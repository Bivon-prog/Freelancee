use axum::{
    extract::State,
    response::Json,
    routing::post,
    Router,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::Utc;
use jsonwebtoken::{encode, Header, EncodingKey};
use mongodb::bson::doc;

use crate::{
    models::{User, CreateUserRequest, LoginRequest, AuthResponse},
    middleware::auth::Claims,
    error::{AppError, Result},
    AppState,
};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
}

async fn register(
    State(state): State<AppState>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<Json<AuthResponse>> {
    let existing_user = state
        .db
        .users()
        .find_one(doc! { "email": &payload.email }, None)
        .await?;

    if existing_user.is_some() {
        return Err(AppError::Conflict("Email already exists".to_string()));
    }

    let hashed_password = hash(&payload.password, DEFAULT_COST)?;

    let user = User {
        id: None,
        email: payload.email,
        password: hashed_password,
        name: payload.name,
        avatar: None,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    let result = state.db.users().insert_one(&user, None).await?;
    let user_id = result.inserted_id.as_object_id().unwrap().to_hex();
    let token = generate_token(&user_id, &state.config.jwt_secret)?;

    let mut user_with_id = user;
    user_with_id.id = Some(result.inserted_id.as_object_id().unwrap());

    Ok(Json(AuthResponse {
        user: user_with_id.into(),
        token,
    }))
}

async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>> {
    let user = state
        .db
        .users()
        .find_one(doc! { "email": &payload.email }, None)
        .await?
        .ok_or(AppError::Unauthorized)?;

    if !verify(&payload.password, &user.password)? {
        return Err(AppError::Unauthorized);
    }

    let user_id = user.id.unwrap().to_hex();
    let token = generate_token(&user_id, &state.config.jwt_secret)?;

    Ok(Json(AuthResponse {
        user: user.into(),
        token,
    }))
}

fn generate_token(user_id: &str, secret: &str) -> Result<String> {
    let expiration = chrono::Utc::now()
        .checked_add_signed(chrono::Duration::days(7))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: user_id.to_string(),
        exp: expiration,
    };

    Ok(encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )?)
}
