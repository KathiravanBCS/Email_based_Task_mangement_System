# Email Notification Setup Guide

## Overview

The Task Management System includes a comprehensive email notification system that sends:
- Task assignment notifications
- Due date reminders
- Status update notifications
- Daily digest emails
- Weekly summary reports
- Comment notifications

## Gmail Setup (Recommended for Testing)

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com
2. Navigate to **Security**
3. Enable **2-Step Verification**

### Step 2: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter name: **Task Manager**
5. Click **Generate**
6. Copy the 16-character password

### Step 3: Configure .env File

Update your `backend/.env` file:

```env
# Enable email notifications
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_DAILY_DIGEST=true

# Gmail configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=Task Manager <your-email@gmail.com>
```

### Step 4: Restart Backend

```bash
# Stop the backend (Ctrl+C)
npm run dev
```

---

## Other Email Providers

### Microsoft Outlook / Office 365

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=Task Manager <your-email@outlook.com>
```

### SendGrid (Production Recommended)

1. Sign up at https://sendgrid.com
2. Create an API key
3. Configure:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=Task Manager <noreply@yourdomain.com>
```

### Mailgun

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-smtp-password
EMAIL_FROM=Task Manager <noreply@yourdomain.com>
```

### AWS SES (Simple Email Service)

```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-aws-smtp-username
EMAIL_PASSWORD=your-aws-smtp-password
EMAIL_FROM=Task Manager <noreply@yourdomain.com>
```

---

## Email Notification Types

### 1. Task Assignment
Sent when a task is assigned to a user.

**Trigger:** Creating a task with `assigned_to` field

### 2. Due Date Reminders
Sent 24 hours before task due date.

**Trigger:** Cron job runs every 30 minutes

### 3. Status Updates
Sent when task status changes.

**Trigger:** Updating task status

### 4. Comment Notifications
Sent when someone comments on a task.

**Trigger:** Adding a comment to a task

### 5. Daily Digest
Summary of tasks due today.

**Trigger:** Cron job runs daily at 9:00 AM

**Configure time in .env:**
```env
DAILY_DIGEST_TIME=09:00
```

### 6. Weekly Summary
Weekly report of completed tasks.

**Trigger:** Cron job runs weekly

---

## Cron Job Schedule

The system runs automated jobs:

| Job | Schedule | Description |
|-----|----------|-------------|
| Daily Digest | 9:00 AM daily | Task summary email |
| Due Date Reminders | Every 30 minutes | Checks upcoming tasks |
| Auto Archive | Weekly (Sunday) | Archives old tasks |
| Recurring Tasks | Daily at 1:00 AM | Creates recurring tasks |

---

## User Notification Preferences

Users can control email notifications in **Settings** page:

- Task Assignment ✓
- Due Date Reminders ✓
- Status Updates ✓
- Comments ✓
- Daily Digest ✓
- Weekly Summary ✓

### Database Storage

Preferences are stored in `user_settings` table:

```json
{
  "task_assignment": true,
  "due_date_reminder": true,
  "status_update": true,
  "comments": true,
  "daily_digest": true,
  "weekly_summary": true
}
```

---

## Testing Email Notifications

### Test 1: Task Assignment

```bash
# Create a task via API
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Task",
    "assigned_to": "USER_ID"
  }'
```

### Test 2: Manual Email Test

Create a test script:

```javascript
// backend/test-email.js
require('dotenv').config();
const { sendEmail } = require('./src/utils/email');

sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Test Email</h1><p>If you receive this, email is working!</p>'
}).then(() => {
  console.log('Email sent successfully');
  process.exit(0);
}).catch(err => {
  console.error('Email failed:', err);
  process.exit(1);
});
```

Run: `node test-email.js`

---

## Troubleshooting

### Email not sending

**Check 1: Environment variables loaded**
```javascript
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
```

**Check 2: SMTP credentials**
- Verify email/password are correct
- For Gmail, use App Password (not regular password)
- Check if 2FA is enabled

**Check 3: Firewall/Network**
- Port 587 should be open
- Some ISPs block port 25/587
- Try port 465 with `secure: true`

**Check 4: Backend logs**
```bash
npm run dev
# Look for email errors in console
```

### Gmail "Less secure app access" error

Solution: Use App Password instead of regular password.

### Emails going to spam

Solutions:
1. Add SPF/DKIM records (production)
2. Use verified domain email
3. Use professional email service (SendGrid, Mailgun)
4. Don't use free email accounts in production

### Rate limiting

Gmail: 500 emails/day
SendGrid Free: 100 emails/day
Mailgun Free: 5,000 emails/month

For production, upgrade to paid plans.

---

## Production Recommendations

### 1. Use Professional Email Service
- SendGrid
- Mailgun
- AWS SES
- Postmark

### 2. Set Up Domain Email
```env
EMAIL_FROM=Task Manager <notifications@yourdomain.com>
```

### 3. Configure SPF/DKIM
Add DNS records for email authentication.

### 4. Monitor Email Delivery
- Track bounce rates
- Monitor spam complaints
- Check delivery rates

### 5. Implement Queue System
For high volume, use:
- Bull Queue
- Redis
- RabbitMQ

---

## Email Templates Customization

Templates are in `backend/src/utils/email.js`

### Customize Colors

```javascript
const colors = {
  primary: '#228BE6',
  success: '#40C057',
  warning: '#FAB005',
  danger: '#FA5252'
};
```

### Customize Layout

Update HTML templates in `emailTemplates` object.

### Add Logo

```html
<img src="https://yourdomain.com/logo.png" alt="Logo" style="max-width: 200px;">
```

---

## Security Best Practices

1. **Never commit credentials**
   - Use `.env` file
   - Add `.env` to `.gitignore`

2. **Use environment-specific configs**
   ```env
   NODE_ENV=production
   EMAIL_FROM=noreply@yourdomain.com
   ```

3. **Validate email addresses**
   - Check format before sending
   - Verify domain exists

4. **Rate limiting**
   - Prevent email bombing
   - Implement cooldown periods

5. **Unsubscribe links**
   - Add to all marketing emails
   - Respect user preferences

---

## Support

If emails still don't work:

1. Check backend console for errors
2. Verify .env file is loaded
3. Test SMTP connection manually
4. Check email provider status
5. Review firewall settings

For Gmail issues: https://support.google.com/accounts/answer/185833

Happy emailing! 📧
