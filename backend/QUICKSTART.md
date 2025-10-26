# Quick Start Guide - 5 Minutes Setup

## Prerequisites Checklist
- [ ] Node.js installed (v14+)
- [ ] PostgreSQL installed (v12+)
- [ ] Code editor (VS Code recommended)

## Installation Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Database
```bash
# Windows
createdb -U postgres task_management

# Or using psql
psql -U postgres
CREATE DATABASE task_management;
\q
```

### 3. Configure Environment
```bash
# Copy example env file
copy .env.example .env

# Edit .env and set your PostgreSQL password
# Minimum required:
DB_PASSWORD=your_postgres_password
JWT_SECRET=any-random-string-here
```

### 4. Run Migrations
```bash
npm run migrate
```

### 5. Seed Database (Optional)
```bash
npm run seed
```

### 6. Start Server
```bash
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 Server running on port 5000 in development mode
```

## Test It Works

Open browser or use curl:
```bash
curl http://localhost:5000/api/health
```

Should return: `{"status":"OK","timestamp":"..."}`

## Login with Default Admin

**Email:** admin@taskmanager.com  
**Password:** admin123

```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@taskmanager.com\",\"password\":\"admin123\"}"
```

## What's Next?

1. ✅ Backend is running
2. 📖 Read [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for all endpoints
3. 🧪 Test endpoints with Postman/Thunder Client
4. 🎨 Build frontend or integrate with existing app
5. 📧 Configure email (optional) - see [SETUP_GUIDE.md](SETUP_GUIDE.md)

## Common Commands

```bash
# Development with auto-reload
npm run dev

# Production
npm start

# Re-run migrations
npm run migrate

# Reset database (migration + seed)
npm run migrate && npm run seed
```

## Troubleshooting

**Can't connect to database?**
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`

**Port already in use?**
- Change `PORT=5000` to `PORT=5001` in `.env`

**Module not found?**
```bash
npm install
```

## Project Structure Overview

```
backend/
├── src/
│   ├── controllers/   # Business logic
│   ├── routes/        # API endpoints
│   ├── middleware/    # Auth, validation, etc.
│   ├── services/      # Cron jobs, email
│   ├── utils/         # Helper functions
│   └── database/      # Schema, migrations
├── uploads/           # File storage
├── server.js          # Entry point
└── .env               # Configuration
```

## API Endpoints Summary

```
POST   /api/auth/register       - Create account
POST   /api/auth/login          - Login
GET    /api/auth/me             - Get profile

GET    /api/tasks               - List tasks
POST   /api/tasks               - Create task
PUT    /api/tasks/:id           - Update task
DELETE /api/tasks/:id           - Delete task

GET    /api/dashboard/stats     - Dashboard data
GET    /api/notifications       - Get notifications
GET    /api/categories          - Get categories
```

See full documentation in [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Support

Need help? Check:
1. [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup
2. [README.md](README.md) - Complete documentation
3. [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference

---

**🎉 You're all set! Happy coding!**
