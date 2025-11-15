use mongodb::{Client, Database as MongoDatabase, Collection};
use anyhow::Result;

#[derive(Clone)]
pub struct Database {
    pub client: Client,
    pub db: MongoDatabase,
}

impl Database {
    pub async fn connect(uri: &str) -> Result<Self> {
        let client = Client::with_uri_str(uri).await?;
        let db = client.database("orbix");
        
        println!("✅ Connected to MongoDB");
        
        Ok(Database { client, db })
    }

    pub fn users(&self) -> Collection<crate::models::User> {
        self.db.collection("users")
    }

    pub fn clients(&self) -> Collection<crate::models::Client> {
        self.db.collection("clients")
    }

    pub fn invoices(&self) -> Collection<crate::models::Invoice> {
        self.db.collection("invoices")
    }

    pub fn time_entries(&self) -> Collection<crate::models::TimeEntry> {
        self.db.collection("time_entries")
    }

    pub fn projects(&self) -> Collection<crate::models::Project> {
        self.db.collection("projects")
    }

    pub fn contracts(&self) -> Collection<crate::models::Contract> {
        self.db.collection("contracts")
    }

    pub fn resumes(&self) -> Collection<crate::models::Resume> {
        self.db.collection("resumes")
    }
}
