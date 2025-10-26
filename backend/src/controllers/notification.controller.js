const db = require('../config/database');
const { asyncHandler, paginate } = require('../utils/helpers');

exports.getUserNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, is_read } = req.query;
  const { limit: queryLimit, offset } = paginate(page, limit);

  let whereClause = 'WHERE user_id = $1';
  const values = [req.user.id];

  if (is_read !== undefined) {
    whereClause += ' AND is_read = $2';
    values.push(is_read === 'true');
  }

  const countResult = await db.query(
    `SELECT COUNT(*) FROM notifications ${whereClause}`,
    values
  );

  const result = await db.query(
    `SELECT n.*, t.title as task_title
     FROM notifications n
     LEFT JOIN tasks t ON n.task_id = t.id
     ${whereClause}
     ORDER BY n.created_at DESC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, queryLimit, offset]
  );

  const total = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: result.rows,
    pagination: {
      page: parseInt(page),
      limit: queryLimit,
      total,
      pages: Math.ceil(total / queryLimit)
    }
  });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    `UPDATE notifications SET is_read = true 
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Notification not found'
    });
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await db.query(
    'UPDATE notifications SET is_read = true WHERE user_id = $1',
    [req.user.id]
  );

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await db.query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
  const result = await db.query(
    'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
    [req.user.id]
  );

  res.json({
    success: true,
    data: {
      count: parseInt(result.rows[0].count)
    }
  });
});
