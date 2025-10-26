const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getStats,
  getRecentActivity,
  getChartData,
  getTasksByStatus
} = require('../controllers/dashboard.controller');

router.use(protect);

router.get('/stats', getStats);

router.get('/recent', getRecentActivity);

router.get('/charts', getChartData);

router.get('/tasks-by-status', getTasksByStatus);

module.exports = router;
