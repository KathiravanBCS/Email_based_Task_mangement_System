require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const taskRoutes = require('./src/routes/task.routes');
const categoryRoutes = require('./src/routes/category.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');

const errorHandler = require('./src/middleware/errorHandler');
const rateLimiter = require('./src/middleware/rateLimiter');
const cronJobs = require('./src/services/cron.service');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (required for Render, Heroku, etc.)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Compression & Logging
app.use(compression());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static Files (for uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting
app.use('/api/', rateLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error Handler (must be last)
app.use(errorHandler);

// Start Cron Jobs
if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
  cronJobs.startAllJobs();
  console.log('📅 Cron jobs started');
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;
