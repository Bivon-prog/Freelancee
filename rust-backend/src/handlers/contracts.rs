use axum::{
    extract::{Path, State, Extension},
    response::Json,
    routing::{get, post, put, delete},
    Router, middleware,
};
use chrono::Utc;
use mongodb::bson::{doc, oid::ObjectId};

use crate::{
    models::{Contract, CreateContractRequest, UpdateContractRequest},
    middleware::{auth_middleware, AuthUser},
    error::{AppError, Result},
    AppState,
};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_contracts).post(create_contract))
        .route("/:id", get(get_contract).put(update_contract).delete(delete_contract))
        .route_layer(middleware::from_fn(auth_middleware))
}

async fn list_contracts(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<Vec<Contract>>> {
    let mut cursor = state
        .db
        .contracts()
        .find(doc! { "user_id": auth_user.user_id }, None)
        .await?;

    let mut contracts = Vec::new();
    while cursor.advance().await? {
        contracts.push(cursor.deserialize_current()?);
    }

    Ok(Json(contracts))
}

async fn create_contract(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateContractRequest>,
) -> Result<Json<Contract>> {
    let client_id = ObjectId::parse_str(&payload.client_id)
        .map_err(|_| AppError::BadRequest("Invalid client ID".to_string()))?;

    let contract = Contract {
        id: None,
        user_id: auth_user.user_id,
        client_id,
        title: payload.title,
        content: payload.content,
        status: crate::models::ContractStatus::Draft,
        start_date: payload.start_date,
        end_date: payload.end_date,
        value: payload.value,
        currency: payload.currency,
        signed_date: None,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    let result = state.db.contracts().insert_one(&contract, None).await?;
    let mut contract_with_id = contract;
    contract_with_id.id = Some(result.inserted_id.as_object_id().unwrap());

    Ok(Json(contract_with_id))
}

async fn get_contract(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<String>,
) -> Result<Json<Contract>> {
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let contract = state
        .db
        .contracts()
        .find_one(doc! { "_id": object_id, "user_id": auth_user.user_id }, None)
        .await?
        .ok_or(AppError::NotFound("Contract not found".to_string()))?;

    Ok(Json(contract))
}

async fn update_contract(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateContractRequest>,
) -> Result<Json<Contract>> {
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let mut update_doc = doc! { "updated_at": Utc::now() };
    
    if let Some(title) = payload.title {
        update_doc.insert("title", title);
    }
    if let Some(content) = payload.content {
        update_doc.insert("content", content);
    }
    if let Some(status) = payload.status {
        update_doc.insert("status", bson::to_bson(&status)?);
    }
    if let Some(end_date) = payload.end_date {
        update_doc.insert("end_date", end_date);
    }
    if let Some(value) = payload.value {
        update_doc.insert("value", value);
    }
    if let Some(signed_date) = payload.signed_date {
        update_doc.insert("signed_date", signed_date);
    }

    let contract = state
        .db
        .contracts()
        .find_one_and_update(
            doc! { "_id": object_id, "user_id": auth_user.user_id },
            doc! { "$set": update_doc },
            None,
        )
        .await?
        .ok_or(AppError::NotFound("Contract not found".to_string()))?;

    Ok(Json(contract))
}

async fn delete_contract(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>> {
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let result = state
        .db
        .contracts()
        .delete_one(doc! { "_id": object_id, "user_id": auth_user.user_id }, None)
        .await?;

    if result.deleted_count == 0 {
        return Err(AppError::NotFound("Contract not found".to_string()));
    }

    Ok(Json(serde_json::json!({ "message": "Contract deleted" })))
}
