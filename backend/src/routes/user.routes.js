const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserTasks,
  updateUserSettings,
  changePassword
} = require('../controllers/user.controller');

router.use(protect);

router.get('/', getAllUsers);

router.get('/:id', getUserById);

router.put('/:id', updateUser);

router.delete('/:id', authorize('admin'), deleteUser);

router.get('/:id/tasks', getUserTasks);

router.put('/:id/settings', [
  body('theme').optional().isIn(['light', 'dark']).withMessage('Invalid theme'),
  validate
], updateUserSettings);

router.post('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate
], changePassword);

module.exports = router;
