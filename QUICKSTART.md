# Orbix Quick Start Checklist

Get Orbix up and running in minutes!

## ✅ Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.10+ installed
- [ ] PostgreSQL installed and running
- [ ] MongoDB installed and running
- [ ] Redis installed and running
- [ ] OpenAI API key (get from https://platform.openai.com)

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
# Install Node.js packages
npm install

# Install Python packages
cd ai-service
pip install -r requirements.txt
cd ..
```

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your credentials
# Required: DATABASE_URL, MONGODB_URI, OPENAI_API_KEY
```

### 3. Setup Database

```bash
# Create PostgreSQL database
createdb orbix

# Run schema
psql orbix < backend/database/schema.sql
```

### 4. Start Services

Open 3 terminal windows:

**Terminal 1:**
```bash
cd frontend
npm run dev
```

**Terminal 2:**
```bash
cd backend
npm run dev
```

**Terminal 3:**
```bash
cd ai-service
uvicorn main:app --reload
```

### 5. Access Application

Open your browser:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/health
- AI Service: http://localhost:8000/docs

## 🎯 First Steps

1. **Create Account**
   - Go to http://localhost:3000
   - Click "Get Started"
   - Fill in registration form

2. **Explore Dashboard**
   - View the main dashboard
   - Check out the 6 tools in the sidebar

3. **Test a Tool**
   - Click on "Invoices" or any tool
   - Explore the interface

## 🔧 Common Issues

### Port Already in Use
```bash
# Kill process on port 3000 (frontend)
npx kill-port 3000

# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 8000 (AI service)
npx kill-port 8000
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready

# Check MongoDB is running
mongosh

# Check Redis is running
redis-cli ping
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# For Python
pip install -r ai-service/requirements.txt
```

## 📚 Next Steps

- [ ] Read [DEVELOPMENT.md](DEVELOPMENT.md) for development workflow
- [ ] Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
- [ ] Start implementing features for each tool
- [ ] Integrate OpenAI API in AI service
- [ ] Add authentication logic
- [ ] Build out tool features

## 🎨 Development Tips

- Use React DevTools for frontend debugging
- Check terminal logs for backend errors
- Use FastAPI docs at `/docs` for AI service testing
- Keep all 3 services running during development
- Changes auto-reload in development mode

## 📖 Documentation

- [README.md](README.md) - Project overview
- [SETUP.md](SETUP.md) - Detailed setup guide
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Complete project details

## 🆘 Need Help?

1. Check the documentation files above
2. Review error messages in terminal
3. Check database connections
4. Verify environment variables
5. Ensure all services are running

## ✨ You're Ready!

Once all services are running and you can access the frontend, you're ready to start developing!

Happy coding! 🚀
