# Complete Setup Guide - Task Management Backend

## Step-by-Step Installation

### 1. Install PostgreSQL

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Run the installer
- Remember the password you set for the `postgres` user
- Default port: 5432

**Verify Installation:**
```bash
psql --version
```

### 2. Create Database

Open PostgreSQL command line (psql) or pgAdmin:

```sql
CREATE DATABASE task_management;
```

Or using command line:
```bash
createdb -U postgres task_management
```

### 3. Install Node.js

- Download from https://nodejs.org/ (LTS version recommended)
- Verify installation:
```bash
node --version
npm --version
```

### 4. Setup Project

1. Navigate to backend folder:
```bash
cd "D:\gokul project\backend"
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
copy .env.example .env
```

4. Edit `.env` file with your settings:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_management
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD

JWT_SECRET=my-super-secret-key-12345
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=my-refresh-secret-key-67890
JWT_REFRESH_EXPIRE=30d

# For development, you can disable email notifications
ENABLE_EMAIL_NOTIFICATIONS=false

FRONTEND_URL=http://localhost:3000
```

5. Run database migration:
```bash
npm run migrate
```

6. Seed database with sample data:
```bash
npm run seed
```

### 5. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 Server running on port 5000 in development mode
```

### 6. Test the API

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Login with default admin:**
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@taskmanager.com\",\"password\":\"admin123\"}"
```

## Email Configuration (Optional)

To enable email notifications:

### Gmail Setup:

1. Enable 2-Step Verification in your Google Account
2. Generate an App Password:
   - Go to Google Account > Security > 2-Step Verification
   - Scroll to "App passwords"
   - Generate a new app password

3. Update `.env`:
```env
ENABLE_EMAIL_NOTIFICATIONS=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=Task Manager <your-email@gmail.com>
```

### Other Email Providers:

**Outlook:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

## Common Issues

### Issue: "Database connection failed"

**Solution:**
- Ensure PostgreSQL service is running
- Check credentials in `.env`
- Verify database exists: `psql -U postgres -l`

### Issue: "Port 5000 already in use"

**Solution:**
- Change PORT in `.env` to another port (e.g., 5001)
- Or kill the process using port 5000:

Windows:
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: "Cannot find module"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Permission denied for uploads folder"

**Solution:**
Create uploads directory manually:
```bash
mkdir uploads
```

## pgAdmin Setup (Optional)

1. Open pgAdmin
2. Right-click "Servers" > Create > Server
3. General tab: Name = "Local PostgreSQL"
4. Connection tab:
   - Host: localhost
   - Port: 5432
   - Database: task_management
   - Username: postgres
   - Password: your_password

## VS Code Extensions (Recommended)

- **Thunder Client** or **REST Client** - For API testing
- **PostgreSQL** - Database management
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **GitLens** - Git integration

## Testing Endpoints

Import this collection to Postman/Thunder Client:

**Base URL:** `http://localhost:5000/api`

**Headers for authenticated requests:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

### Sample Requests:

1. **Register:**
```json
POST /auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "full_name": "Test User"
}
```

2. **Create Task:**
```json
POST /tasks
{
  "title": "My First Task",
  "description": "Task description",
  "priority": "high",
  "due_date": "2024-12-31T23:59:59Z"
}
```

3. **Get Dashboard Stats:**
```
GET /dashboard/stats
```

## Production Deployment

### Environment Setup:
```env
NODE_ENV=production
ENABLE_EMAIL_NOTIFICATIONS=true
RATE_LIMIT_MAX_REQUESTS=100
```

### Security Checklist:
- [ ] Change default admin password
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Use environment-specific configurations

### Deployment Platforms:

**Heroku:**
1. Install Heroku CLI
2. `heroku create your-app-name`
3. Add PostgreSQL addon: `heroku addons:create heroku-postgresql:hobby-dev`
4. Set environment variables: `heroku config:set KEY=value`
5. Deploy: `git push heroku main`

**Railway:**
1. Connect GitHub repository
2. Add PostgreSQL service
3. Set environment variables
4. Deploy automatically

**DigitalOcean:**
1. Create a Droplet
2. Install Node.js and PostgreSQL
3. Clone repository
4. Set up PM2 for process management
5. Configure Nginx as reverse proxy

## Monitoring

Install PM2 for production:
```bash
npm install -g pm2
pm2 start server.js --name task-api
pm2 logs
pm2 monit
```

## Backup Database

```bash
pg_dump -U postgres task_management > backup.sql
```

Restore:
```bash
psql -U postgres task_management < backup.sql
```

## Next Steps

1. ✅ Backend API is ready
2. 🚀 Build the frontend with React + Mantine UI
3. 🔗 Connect frontend to this API
4. 🎨 Customize email templates
5. 📊 Add more analytics features
6. 🧪 Write tests

## Support

If you encounter any issues:
1. Check the error messages in console
2. Verify all environment variables
3. Ensure database is properly migrated
4. Check PostgreSQL logs
5. Review the troubleshooting section

Happy coding! 🎉
