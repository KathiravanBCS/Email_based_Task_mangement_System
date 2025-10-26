const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskHistory,
  addComment,
  getComments,
  uploadAttachment,
  deleteAttachment
} = require('../controllers/task.controller');

router.use(protect);

router.get('/', getAllTasks);

router.get('/:id', getTaskById);

router.post('/', authorize('admin', 'manager'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('task_type').optional().isIn(['file', 'reminder', 'utility']).withMessage('Invalid task type'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled']).withMessage('Invalid status'),
  validate
], createTask);

router.put('/:id', updateTask);

router.delete('/:id', authorize('admin', 'manager'), deleteTask);

router.get('/:id/history', getTaskHistory);

router.post('/:id/comments', [
  body('content').trim().notEmpty().withMessage('Comment content is required'),
  validate
], addComment);

router.get('/:id/comments', getComments);

router.post('/:id/attachments', upload.single('file'), uploadAttachment);

router.delete('/:id/attachments/:fileId', deleteAttachment);

module.exports = router;
