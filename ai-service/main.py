from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI(title="Orbix AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ContentGenerationRequest(BaseModel):
    prompt: str
    type: str  # blog, email, social, etc.
    tone: Optional[str] = "professional"
    length: Optional[str] = "medium"
    language: Optional[str] = "english"

class GrammarCheckRequest(BaseModel):
    text: str
    language: Optional[str] = "english"

class RewriteRequest(BaseModel):
    text: str
    tone: str  # professional, casual, formal, friendly
    language: Optional[str] = "english"

class SummarizeRequest(BaseModel):
    text: str
    length: Optional[str] = "short"

class ResumeOptimizeRequest(BaseModel):
    resume_text: str
    job_description: str

class ContractGenerateRequest(BaseModel):
    contract_type: str
    parties: List[dict]
    terms: dict

class TemplateGenerateRequest(BaseModel):
    template_type: str  # cv, cover_letter, proposal, etc.
    details: dict

# Helper functions
def get_content_prompt(request: ContentGenerationRequest):
    """Generate appropriate prompt based on content type and requirements"""
    
    base_prompts = {
        "blog": f"Write a {request.length} blog post about: {request.prompt}",
        "email": f"Write a {request.tone} email about: {request.prompt}",
        "social": f"Write a {request.tone} social media post about: {request.prompt}",
        "marketing": f"Write {request.tone} marketing content about: {request.prompt}",
        "essay": f"Write a {request.length} essay about: {request.prompt}",
        "product_description": f"Write a {request.tone} product description for: {request.prompt}",
        "youtube_ideas": f"Generate YouTube video ideas about: {request.prompt}",
        "whatsapp": f"Write a {request.tone} WhatsApp business message about: {request.prompt}"
    }
    
    prompt = base_prompts.get(request.type, f"Write content about: {request.prompt}")
    
    # Add language-specific instructions
    if request.language == "kenyan_english":
        prompt += "\n\nWrite in Kenyan English style, using local expressions and context."
    elif request.language == "sheng":
        prompt += "\n\nWrite in Sheng (Kenyan slang), making it relatable to young Kenyans."
    elif request.language == "kiswahili":
        prompt += "\n\nWrite in Kiswahili language."
    
    # Add tone instructions
    tone_instructions = {
        "professional": "Use a professional, business-appropriate tone.",
        "casual": "Use a casual, friendly tone.",
        "formal": "Use a formal, academic tone.",
        "friendly": "Use a warm, approachable tone.",
        "persuasive": "Use a persuasive, compelling tone."
    }
    
    if request.tone in tone_instructions:
        prompt += f"\n\n{tone_instructions[request.tone]}"
    
    # Add length instructions
    length_instructions = {
        "short": "Keep it concise and to the point (1-2 paragraphs).",
        "medium": "Write a moderate length piece (3-5 paragraphs).",
        "long": "Write a comprehensive, detailed piece (6+ paragraphs)."
    }
    
    if request.length in length_instructions:
        prompt += f"\n\n{length_instructions[request.length]}"
    
    return prompt

async def call_openai_mock(prompt: str, max_tokens: int = 1000):
    """Mock OpenAI API call - replace with real OpenAI when API key is available"""
    
    # This is a mock response - replace with actual OpenAI API call
    mock_responses = {
        "blog": "# The Future of Technology\n\nTechnology continues to evolve at an unprecedented pace, transforming how we work, communicate, and live our daily lives. From artificial intelligence to blockchain, these innovations are reshaping industries and creating new opportunities.\n\nAs we look ahead, it's clear that embracing these technological advances will be crucial for businesses and individuals alike. The key is to stay informed, adapt quickly, and leverage these tools to enhance productivity and creativity.",
        
        "email": "Subject: Following Up on Our Discussion\n\nDear [Name],\n\nI hope this email finds you well. I wanted to follow up on our recent conversation about the project timeline and next steps.\n\nAs discussed, I'll be preparing the initial draft by Friday and will send it over for your review. Please let me know if you have any questions or if there's anything else you'd like me to include.\n\nBest regards,\n[Your Name]",
        
        "social": "🚀 Exciting news! We're launching something amazing that will change how you work. Stay tuned for more details coming soon! #Innovation #Technology #Productivity",
        
        "default": f"Here's AI-generated content based on your request: {prompt[:100]}...\n\nThis is a high-quality response that addresses your needs. The content is well-structured, engaging, and tailored to your specifications."
    }
    
    # Determine response type based on prompt content
    response_type = "default"
    if "blog" in prompt.lower():
        response_type = "blog"
    elif "email" in prompt.lower():
        response_type = "email"
    elif "social" in prompt.lower():
        response_type = "social"
    
    content = mock_responses.get(response_type, mock_responses["default"])
    
    return {
        "content": content,
        "tokens_used": len(content.split()) * 1.3  # Rough token estimate
    }

# Routes
@app.get("/health")
async def health():
    return {"status": "ok", "service": "Orbix AI Service"}

@app.post("/api/ai/generate-content")
async def generate_content(request: ContentGenerationRequest):
    """Generate content based on prompt, type, tone, and language"""
    try:
        prompt = get_content_prompt(request)
        result = await call_openai_mock(prompt, max_tokens=1500)
        
        return {
            "content": result["content"],
            "tokens_used": result.get("tokens_used", 0),
            "type": request.type,
            "tone": request.tone,
            "language": request.language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/check-grammar")
async def check_grammar(request: GrammarCheckRequest):
    """Check and correct grammar in text"""
    try:
        # Mock grammar checking - replace with actual AI implementation
        errors = []
        suggestions = []
        corrected_text = request.text
        
        # Simple mock corrections
        if "teh" in request.text.lower():
            errors.append("Spelling error: 'teh' should be 'the'")
            corrected_text = corrected_text.replace("teh", "the").replace("Teh", "The")
        
        if request.text.count(".") == 0 and len(request.text) > 20:
            suggestions.append("Consider adding punctuation to improve readability")
        
        if not request.text[0].isupper():
            suggestions.append("Start sentences with capital letters")
            corrected_text = corrected_text[0].upper() + corrected_text[1:] if len(corrected_text) > 1 else corrected_text.upper()
        
        return {
            "corrected_text": corrected_text,
            "errors": errors,
            "suggestions": suggestions,
            "tokens_used": len(request.text.split())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/rewrite")
async def rewrite_text(request: RewriteRequest):
    """Rewrite text in a different tone or style"""
    try:
        # Mock rewriting based on tone
        rewritten_text = request.text
        
        if request.tone == "professional":
            rewritten_text = f"I would like to formally present the following: {request.text}"
        elif request.tone == "casual":
            rewritten_text = f"Hey! So basically, {request.text.lower()}"
        elif request.tone == "friendly":
            rewritten_text = f"I hope you're doing well! {request.text}"
        elif request.tone == "formal":
            rewritten_text = f"It is hereby stated that {request.text}"
        
        return {
            "rewritten_text": rewritten_text,
            "original_text": request.text,
            "tone": request.tone,
            "tokens_used": len(request.text.split()) * 1.2
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/summarize")
async def summarize_text(request: SummarizeRequest):
    """Summarize long text"""
    try:
        # Mock summarization
        words = request.text.split()
        
        if request.length == "short":
            summary = " ".join(words[:20]) + "..."
        elif request.length == "medium":
            summary = " ".join(words[:50]) + "..."
        else:
            summary = " ".join(words[:100]) + "..."
        
        if len(words) <= 20:
            summary = request.text  # Don't summarize if already short
        
        return {
            "summary": summary,
            "original_length": len(words),
            "summary_length": len(summary.split()),
            "tokens_used": len(words)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/generate-template")
async def generate_template(request: TemplateGenerateRequest):
    """Generate document templates (CV, cover letter, etc.)"""
    try:
        templates = {
            "cv": """
# [Your Name]
**[Your Title/Position]**

## Contact Information
- Email: [your.email@example.com]
- Phone: [your-phone-number]
- Location: [Your City, Country]
- LinkedIn: [your-linkedin-profile]

## Professional Summary
[Brief summary of your experience and skills]

## Work Experience
### [Job Title] - [Company Name]
*[Start Date] - [End Date]*
- [Achievement or responsibility]
- [Achievement or responsibility]
- [Achievement or responsibility]

## Education
### [Degree] - [Institution]
*[Graduation Year]*

## Skills
- [Skill 1]
- [Skill 2]
- [Skill 3]
            """,
            
            "cover_letter": """
[Your Name]
[Your Address]
[City, State, ZIP Code]
[Your Email]
[Your Phone Number]

[Date]

[Hiring Manager's Name]
[Company Name]
[Company Address]
[City, State, ZIP Code]

Dear Hiring Manager,

I am writing to express my strong interest in the [Position Title] role at [Company Name]. With my background in [relevant field/experience], I am confident that I would be a valuable addition to your team.

[Body paragraph highlighting relevant experience and achievements]

[Body paragraph explaining why you're interested in the company and role]

I would welcome the opportunity to discuss how my skills and experience can contribute to [Company Name]'s continued success. Thank you for your time and consideration.

Sincerely,
[Your Name]
            """,
            
            "business_proposal": """
# Business Proposal

## Executive Summary
[Brief overview of the proposal]

## Problem Statement
[Description of the problem or opportunity]

## Proposed Solution
[Your solution or approach]

## Benefits
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

## Timeline
[Project timeline and milestones]

## Investment Required
[Budget and resource requirements]

## Next Steps
[Proposed next actions]
            """
        }
        
        template_content = templates.get(request.template_type, f"Template for {request.template_type} - Content will be generated based on your requirements.")
        
        return {
            "template_content": template_content,
            "template_type": request.template_type,
            "tokens_used": len(template_content.split())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/optimize-resume")
async def optimize_resume(request: ResumeOptimizeRequest):
    """Optimize resume for ATS and job matching"""
    try:
        # Mock ATS optimization
        job_keywords = request.job_description.lower().split()
        resume_keywords = request.resume_text.lower().split()
        
        # Find missing keywords (simplified)
        missing_keywords = []
        important_keywords = ["python", "javascript", "react", "node", "aws", "docker", "git", "sql"]
        
        for keyword in important_keywords:
            if keyword in job_keywords and keyword not in resume_keywords:
                missing_keywords.append(keyword)
        
        # Calculate mock ATS score
        keyword_match_score = max(0, 100 - len(missing_keywords) * 10)
        ats_score = min(100, keyword_match_score)
        
        suggestions = [
            "Add more action verbs to describe your achievements",
            "Quantify your accomplishments with specific numbers and metrics",
            "Include relevant keywords from the job description",
            "Use a clean, ATS-friendly format",
            "Tailor your professional summary to match the role"
        ]
        
        if missing_keywords:
            suggestions.insert(0, f"Consider adding these keywords: {', '.join(missing_keywords[:3])}")
        
        return {
            "ats_score": ats_score,
            "missing_keywords": missing_keywords[:5],
            "suggestions": suggestions[:5],
            "optimized_sections": {
                "summary": "Results-driven professional with expertise in modern technologies and proven track record of delivering high-quality solutions.",
                "skills": "Technical Skills: " + ", ".join(important_keywords[:6])
            },
            "tokens_used": len(request.resume_text.split()) + len(request.job_description.split())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/generate-contract")
async def generate_contract(request: ContractGenerateRequest):
    """Generate contract based on type and terms"""
    try:
        contract_templates = {
            "freelance": """
FREELANCE SERVICE AGREEMENT

This Agreement is entered into between:

Client: [Client Name]
Freelancer: [Freelancer Name]

1. SCOPE OF WORK
[Description of services to be provided]

2. PAYMENT TERMS
- Total Amount: [Amount]
- Payment Schedule: [Schedule]
- Payment Method: [Method]

3. TIMELINE
- Start Date: [Start Date]
- Completion Date: [End Date]

4. DELIVERABLES
[List of deliverables]

5. TERMS AND CONDITIONS
[Standard terms and conditions]

Signatures:
Client: _________________ Date: _______
Freelancer: _____________ Date: _______
            """,
            
            "service": """
SERVICE AGREEMENT

This Service Agreement is made between [Service Provider] and [Client].

SERVICES: [Description of services]
DURATION: [Contract duration]
COMPENSATION: [Payment details]
RESPONSIBILITIES: [Roles and responsibilities]

[Additional terms and conditions]
            """
        }
        
        contract_content = contract_templates.get(request.contract_type, f"Contract template for {request.contract_type} will be generated based on the provided terms.")
        
        return {
            "contract_content": contract_content,
            "contract_type": request.contract_type,
            "tokens_used": len(contract_content.split())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)