use axum::{
    extract::{Path, State, Extension},
    response::Json,
    routing::{get, post, put, delete},
    Router, middleware,
};
use chrono::Utc;
use mongodb::bson::{doc, oid::ObjectId};

use crate::{
    models::{Client, CreateClientRequest, UpdateClientRequest},
    middleware::{auth_middleware, AuthUser},
    error::{AppError, Result},
    AppState,
};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_clients).post(create_client))
        .route("/:id", get(get_client).put(update_client).delete(delete_client))
        .route_layer(middleware::from_fn(auth_middleware))
}

async fn list_clients(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<Vec<Client>>> {
    let mut cursor = state
        .db
        .clients()
        .find(doc! { "user_id": auth_user.user_id }, None)
        .await?;

    let mut clients = Vec::new();
    while cursor.advance().await? {
        clients.push(cursor.deserialize_current()?);
    }

    Ok(Json(clients))
}

async fn create_client(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateClientRequest>,
) -> Result<Json<Client>> {
    let client = Client {
        id: None,
        user_id: auth_user.user_id,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        company: payload.company,
        address: payload.address,
        notes: payload.notes,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    let result = state.db.clients().insert_one(&client, None).await?;
    let mut client_with_id = client;
    client_with_id.id = Some(result.inserted_id.as_object_id().unwrap());

    Ok(Json(client_with_id))
}

async fn get_client(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<String>,
) -> Result<Json<Client>> {
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let client = state
        .db
        .clients()
        .find_one(doc! { "_id": object_id, "user_id": auth_user.user_id }, None)
        .await?
        .ok_or(AppError::NotFound("Client not found".to_string()))?;

    Ok(Json(client))
}

async fn update_client(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateClientRequest>,
) -> Result<Json<Client>> {
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let mut update_doc = doc! { "updated_at": Utc::now() };
    
    if let Some(name) = payload.name {
        update_doc.insert("name", name);
    }
    if let Some(email) = payload.email {
        update_doc.insert("email", email);
    }
    if let Some(phone) = payload.phone {
        update_doc.insert("phone", phone);
    }
    if let Some(company) = payload.company {
        update_doc.insert("company", company);
    }
    if let Some(address) = payload.address {
        update_doc.insert("address", address);
    }
    if let Some(notes) = payload.notes {
        update_doc.insert("notes", notes);
    }

    let client = state
        .db
        .clients()
        .find_one_and_update(
            doc! { "_id": object_id, "user_id": auth_user.user_id },
            doc! { "$set": update_doc },
            None,
        )
        .await?
        .ok_or(AppError::NotFound("Client not found".to_string()))?;

    Ok(Json(client))
}

async fn delete_client(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>> {
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let result = state
        .db
        .clients()
        .delete_one(doc! { "_id": object_id, "user_id": auth_user.user_id }, None)
        .await?;

    if result.deleted_count == 0 {
        return Err(AppError::NotFound("Client not found".to_string()));
    }

    Ok(Json(serde_json::json!({ "message": "Client deleted" })))
}
