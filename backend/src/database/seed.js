require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', parseInt(process.env.BCRYPT_ROUNDS) || 10);
    
    const adminResult = await db.query(
      `INSERT INTO users (username, email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['admin', 'admin@taskmanager.com', hashedPassword, 'Admin User', 'admin']
    );

    if (adminResult.rows.length > 0) {
      const adminId = adminResult.rows[0].id;
      console.log('✅ Admin user created');

      // Create default categories
      const categories = [
        ['Work', '#228BE6', '💼'],
        ['Personal', '#40C057', '👤'],
        ['Urgent', '#FA5252', '🚨'],
        ['Development', '#7950F2', '💻'],
        ['Meeting', '#FD7E14', '📅'],
        ['Research', '#20C997', '🔍']
      ];

      for (const [name, color, icon] of categories) {
        await db.query(
          `INSERT INTO categories (name, color, icon, created_by) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT DO NOTHING`,
          [name, color, icon, adminId]
        );
      }
      console.log('✅ Categories created');

      // Create user settings for admin
      await db.query(
        `INSERT INTO user_settings (user_id) 
         VALUES ($1) 
         ON CONFLICT (user_id) DO NOTHING`,
        [adminId]
      );
      console.log('✅ User settings initialized');

      // Create sample tasks
      const workCategoryResult = await db.query(
        `SELECT id FROM categories WHERE name = 'Work' LIMIT 1`
      );
      
      if (workCategoryResult.rows.length > 0) {
        const categoryId = workCategoryResult.rows[0].id;
        
        const sampleTasks = [
          ['Complete project documentation', 'high', 'in_progress'],
          ['Review pull requests', 'medium', 'not_started'],
          ['Team meeting preparation', 'medium', 'not_started'],
          ['Code refactoring', 'low', 'not_started']
        ];

        for (const [title, priority, status] of sampleTasks) {
          await db.query(
            `INSERT INTO tasks (title, priority, status, category_id, created_by, assigned_to, task_type, due_date) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [title, priority, status, categoryId, adminId, adminId, 'utility', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
          );
        }
        console.log('✅ Sample tasks created');
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('📧 Admin credentials: admin@taskmanager.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
