from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

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

class GrammarCheckRequest(BaseModel):
    text: str

class RewriteRequest(BaseModel):
    text: str
    tone: str  # professional, casual, formal, friendly

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

# Routes
@app.get("/health")
async def health():
    return {"status": "ok", "service": "Orbix AI Service"}

@app.post("/api/ai/generate-content")
async def generate_content(request: ContentGenerationRequest):
    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        system_prompts = {
            "blog": "You are a professional blog writer. Create engaging, well-structured blog posts.",
            "email": "You are a professional email writer. Create clear, concise, and professional emails.",
            "social": "You are a social media expert. Create engaging, catchy social media posts.",
            "marketing": "You are a marketing copywriter. Create persuasive marketing content.",
            "essay": "You are an academic writer. Create well-researched, structured essays.",
        }
        
        system_prompt = system_prompts.get(request.type, "You are a helpful writing assistant.")
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"{system_prompt} Write in a {request.tone} tone. Length: {request.length}."},
                {"role": "user", "content": request.prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        return {
            "content": response.choices[0].message.content,
            "tokens_used": response.usage.total_tokens
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/check-grammar")
async def check_grammar(request: GrammarCheckRequest):
    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a grammar expert. Check and correct grammar, spelling, and punctuation. Return the corrected text and list any errors found."},
                {"role": "user", "content": f"Check this text for errors:\n\n{request.text}"}
            ],
            temperature=0.3
        )
        
        return {
            "corrected_text": response.choices[0].message.content,
            "errors": [],
            "suggestions": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/rewrite")
async def rewrite_text(request: RewriteRequest):
    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"You are a writing expert. Rewrite the following text in a {request.tone} tone while maintaining the core message."},
                {"role": "user", "content": request.text}
            ],
            temperature=0.7
        )
        
        return {
            "rewritten_text": response.choices[0].message.content,
            "tone": request.tone
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/summarize")
async def summarize_text(request: SummarizeRequest):
    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        length_instructions = {
            "short": "in 2-3 sentences",
            "medium": "in 1-2 paragraphs",
            "long": "in 3-4 paragraphs with key points"
        }
        
        instruction = length_instructions.get(request.length, "concisely")
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"You are a summarization expert. Summarize the following text {instruction}."},
                {"role": "user", "content": request.text}
            ],
            temperature=0.5
        )
        
        return {
            "summary": response.choices[0].message.content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/optimize-resume")
async def optimize_resume(request: ResumeOptimizeRequest):
    # TODO: Implement resume optimization
    return {
        "optimized_resume": request.resume_text,
        "ats_score": 85,
        "suggestions": [
            "Add more action verbs",
            "Include relevant keywords from job description",
            "Quantify achievements with metrics"
        ],
        "missing_keywords": ["Python", "AWS", "Docker"]
    }

@app.post("/api/ai/generate-contract")
async def generate_contract(request: ContractGenerateRequest):
    # TODO: Implement contract generation
    return {
        "contract_content": f"Generated {request.contract_type} contract",
        "sections": []
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
