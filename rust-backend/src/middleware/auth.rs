use axum::{
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use bson::oid::ObjectId;

use crate::{AppState, error::AppError};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String, // user_id
    pub exp: usize,
}

#[derive(Clone)]
pub struct AuthUser {
    pub user_id: ObjectId,
}

pub async fn auth_middleware(
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    let state = req.extensions().get::<AppState>().cloned()
        .ok_or(AppError::InternalError("State not found".to_string()))?;

    let auth_header = req
        .headers()
        .get("authorization")
        .and_then(|h| h.to_str().ok())
        .ok_or(AppError::Unauthorized)?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or(AppError::Unauthorized)?;

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.config.jwt_secret.as_ref()),
        &Validation::default(),
    )?;

    let user_id = ObjectId::parse_str(&token_data.claims.sub)
        .map_err(|_| AppError::Unauthorized)?;

    req.extensions_mut().insert(AuthUser { user_id });

    Ok(next.run(req).await)
}
