const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initAdmin() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  const hash = await bcrypt.hash('admin123', 10);
  await pool.query('UPDATE users SET password = ? WHERE username = ?', [hash, 'manager']);
  console.log('Manager password updated to: admin123');
  await pool.end();
}

initAdmin().catch(console.error);
