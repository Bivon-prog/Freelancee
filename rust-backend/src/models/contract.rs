use serde::{Deserialize, Serialize};
use bson::oid::ObjectId;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Contract {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user_id: ObjectId,
    pub client_id: ObjectId,
    pub title: String,
    pub content: String,
    pub status: ContractStatus,
    pub start_date: DateTime<Utc>,
    pub end_date: Option<DateTime<Utc>>,
    pub value: Option<f64>,
    pub currency: Option<String>,
    pub signed_date: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum ContractStatus {
    Draft,
    Sent,
    Signed,
    Active,
    Completed,
    Terminated,
}

#[derive(Debug, Deserialize)]
pub struct CreateContractRequest {
    pub client_id: String,
    pub title: String,
    pub content: String,
    pub start_date: DateTime<Utc>,
    pub end_date: Option<DateTime<Utc>>,
    pub value: Option<f64>,
    pub currency: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateContractRequest {
    pub title: Option<String>,
    pub content: Option<String>,
    pub status: Option<ContractStatus>,
    pub end_date: Option<DateTime<Utc>>,
    pub value: Option<f64>,
    pub signed_date: Option<DateTime<Utc>>,
}
