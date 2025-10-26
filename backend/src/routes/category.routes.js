const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');

router.use(protect);

router.get('/', getAllCategories);

router.get('/:id', getCategoryById);

router.post('/', authorize('admin', 'manager'), [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Invalid color format'),
  validate
], createCategory);

router.put('/:id', authorize('admin', 'manager'), updateCategory);

router.delete('/:id', authorize('admin', 'manager'), deleteCategory);

module.exports = router;
