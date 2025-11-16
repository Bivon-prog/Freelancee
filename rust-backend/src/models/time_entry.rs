use serde::{Deserialize, Serialize};
use bson::oid::ObjectId;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TimeEntry {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user_id: ObjectId,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub project_id: Option<ObjectId>,
    pub description: String,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub duration: Option<i64>, // in seconds
    pub is_billable: bool,
    pub hourly_rate: Option<f64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTimeEntryRequest {
    pub project_id: Option<String>,
    pub description: String,
    pub start_time: DateTime<Utc>,
    pub is_billable: Option<bool>,
    pub hourly_rate: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct StopTimeEntryRequest {
    pub end_time: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTimeEntryRequest {
    pub description: Option<String>,
    pub start_time: Option<DateTime<Utc>>,
    pub end_time: Option<DateTime<Utc>>,
    pub is_billable: Option<bool>,
    pub hourly_rate: Option<f64>,
}
