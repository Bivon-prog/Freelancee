use axum::{
    extract::{Path, State, Extension},
    response::Json,
    routing::{get, post, put, delete},
    Router, middleware,
};
use chrono::Utc;
use mongodb::bson::{doc, oid::ObjectId};

use crate::{
    models::{Resume, CreateResumeRequest, OptimizeResumeRequest},
    middleware::{auth_middleware, AuthUser},
    error::{AppError, Result},
    AppState,
};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_resumes).post(create_resume))
        .route("/:id", get(get_resume).delete(delete_resume))
        .route("/optimize", post(optimize_resume))
        .route_layer(middleware::from_fn(auth_middleware))
}

async fn list_resumes(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<Vec<Resume>>> {
    let mut cursor = state
        .db
        .resumes()
        .find(doc! { "user_id": auth_user.user_id }, None)
        .await?;

    let mut resumes = Vec::new();
    while cursor.advance().await? {
        resumes.push(cursor.deserialize_current()?);
    }

    Ok(Json(resumes))
}

async fn create_resume(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateResumeRequest>,
) -> Result<Json<Resume>> {
    let resume = Resume {
        id: None,
        user_id: auth_user.user_id,
        title: payload.title,
        personal_info: payload.personal_info,
        summary: payload.summary,
        experience: payload.experience,
        education: payload.education,
        skills: payload.skills,
        certifications: payload.certifications,
        languages: payload.languages,
        template: payload.template.unwrap_or_else(|| "modern".to_string()),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    let result = state.db.resumes().insert_one(&resume, None).await?;
    let mut resume_with_id = resume;
    resume_with_id.id = Some(result.inserted_id.as_object_id().unwrap());

    Ok(Json(resume_with_id))
}

async fn get_resume(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<String>,
) -> Result<Json<Resume>> {
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let resume = state
        .db
        .resumes()
        .find_one(doc! { "_id": object_id, "user_id": auth_user.user_id }, None)
        .await?
        .ok_or(AppError::NotFound("Resume not found".to_string()))?;

    Ok(Json(resume))
}

async fn delete_resume(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>> {
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let result = state
        .db
        .resumes()
        .delete_one(doc! { "_id": object_id, "user_id": auth_user.user_id }, None)
        .await?;

    if result.deleted_count == 0 {
        return Err(AppError::NotFound("Resume not found".to_string()));
    }

    Ok(Json(serde_json::json!({ "message": "Resume deleted" })))
}

async fn optimize_resume(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<OptimizeResumeRequest>,
) -> Result<Json<serde_json::Value>> {
    let resume_id = ObjectId::parse_str(&payload.resume_id)
        .map_err(|_| AppError::BadRequest("Invalid resume ID".to_string()))?;

    let resume = state
        .db
        .resumes()
        .find_one(doc! { "_id": resume_id, "user_id": auth_user.user_id }, None)
        .await?
        .ok_or(AppError::NotFound("Resume not found".to_string()))?;

    // Call AI service for optimization
    let client = reqwest::Client::new();
    let ai_response = client
        .post(format!("{}/optimize-resume", state.config.ai_service_url))
        .json(&serde_json::json!({
            "resume": resume,
            "job_description": payload.job_description
        }))
        .send()
        .await
        .map_err(|e| AppError::InternalError(format!("AI service error: {}", e)))?;

    let optimized_data: serde_json::Value = ai_response
        .json()
        .await
        .map_err(|e| AppError::InternalError(format!("Failed to parse AI response: {}", e)))?;

    Ok(Json(optimized_data))
}
