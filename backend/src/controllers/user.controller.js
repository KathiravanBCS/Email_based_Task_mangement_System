const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { asyncHandler, paginate } = require('../utils/helpers');

exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, is_active } = req.query;
  const { limit: queryLimit, offset } = paginate(page, limit);

  let whereClause = '';
  const values = [];
  let paramCount = 1;

  if (role) {
    whereClause = `WHERE role = $${paramCount}`;
    values.push(role);
    paramCount++;
  }

  if (is_active !== undefined) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += `is_active = $${paramCount}`;
    values.push(is_active === 'true');
    paramCount++;
  }

  const countResult = await db.query(
    `SELECT COUNT(*) FROM users ${whereClause}`,
    values
  );

  const usersResult = await db.query(
    `SELECT id, username, email, full_name, avatar_url, role, is_active, created_at, last_login
     FROM users
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
    [...values, queryLimit, offset]
  );

  const total = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: usersResult.rows,
    pagination: {
      page: parseInt(page),
      limit: queryLimit,
      total,
      pages: Math.ceil(total / queryLimit)
    }
  });
});

exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    `SELECT u.id, u.username, u.email, u.full_name, u.avatar_url, u.role, u.is_active, u.created_at, u.last_login,
            s.theme, s.email_notifications, s.timezone, s.language
     FROM users u
     LEFT JOIN user_settings s ON u.id = s.user_id
     WHERE u.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, email, full_name, avatar_url, role, is_active } = req.body;

  if (req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this user'
    });
  }

  const fields = [];
  const values = [];
  let paramCount = 1;

  if (username) {
    fields.push(`username = $${paramCount}`);
    values.push(username);
    paramCount++;
  }
  if (email) {
    fields.push(`email = $${paramCount}`);
    values.push(email);
    paramCount++;
  }
  if (full_name) {
    fields.push(`full_name = $${paramCount}`);
    values.push(full_name);
    paramCount++;
  }
  if (avatar_url !== undefined) {
    fields.push(`avatar_url = $${paramCount}`);
    values.push(avatar_url);
    paramCount++;
  }
  if (role && req.user.role === 'admin') {
    fields.push(`role = $${paramCount}`);
    values.push(role);
    paramCount++;
  }
  if (is_active !== undefined && req.user.role === 'admin') {
    fields.push(`is_active = $${paramCount}`);
    values.push(is_active);
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
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}
     RETURNING id, username, email, full_name, avatar_url, role, is_active`,
    values
  );

  res.json({
    success: true,
    data: result.rows[0]
  });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await db.query('UPDATE users SET is_active = false WHERE id = $1', [id]);

  res.json({
    success: true,
    message: 'User deactivated successfully'
  });
});

exports.getUserTasks = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const { limit: queryLimit, offset } = paginate(page, limit);

  const result = await db.query(
    `SELECT t.*, c.name as category_name, c.color as category_color
     FROM tasks t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.assigned_to = $1 AND t.archived_at IS NULL
     ORDER BY t.created_at DESC
     LIMIT $2 OFFSET $3`,
    [id, queryLimit, offset]
  );

  res.json({
    success: true,
    data: result.rows
  });
});

exports.updateUserSettings = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { theme, email_notifications, timezone, language } = req.body;

  if (req.user.id !== id) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update settings for this user'
    });
  }

  const fields = [];
  const values = [];
  let paramCount = 1;

  if (theme) {
    fields.push(`theme = $${paramCount}`);
    values.push(theme);
    paramCount++;
  }
  if (email_notifications) {
    fields.push(`email_notifications = $${paramCount}`);
    values.push(JSON.stringify(email_notifications));
    paramCount++;
  }
  if (timezone) {
    fields.push(`timezone = $${paramCount}`);
    values.push(timezone);
    paramCount++;
  }
  if (language) {
    fields.push(`language = $${paramCount}`);
    values.push(language);
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
    `UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = $${paramCount}
     RETURNING *`,
    values
  );

  res.json({
    success: true,
    data: result.rows[0]
  });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);

  const isValid = await bcrypt.compare(currentPassword, user.rows[0].password_hash);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: 'Current password is incorrect'
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 10);

  await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, req.user.id]);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});
