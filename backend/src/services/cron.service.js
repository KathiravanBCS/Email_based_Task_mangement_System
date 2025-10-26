const cron = require('node-cron');
const db = require('../config/database');
const { sendEmail, emailTemplates } = require('../utils/email');

const sendDueDateReminders = async () => {
  try {
    console.log('⏰ Running due date reminder job...');

    const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const tasksResult = await db.query(
      `SELECT t.*, u.email, u.full_name
       FROM tasks t
       JOIN users u ON t.assigned_to = u.id
       JOIN user_settings s ON u.id = s.user_id
       WHERE t.due_date BETWEEN CURRENT_TIMESTAMP AND $1
       AND t.status NOT IN ('completed', 'cancelled')
       AND t.archived_at IS NULL
       AND s.email_notifications->>'due_date_reminder' = 'true'`,
      [oneDayFromNow]
    );

    for (const task of tasksResult.rows) {
      const emailContent = emailTemplates.dueDateReminder(task, task);
      
      await sendEmail({
        to: task.email,
        ...emailContent
      });

      await db.query(
        `INSERT INTO notifications (user_id, task_id, notification_type, title, message, email_sent)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          task.assigned_to,
          task.id,
          'due_date_reminder',
          `Task Due Soon: ${task.title}`,
          `Your task "${task.title}" is due within 24 hours`,
          true
        ]
      );
    }

    console.log(`✅ Sent ${tasksResult.rows.length} due date reminders`);
  } catch (error) {
    console.error('❌ Error in due date reminder job:', error);
  }
};

const sendDailyDigest = async () => {
  try {
    console.log('📧 Running daily digest job...');

    const usersResult = await db.query(
      `SELECT u.id, u.email, u.full_name
       FROM users u
       JOIN user_settings s ON u.id = s.user_id
       WHERE u.is_active = true
       AND s.email_notifications->>'daily_digest' = 'true'`
    );

    for (const user of usersResult.rows) {
      const [dueToday, completed, overdue, inProgress, taskList] = await Promise.all([
        db.query(
          `SELECT COUNT(*) FROM tasks 
           WHERE assigned_to = $1 AND due_date::date = CURRENT_DATE AND archived_at IS NULL`,
          [user.id]
        ),
        db.query(
          `SELECT COUNT(*) FROM tasks 
           WHERE assigned_to = $1 AND status = 'completed' AND completed_date::date = CURRENT_DATE`,
          [user.id]
        ),
        db.query(
          `SELECT COUNT(*) FROM tasks 
           WHERE assigned_to = $1 AND due_date < CURRENT_TIMESTAMP AND status NOT IN ('completed', 'cancelled') AND archived_at IS NULL`,
          [user.id]
        ),
        db.query(
          `SELECT COUNT(*) FROM tasks 
           WHERE assigned_to = $1 AND status = 'in_progress' AND archived_at IS NULL`,
          [user.id]
        ),
        db.query(
          `SELECT id, title, due_date, priority FROM tasks 
           WHERE assigned_to = $1 AND due_date::date = CURRENT_DATE AND archived_at IS NULL
           ORDER BY priority DESC, due_date ASC
           LIMIT 5`,
          [user.id]
        )
      ]);

      const tasksData = {
        dueToday: parseInt(dueToday.rows[0].count),
        completed: parseInt(completed.rows[0].count),
        overdue: parseInt(overdue.rows[0].count),
        inProgress: parseInt(inProgress.rows[0].count),
        taskList: taskList.rows
      };

      const emailContent = emailTemplates.dailyDigest(user, tasksData);
      
      await sendEmail({
        to: user.email,
        ...emailContent
      });
    }

    console.log(`✅ Sent ${usersResult.rows.length} daily digest emails`);
  } catch (error) {
    console.error('❌ Error in daily digest job:', error);
  }
};

const archiveCompletedTasks = async () => {
  try {
    console.log('🗄️ Running auto-archive job...');

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await db.query(
      `UPDATE tasks 
       SET archived_at = CURRENT_TIMESTAMP 
       WHERE status = 'completed' 
       AND completed_date < $1 
       AND archived_at IS NULL
       RETURNING id`,
      [thirtyDaysAgo]
    );

    console.log(`✅ Archived ${result.rowCount} completed tasks`);
  } catch (error) {
    console.error('❌ Error in archive job:', error);
  }
};

const processRecurringTasks = async () => {
  try {
    console.log('🔄 Processing recurring tasks...');

    const result = await db.query(
      `SELECT * FROM tasks 
       WHERE is_recurring = true 
       AND status = 'completed' 
       AND archived_at IS NULL`
    );

    for (const task of result.rows) {
      const pattern = task.recurrence_pattern;
      if (!pattern) continue;

      let newDueDate;
      const currentDue = new Date(task.due_date);

      switch (pattern.frequency) {
        case 'daily':
          newDueDate = new Date(currentDue.setDate(currentDue.getDate() + (pattern.interval || 1)));
          break;
        case 'weekly':
          newDueDate = new Date(currentDue.setDate(currentDue.getDate() + 7 * (pattern.interval || 1)));
          break;
        case 'monthly':
          newDueDate = new Date(currentDue.setMonth(currentDue.getMonth() + (pattern.interval || 1)));
          break;
        default:
          continue;
      }

      await db.query(
        `INSERT INTO tasks (
          title, description, task_type, priority, category_id, tags,
          created_by, assigned_to, due_date, start_date, is_recurring, recurrence_pattern
        ) SELECT 
          title, description, task_type, priority, category_id, tags,
          created_by, assigned_to, $1, $2, is_recurring, recurrence_pattern
        FROM tasks WHERE id = $3`,
        [newDueDate, new Date(), task.id]
      );
    }

    console.log(`✅ Created ${result.rowCount} recurring tasks`);
  } catch (error) {
    console.error('❌ Error in recurring tasks job:', error);
  }
};

const startAllJobs = () => {
  cron.schedule('0 9 * * *', sendDailyDigest);
  
  cron.schedule('*/30 * * * *', sendDueDateReminders);
  
  cron.schedule('0 0 * * 0', archiveCompletedTasks);
  
  cron.schedule('0 1 * * *', processRecurringTasks);

  console.log('✅ All cron jobs scheduled');
};

module.exports = {
  startAllJobs,
  sendDueDateReminders,
  sendDailyDigest,
  archiveCompletedTasks,
  processRecurringTasks
};
