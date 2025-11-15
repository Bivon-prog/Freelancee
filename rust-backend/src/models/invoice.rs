use serde::{Deserialize, Serialize};
use bson::oid::ObjectId;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InvoiceItem {
    pub description: String,
    pub quantity: f64,
    pub rate: f64,
    pub amount: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Invoice {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user_id: ObjectId,
    pub client_id: ObjectId,
    pub invoice_number: String,
    pub date: DateTime<Utc>,
    pub due_date: DateTime<Utc>,
    pub items: Vec<InvoiceItem>,
    pub subtotal: f64,
    pub tax: f64,
    pub discount: f64,
    pub total: f64,
    pub currency: String,
    pub status: InvoiceStatus,
    pub notes: Option<String>,
    pub payment_terms: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum InvoiceStatus {
    Draft,
    Sent,
    Paid,
    Overdue,
}

#[derive(Debug, Deserialize)]
pub struct CreateInvoiceRequest {
    pub client_id: String,
    pub items: Vec<InvoiceItem>,
    pub due_date: DateTime<Utc>,
    pub tax: Option<f64>,
    pub discount: Option<f64>,
    pub currency: Option<String>,
    pub notes: Option<String>,
    pub payment_terms: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateInvoiceStatusRequest {
    pub status: InvoiceStatus,
}
