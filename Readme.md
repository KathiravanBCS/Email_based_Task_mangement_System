# Task Management System - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Use Cases](#use-cases)
4. [Technology Stack](#technology-stack)
5. [Prerequisites](#prerequisites)
6. [Installation Guide](#installation-guide)
7. [Running the Application](#running-the-application)
8. [Application Structure](#application-structure)
9. [API Documentation](#api-documentation)
10. [Default Credentials](#default-credentials)
11. [Configuration](#configuration)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

The **Task Management System** is a comprehensive full-stack web application designed to help individuals and teams organize, track, and manage tasks efficiently. It features a modern React frontend and a robust Node.js backend with PostgreSQL database.

### What is this project?
A production-ready task management platform that enables users to:
- Create, organize, and track tasks with priorities and deadlines
- Collaborate through comments and file attachments
- Visualize progress through dashboards and analytics
- Receive email notifications and reminders
- Manage recurring tasks and scheduled activities
- Assign roles and manage team members

---

## ✨ Features

### Core Features
- 🔐 **Authentication & Authorization** - JWT-based secure login with role-based access (Admin, Manager, User)
- 📋 **Task Management** - Complete CRUD operations with filters, sorting, and pagination
- 📊 **Dashboard Analytics** - Real-time statistics, charts, and task insights
- 🔔 **Notifications System** - In-app and email notifications
- 💬 **Comments & Collaboration** - Rich text comments with @mentions
- 📎 **File Attachments** - Upload and manage task-related files
- 🏷️ **Categories & Tags** - Organize tasks with custom categories
- 🔄 **Recurring Tasks** - Daily, weekly, monthly recurring task support
- ⏰ **Automated Reminders** - Email reminders for due dates
- 🌓 **Dark Mode** - Light and dark theme support

### Advanced Features
- Kanban board view for visual task management
- Calendar view for date-based task visualization
- Task history and audit trail
- Email digest reports
- Scheduled cron jobs for automation
- File upload with type and size validation
- Rate limiting and security features
- Responsive design for mobile and desktop

---

## 💼 Use Cases

### Where to Use This Application

1. **Personal Task Management**
   - Organize daily to-dos and personal projects
   - Track goals and deadlines
   - Set reminders for important tasks

2. **Team Collaboration**
   - Assign tasks to team members
   - Track project progress
   - Comment and discuss on tasks
   - Share files and attachments

3. **Project Management**
   - Manage multiple projects with categories
   - Monitor task status and priorities
   - Generate reports and analytics
   - Track time-sensitive deliverables

4. **Business Operations**
   - Workflow automation with recurring tasks
   - Team performance monitoring
   - Resource allocation and management
   - Client project tracking

5. **Educational Institutions**
   - Student assignment tracking
   - Faculty task management
   - Course project organization
   - Administrative task handling

---

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js v14+
- **Framework:** Express.js
- **Database:** PostgreSQL v12+
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** Bcrypt
- **Email Service:** Nodemailer
- **File Upload:** Multer
- **Task Scheduling:** Node-cron
- **Security:** Helmet.js, CORS, Rate Limiting

### Frontend
- **Library:** React 18
- **Build Tool:** Vite
- **UI Framework:** Mantine UI v7
- **Routing:** React Router v6
- **State Management:** Zustand, React Query
- **HTTP Client:** Axios
- **Data Visualization:** Recharts
- **Date Handling:** Day.js
- **Rich Text Editor:** TipTap

---

## 📦 Prerequisites

Before installing the application, ensure you have:

- **Node.js** >= 16.x ([Download](https://nodejs.org/))
- **PostgreSQL** >= 12.x ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** (comes with Node.js)
- **Git** (for cloning the repository)

### Verify Installation
```bash
node --version    # Should show v16.x or higher
npm --version     # Should show npm version
psql --version    # Should show PostgreSQL version
```

---

## 🚀 Installation Guide

### Step 1: Clone or Extract the Project

If using Git:
```bash
git clone <repository-url>
cd "gokul project"
```

Or extract the project folder to your desired location.

### Step 2: Database Setup

1. **Start PostgreSQL service**
   - Windows: Start PostgreSQL from Services or pgAdmin
   - macOS: `brew services start postgresql`
   - Linux: `sudo systemctl start postgresql`

2. **Create database**
   ```bash
   # Open PostgreSQL command line
   psql -U postgres
   
   # Create database
   CREATE DATABASE task_management;
   
   # Exit
   \q
   ```

### Step 3: Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the backend directory with:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=task_management
   DB_USER=postgres
   DB_PASSWORD=your_postgresql_password
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-refresh-token-secret-key
   JWT_EXPIRE=24h
   JWT_REFRESH_EXPIRE=7d
   
   # Email Configuration (Optional - for notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=Task Manager <your-email@gmail.com>
   
   # File Upload
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   
   # CORS
   FRONTEND_URL=http://localhost:3000
   ```

   **Important:** Replace placeholder values with your actual credentials.

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Seed initial data (Optional)**
   ```bash
   npm run seed
   ```
   This creates default admin user and sample data.

### Step 4: Frontend Setup

1. **Open a new terminal and navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the frontend directory with:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

---

## ▶️ Running the Application

### Development Mode

1. **Start Backend Server** (from backend directory)
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on: `http://localhost:5000`

2. **Start Frontend Server** (from frontend directory - new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   Application runs on: `http://localhost:3000`

3. **Access the Application**
   - Open browser and navigate to: `http://localhost:3000`
   - Login with default credentials (see below)

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

Or deploy the `dist` folder to a static hosting service.

---

## 🏗️ Application Structure

### Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   └── database.js              # Database connection config
│   ├── controllers/
│   │   ├── auth.controller.js       # Authentication logic
│   │   ├── task.controller.js       # Task operations
│   │   ├── user.controller.js       # User management
│   │   ├── category.controller.js   # Category operations
│   │   ├── notification.controller.js
│   │   └── dashboard.controller.js  # Dashboard data
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── errorHandler.js          # Error handling
│   │   ├── rateLimiter.js           # Rate limiting
│   │   ├── upload.js                # File upload
│   │   └── validator.js             # Input validation
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── task.routes.js
│   │   ├── user.routes.js
│   │   ├── category.routes.js
│   │   ├── notification.routes.js
│   │   └── dashboard.routes.js
│   ├── services/
│   │   └── cron.service.js          # Scheduled jobs
│   ├── utils/
│   │   ├── email.js                 # Email utilities
│   │   └── helpers.js               # Helper functions
│   └── database/
│       ├── schema.sql               # Database schema
│       ├── migrate.js               # Migration script
│       └── seed.js                  # Seed data
├── uploads/                         # Uploaded files
├── server.js                        # Application entry point
├── .env                             # Environment variables
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/                  # Reusable components
│   │   └── Tasks/
│   ├── layouts/
│   │   ├── AuthLayout.jsx          # Auth pages layout
│   │   └── MainLayout.jsx          # App layout
│   ├── pages/
│   │   ├── Auth/                   # Login/Register
│   │   ├── Dashboard/              # Dashboard page
│   │   ├── Tasks/                  # Task pages
│   │   ├── Categories/             # Category management
│   │   ├── Notifications/          # Notifications
│   │   ├── Settings/               # User settings
│   │   └── Profile/                # User profile
│   ├── services/
│   │   └── api.js                  # API service layer
│   ├── store/
│   │   └── authStore.js            # Auth state
│   ├── App.jsx                     # Main component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── index.html
├── vite.config.js
├── .env
└── package.json
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh-token` | Refresh access token | No |
| POST | `/auth/logout` | Logout user | Yes |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password | No |

### Task Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tasks` | Get all tasks (with filters) | Yes |
| GET | `/tasks/:id` | Get task by ID | Yes |
| POST | `/tasks` | Create new task | Yes |
| PUT | `/tasks/:id` | Update task | Yes |
| DELETE | `/tasks/:id` | Archive task | Yes |
| GET | `/tasks/:id/history` | Get task history | Yes |
| POST | `/tasks/:id/comments` | Add comment | Yes |
| GET | `/tasks/:id/comments` | Get comments | Yes |
| POST | `/tasks/:id/attachments` | Upload attachment | Yes |
| DELETE | `/tasks/:id/attachments/:fileId` | Delete attachment | Yes |

### User Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | Admin/Manager |
| GET | `/users/:id` | Get user by ID | Yes |
| PUT | `/users/:id` | Update user | Yes |
| DELETE | `/users/:id` | Deactivate user | Admin |
| GET | `/users/:id/tasks` | Get user's tasks | Yes |
| PUT | `/users/:id/settings` | Update user settings | Yes |
| POST | `/users/change-password` | Change password | Yes |

### Category Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/categories` | Get all categories | Yes |
| GET | `/categories/:id` | Get category by ID | Yes |
| POST | `/categories` | Create category | Admin/Manager |
| PUT | `/categories/:id` | Update category | Admin/Manager |
| DELETE | `/categories/:id` | Delete category | Admin/Manager |

### Notification Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | Get user notifications | Yes |
| GET | `/notifications/unread-count` | Get unread count | Yes |
| PATCH | `/notifications/:id/read` | Mark as read | Yes |
| PATCH | `/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/notifications/:id` | Delete notification | Yes |

### Dashboard Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard/stats` | Get statistics | Yes |
| GET | `/dashboard/recent` | Get recent activity | Yes |
| GET | `/dashboard/charts` | Get chart data | Yes |
| GET | `/dashboard/tasks-by-status` | Tasks by status | Yes |

### Query Parameters (Tasks)
```
GET /api/tasks?status=in_progress&priority=high&page=1&limit=10
```

Available filters:
- `status`: not_started, in_progress, on_hold, completed, cancelled
- `priority`: low, medium, high, urgent
- `category_id`: Filter by category ID
- `assigned_to`: Filter by user ID
- `task_type`: file, reminder, utility
- `search`: Search in title and description
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

---

## 🔑 Default Credentials

After running the seed script, use these credentials:

**Admin Account:**
- Email: `admin@taskmanager.com`
- Password: `admin123`

**⚠️ IMPORTANT:** Change the default password immediately after first login!

---

## ⚙️ Configuration

### Email Setup (Optional)

For email notifications to work:

1. **Using Gmail:**
   - Enable 2-factor authentication
   - Generate App Password: https://myaccount.google.com/apppasswords
   - Use App Password in `.env` EMAIL_PASSWORD

2. **Using Other SMTP:**
   - Update EMAIL_HOST and EMAIL_PORT
   - Provide credentials in EMAIL_USER and EMAIL_PASSWORD

### File Upload Configuration

Supported file types:
- Images: JPEG, JPG, PNG, GIF
- Documents: PDF, DOC, DOCX, XLS, XLSX, TXT
- Archives: ZIP, RAR

Maximum file size: 10MB (configurable in `.env`)

### Automated Cron Jobs

The system runs these automated tasks:
- **Daily Digest** - 9:00 AM daily
- **Due Date Reminders** - Every 30 minutes
- **Auto Archive** - Weekly (completed tasks > 30 days)
- **Recurring Tasks** - Daily at 1:00 AM

---

## 🔧 Troubleshooting

### Database Connection Issues
```
Error: Connection failed
```
**Solutions:**
- Verify PostgreSQL is running
- Check DB credentials in `.env`
- Ensure database `task_management` exists
- Verify DB_PORT is correct (default: 5432)

### Backend Won't Start
```
Error: Port 5000 already in use
```
**Solutions:**
- Change PORT in backend `.env`
- Kill process using port 5000
- Windows: `netstat -ano | findstr :5000`
- Mac/Linux: `lsof -i :5000`

### Frontend Can't Connect to API
```
Error: Network Error
```
**Solutions:**
- Ensure backend is running on port 5000
- Check VITE_API_URL in frontend `.env`
- Verify CORS settings in backend
- Check FRONTEND_URL in backend `.env`

### Email Notifications Not Sending
**Solutions:**
- Verify SMTP credentials in `.env`
- For Gmail, use App Password
- Check firewall/network settings
- Test with a simple SMTP tool

### Migration Fails
```
Error: relation already exists
```
**Solutions:**
- Database already has tables
- Drop all tables and re-run migration
- Or skip migration if tables exist

### File Upload Fails
**Solutions:**
- Ensure `uploads/` directory exists
- Check write permissions on `uploads/`
- Verify MAX_FILE_SIZE setting
- Check file type restrictions

### Port 3000 Already in Use
**Solutions:**
- Change port in vite.config.js
- Or run: `npm run dev -- --port 3001`

### Installation Issues
```
Error: npm install fails
```
**Solutions:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 📝 Quick Start Commands

### Complete Setup (First Time)
```bash
# 1. Setup Backend
cd backend
npm install
# Configure .env file
npm run migrate
npm run seed
npm run dev

# 2. Setup Frontend (new terminal)
cd ../frontend
npm install
# Configure .env file
npm run dev

# 3. Open browser
# Navigate to http://localhost:3000
# Login with admin@taskmanager.com / admin123
```

### Daily Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 📚 Additional Resources

- **Backend README:** `backend/README.md`
- **Frontend README:** `frontend/README.md`
- **API Documentation:** `backend/API_DOCUMENTATION.md`
- **Email Setup Guide:** `backend/EMAIL_SETUP_GUIDE.md`
- **Quick Start:** `backend/QUICKSTART.md` & `frontend/QUICKSTART.md`

---

## 🤝 Support

For issues or questions:
1. Check this documentation
2. Review error logs in terminal
3. Check individual README files
4. Verify environment configurations

---

## 📄 License

ISC

---

**Last Updated:** October 26, 2025

**Version:** 1.0.0

---

## ✅ Verification Checklist

After installation, verify everything works:

- [ ] PostgreSQL database created
- [ ] Backend migrations completed
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Can login with default credentials
- [ ] Dashboard displays correctly
- [ ] Can create a new task
- [ ] Can edit and delete tasks
- [ ] Notifications appear
- [ ] File upload works (optional)
- [ ] Email notifications work (optional)

---

**Congratulations! Your Task Management System is ready to use!** 🎉
