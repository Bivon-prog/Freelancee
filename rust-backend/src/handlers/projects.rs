use axum::{
    extract::{Path, State, Extension},
    response::Json,
    routing::{get, post, put, delete},
    Router, middleware,
};
use chrono::Utc;
use mongodb::bson::{doc, oid::ObjectId};

use crate::{
    models::{Project, ProjectStatus, CreateProjectRequest, UpdateProjectRequest},
    middleware::{auth_middleware, AuthUser},
    error::{AppError, Result},
    AppState,
};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_projects).post(create_project))
        .route("/:id", get(get_project).put(update_project).delete(delete_project))
        .route_layer(middleware::from_fn(auth_middleware))
}

async fn list_projects(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<Vec<Project>>> {
    let mut cursor = state
        .db
        .projects()
        .find(doc! { "user_id": auth_user.user_id }, None)
        .await?;

    let mut projects = Vec::new();
    while cursor.advance().await? {
        projects.push(cursor.deserialize_current()?);
    }

    Ok(Json(projects))
}

async fn create_project(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateProjectRequest>,
) -> Result<Json<Project>> {
    let client_id = ObjectId::parse_str(&payload.client_id)
        .map_err(|_| AppError::BadRequest("Invalid client ID".to_string()))?;

    let project = Project {
        id: None,
        user_id: auth_user.user_id,
        client_id,
        name: payload.name,
        description: payload.description,
        status: ProjectStatus::Active,
        hourly_rate: payload.hourly_rate,
        budget: payload.budget,
        start_date: payload.start_date,
        end_date: None,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    let result = state.db.projects().insert_one(&project, None).await?;
    let mut project_with_id = project;
    project_with_id.id = Some(result.inserted_id.as_object_id().unwrap());

    Ok(Json(project_with_id))
}

async fn get_project(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<String>,
) -> Result<Json<Project>> {
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let project = state
        .db
        .projects()
        .find_one(doc! { "_id": object_id, "user_id": auth_user.user_id }, None)
        .await?
        .ok_or(AppError::NotFound("Project not found".to_string()))?;

    Ok(Json(project))
}

async fn update_project(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateProjectRequest>,
) -> Result<Json<Project>> {
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let mut update_doc = doc! { "updated_at": Utc::now() };
    
    if let Some(name) = payload.name {
        update_doc.insert("name", name);
    }
    if let Some(description) = payload.description {
        update_doc.insert("description", description);
    }
    if let Some(status) = payload.status {
        update_doc.insert("status", bson::to_bson(&status)?);
    }
    if let Some(hourly_rate) = payload.hourly_rate {
        update_doc.insert("hourly_rate", hourly_rate);
    }
    if let Some(budget) = payload.budget {
        update_doc.insert("budget", budget);
    }
    if let Some(end_date) = payload.end_date {
        update_doc.insert("end_date", end_date);
    }

    let project = state
        .db
        .projects()
        .find_one_and_update(
            doc! { "_id": object_id, "user_id": auth_user.user_id },
            doc! { "$set": update_doc },
            None,
        )
        .await?
        .ok_or(AppError::NotFound("Project not found".to_string()))?;

    Ok(Json(project))
}

async fn delete_project(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>> {
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let result = state
        .db
        .projects()
        .delete_one(doc! { "_id": object_id, "user_id": auth_user.user_id }, None)
        .await?;

    if result.deleted_count == 0 {
        return Err(AppError::NotFound("Project not found".to_string()));
    }

    Ok(Json(serde_json::json!({ "message": "Project deleted" })))
}
