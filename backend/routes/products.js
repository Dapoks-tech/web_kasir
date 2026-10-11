const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, managerOnly } = require('../middleware/auth');

// Get all categories
router.get('/categories', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create category (manager)
router.post('/categories', auth, managerOnly, async (req, res) => {
  try {
    const { name } = req.body;
    const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete category (manager)
router.delete('/categories/:id', auth, managerOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Kategori dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all products
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY c.name, p.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product (manager)
router.post('/', auth, managerOnly, async (req, res) => {
  try {
    const { name, category_id, price } = req.body;
    const [result] = await pool.query(
      'INSERT INTO products (name, category_id, price) VALUES (?, ?, ?)',
      [name, category_id, price]
    );
    res.status(201).json({ id: result.insertId, name, category_id, price });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update product (manager)
router.put('/:id', auth, managerOnly, async (req, res) => {
  try {
    const { name, category_id, price, is_available } = req.body;
    await pool.query(
      'UPDATE products SET name=?, category_id=?, price=?, is_available=? WHERE id=?',
      [name, category_id, price, is_available, req.params.id]
    );
    res.json({ message: 'Produk diupdate' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete product (manager)
router.delete('/:id', auth, managerOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Produk dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
