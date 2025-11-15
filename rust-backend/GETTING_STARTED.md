# 🚀 Getting Started with Rust Backend

## Prerequisites Check

Before starting, make sure you have:

- [ ] **Rust** installed (1.75 or later)
- [ ] **MongoDB** running (locally or Docker)
- [ ] **Git** installed
- [ ] **Text editor** (VS Code recommended)

## Step-by-Step Setup

### 1. Install Rust (if not installed)

**Windows:**
```powershell
winget install Rustlang.Rust.MSVC
```

**Or download from:** https://rustup.rs/

**Verify installation:**
```bash
rustc --version
cargo --version
```

### 2. Start MongoDB

**Option A: Using Docker (Recommended)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

**Option B: Install MongoDB Community Edition**
Download from: https://www.mongodb.com/try/download/community

**Verify MongoDB is running:**
```bash
# Should connect successfully
mongosh mongodb://localhost:27017
```

### 3. Configure Environment

```bash
# Navigate to rust-backend directory
cd rust-backend

# Copy environment template
cp .env.example .env
```

**Edit `.env` file:**
```env
MONGODB_URI=mongodb://localhost:27017/orbix
JWT_SECRET=change-this-to-a-random-secret-key
PORT=5000
AI_SERVICE_URL=http://localhost:8000
```

**Generate a secure JWT secret:**
```bash
# On Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Or use any random 32+ character string
```

### 4. Build and Run

**First time (downloads dependencies):**
```bash
cargo build
```

This will take 5-10 minutes on first run. Subsequent builds are much faster.

**Run the server:**
```bash
cargo run
```

You should see:
```
✅ Connected to MongoDB
🦀 Orbix Rust Backend running on http://0.0.0.0:5000
```

### 5. Test the Backend

**Health check:**
```bash
curl http://localhost:5000/health
```

Expected response:
```
🦀 Orbix Rust Backend - Healthy!
```

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}"
```

Expected response:
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "avatar": null
  },
  "token": "eyJ..."
}
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### 6. Connect Frontend

Update your frontend environment file:

**`frontend/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Restart your frontend:
```bash
cd frontend
npm run dev
```

## Development Workflow

### Auto-reload on Changes

Install cargo-watch:
```bash
cargo install cargo-watch
```

Run with auto-reload:
```bash
cargo watch -x run
```

Now the server will restart automatically when you change code!

### Check Code Without Building

```bash
cargo check
```

This is faster than `cargo build` and catches compilation errors.

### Format Code

```bash
cargo fmt
```

### Lint Code

```bash
cargo clippy
```

### Run Tests

```bash
cargo test
```

## Common Issues & Solutions

### Issue: "MongoDB connection failed"

**Solution:**
1. Check MongoDB is running: `docker ps` or `mongosh`
2. Verify MONGODB_URI in `.env`
3. Check firewall settings

### Issue: "JWT_SECRET must be set"

**Solution:**
Add `JWT_SECRET` to your `.env` file with a random string.

### Issue: Slow first build

**Solution:**
This is normal! First build downloads and compiles all dependencies (5-10 min).
Subsequent builds are much faster (<10 seconds).

### Issue: "error: linker `link.exe` not found"

**Solution (Windows):**
Install Visual Studio Build Tools:
```powershell
winget install Microsoft.VisualStudio.2022.BuildTools
```

### Issue: Port 5000 already in use

**Solution:**
Change PORT in `.env` to another port (e.g., 5001).

### Issue: "Cannot find crate for `mongodb`"

**Solution:**
```bash
cargo clean
cargo build
```

## IDE Setup

### VS Code (Recommended)

Install extensions:
1. **rust-analyzer** - Language support
2. **CodeLLDB** - Debugging
3. **crates** - Dependency management
4. **Even Better TOML** - Cargo.toml syntax

**Settings:**
```json
{
  "rust-analyzer.checkOnSave.command": "clippy",
  "editor.formatOnSave": true
}
```

### IntelliJ IDEA / CLion

Install the **Rust plugin** from JetBrains marketplace.

## Project Structure

```
rust-backend/
├── src/
│   ├── main.rs              # Entry point
│   ├── config.rs            # Configuration
│   ├── database.rs          # MongoDB connection
│   ├── error.rs             # Error handling
│   ├── models/              # Data models
│   │   ├── user.rs
│   │   ├── client.rs
│   │   ├── invoice.rs
│   │   ├── project.rs
│   │   ├── time_entry.rs
│   │   ├── contract.rs
│   │   └── resume.rs
│   ├── handlers/            # API handlers
│   │   ├── auth.rs
│   │   ├── clients.rs
│   │   ├── invoices.rs
│   │   ├── projects.rs
│   │   ├── time_tracking.rs
│   │   ├── contracts.rs
│   │   └── resumes.rs
│   ├── middleware/          # Middleware
│   │   └── auth.rs
│   └── services/            # Business logic
├── Cargo.toml               # Dependencies
├── .env                     # Environment variables
└── README.md                # Documentation
```

## Next Steps

1. ✅ Backend is running
2. ✅ Test API endpoints
3. ✅ Connect frontend
4. 📖 Read [README.md](README.md) for API documentation
5. 📖 Read [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
6. 🚀 Start building features!

## Useful Commands

```bash
# Development
cargo run                    # Run server
cargo watch -x run          # Auto-reload
cargo check                 # Check compilation
cargo test                  # Run tests

# Code Quality
cargo fmt                   # Format code
cargo clippy                # Lint code
cargo audit                 # Security audit

# Production
cargo build --release       # Build optimized binary
./target/release/orbix-backend  # Run production binary

# Docker
docker-compose up -d        # Start with Docker
docker-compose logs -f      # View logs
docker-compose down         # Stop containers
```

## Learning Resources

### Rust Language
- **The Rust Book**: https://doc.rust-lang.org/book/
- **Rust by Example**: https://doc.rust-lang.org/rust-by-example/
- **Rustlings**: https://github.com/rust-lang/rustlings

### Axum Framework
- **Axum Docs**: https://docs.rs/axum/latest/axum/
- **Examples**: https://github.com/tokio-rs/axum/tree/main/examples

### MongoDB
- **Rust Driver**: https://www.mongodb.com/docs/drivers/rust/

## Getting Help

- **Rust Discord**: https://discord.gg/rust-lang
- **Axum Discord**: https://discord.gg/tokio
- **Stack Overflow**: Tag questions with `rust` and `axum`

## Success! 🎉

If you see this message, you're all set:
```
✅ Connected to MongoDB
🦀 Orbix Rust Backend running on http://0.0.0.0:5000
```

Your Rust backend is now running and ready to handle requests!
