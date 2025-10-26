const db = require('../config/database');
const { asyncHandler } = require('../utils/helpers');

exports.getStats = asyncHandler(async (req, res) => {
  const userId = req.query.user_id || req.user.id;
  const userRole = req.user.role;
  
  // For admin/manager, show all tasks. For users, show only assigned tasks
  const whereClause = (userRole === 'admin' || userRole === 'manager') 
    ? 'archived_at IS NULL' 
    : 'assigned_to = $1 AND archived_at IS NULL';
  
  const params = (userRole === 'admin' || userRole === 'manager') ? [] : [userId];

  const statsQueries = await Promise.all([
    db.query(
      `SELECT COUNT(*) FROM tasks WHERE ${whereClause}`,
      params
    ),
    db.query(
      `SELECT COUNT(*) FROM tasks WHERE ${whereClause} AND status = 'completed'`,
      params
    ),
    db.query(
      `SELECT COUNT(*) FROM tasks WHERE ${whereClause} AND due_date < CURRENT_TIMESTAMP AND status != 'completed'`,
      params
    ),
    db.query(
      `SELECT COUNT(*) FROM tasks WHERE ${whereClause} AND due_date::date = CURRENT_DATE`,
      params
    ),
    db.query(
      `SELECT COUNT(*) FROM tasks WHERE ${whereClause} AND due_date >= CURRENT_DATE AND due_date < CURRENT_DATE + INTERVAL '7 days'`,
      params
    ),
    db.query(
      `SELECT COUNT(*) FROM tasks WHERE ${whereClause} AND status = 'in_progress'`,
      params
    )
  ]);

  const totalTasks = parseInt(statsQueries[0].rows[0].count);
  const completedTasks = parseInt(statsQueries[1].rows[0].count);
  const overdueTasks = parseInt(statsQueries[2].rows[0].count);
  const dueToday = parseInt(statsQueries[3].rows[0].count);
  const dueThisWeek = parseInt(statsQueries[4].rows[0].count);
  const inProgress = parseInt(statsQueries[5].rows[0].count);

  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

  res.json({
    success: true,
    data: {
      totalTasks,
      completedTasks,
      overdueTasks,
      dueToday,
      dueThisWeek,
      inProgress,
      completionRate: parseFloat(completionRate)
    }
  });
});

exports.getRecentActivity = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const result = await db.query(
    `SELECT th.*, t.title as task_title, u.full_name as user_name
     FROM task_history th
     LEFT JOIN tasks t ON th.task_id = t.id
     LEFT JOIN users u ON th.user_id = u.id
     WHERE t.assigned_to = $1 OR t.created_by = $1
     ORDER BY th.timestamp DESC
     LIMIT $2`,
    [req.user.id, parseInt(limit)]
  );

  res.json({
    success: true,
    data: result.rows
  });
});

exports.getChartData = asyncHandler(async (req, res) => {
  const { type = 'completion', days = 7 } = req.query;
  const userId = req.query.user_id || req.user.id;
  const userRole = req.user.role;
  
  const whereClause = (userRole === 'admin' || userRole === 'manager') 
    ? 'archived_at IS NULL' 
    : 'assigned_to = $1 AND archived_at IS NULL';
  
  const params = (userRole === 'admin' || userRole === 'manager') ? [] : [userId];

  if (type === 'completion') {
    // Generate last N days with dates
    const result = await db.query(
      `SELECT DATE(updated_at) as date, COUNT(*) as count
       FROM tasks
       WHERE ${whereClause} AND status = 'completed' 
       AND updated_at >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY DATE(updated_at)
       ORDER BY date ASC`,
      params
    );

    // Fill in missing dates with 0 count
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const existing = result.rows.find(r => r.date && r.date.toISOString().split('T')[0] === dateStr);
      dates.push({
        date: dateStr,
        count: existing ? parseInt(existing.count) : 0
      });
    }

    res.json({
      success: true,
      data: dates
    });
  } else if (type === 'priority') {
    const result = await db.query(
      `SELECT priority, COUNT(*) as count
       FROM tasks
       WHERE ${whereClause}
       GROUP BY priority
       ORDER BY 
         CASE priority
           WHEN 'urgent' THEN 1
           WHEN 'high' THEN 2
           WHEN 'medium' THEN 3
           WHEN 'low' THEN 4
         END`,
      params
    );

    res.json({
      success: true,
      data: result.rows
    });
  } else if (type === 'category') {
    const categoryWhereClause = (userRole === 'admin' || userRole === 'manager') 
      ? 't.archived_at IS NULL' 
      : 't.assigned_to = $1 AND t.archived_at IS NULL';
    
    const result = await db.query(
      `SELECT c.name, c.color, COUNT(t.id) as count
       FROM tasks t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE ${categoryWhereClause}
       GROUP BY c.id, c.name, c.color
       ORDER BY count DESC`,
      params
    );

    res.json({
      success: true,
      data: result.rows
    });
  } else if (type === 'status') {
    const result = await db.query(
      `SELECT status, COUNT(*) as count
       FROM tasks
       WHERE ${whereClause}
       GROUP BY status`,
      params
    );

    res.json({
      success: true,
      data: result.rows
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Invalid chart type'
    });
  }
});

exports.getTasksByStatus = asyncHandler(async (req, res) => {
  const userId = req.query.user_id || req.user.id;
  const userRole = req.user.role;
  
  const whereClause = (userRole === 'admin' || userRole === 'manager') 
    ? 'archived_at IS NULL' 
    : 'assigned_to = $1 AND archived_at IS NULL';
  
  const params = (userRole === 'admin' || userRole === 'manager') ? [] : [userId];

  const result = await db.query(
    `SELECT status, COUNT(*) as count
     FROM tasks
     WHERE ${whereClause}
     GROUP BY status
     ORDER BY 
       CASE status
         WHEN 'pending' THEN 1
         WHEN 'in_progress' THEN 2
         WHEN 'on_hold' THEN 3
         WHEN 'completed' THEN 4
       END`,
    params
  );

  res.json({
    success: true,
    data: result.rows
  });
});
