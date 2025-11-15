# Orbix System Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│                     http://localhost:3000                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Landing  │  │   Auth   │  │Dashboard │  │  Tools   │   │
│  │   Page   │  │  Pages   │  │   Page   │  │  Pages   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  Components: React, TailwindCSS, TipTap, Recharts          │
└──────────────────┬───────────────────────┬──────────────────┘
                   │                       │
                   ▼                       ▼
    ┌──────────────────────┐   ┌──────────────────────┐
    │  BACKEND API         │   │  AI SERVICE          │
    │  (Express/Node.js)   │   │  (FastAPI/Python)    │
    │  Port: 5000          │   │  Port: 8000          │
    │                      │   │                      │
    │  Routes:             │   │  Endpoints:          │
    │  • /api/auth         │   │  • /api/ai/generate  │
    │  • /api/invoices     │   │  • /api/ai/grammar   │
    │  • /api/clients      │   │  • /api/ai/rewrite   │
    │  • /api/time-track   │   │  • /api/ai/optimize  │
    │  • /api/contracts    │   │  • /api/ai/contract  │
    │  • /api/resumes      │   │                      │
    └──────────┬───────────┘   └──────────┬───────────┘
               │                          │
               │                          │
               ▼                          ▼
    ┌──────────────────────┐   ┌──────────────────────┐
    │  DATABASES           │   │  OPENAI API          │
    │                      │   │                      │
    │  PostgreSQL          │   │  GPT-4 Models        │
    │  • Users             │   │  • Content Gen       │
    │  • Clients           │   │  • Text Analysis     │
    │  • Invoices          │   │  • Optimization      │
    │  • Time Entries      │   │                      │
    │                      │   └──────────────────────┘
    │  MongoDB             │
    │  • Resumes           │
    │  • Contracts         │
    │  • AI Content        │
    │                      │
    │  Redis               │
    │  • Sessions          │
    │  • Cache             │
    └──────────────────────┘
```

## Data Flow Diagram

### Invoice Generation Flow
```
User → Dashboard → Invoice Page → Create Invoice Form
                                         ↓
                                   Select Client
                                         ↓
                                   Add Line Items
                                         ↓
                              POST /api/invoices
                                         ↓
                                Backend validates
                                         ↓
                              Save to PostgreSQL
                                         ↓
                              Generate PDF (PDFKit)
                                         ↓
                              Return invoice data
                                         ↓
                              Display success + PDF
```

### AI Content Generation Flow
```
User → Writing Tool → Enter Prompt → Select Type/Tone
                                           ↓
                              POST /api/ai/generate-content
                                           ↓
                                    AI Service receives
                                           ↓
                              Build prompt for OpenAI
                                           ↓
                              Call OpenAI GPT-4 API
                                           ↓
                              Process response
                                           ↓
                              Return generated content
                                           ↓
                              Display in editor (TipTap)
```

### Resume Optimization Flow
```
User → Resume Optimizer → Upload Resume + Job Description
                                    ↓
                      POST /api/ai/optimize-resume
                                    ↓
                          AI Service receives
                                    ↓
                      Extract text from PDF/DOCX
                                    ↓
                      Analyze with OpenAI
                                    ↓
                      Calculate ATS score
                                    ↓
                      Generate suggestions
                                    ↓
                      Return optimization data
                                    ↓
                      Display score + suggestions
```

### Time Tracking to Invoice Flow
```
User → Time Tracking → Start Timer → Work → Stop Timer
                                                  ↓
                                    Save time entry to DB
                                                  ↓
User → Invoices → Create from Time Entries
                                                  ↓
                              Fetch time entries for client
                                                  ↓
                              Calculate total hours × rate
                                                  ↓
                              Pre-fill invoice form
                                                  ↓
                              User reviews and sends
```

## Tool Integration Map

```
┌─────────────────────────────────────────────────────────┐
│                    SHARED DATA LAYER                     │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Users   │  │ Clients  │  │ Projects │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Invoice    │  │Time Tracking│  │  Contracts  │
│  Generator  │◄─┤             │  │  Generator  │
└─────────────┘  └─────────────┘  └─────────────┘
                                          │
                                          ▼
                                  Uses client data
                                          │
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Resume    │  │   Resume    │  │ AI Writing  │
│   Builder   │─►│  Optimizer  │  │  Assistant  │
└─────────────┘  └─────────────┘  └─────────────┘
      │                                   │
      └───────────────┬───────────────────┘
                      ▼
              Shared AI Service
```

## Authentication Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     ▼
┌─────────────────┐
│ Register/Login  │
│     Page        │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ POST /api/auth  │
│  /register      │
│  /login         │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Validate Data   │
│ Hash Password   │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Save to DB      │
│ Generate JWT    │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Return Token    │
│ Store in        │
│ localStorage    │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Redirect to     │
│ Dashboard       │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ All API calls   │
│ include token   │
│ in header       │
└─────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      PRODUCTION                          │
└─────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Vercel     │     │   Railway    │     │   Railway    │
│  (Frontend)  │────►│  (Backend)   │────►│ (AI Service) │
│              │     │              │     │              │
│  Next.js     │     │  Express     │     │  FastAPI     │
│  Static      │     │  Node.js     │     │  Python      │
└──────────────┘     └──────┬───────┘     └──────┬───────┘
                            │                    │
                            ▼                    ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  Supabase    │     │   OpenAI     │
                     │ (PostgreSQL) │     │     API      │
                     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ MongoDB      │
                     │   Atlas      │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Upstash    │
                     │   (Redis)    │
                     └──────────────┘
```

## File Storage Flow

```
User uploads file (Resume/Contract)
         │
         ▼
Frontend validates file type/size
         │
         ▼
POST to backend with multipart/form-data
         │
         ▼
Backend receives file (Multer middleware)
         │
         ▼
Save to local storage (./uploads)
         │
         ▼
Store file path in database
         │
         ▼
Return file URL to frontend
         │
         ▼
Display file or process with AI

Future: Replace local storage with S3/Cloudinary
```

## Security Layers

```
┌─────────────────────────────────────────┐
│         Request from Browser            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      CORS Middleware (Backend)          │
│      Check origin, methods              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      JWT Authentication                 │
│      Verify token, extract userId       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Input Validation (Zod)             │
│      Validate request body/params       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Rate Limiting (Redis)              │
│      Check request count per user       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Business Logic                     │
│      Process request                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Database Query                     │
│      Parameterized queries (no SQL inj) │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Return Response                    │
│      Sanitized data                     │
└─────────────────────────────────────────┘
```

This diagram shows the complete system architecture and data flows for Orbix!
