# Task Management System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ] // Optional validation errors
}
```

---

## Authentication Endpoints

### Register User
```
POST /auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "user"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as Register

### Refresh Token
```
POST /auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

### Get Current User
```
GET /auth/me
```
**Requires:** Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "role": "user",
    "theme": "light",
    "email_notifications": { ... }
  }
}
```

---

## Task Endpoints

### Get All Tasks
```
GET /tasks?page=1&limit=10&status=in_progress&priority=high&search=keyword
```
**Requires:** Authentication

**Query Parameters:**
- `page` (number) - Page number, default: 1
- `limit` (number) - Items per page, default: 10
- `status` (string) - Filter by status
- `priority` (string) - Filter by priority
- `category_id` (uuid) - Filter by category
- `assigned_to` (uuid) - Filter by assignee
- `task_type` (string) - Filter by task type
- `search` (string) - Search in title/description

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Complete documentation",
      "description": "Write API docs",
      "task_type": "utility",
      "status": "in_progress",
      "priority": "high",
      "category_id": "uuid",
      "category_name": "Work",
      "category_color": "#228BE6",
      "assigned_to": "uuid",
      "assigned_to_name": "John Doe",
      "created_by": "uuid",
      "created_by_name": "Admin User",
      "due_date": "2024-12-31T23:59:59Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-02T00:00:00Z",
      "tags": ["urgent", "documentation"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Get Task By ID
```
GET /tasks/:id
```
**Requires:** Authentication

### Create Task
```
POST /tasks
```
**Requires:** Authentication

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "<p>Rich text description</p>",
  "task_type": "utility",
  "priority": "high",
  "category_id": "uuid",
  "tags": ["urgent", "documentation"],
  "assigned_to": "uuid",
  "due_date": "2024-12-31T23:59:59Z",
  "start_date": "2024-01-01T00:00:00Z",
  "is_recurring": false,
  "recurrence_pattern": {
    "frequency": "weekly",
    "interval": 1
  }
}
```

**Required Fields:**
- `title` (string, min 1 char)

**Optional Fields:**
- `description` (string)
- `task_type` (enum: file, reminder, utility) - default: utility
- `priority` (enum: low, medium, high, urgent) - default: medium
- `status` (enum) - default: not_started
- `category_id` (uuid)
- `tags` (array of strings)
- `assigned_to` (uuid)
- `due_date` (ISO date string)
- `start_date` (ISO date string)
- `is_recurring` (boolean)
- `recurrence_pattern` (object)

### Update Task
```
PUT /tasks/:id
```
**Requires:** Authentication

**Request Body:** Same fields as Create Task (all optional)

### Delete Task (Archive)
```
DELETE /tasks/:id
```
**Requires:** Authentication

Soft deletes the task by setting `archived_at` timestamp.

### Get Task History
```
GET /tasks/:id/history
```
**Requires:** Authentication

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "task_id": "uuid",
      "user_id": "uuid",
      "user_name": "John Doe",
      "action": "updated",
      "field_changed": "status",
      "old_value": "not_started",
      "new_value": "in_progress",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Add Comment
```
POST /tasks/:id/comments
```
**Requires:** Authentication

**Request Body:**
```json
{
  "content": "<p>This is a comment</p>",
  "parent_comment_id": "uuid" // Optional, for threaded comments
}
```

### Get Comments
```
GET /tasks/:id/comments
```
**Requires:** Authentication

### Upload Attachment
```
POST /tasks/:id/attachments
```
**Requires:** Authentication  
**Content-Type:** multipart/form-data

**Form Data:**
- `file` - The file to upload

**Supported File Types:**
- Images: jpeg, jpg, png, gif
- Documents: pdf, doc, docx, xls, xlsx, txt
- Archives: zip, rar

**Max Size:** 10MB

### Delete Attachment
```
DELETE /tasks/:id/attachments/:fileId
```
**Requires:** Authentication

---

## User Endpoints

### Get All Users
```
GET /users?page=1&limit=10&role=user&is_active=true
```
**Requires:** Authentication (Admin or Manager role)

### Get User By ID
```
GET /users/:id
```
**Requires:** Authentication

### Update User
```
PUT /users/:id
```
**Requires:** Authentication (Own profile or Admin)

**Request Body:**
```json
{
  "username": "newusername",
  "email": "new@example.com",
  "full_name": "New Name",
  "avatar_url": "https://...",
  "role": "manager" // Admin only
}
```

### Get User's Tasks
```
GET /users/:id/tasks?page=1&limit=10
```
**Requires:** Authentication

### Update User Settings
```
PUT /users/:id/settings
```
**Requires:** Authentication (Own settings only)

**Request Body:**
```json
{
  "theme": "dark",
  "email_notifications": {
    "task_assignment": true,
    "due_date_reminder": true,
    "status_update": true,
    "comments": true,
    "daily_digest": true,
    "weekly_summary": false
  },
  "timezone": "America/New_York",
  "language": "en"
}
```

### Change Password
```
POST /users/change-password
```
**Requires:** Authentication

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## Category Endpoints

### Get All Categories
```
GET /categories
```
**Requires:** Authentication

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Work",
      "color": "#228BE6",
      "icon": "💼",
      "created_by": "uuid",
      "created_by_name": "Admin",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Category
```
POST /categories
```
**Requires:** Authentication (Admin or Manager)

**Request Body:**
```json
{
  "name": "Personal",
  "color": "#40C057",
  "icon": "👤"
}
```

### Update Category
```
PUT /categories/:id
```
**Requires:** Authentication (Admin or Manager)

### Delete Category
```
DELETE /categories/:id
```
**Requires:** Authentication (Admin or Manager)

---

## Notification Endpoints

### Get User Notifications
```
GET /notifications?page=1&limit=20&is_read=false
```
**Requires:** Authentication

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "task_id": "uuid",
      "task_title": "Complete documentation",
      "notification_type": "task_assignment",
      "title": "New Task Assigned",
      "message": "You have been assigned a new task",
      "is_read": false,
      "email_sent": true,
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Get Unread Count
```
GET /notifications/unread-count
```
**Requires:** Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

### Mark As Read
```
PATCH /notifications/:id/read
```
**Requires:** Authentication

### Mark All As Read
```
PATCH /notifications/read-all
```
**Requires:** Authentication

### Delete Notification
```
DELETE /notifications/:id
```
**Requires:** Authentication

---

## Dashboard Endpoints

### Get Statistics
```
GET /dashboard/stats?user_id=uuid
```
**Requires:** Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTasks": 50,
    "completedTasks": 25,
    "overdueTasks": 3,
    "dueToday": 5,
    "dueThisWeek": 12,
    "inProgress": 15,
    "completionRate": 50.0
  }
}
```

### Get Recent Activity
```
GET /dashboard/recent?limit=10
```
**Requires:** Authentication

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "task_id": "uuid",
      "task_title": "Task name",
      "user_name": "John Doe",
      "action": "status_changed",
      "field_changed": "status",
      "old_value": "not_started",
      "new_value": "in_progress",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Get Chart Data
```
GET /dashboard/charts?type=completion&days=7
GET /dashboard/charts?type=priority
GET /dashboard/charts?type=category
GET /dashboard/charts?type=status
```
**Requires:** Authentication

**Chart Types:**
- `completion` - Tasks completed over time (requires `days` parameter)
- `priority` - Tasks grouped by priority
- `category` - Tasks grouped by category
- `status` - Tasks grouped by status

**Response (completion):**
```json
{
  "success": true,
  "data": [
    { "date": "2024-01-01", "count": 5 },
    { "date": "2024-01-02", "count": 3 }
  ]
}
```

**Response (priority/category/status):**
```json
{
  "success": true,
  "data": [
    { "priority": "high", "count": 15 },
    { "priority": "medium", "count": 20 }
  ]
}
```

---

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per window per IP

When exceeded, returns `429 Too Many Requests`

## Enums

### Task Status
- `not_started`
- `in_progress`
- `on_hold`
- `completed`
- `cancelled`

### Task Priority
- `low`
- `medium`
- `high`
- `urgent`

### Task Type
- `file`
- `reminder`
- `utility`

### User Role
- `user`
- `manager`
- `admin`

### Theme
- `light`
- `dark`

---

## Webhooks (Future Enhancement)

Coming soon: Webhook support for real-time notifications to external services.

## WebSocket Events (Future Enhancement)

Coming soon: Real-time updates using Socket.io for live collaboration.
