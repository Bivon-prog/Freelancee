use axum::{
    routing::{get, post, put, delete},
    Router,
};
use std::net::SocketAddr;
use tower_http::cors::{CorsLayer, Any};

mod config;
mod models;
mod handlers;
mod middleware;
mod database;
mod services;
mod error;

use config::Config;
use database::Database;

#[derive(Clone)]
pub struct AppState {
    pub db: Database,
    pub config: Config,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv::dotenv().ok();
    
    let config = Config::from_env()?;
    let db = Database::connect(&config.mongodb_uri).await?;
    
    let app_state = AppState {
        db: db.clone(),
        config: config.clone(),
    };

    let app = Router::new()
        .route("/health", get(health_check))
        .nest("/api/auth", handlers::auth::routes())
        .nest("/api/invoices", handlers::invoices::routes())
        .nest("/api/clients", handlers::clients::routes())
        .nest("/api/time-tracking", handlers::time_tracking::routes())
        .nest("/api/contracts", handlers::contracts::routes())
        .nest("/api/resumes", handlers::resumes::routes())
        .nest("/api/projects", handlers::projects::routes())
        .layer(axum::Extension(app_state.clone()))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any)
        )
        .with_state(app_state);

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    println!("🦀 Orbix Rust Backend running on http://{}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    
    Ok(())
}

async fn health_check() -> &'static str {
    "🦀 Orbix Rust Backend - Healthy!"
}
