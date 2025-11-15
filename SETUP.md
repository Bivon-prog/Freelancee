# Orbix Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.10+ ([Download](https://www.python.org/))
- **PostgreSQL** ([Download](https://www.postgresql.org/download/))
- **MongoDB** ([Download](https://www.mongodb.com/try/download/community))
- **Redis** ([Download](https://redis.io/download))

## Installation Steps

### 1. Clone and Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies for AI service
cd ai-service
pip install -r requirements.txt
cd ..
```

### 2. Database Setup

#### PostgreSQL Setup

```bash
# Create database
createdb orbix

# Run schema
psql orbix < backend/database/schema.sql
```

#### MongoDB Setup

MongoDB will automatically create the database on first connection.

#### Redis Setup

Start Redis server:
```bash
redis-server
```

### 3. Environment Variables

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/orbix
MONGODB_URI=mongodb://localhost:27017/orbix
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_SECRET=generate-a-random-secret-here
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=generate-another-random-secret

# AI Service
OPENAI_API_KEY=your-openai-api-key-here
AI_SERVICE_URL=http://localhost:8000

# Backend
BACKEND_URL=http://localhost:5000
```

### 4. Start Development Servers

Open three terminal windows:

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - AI Service:**
```bash
cd ai-service
uvicorn main:app --reload
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Quick Start

1. Open http://localhost:3000
2. Click "Get Started" to create an account
3. Login and explore the dashboard
4. Navigate between tools using the sidebar

## Development Tips

- Frontend hot-reloads automatically on file changes
- Backend restarts automatically with tsx watch
- AI service reloads with uvicorn --reload
- Check console logs for any errors

## Troubleshooting

### Port Already in Use

If ports are already in use, you can change them:

- Frontend: Edit `frontend/package.json` dev script
- Backend: Set `PORT` in `.env`
- AI Service: Change port in `ai-service/main.py`

### Database Connection Issues

- Ensure PostgreSQL is running: `pg_isready`
- Ensure MongoDB is running: `mongosh`
- Ensure Redis is running: `redis-cli ping`

### OpenAI API Issues

- Verify your API key is correct
- Check your OpenAI account has credits
- Review rate limits if getting 429 errors

## Next Steps

- Implement OpenAI integration in AI service
- Add authentication logic
- Build out individual tool features
- Add payment gateway integration
- Deploy to production

## Support

For issues or questions, check the documentation or create an issue in the repository.
