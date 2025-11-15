# Orbix - Smart Solutions for Your Work

A unified platform combining 6 powerful productivity tools for freelancers, businesses, and professionals.

## Tools Included

1. **Freelance Invoice Generator** - Create, manage, and track invoices
2. **AI Writing Assistant** - Content generation, grammar checking, and rewriting
3. **Contract & Proposal Generator** - Professional contracts and business proposals
4. **Time Tracking & Billing** - Track hours and generate bills automatically
5. **Resume & Portfolio Builder** - Create professional CVs and portfolios
6. **AI Resume Optimizer** - ATS-optimized resume analysis and improvement

## Tech Stack

- **Frontend**: Next.js, TailwindCSS, TipTap, Recharts
- **Backend**: Node.js, Express, PostgreSQL, MongoDB, Redis
- **AI Service**: Python FastAPI, OpenAI GPT-4, LangChain
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL
- MongoDB
- Redis

### Installation

```bash
# Install all dependencies
npm run install:all

# Set up environment variables
cp .env.example .env

# Run development servers
npm run dev
```

## Project Structure

```
/orbix
  /frontend       - Next.js application
  /backend        - Express API server
  /ai-service     - FastAPI AI microservice
  /shared         - Shared types and utilities
```

## License

Proprietary
