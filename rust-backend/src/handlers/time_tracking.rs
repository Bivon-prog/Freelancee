use axum::{
    extract::{Path, State, Extension},
    response::Json,
    routing::{get, post, put, delete},
    Router, middleware,
};
use chrono::Utc;
use mongodb::bson::{doc, oid::ObjectId};

use crate::{
    models::{TimeEntry, CreateTimeEntryRequest, StopTimeEntryRequest, UpdateTimeEntryRequest},
    middleware::{auth_middleware, AuthUser},
    error::{AppError, Result},
    AppState,
};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_time_entries).post(create_time_entry))
        .route("/:id", get(get_time_entry).put(update_time_entry).delete(delete_time_entry))
        .route("/:id/stop", post(stop_time_entry))
        .route_layer(middleware::from_fn(auth_middleware))
}

async fn list_time_entries(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<Vec<TimeEntry>>> {
    let mut cursor = state
        .db
        .time_entries()
        .find(doc! { "user_id": auth_user.user_id }, None)
        .await?;

    let mut entries = Vec::new();
    while cursor.advance().await? {
        entries.push(cursor.deserialize_current()?);
    }

    Ok(Json(entries))
}

async fn create_time_entry(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateTimeEntryRequest>,
) -> Result<Json<TimeEntry>> {
    let project_id = match payload.project_id {
        Some(id) => Some(ObjectId::parse_str(&id)
            .map_err(|_| AppError::BadRequest("Invalid project ID".to_string()))?),
        None => None,
    };

    let entry = TimeEntry {
        id: None,
        user_id: auth_user.user_id,
        project_id,
        description: payload.description,
        start_time: payload.start_time,
        end_time: None,
        duration: None,
        is_billable: payload.is_billable.unwrap_or(true),
        hourly_rate: payload.hourly_rate,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    let result = state.db.time_entries().insert_one(&entry, None).await?;
    let mut entry_with_id = entry;
    entry_with_id.id = Some(result.inserted_id.as_object_id().unwrap());

    Ok(Json(entry_with_id))
}

async fn get_time_entry(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<String>,
) -> Result<Json<TimeEntry>> {
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let entry = state
        .db
        .time_entries()
        .find_one(doc! { "_id": object_id, "user_id": auth_user.user_id }, None)
        .await?
        .ok_or(AppError::NotFound("Time entry not found".to_string()))?;

    Ok(Json(entry))
}

async fn stop_time_entry(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<String>,
    Json(payload): Json<StopTimeEntryRequest>,
) -> Result<Json<TimeEntry>> {
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let entry = state
        .db
        .time_entries()
        .find_one(doc! { "_id": object_id, "user_id": auth_user.user_id }, None)
        .await?
        .ok_or(AppError::NotFound("Time entry not found".to_string()))?;

    let duration = (payload.end_time - entry.start_time).num_seconds();

    let updated_entry = state
        .db
        .time_entries()
        .find_one_and_update(
            doc! { "_id": object_id, "user_id": auth_user.user_id },
            doc! { 
                "$set": { 
                    "end_time": payload.end_time,
                    "duration": duration,
                    "updated_at": Utc::now()
                } 
            },
            None,
        )
        .await?
        .ok_or(AppError::NotFound("Time entry not found".to_string()))?;

    Ok(Json(updated_entry))
}

async fn update_time_entry(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateTimeEntryRequest>,
) -> Result<Json<TimeEntry>> {
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let mut update_doc = doc! { "updated_at": Utc::now() };
    
    if let Some(description) = payload.description {
        update_doc.insert("description", description);
    }
    if let Some(start_time) = payload.start_time {
        update_doc.insert("start_time", start_time);
    }
    if let Some(end_time) = payload.end_time {
        update_doc.insert("end_time", end_time);
    }
    if let Some(is_billable) = payload.is_billable {
        update_doc.insert("is_billable", is_billable);
    }
    if let Some(hourly_rate) = payload.hourly_rate {
        update_doc.insert("hourly_rate", hourly_rate);
    }

    let entry = state
        .db
        .time_entries()
        .find_one_and_update(
            doc! { "_id": object_id, "user_id": auth_user.user_id },
            doc! { "$set": update_doc },
            None,
        )
        .await?
        .ok_or(AppError::NotFound("Time entry not found".to_string()))?;

    Ok(Json(entry))
}

async fn delete_time_entry(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>> {
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let result = state
        .db
        .time_entries()
        .delete_one(doc! { "_id": object_id, "user_id": auth_user.user_id }, None)
        .await?;

    if result.deleted_count == 0 {
        return Err(AppError::NotFound("Time entry not found".to_string()));
    }

    Ok(Json(serde_json::json!({ "message": "Time entry deleted" })))
}
