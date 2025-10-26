const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateTokens } = require('../utils/helpers');
const { asyncHandler } = require('../utils/helpers');

exports.register = asyncHandler(async (req, res) => {
  const { username, email, password, full_name } = req.body;

  const userExists = await db.query(
    'SELECT id FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );

  if (userExists.rows.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'User already exists with this email or username'
    });
  }

  const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

  const result = await db.query(
    `INSERT INTO users (username, email, password_hash, full_name) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, username, email, full_name, role, created_at`,
    [username, email, hashedPassword, full_name]
  );

  const user = result.rows[0];

  await db.query(
    'INSERT INTO user_settings (user_id) VALUES ($1)',
    [user.id]
  );

  const { accessToken, refreshToken } = generateTokens(user);

  await db.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
  );

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      accessToken,
      refreshToken
    }
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  const user = result.rows[0];

  if (!user.is_active) {
    return res.status(401).json({
      success: false,
      error: 'Account is deactivated'
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  await db.query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  const { accessToken, refreshToken } = generateTokens(user);

  await db.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
  );

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url
      },
      accessToken,
      refreshToken
    }
  });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token required'
    });
  }

  const tokenResult = await db.query(
    'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP',
    [refreshToken]
  );

  if (tokenResult.rows.length === 0) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    });
  }

  const jwt = require('jsonwebtoken');
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  const userResult = await db.query(
    'SELECT id, username, email, role FROM users WHERE id = $1 AND is_active = true',
    [decoded.id]
  );

  if (userResult.rows.length === 0) {
    return res.status(401).json({
      success: false,
      error: 'User not found'
    });
  }

  const user = userResult.rows[0];
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

  await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);

  await db.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, newRefreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
  );

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken: newRefreshToken
    }
  });
});

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT u.id, u.username, u.email, u.full_name, u.avatar_url, u.role, u.created_at,
            s.theme, s.email_notifications, s.timezone, s.language
     FROM users u
     LEFT JOIN user_settings s ON u.id = s.user_id
     WHERE u.id = $1`,
    [req.user.id]
  );

  res.json({
    success: true,
    data: result.rows[0]
  });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    return res.json({
      success: true,
      message: 'If email exists, password reset link has been sent'
    });
  }

  const user = result.rows[0];
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(resetToken, 10);

  await db.query(
    `UPDATE users SET password_hash = $1 WHERE id = $2`,
    [hashedToken, user.id]
  );

  const { sendEmail, emailTemplates } = require('../utils/email');
  
  res.json({
    success: true,
    message: 'Password reset email sent (Demo: Check console for reset link)',
    resetToken
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 10);

  await db.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [hashedPassword, req.user.id]
  );

  res.json({
    success: true,
    message: 'Password reset successful'
  });
});
