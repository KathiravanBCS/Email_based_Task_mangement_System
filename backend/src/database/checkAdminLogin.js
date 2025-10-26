require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function check() {
  try {
    const email = 'admin@taskmanager.com';
    const plain = 'admin123';

    const result = await db.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      console.log(`No user found with email ${email}`);
      process.exit(0);
    }

    const user = result.rows[0];
    console.log('Found user id:', user.id);
    console.log('Stored password hash prefix:', user.password_hash ? user.password_hash.slice(0, 6) : '(empty)');

    if (!user.password_hash) {
      console.log('Password hash is empty — login will always fail.');
      process.exit(1);
    }

    const ok = await bcrypt.compare(plain, user.password_hash);
    console.log(`Does '${plain}' match stored hash? =>`, ok);
    if (!ok) {
      console.log('The stored hash does not match the expected seeded password.');
      console.log('You can run `npm run reset-admin` to set the password to the seeded default.');
    } else {
      console.log('Password matches. If login still fails, check the server logs and the frontend API base URL.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error checking admin password:', err.message || err);
    process.exit(1);
  }
}

check();
