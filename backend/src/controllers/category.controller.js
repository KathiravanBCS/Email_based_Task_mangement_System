const db = require('../config/database');
const { asyncHandler } = require('../utils/helpers');

exports.getAllCategories = asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT c.*, u.full_name as created_by_name
     FROM categories c
     LEFT JOIN users u ON c.created_by = u.id
     ORDER BY c.created_at DESC`
  );

  res.json({
    success: true,
    data: result.rows
  });
});

exports.getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    `SELECT c.*, u.full_name as created_by_name
     FROM categories c
     LEFT JOIN users u ON c.created_by = u.id
     WHERE c.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Category not found'
    });
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const { name, color = '#228BE6', icon } = req.body;

  const result = await db.query(
    `INSERT INTO categories (name, color, icon, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, color, icon, req.user.id]
  );

  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, color, icon } = req.body;

  const fields = [];
  const values = [];
  let paramCount = 1;

  if (name) {
    fields.push(`name = $${paramCount}`);
    values.push(name);
    paramCount++;
  }
  if (color) {
    fields.push(`color = $${paramCount}`);
    values.push(color);
    paramCount++;
  }
  if (icon !== undefined) {
    fields.push(`icon = $${paramCount}`);
    values.push(icon);
    paramCount++;
  }

  if (fields.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No fields to update'
    });
  }

  values.push(id);

  const result = await db.query(
    `UPDATE categories SET ${fields.join(', ')} WHERE id = $${paramCount}
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Category not found'
    });
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await db.query('DELETE FROM categories WHERE id = $1', [id]);

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});
