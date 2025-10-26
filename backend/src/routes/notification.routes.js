const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = require('../controllers/notification.controller');

router.use(protect);

router.get('/', getUserNotifications);

router.get('/unread-count', getUnreadCount);

router.patch('/:id/read', markAsRead);

router.patch('/read-all', markAllAsRead);

router.delete('/:id', deleteNotification);

module.exports = router;
