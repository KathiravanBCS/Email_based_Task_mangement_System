# Frontend Quick Start Guide

## Install and Run (2 Minutes)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
Navigate to: http://localhost:3000

### 4. Login
Use the default admin credentials:
- **Email:** admin@taskmanager.com
- **Password:** admin123

## That's It!

You should now see the Task Management dashboard.

## Common Issues

**Port 3000 in use?**
```bash
npm run dev -- --port 3001
```

**Cannot connect to API?**
- Make sure backend is running on port 5000
- Check `.env` file has correct API URL

**Dependencies error?**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Features Available

✅ Login/Register
✅ Dashboard with charts
✅ Task List with filters
✅ Create/Edit tasks
✅ Kanban board
✅ Dark mode toggle
✅ Responsive design

## Next Steps

- Explore the dashboard
- Create your first task
- Try different views (List/Kanban)
- Customize your profile
- Enable dark mode
