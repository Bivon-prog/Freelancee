# 🚀 Rust Backend Quickstart

## Prerequisites

- Rust 1.75+ (`rustup` installed)
- MongoDB 7+
- Git

## 5-Minute Setup

### 1. Install Rust (if not installed)

```bash
# Windows
winget install Rustlang.Rust.MSVC

# Or visit: https://rustup.rs/
```

### 2. Start MongoDB

```bash
# Using Docker (easiest)
docker run -d -p 27017:27017 --name mongodb mongo:7

# Or install MongoDB Community Edition
```

### 3. Configure

```bash
cd rust-backend
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/orbix
JWT_SECRET=your-super-secret-key-change-this
PORT=5000
AI_SERVICE_URL=http://localhost:8000
```

### 4. Run

```bash
cargo run
```

That's it! Backend running on `http://localhost:5000` 🎉

## Test It

```bash
# Health check
curl http://localhost:5000/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## Development

```bash
# Auto-reload on changes (install cargo-watch first)
cargo install cargo-watch
cargo watch -x run

# Run tests
cargo test

# Build for production
cargo build --release
```

## Common Issues

### "MongoDB connection failed"
- Make sure MongoDB is running
- Check MONGODB_URI in .env

### "JWT_SECRET must be set"
- Add JWT_SECRET to .env file

### Slow first build
- First build downloads dependencies (5-10 min)
- Subsequent builds are fast (<10 sec)

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) for migration details
- Explore the API endpoints
