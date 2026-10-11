const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// Generate order number: ORD-YYYYMMDD-XXXX
async function generateOrderNumber() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [rows] = await pool.query(
    "SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()"
  );
  const num = (rows[0].count + 1).toString().padStart(4, '0');
  return `ORD-${today}-${num}`;
}

// Create order
router.post('/', auth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { items, payment_method, amount_paid } = req.body;
    // items: [{ product_id, product_name, price, qty, notes }]

    const TAX_RATE = 0.1;
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + tax;
    const change_amount = payment_method === 'cash' ? amount_paid - total : 0;

    const order_number = await generateOrderNumber();

    const [orderResult] = await conn.query(
      `INSERT INTO orders (order_number, barista_id, subtotal, tax, total, payment_method, amount_paid, change_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_number, req.user.id, subtotal, tax, total, payment_method, amount_paid || total, change_amount]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, qty, subtotal, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.price, item.qty, item.price * item.qty, item.notes || null]
      );
    }

    await conn.commit();
    res.status(201).json({
      id: orderId,
      order_number,
      subtotal,
      tax,
      total,
      payment_method,
      amount_paid: amount_paid || total,
      change_amount,
      items,
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
});

// Get orders today (barista)
router.get('/today', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.*, u.name as barista_name 
      FROM orders o 
      LEFT JOIN users u ON o.barista_id = u.id
      WHERE DATE(o.created_at) = CURDATE()
      ORDER BY o.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get order detail
router.get('/:id', auth, async (req, res) => {
  try {
    const [order] = await pool.query(`
      SELECT o.*, u.name as barista_name 
      FROM orders o 
      LEFT JOIN users u ON o.barista_id = u.id
      WHERE o.id = ?
    `, [req.params.id]);
    if (order.length === 0) return res.status(404).json({ message: 'Order tidak ditemukan' });

    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    res.json({ ...order[0], items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
