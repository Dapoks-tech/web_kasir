const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, managerOnly } = require('../middleware/auth');

// Dashboard summary
router.get('/dashboard', auth, managerOnly, async (req, res) => {
  try {
    // Today's revenue
    const [todayRev] = await pool.query(
      "SELECT COALESCE(SUM(total),0) as revenue, COUNT(*) as orders FROM orders WHERE DATE(created_at) = CURDATE()"
    );

    // This month's revenue
    const [monthRev] = await pool.query(
      "SELECT COALESCE(SUM(total),0) as revenue, COUNT(*) as orders FROM orders WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())"
    );

    // Top products
    const [topProducts] = await pool.query(`
      SELECT product_name, SUM(qty) as total_qty, SUM(subtotal) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE MONTH(o.created_at) = MONTH(CURDATE()) AND YEAR(o.created_at) = YEAR(CURDATE())
      GROUP BY product_name
      ORDER BY total_qty DESC
      LIMIT 5
    `);

    // Today's expenses
    const [todayExp] = await pool.query(
      "SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE date = CURDATE()"
    );

    res.json({
      today: { revenue: todayRev[0].revenue, orders: todayRev[0].orders },
      month: { revenue: monthRev[0].revenue, orders: monthRev[0].orders },
      topProducts,
      todayExpenses: todayExp[0].total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sales report by date range
router.get('/sales', auth, managerOnly, async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = start || new Date().toISOString().slice(0, 10);
    const endDate = end || startDate;

    const [orders] = await pool.query(`
      SELECT o.*, u.name as barista_name
      FROM orders o
      LEFT JOIN users u ON o.barista_id = u.id
      WHERE DATE(o.created_at) BETWEEN ? AND ?
      ORDER BY o.created_at DESC
    `, [startDate, endDate]);

    const [summary] = await pool.query(`
      SELECT COALESCE(SUM(total),0) as total_revenue, 
             COALESCE(SUM(tax),0) as total_tax,
             COUNT(*) as total_orders
      FROM orders
      WHERE DATE(created_at) BETWEEN ? AND ?
    `, [startDate, endDate]);

    res.json({ orders, summary: summary[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Daily revenue chart (last 7 days)
router.get('/chart/daily', auth, managerOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Expenses CRUD
router.get('/expenses', auth, managerOnly, async (req, res) => {
  try {
    const { start, end } = req.query;
    let query = 'SELECT e.*, u.name as created_by_name FROM expenses e LEFT JOIN users u ON e.created_by = u.id';
    const params = [];
    if (start && end) {
      query += ' WHERE e.date BETWEEN ? AND ?';
      params.push(start, end);
    }
    query += ' ORDER BY e.date DESC, e.created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/expenses', auth, managerOnly, async (req, res) => {
  try {
    const { description, amount, date } = req.body;
    const [result] = await pool.query(
      'INSERT INTO expenses (description, amount, date, created_by) VALUES (?, ?, ?, ?)',
      [description, amount, date, req.user.id]
    );
    res.status(201).json({ id: result.insertId, description, amount, date });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/expenses/:id', auth, managerOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Pengeluaran dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
