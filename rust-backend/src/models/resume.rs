use serde::{Deserialize, Serialize};
use bson::oid::ObjectId;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Resume {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user_id: ObjectId,
    pub title: String,
    pub personal_info: PersonalInfo,
    pub summary: Option<String>,
    pub experience: Vec<Experience>,
    pub education: Vec<Education>,
    pub skills: Vec<String>,
    pub certifications: Option<Vec<Certification>>,
    pub languages: Option<Vec<Language>>,
    pub template: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PersonalInfo {
    pub full_name: String,
    pub email: String,
    pub phone: Option<String>,
    pub location: Option<String>,
    pub website: Option<String>,
    pub linkedin: Option<String>,
    pub github: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Experience {
    pub company: String,
    pub position: String,
    pub location: Option<String>,
    pub start_date: String,
    pub end_date: Option<String>,
    pub description: String,
    pub achievements: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Education {
    pub institution: String,
    pub degree: String,
    pub field: String,
    pub start_date: String,
    pub end_date: Option<String>,
    pub gpa: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Certification {
    pub name: String,
    pub issuer: String,
    pub date: String,
    pub credential_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Language {
    pub name: String,
    pub proficiency: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateResumeRequest {
    pub title: String,
    pub personal_info: PersonalInfo,
    pub summary: Option<String>,
    pub experience: Vec<Experience>,
    pub education: Vec<Education>,
    pub skills: Vec<String>,
    pub certifications: Option<Vec<Certification>>,
    pub languages: Option<Vec<Language>>,
    pub template: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct OptimizeResumeRequest {
    pub resume_id: String,
    pub job_description: String,
}
