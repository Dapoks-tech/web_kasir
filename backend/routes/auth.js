const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { auth, managerOnly } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) return res.status(401).json({ message: 'Username tidak ditemukan' });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Password salah' });

    const token = jwt.sign(
      { id: user.id, name: user.name, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error('LOGIN ERROR:', err.code, err.message, err);
    res.status(500).json({ message: err.message || err.code || 'Internal server error' });
  }
});

// Get current user
router.get('/me', auth, (req, res) => {
  res.json(req.user);
});

// Register barista (manager only)
router.post('/register', auth, managerOnly, async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)', [name, username, hash, role || 'barista']);
    res.status(201).json({ message: 'User berhasil dibuat' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Username sudah dipakai' });
    res.status(500).json({ message: err.message });
  }
});

// Get all users (manager only)
router.get('/users', auth, managerOnly, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, username, role, created_at FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user (manager only)
router.delete('/users/:id', auth, managerOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ? AND role != ?', [req.params.id, 'manager']);
    res.json({ message: 'User dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
