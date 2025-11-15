# Orbix Architecture

## Overview

Orbix is a monorepo-based full-stack application combining 6 productivity tools into a unified platform.

## Project Structure

```
orbix/
├── frontend/           # Next.js application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/# React components
│   │   └── lib/       # Utilities and API clients
│   └── package.json
│
├── backend/           # Node.js/Express API
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── models/    # Mongoose models
│   │   ├── middleware/# Auth, validation
│   │   └── config/    # Database config
│   └── package.json
│
├── ai-service/        # Python FastAPI microservice
│   ├── main.py        # FastAPI app
│   └── requirements.txt
│
└── shared/            # Shared TypeScript types
    └── types/
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Rich Text**: TipTap
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Mongoose (MongoDB), pg (PostgreSQL)
- **Authentication**: JWT
- **Validation**: Zod

### AI Service
- **Framework**: FastAPI
- **AI**: OpenAI GPT-4
- **NLP**: spaCy
- **Document Processing**: PyMuPDF, python-docx

### Databases
- **PostgreSQL**: Relational data (users, invoices, time entries)
- **MongoDB**: Document storage (resumes, contracts, AI content)
- **Redis**: Caching and sessions

## Data Flow

```
User → Frontend (Next.js) → Backend API (Express) → Database
                          ↓
                    AI Service (FastAPI) → OpenAI API
```

## Database Schema

### PostgreSQL Tables
- `users` - User accounts
- `clients` - Client information
- `projects` - Project tracking
- `time_entries` - Time tracking records
- `invoices` - Invoice data

### MongoDB Collections
- `resumes` - Resume documents
- `contracts` - Contract documents
- `ai_content` - AI-generated content

## API Structure

### Backend API (Port 5000)
- `/api/auth` - Authentication
- `/api/clients` - Client management
- `/api/invoices` - Invoice CRUD
- `/api/time-tracking` - Time entries
- `/api/contracts` - Contract management
- `/api/resumes` - Resume management

### AI Service API (Port 8000)
- `/api/ai/generate-content` - Content generation
- `/api/ai/check-grammar` - Grammar checking
- `/api/ai/rewrite` - Text rewriting
- `/api/ai/summarize` - Text summarization
- `/api/ai/optimize-resume` - Resume optimization
- `/api/ai/generate-contract` - Contract generation

## Authentication Flow

1. User registers/logs in via frontend
2. Backend validates credentials
3. JWT token issued
4. Token stored in localStorage
5. Token sent with each API request
6. Middleware validates token

## Tool Integration

Tools share data through:
- **Clients**: Used by Invoices, Time Tracking, Contracts
- **Projects**: Link Time Tracking to Invoices
- **User Profile**: Feeds Resume Builder

## Deployment Architecture

### Production Setup
- **Frontend**: Vercel
- **Backend**: Railway/Render/Fly.io
- **AI Service**: Railway/Render
- **PostgreSQL**: Managed service (Supabase/Neon)
- **MongoDB**: MongoDB Atlas
- **Redis**: Upstash/Redis Cloud

## Security Considerations

- JWT tokens for authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation with Zod
- SQL injection prevention
- XSS protection
- Rate limiting (Redis)

## Scalability

- Horizontal scaling of backend/AI service
- Database connection pooling
- Redis caching for frequent queries
- CDN for static assets
- Lazy loading of tool modules

## Future Enhancements

- WebSocket for real-time updates
- Background job processing
- Email notifications
- File upload to S3/Cloudinary
- Multi-tenancy support
- Mobile apps (React Native)
