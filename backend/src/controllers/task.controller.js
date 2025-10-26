const db = require('../config/database');
const { asyncHandler, paginate, buildFilterQuery } = require('../utils/helpers');
const { sendEmail, emailTemplates } = require('../utils/email');

exports.getAllTasks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, priority, category_id, assigned_to, search, task_type } = req.query;
  const { limit: queryLimit, offset } = paginate(page, limit);

  const filters = {};
  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  if (category_id) filters.category_id = category_id;
  if (assigned_to) filters.assigned_to = assigned_to;
  if (task_type) filters.task_type = task_type;
  if (search) filters.search = search;

  if (req.user.role === 'user') {
    filters.assigned_to = req.user.id;
  }

  const { conditions, values } = buildFilterQuery(filters);
  
  const whereClause = conditions.length > 0 
    ? `WHERE archived_at IS NULL AND ${conditions.join(' AND ')}` 
    : 'WHERE archived_at IS NULL';

  const countResult = await db.query(
    `SELECT COUNT(*) FROM tasks ${whereClause}`,
    values
  );

  const tasksResult = await db.query(
    `SELECT t.*, 
            u.full_name as assigned_to_name, u.email as assigned_to_email,
            c.name as category_name, c.color as category_color,
            creator.full_name as created_by_name
     FROM tasks t
     LEFT JOIN users u ON t.assigned_to = u.id
     LEFT JOIN users creator ON t.created_by = creator.id
     LEFT JOIN categories c ON t.category_id = c.id
     ${whereClause}
     ORDER BY t.created_at DESC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, queryLimit, offset]
  );

  const total = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: tasksResult.rows,
    pagination: {
      page: parseInt(page),
      limit: queryLimit,
      total,
      pages: Math.ceil(total / queryLimit)
    }
  });
});

exports.getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    `SELECT t.*, 
            u.full_name as assigned_to_name, u.email as assigned_to_email,
            c.name as category_name, c.color as category_color,
            creator.full_name as created_by_name
     FROM tasks t
     LEFT JOIN users u ON t.assigned_to = u.id
     LEFT JOIN users creator ON t.created_by = creator.id
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
});

exports.createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    task_type = 'utility',
    priority = 'medium',
    category_id,
    tags = [],
    assigned_to,
    due_date,
    start_date,
    is_recurring = false,
    recurrence_pattern
  } = req.body;

  const result = await db.query(
    `INSERT INTO tasks (
      title, description, task_type, priority, category_id, tags,
      created_by, assigned_to, due_date, start_date, is_recurring, recurrence_pattern
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      title, description, task_type, priority, category_id, JSON.stringify(tags),
      req.user.id, assigned_to, due_date, start_date, is_recurring, 
      recurrence_pattern ? JSON.stringify(recurrence_pattern) : null
    ]
  );

  const task = result.rows[0];

  await db.query(
    `INSERT INTO task_history (task_id, user_id, action) VALUES ($1, $2, $3)`,
    [task.id, req.user.id, 'created']
  );

  if (assigned_to && assigned_to !== req.user.id) {
    const assignedUser = await db.query('SELECT * FROM users WHERE id = $1', [assigned_to]);
    
    await db.query(
      `INSERT INTO notifications (user_id, task_id, notification_type, title, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [assigned_to, task.id, 'task_assignment', `New Task: ${title}`, `You have been assigned a task by ${req.user.full_name}`]
    );

    console.log('📧 Email notification check:');
    console.log('- ENABLE_EMAIL_NOTIFICATIONS:', process.env.ENABLE_EMAIL_NOTIFICATIONS);
    console.log('- Assigned user found:', assignedUser.rows.length > 0);
    console.log('- Assigned user email:', assignedUser.rows[0]?.email);

    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true' && assignedUser.rows.length > 0) {
      try {
        const emailContent = emailTemplates.taskAssignment(task, req.user, assignedUser.rows[0]);
        console.log('📧 Sending email to:', assignedUser.rows[0].email);
        await sendEmail({
          to: assignedUser.rows[0].email,
          ...emailContent
        });
        console.log('✅ Email sent successfully!');
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError.message);
      }
    } else {
      console.log('⚠️ Email not sent - notifications disabled or user not found');
    }
  }

  res.status(201).json({
    success: true,
    data: task
  });
});

exports.updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  const currentTask = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
  
  if (currentTask.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  const oldTask = currentTask.rows[0];
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updateFields).forEach(key => {
    if (updateFields[key] !== undefined && key !== 'id') {
      fields.push(`${key} = $${paramCount}`);
      values.push(typeof updateFields[key] === 'object' ? JSON.stringify(updateFields[key]) : updateFields[key]);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No fields to update'
    });
  }

  values.push(id);

  const result = await db.query(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  const updatedTask = result.rows[0];

  Object.keys(updateFields).forEach(async (key) => {
    if (oldTask[key] !== updateFields[key]) {
      await db.query(
        `INSERT INTO task_history (task_id, user_id, action, field_changed, old_value, new_value)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, req.user.id, 'updated', key, String(oldTask[key]), String(updateFields[key])]
      );
    }
  });

  if (updateFields.status && oldTask.status !== updateFields.status && oldTask.assigned_to) {
    const assignedUser = await db.query('SELECT * FROM users WHERE id = $1', [oldTask.assigned_to]);
    
    await db.query(
      `INSERT INTO notifications (user_id, task_id, notification_type, title, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [oldTask.assigned_to, id, 'status_update', `Task Status Updated`, `Status changed to ${updateFields.status}`]
    );

    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true' && assignedUser.rows.length > 0) {
      const emailContent = emailTemplates.statusUpdate(updatedTask, assignedUser.rows[0], oldTask.status, updateFields.status, req.user);
      await sendEmail({
        to: assignedUser.rows[0].email,
        ...emailContent
      });
    }
  }

  res.json({
    success: true,
    data: updatedTask
  });
});

exports.deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await db.query(
    'UPDATE tasks SET archived_at = CURRENT_TIMESTAMP WHERE id = $1',
    [id]
  );

  await db.query(
    `INSERT INTO task_history (task_id, user_id, action) VALUES ($1, $2, $3)`,
    [id, req.user.id, 'archived']
  );

  res.json({
    success: true,
    message: 'Task archived successfully'
  });
});

exports.getTaskHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    `SELECT th.*, u.full_name as user_name
     FROM task_history th
     LEFT JOIN users u ON th.user_id = u.id
     WHERE th.task_id = $1
     ORDER BY th.timestamp DESC`,
    [id]
  );

  res.json({
    success: true,
    data: result.rows
  });
});

exports.addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, parent_comment_id } = req.body;

  const result = await db.query(
    `INSERT INTO comments (task_id, user_id, content, parent_comment_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, req.user.id, content, parent_comment_id]
  );

  const task = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
  
  if (task.rows.length > 0 && task.rows[0].assigned_to && task.rows[0].assigned_to !== req.user.id) {
    const assignedUser = await db.query('SELECT * FROM users WHERE id = $1', [task.rows[0].assigned_to]);
    
    await db.query(
      `INSERT INTO notifications (user_id, task_id, notification_type, title, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [task.rows[0].assigned_to, id, 'comment', 'New Comment', `${req.user.full_name} commented on your task`]
    );

    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true' && assignedUser.rows.length > 0) {
      const emailContent = emailTemplates.newComment(task.rows[0], result.rows[0], assignedUser.rows[0], req.user);
      await sendEmail({
        to: assignedUser.rows[0].email,
        ...emailContent
      });
    }
  }

  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});

exports.getComments = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    `SELECT c.*, u.full_name as user_name, u.avatar_url
     FROM comments c
     LEFT JOIN users u ON c.user_id = u.id
     WHERE c.task_id = $1
     ORDER BY c.created_at ASC`,
    [id]
  );

  res.json({
    success: true,
    data: result.rows
  });
});

exports.uploadAttachment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }

  const result = await db.query(
    `INSERT INTO attachments (task_id, file_name, file_url, file_size, file_type, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      id,
      req.file.originalname,
      `/uploads/${req.file.filename}`,
      req.file.size,
      req.file.mimetype,
      req.user.id
    ]
  );

  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});

exports.deleteAttachment = asyncHandler(async (req, res) => {
  const { id, fileId } = req.params;
  const fs = require('fs');
  const path = require('path');

  const attachment = await db.query('SELECT * FROM attachments WHERE id = $1 AND task_id = $2', [fileId, id]);

  if (attachment.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Attachment not found'
    });
  }

  const filePath = path.join(__dirname, '../../', attachment.rows[0].file_url);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await db.query('DELETE FROM attachments WHERE id = $1', [fileId]);

  res.json({
    success: true,
    message: 'Attachment deleted successfully'
  });
});
