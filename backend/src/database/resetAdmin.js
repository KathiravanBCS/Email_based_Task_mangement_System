require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function resetAdminPassword() {
  try {
    const email = 'admin@taskmanager.com';
    const newPlain = 'admin123';
    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
    const hashed = await bcrypt.hash(newPlain, rounds);

    const result = await db.query(
      `UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id`,
      [hashed, email]
    );

    if (result.rows.length === 0) {
      console.log(`No user found with email ${email}. You can run \`npm run seed\` to create the default admin.`);
      process.exit(0);
    }

    console.log(`✅ Password for ${email} has been reset to '${newPlain}'.`);
    console.log('⚠️  For production, change this password immediately.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to reset admin password:', err);
    process.exit(1);
  }
}

resetAdminPassword();
