use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct Config {
    pub mongodb_uri: String,
    pub jwt_secret: String,
    pub port: u16,
    pub openai_api_key: Option<String>,
    pub ai_service_url: String,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        Ok(Config {
            mongodb_uri: std::env::var("MONGODB_URI")
                .unwrap_or_else(|_| "mongodb://localhost:27017/orbix".to_string()),
            jwt_secret: std::env::var("JWT_SECRET")
                .expect("JWT_SECRET must be set"),
            port: std::env::var("PORT")
                .unwrap_or_else(|_| "5000".to_string())
                .parse()?,
            openai_api_key: std::env::var("OPENAI_API_KEY").ok(),
            ai_service_url: std::env::var("AI_SERVICE_URL")
                .unwrap_or_else(|_| "http://localhost:8000".to_string()),
        })
    }
}
