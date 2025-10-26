const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

const emailTemplates = {
  taskAssignment: (task, assignedBy, assignedTo) => ({
    subject: `New Task Assigned: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #228BE6;">New Task Assigned</h2>
        <p>Hi ${assignedTo.full_name},</p>
        <p>You have been assigned a new task by <strong>${assignedBy.full_name}</strong>:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${task.title}</h3>
          <p><strong>Priority:</strong> <span style="color: ${getPriorityColor(task.priority)};">${task.priority.toUpperCase()}</span></p>
          <p><strong>Due Date:</strong> ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}</p>
          ${task.description ? `<p><strong>Description:</strong></p><div>${task.description}</div>` : ''}
        </div>
        
        <p>
          <a href="${process.env.FRONTEND_URL}/tasks/${task.id}" 
             style="background-color: #228BE6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Task
          </a>
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
        <p style="color: #666; font-size: 12px;">You can manage your notification preferences in settings.</p>
      </div>
    `
  }),

  dueDateReminder: (task, user) => ({
    subject: `Reminder: Task "${task.title}" is due soon`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FAB005;">⏰ Task Due Date Reminder</h2>
        <p>Hi ${user.full_name},</p>
        <p>This is a friendly reminder that your task is due soon:</p>
        
        <div style="background-color: #fff9db; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FAB005;">
          <h3 style="margin-top: 0;">${task.title}</h3>
          <p><strong>Due Date:</strong> ${new Date(task.due_date).toLocaleString()}</p>
          <p><strong>Priority:</strong> <span style="color: ${getPriorityColor(task.priority)};">${task.priority.toUpperCase()}</span></p>
          <p><strong>Status:</strong> ${task.status.replace('_', ' ').toUpperCase()}</p>
        </div>
        
        <p>
          <a href="${process.env.FRONTEND_URL}/tasks/${task.id}" 
             style="background-color: #228BE6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Task
          </a>
        </p>
        
        <p>Don't forget to update the status when completed!</p>
      </div>
    `
  }),

  statusUpdate: (task, user, oldStatus, newStatus, changedBy) => ({
    subject: `Task Status Updated: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #40C057;">Task Status Updated</h2>
        <p>Hi ${user.full_name},</p>
        <p>The status of your task has been updated by <strong>${changedBy.full_name}</strong>:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${task.title}</h3>
          <p>
            Status changed from 
            <strong>${oldStatus.replace('_', ' ').toUpperCase()}</strong> 
            to 
            <strong style="color: #40C057;">${newStatus.replace('_', ' ').toUpperCase()}</strong>
          </p>
        </div>
        
        <p>
          <a href="${process.env.FRONTEND_URL}/tasks/${task.id}" 
             style="background-color: #228BE6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Task
          </a>
        </p>
      </div>
    `
  }),

  dailyDigest: (user, tasks) => ({
    subject: `Your Daily Task Summary - ${new Date().toLocaleDateString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #228BE6;">📋 Daily Task Summary</h2>
        <p>Hi ${user.full_name},</p>
        <p>Here's your task summary for today:</p>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
          <div style="background-color: #e7f5ff; padding: 15px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #228BE6;">${tasks.dueToday}</h3>
            <p style="margin: 5px 0 0 0;">Due Today</p>
          </div>
          <div style="background-color: #d3f9d8; padding: 15px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #40C057;">${tasks.completed}</h3>
            <p style="margin: 5px 0 0 0;">Completed</p>
          </div>
          <div style="background-color: #ffe3e3; padding: 15px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #FA5252;">${tasks.overdue}</h3>
            <p style="margin: 5px 0 0 0;">Overdue</p>
          </div>
          <div style="background-color: #fff3bf; padding: 15px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #FAB005;">${tasks.inProgress}</h3>
            <p style="margin: 5px 0 0 0;">In Progress</p>
          </div>
        </div>
        
        ${tasks.taskList && tasks.taskList.length > 0 ? `
          <h3>Your Tasks:</h3>
          <ul style="list-style: none; padding: 0;">
            ${tasks.taskList.map(task => `
              <li style="background-color: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 4px;">
                <strong>${task.title}</strong><br>
                <small>Due: ${task.due_date ? new Date(task.due_date).toLocaleString() : 'Not set'} | 
                Priority: ${task.priority}</small>
              </li>
            `).join('')}
          </ul>
        ` : ''}
        
        <p>
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background-color: #228BE6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Dashboard
          </a>
        </p>
        
        <p>Have a productive day!</p>
      </div>
    `
  }),

  newComment: (task, comment, user, commentAuthor) => ({
    subject: `New comment on: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #228BE6;">💬 New Comment</h2>
        <p>Hi ${user.full_name},</p>
        <p><strong>${commentAuthor.full_name}</strong> commented on your task:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${task.title}</h3>
        </div>
        
        <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 3px solid #228BE6;">
          ${comment.content}
        </div>
        
        <p>
          <a href="${process.env.FRONTEND_URL}/tasks/${task.id}" 
             style="background-color: #228BE6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Task & Reply
          </a>
        </p>
      </div>
    `
  })
};

function getPriorityColor(priority) {
  const colors = {
    low: '#40C057',
    medium: '#FAB005',
    high: '#FD7E14',
    urgent: '#FA5252'
  };
  return colors[priority] || '#228BE6';
}

module.exports = { sendEmail, emailTemplates };
