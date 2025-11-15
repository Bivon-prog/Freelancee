use axum::{
    extract::{Path, State, Extension},
    response::Json,
    routing::{get, post, put},
    Router, middleware,
};
use chrono::Utc;
use mongodb::bson::{doc, oid::ObjectId};

use crate::{
    models::{Invoice, InvoiceStatus, CreateInvoiceRequest, UpdateInvoiceStatusRequest},
    middleware::{auth_middleware, AuthUser},
    error::{AppError, Result},
    AppState,
};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_invoices).post(create_invoice))
        .route("/:id", get(get_invoice).put(update_invoice_status))
        .route_layer(middleware::from_fn(auth_middleware))
}

async fn list_invoices(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<Vec<Invoice>>> {
    let mut cursor = state
        .db
        .invoices()
        .find(doc! { "user_id": auth_user.user_id }, None)
        .await?;

    let mut invoices = Vec::new();
    while cursor.advance().await? {
        invoices.push(cursor.deserialize_current()?);
    }

    Ok(Json(invoices))
}

async fn create_invoice(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateInvoiceRequest>,
) -> Result<Json<Invoice>> {
    let client_id = ObjectId::parse_str(&payload.client_id)
        .map_err(|_| AppError::BadRequest("Invalid client ID".to_string()))?;

    // Calculate totals
    let subtotal: f64 = payload.items.iter().map(|item| item.amount).sum();
    let tax = payload.tax.unwrap_or(0.0);
    let discount = payload.discount.unwrap_or(0.0);
    let total = subtotal + tax - discount;

    // Generate invoice number
    let count = state
        .db
        .invoices()
        .count_documents(doc! { "user_id": auth_user.user_id }, None)
        .await?;
    let invoice_number = format!("INV-{:05}", count + 1);

    let invoice = Invoice {
        id: None,
        user_id: auth_user.user_id,
        client_id,
        invoice_number,
        date: Utc::now(),
        due_date: payload.due_date,
        items: payload.items,
        subtotal,
        tax,
        discount,
        total,
        currency: payload.currency.unwrap_or_else(|| "USD".to_string()),
        status: InvoiceStatus::Draft,
        notes: payload.notes,
        payment_terms: payload.payment_terms,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    let result = state.db.invoices().insert_one(&invoice, None).await?;
    let mut invoice_with_id = invoice;
    invoice_with_id.id = Some(result.inserted_id.as_object_id().unwrap());

    Ok(Json(invoice_with_id))
}

async fn get_invoice(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<String>,
) -> Result<Json<Invoice>> {
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let invoice = state
        .db
        .invoices()
        .find_one(doc! { "_id": object_id, "user_id": auth_user.user_id }, None)
        .await?
        .ok_or(AppError::NotFound("Invoice not found".to_string()))?;

    Ok(Json(invoice))
}

async fn update_invoice_status(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateInvoiceStatusRequest>,
) -> Result<Json<Invoice>> {
    let object_id = ObjectId::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid ID".to_string()))?;

    let invoice = state
        .db
        .invoices()
        .find_one_and_update(
            doc! { "_id": object_id, "user_id": auth_user.user_id },
            doc! { "$set": { "status": bson::to_bson(&payload.status)?, "updated_at": Utc::now() } },
            None,
        )
        .await?
        .ok_or(AppError::NotFound("Invoice not found".to_string()))?;

    Ok(Json(invoice))
}
