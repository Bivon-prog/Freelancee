# 🦀 Orbix Rust Backend

High-performance backend built with Rust, Axum, and MongoDB.

## Features

- **Blazing Fast**: Rust's zero-cost abstractions and Axum's performance
- **Memory Safe**: No null pointers, no data races
- **Type Safe**: Compile-time guarantees
- **Async/Await**: High concurrency with Tokio
- **MongoDB**: Flexible document database

## Tech Stack

- **Axum** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Tokio** - Async runtime
- **Serde** - Serialization

## Setup

1. Install Rust:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Install MongoDB

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Run the server:
```bash
cargo run
```

## Development

```bash
# Run in watch mode
cargo watch -x run

# Build for production
cargo build --release

# Run tests
cargo test
```

## API Endpoints

### Auth
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user

### Clients
- GET `/api/clients` - List clients
- POST `/api/clients` - Create client
- GET `/api/clients/:id` - Get client
- PUT `/api/clients/:id` - Update client
- DELETE `/api/clients/:id` - Delete client

### Invoices
- GET `/api/invoices` - List invoices
- POST `/api/invoices` - Create invoice
- GET `/api/invoices/:id` - Get invoice
- PUT `/api/invoices/:id` - Update invoice status

### Projects
- GET `/api/projects` - List projects
- POST `/api/projects` - Create project
- GET `/api/projects/:id` - Get project
- PUT `/api/projects/:id` - Update project
- DELETE `/api/projects/:id` - Delete project

### Time Tracking
- GET `/api/time-tracking` - List time entries
- POST `/api/time-tracking` - Start time entry
- POST `/api/time-tracking/:id/stop` - Stop time entry
- PUT `/api/time-tracking/:id` - Update time entry
- DELETE `/api/time-tracking/:id` - Delete time entry

### Contracts
- GET `/api/contracts` - List contracts
- POST `/api/contracts` - Create contract
- GET `/api/contracts/:id` - Get contract
- PUT `/api/contracts/:id` - Update contract
- DELETE `/api/contracts/:id` - Delete contract

### Resumes
- GET `/api/resumes` - List resumes
- POST `/api/resumes` - Create resume
- GET `/api/resumes/:id` - Get resume
- POST `/api/resumes/optimize` - Optimize resume with AI
- DELETE `/api/resumes/:id` - Delete resume
