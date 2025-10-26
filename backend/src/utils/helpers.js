const generateToken = (user, secret, expiresIn) => {
  const jwt = require('jsonwebtoken');
  if (!secret) {
    throw new Error('JWT secret is not defined. Check your .env file.');
  }
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn }
  );
};

const generateTokens = (user) => {
  const jwtSecret = process.env.JWT_SECRET || 'default-secret-key-change-me';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me';
  
  const accessToken = generateToken(user, jwtSecret, process.env.JWT_EXPIRE || '7d');
  const refreshToken = generateToken(user, jwtRefreshSecret, process.env.JWT_REFRESH_EXPIRE || '30d');
  
  return { accessToken, refreshToken };
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset: parseInt(offset) };
};

const buildFilterQuery = (filters) => {
  const conditions = [];
  const values = [];
  let paramCount = 1;

  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      if (key === 'search') {
        conditions.push(`(title ILIKE $${paramCount} OR description ILIKE $${paramCount})`);
        values.push(`%${filters[key]}%`);
        paramCount++;
      } else if (Array.isArray(filters[key])) {
        conditions.push(`${key} = ANY($${paramCount})`);
        values.push(filters[key]);
        paramCount++;
      } else {
        conditions.push(`${key} = $${paramCount}`);
        values.push(filters[key]);
        paramCount++;
      }
    }
  });

  return { conditions, values, paramCount };
};

module.exports = {
  generateToken,
  generateTokens,
  asyncHandler,
  paginate,
  buildFilterQuery
};
