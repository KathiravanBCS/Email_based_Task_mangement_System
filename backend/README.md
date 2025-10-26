# Task Management System - Backend API

A comprehensive RESTful API for an advanced task management system built with Node.js, Express, and PostgreSQL.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 📋 **Task Management** - Complete CRUD operations with filtering, sorting, and pagination
- 🔔 **Notifications** - Real-time notifications and email alerts
- 📊 **Dashboard Analytics** - Statistics and charts for task insights
- 💬 **Comments & Collaboration** - Rich text comments and mentions
- 📎 **File Attachments** - Upload and manage task attachments
- ⏰ **Scheduled Tasks** - Cron jobs for reminders and automation
- 📧 **Email Service** - Nodemailer integration for notifications
- 🏷️ **Categories & Tags** - Organize tasks with categories and tags
- 🔄 **Recurring Tasks** - Support for daily, weekly, and monthly recurring tasks

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Node-cron** - Task scheduling
- **Multer** - File uploads

## Prerequisites

- Node.js >= 14.x
- PostgreSQL >= 12.x
- npm or yarn

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_management
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
```

4. **Create PostgreSQL database**
```bash
createdb task_management
```

5. **Run database migration**
```bash
npm run migrate
```

6. **Seed database with initial data** (Optional)
```bash
npm run seed
```

## Running the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on `http://localhost:5000`

## API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/refresh-token     - Refresh access token
POST   /api/auth/logout            - Logout user
GET    /api/auth/me                - Get current user
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password
```

### Users
```
GET    /api/users                  - Get all users (Admin/Manager only)
GET    /api/users/:id              - Get user by ID
PUT    /api/users/:id              - Update user
DELETE /api/users/:id              - Deactivate user (Admin only)
GET    /api/users/:id/tasks        - Get user's tasks
PUT    /api/users/:id/settings     - Update user settings
POST   /api/users/change-password  - Change password
```

### Tasks
```
GET    /api/tasks                         - Get all tasks (with filters)
GET    /api/tasks/:id                     - Get task by ID
POST   /api/tasks                         - Create new task
PUT    /api/tasks/:id                     - Update task
DELETE /api/tasks/:id                     - Archive task
GET    /api/tasks/:id/history             - Get task history
POST   /api/tasks/:id/comments            - Add comment
GET    /api/tasks/:id/comments            - Get comments
POST   /api/tasks/:id/attachments         - Upload attachment
DELETE /api/tasks/:id/attachments/:fileId - Delete attachment
```

### Categories
```
GET    /api/categories     - Get all categories
GET    /api/categories/:id - Get category by ID
POST   /api/categories     - Create category (Admin/Manager only)
PUT    /api/categories/:id - Update category (Admin/Manager only)
DELETE /api/categories/:id - Delete category (Admin/Manager only)
```

### Notifications
```
GET    /api/notifications              - Get user notifications
GET    /api/notifications/unread-count - Get unread count
PATCH  /api/notifications/:id/read     - Mark as read
PATCH  /api/notifications/read-all     - Mark all as read
DELETE /api/notifications/:id          - Delete notification
```

### Dashboard
```
GET    /api/dashboard/stats          - Get dashboard statistics
GET    /api/dashboard/recent         - Get recent activity
GET    /api/dashboard/charts         - Get chart data
GET    /api/dashboard/tasks-by-status - Get tasks grouped by status
```

## Query Parameters

### Tasks Filtering
```
GET /api/tasks?status=in_progress&priority=high&page=1&limit=10
```

Available filters:
- `status` - Filter by status (not_started, in_progress, on_hold, completed, cancelled)
- `priority` - Filter by priority (low, medium, high, urgent)
- `category_id` - Filter by category ID
- `assigned_to` - Filter by assigned user ID
- `task_type` - Filter by task type (file, reminder, utility)
- `search` - Search in title and description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

## Request Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "priority": "high",
    "task_type": "utility",
    "due_date": "2024-12-31T23:59:59Z"
  }'
```

## Database Schema

See [src/database/schema.sql](src/database/schema.sql) for complete schema.

### Main Tables:
- `users` - User accounts
- `tasks` - Task items
- `categories` - Task categories
- `comments` - Task comments
- `attachments` - File attachments
- `notifications` - User notifications
- `task_history` - Audit trail
- `user_settings` - User preferences
- `refresh_tokens` - JWT refresh tokens

## Cron Jobs

The system runs several automated jobs:

- **Daily Digest** - Sends daily task summary at 9:00 AM
- **Due Date Reminders** - Checks every 30 minutes for upcoming tasks
- **Auto Archive** - Archives completed tasks older than 30 days (weekly)
- **Recurring Tasks** - Creates new instances of recurring tasks (daily at 1:00 AM)

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- Helmet.js security headers
- CORS configuration
- SQL injection prevention
- XSS protection

## File Uploads

Supported file types:
- Images: JPEG, JPG, PNG, GIF
- Documents: PDF, DOC, DOCX, XLS, XLSX, TXT
- Archives: ZIP, RAR

Max file size: 10MB (configurable in .env)

## Email Templates

The system includes beautiful HTML email templates for:
- Task assignment notifications
- Due date reminders
- Status update notifications
- Daily digest
- New comment notifications

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": {} // Optional validation details
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Environment Variables

See [.env.example](.env.example) for all available configuration options.

## Default Admin Credentials

After running the seed script:
- **Email:** admin@taskmanager.com
- **Password:** admin123

⚠️ **Important:** Change the default admin password immediately after first login!

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js         # Database configuration
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── task.controller.js
│   │   ├── user.controller.js
│   │   ├── category.controller.js
│   │   ├── notification.controller.js
│   │   └── dashboard.controller.js
│   ├── middleware/
│   │   ├── auth.js             # Authentication middleware
│   │   ├── errorHandler.js     # Global error handler
│   │   ├── rateLimiter.js      # Rate limiting
│   │   ├── upload.js           # File upload handling
│   │   └── validator.js        # Input validation
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── task.routes.js
│   │   ├── user.routes.js
│   │   ├── category.routes.js
│   │   ├── notification.routes.js
│   │   └── dashboard.routes.js
│   ├── services/
│   │   └── cron.service.js     # Scheduled jobs
│   ├── utils/
│   │   ├── email.js            # Email utilities
│   │   └── helpers.js          # Helper functions
│   └── database/
│       ├── schema.sql          # Database schema
│       ├── migrate.js          # Migration script
│       └── seed.js             # Seed script
├── uploads/                    # Uploaded files
├── server.js                   # Application entry point
├── package.json
├── .env.example
└── README.md
```

## Testing

Use tools like Postman or Thunder Client to test the API endpoints.

Import the endpoints or use the examples provided above.

## Troubleshooting

### Database connection fails
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database exists

### Email sending fails
- Verify SMTP credentials
- For Gmail, use App Password instead of regular password
- Check firewall/network settings

### File upload fails
- Verify `uploads/` directory exists and has write permissions
- Check file size and type restrictions
- Ensure `MAX_FILE_SIZE` is set correctly

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Support

For issues and questions, please open an issue in the repository.
