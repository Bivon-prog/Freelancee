use serde::{Deserialize, Serialize};
use bson::oid::ObjectId;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Project {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user_id: ObjectId,
    pub client_id: ObjectId,
    pub name: String,
    pub description: Option<String>,
    pub status: ProjectStatus,
    pub hourly_rate: Option<f64>,
    pub budget: Option<f64>,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum ProjectStatus {
    Active,
    Completed,
    OnHold,
    Cancelled,
}

#[derive(Debug, Deserialize)]
pub struct CreateProjectRequest {
    pub client_id: String,
    pub name: String,
    pub description: Option<String>,
    pub hourly_rate: Option<f64>,
    pub budget: Option<f64>,
    pub start_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProjectRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub status: Option<ProjectStatus>,
    pub hourly_rate: Option<f64>,
    pub budget: Option<f64>,
    pub end_date: Option<DateTime<Utc>>,
}
