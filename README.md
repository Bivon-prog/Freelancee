# Orbix - Smart Solutions for Your Work

A unified productivity platform combining 6 essential business tools into one seamless application.

## 🎯 The 6 Tools

1. **💰 Invoice Generator** - Create and manage professional invoices
2. **✍️ AI Writing Assistant** - AI-powered content creation and improvement
3. **📄 Contract Generator** - Generate professional legal documents
4. **⏱️ Time Tracking & Billing** - Track work hours and generate bills
5. **📝 Resume Builder** - Create professional resumes and portfolios
6. **🎯 Resume Optimizer** - Optimize resumes for job applications

## 🚀 Quick Start

### Prerequisites
- Rust 1.75+ (for backend)
- MongoDB 7+ (running)
- Python 3.8+ (for serving frontend)

### 1. Start MongoDB
```bash
# Make sure MongoDB service is running
# On Windows: MongoDB should be running as a service
```

### 2. Configure Backend
```bash
cd rust-backend
# Edit .env file with your settings
```

### 3. Start Backend
```bash
cd rust-backend
cargo run
# Backend will run on http://localhost:5000
```

### 4. Start Frontend
```bash
cd frontend-simple
python -m http.server 3000
# Frontend will run on http://localhost:3000
```

### 5. Open Application
Open your browser and navigate to: http://localhost:3000

## 📁 Project Structure

```
Orbix/
├── rust-backend/          # Rust/Axum backend API
│   ├── src/
│   │   ├── handlers/      # API route handlers
│   │   ├── models/        # Data models
│   │   ├── middleware/    # Auth middleware
│   │   ├── database.rs    # MongoDB connection
│   │   ├── config.rs      # Configuration
│   │   └── main.rs        # Entry point
│   ├── Cargo.toml
│   └── .env               # Environment variables
│
├── frontend-simple/       # HTML/CSS/JS frontend
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Styling
│   └── app.js             # JavaScript logic
│
├── .env.example           # Example environment variables
├── README.md              # This file
├── TOOLS_STATUS.md        # Tool connection status
└── LICENSE
```

## 🔧 Technology Stack

### Backend
- **Rust** - High-performance, memory-safe backend
- **Axum** - Modern web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling
- **Vanilla JavaScript** - Logic (no frameworks!)

## 📊 Features

### ✅ Working Features
- User authentication (register/login)
- Invoice creation and management
- Contract generation
- Time tracking with timer
- Resume building
- Client management
- Project management
- Data persistence in MongoDB

### ⚠️ Needs AI Integration
- AI Writing Assistant
- Resume Optimizer

## 🔐 Authentication

All API routes (except auth) are protected with JWT authentication. Users must register and login to access the tools.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Invoices
- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get invoice
- `PUT /api/invoices/:id` - Update invoice

### Contracts
- `GET /api/contracts` - List all contracts
- `POST /api/contracts` - Create contract
- `GET /api/contracts/:id` - Get contract
- `PUT /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract

### Time Tracking
- `GET /api/time-tracking` - List time entries
- `POST /api/time-tracking` - Create time entry
- `POST /api/time-tracking/:id/stop` - Stop timer
- `DELETE /api/time-tracking/:id` - Delete entry

### Resumes
- `GET /api/resumes` - List all resumes
- `POST /api/resumes` - Create resume
- `GET /api/resumes/:id` - Get resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create client
- `GET /api/clients/:id` - Get client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## 🛠️ Development

### Backend Development
```bash
cd rust-backend
cargo watch -x run  # Auto-reload on changes
cargo test          # Run tests
```

### Frontend Development
Just edit the HTML/CSS/JS files and refresh your browser!

## 📦 Environment Variables

Create a `.env` file in `rust-backend/`:

```env
MONGODB_URI=mongodb://localhost:27017/orbix
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
AI_SERVICE_URL=http://localhost:8000
OPENAI_API_KEY=your-openai-api-key
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Roadmap

- [ ] Add AI service integration
- [ ] Implement PDF generation
- [ ] Add email notifications
- [ ] Mobile responsive improvements
- [ ] Add search and filtering
- [ ] Export data functionality
- [ ] Team collaboration features
- [ ] Payment gateway integration

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for freelancers, businesses, and professionals worldwide.**
