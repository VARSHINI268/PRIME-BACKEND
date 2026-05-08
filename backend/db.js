const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, 'prime_backend.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('SQLite connection error:', err);
    process.exit(1);
  } else {
    console.log('SQLite connected');
    initializeSchema();
  }
});

const initializeSchema = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    seedAdminUser();
  });
};

const seedAdminUser = () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  db.get('SELECT * FROM users WHERE email = ?', [adminEmail], async (err, row) => {
    if (err) {
      console.error('Failed to check admin user:', err);
      return;
    }
    if (!row) {
      try {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        db.run(
          'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
          [adminUsername, adminEmail, hashedPassword, 'admin'],
          (insertErr) => {
            if (insertErr) {
              console.error('Failed to create admin user:', insertErr);
            } else {
              console.log(`Admin user seeded: ${adminUsername} / ${adminPassword}`);
            }
          }
        );
      } catch (hashErr) {
        console.error('Failed to hash admin password:', hashErr);
      }
    }
  });
};

module.exports = db;