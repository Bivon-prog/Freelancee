# Development Guide

## Getting Started

Follow the [SETUP.md](SETUP.md) guide first to install dependencies and configure your environment.

## Development Workflow

### Running the Application

Start all services in development mode:

```bash
# Option 1: Run all services at once (from root)
npm run dev

# Option 2: Run services individually
npm run dev:frontend  # Frontend only
npm run dev:backend   # Backend only
npm run dev:ai        # AI service only
```

### Code Structure

#### Frontend (Next.js)

```
frontend/src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── auth/                 # Auth pages
│   └── dashboard/            # Dashboard pages
│       ├── layout.tsx        # Dashboard layout
│       ├── page.tsx          # Dashboard home
│       ├── invoices/         # Invoice tool
│       ├── writing/          # AI Writing tool
│       ├── contracts/        # Contract tool
│       ├── time-tracking/    # Time tracking tool
│       ├── resume-builder/   # Resume builder
│       └── resume-optimizer/ # Resume optimizer
├── components/               # Reusable components
└── lib/
    └── api.ts               # API client functions
```

#### Backend (Express)

```
backend/src/
├── index.ts                 # Entry point
├── routes/                  # API routes
│   ├── auth.ts
│   ├── clients.ts
│   ├── invoices.ts
│   ├── timeTracking.ts
│   ├── contracts.ts
│   └── resumes.ts
├── models/                  # Mongoose models
│   ├── Contract.ts
│   └── Resume.ts
├── middleware/
│   └── auth.ts             # JWT authentication
└── config/
    └── database.ts         # Database connections
```

#### AI Service (FastAPI)

```
ai-service/
├── main.py                 # FastAPI app
├── services/               # AI service logic (to be added)
└── requirements.txt        # Python dependencies
```

## Adding New Features

### Adding a New API Endpoint

1. Create route in `backend/src/routes/`
2. Add route to `backend/src/index.ts`
3. Create API function in `frontend/src/lib/api.ts`
4. Use in frontend components

Example:

```typescript
// backend/src/routes/example.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  // Your logic here
});

export default router;
```

### Adding a New Frontend Page

1. Create page in `frontend/src/app/dashboard/[tool-name]/page.tsx`
2. Add navigation link in `frontend/src/app/dashboard/layout.tsx`

### Adding AI Functionality

1. Add endpoint in `ai-service/main.py`
2. Implement OpenAI integration
3. Create API function in frontend
4. Use in components

## Database Migrations

### PostgreSQL

When schema changes:

```bash
# Edit backend/database/schema.sql
# Then run:
psql orbix < backend/database/schema.sql
```

### MongoDB

Mongoose handles schema automatically. Just update models.

## Testing

### Frontend Testing

```bash
cd frontend
npm run test
```

### Backend Testing

```bash
cd backend
npm run test
```

### API Testing

Use the FastAPI docs at http://localhost:8000/docs for testing AI endpoints.

## Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

## Environment Variables

Never commit `.env` files. Always use `.env.example` as template.

## Common Tasks

### Adding a New Tool

1. Create database schema/model
2. Create backend routes
3. Create frontend page
4. Add navigation link
5. Implement features

### Integrating OpenAI

```python
# ai-service/main.py
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": prompt}]
)
```

### Adding Authentication to Route

```typescript
// backend
import { authenticate } from '../middleware/auth';
router.use(authenticate);

// Frontend
import { api } from '@/lib/api';
const response = await api.get('/api/endpoint');
```

## Debugging

### Frontend
- Use React DevTools
- Check browser console
- Use Next.js error overlay

### Backend
- Check terminal logs
- Use console.log or debugger
- Check database connections

### AI Service
- Check FastAPI logs
- Use `/docs` endpoint for testing
- Verify OpenAI API key

## Performance Tips

- Use React.memo for expensive components
- Implement pagination for large lists
- Cache API responses
- Optimize database queries
- Use Redis for frequent data

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/tool-name

# Make changes and commit
git add .
git commit -m "Add feature description"

# Push and create PR
git push origin feature/tool-name
```

## Deployment

See deployment guides for:
- Vercel (Frontend)
- Railway/Render (Backend)
- Database services

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Express Docs](https://expressjs.com/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
