import { useState, useEffect } from 'react';
import api from '../api';
import { FiPlus, FiMinus, FiTrash2, FiShoppingCart } from 'react-icons/fi';

export default function OrderPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [showReceipt, setShowReceipt] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [prodRes, catRes] = await Promise.all([
      api.get('/products'),
      api.get('/products/categories'),
    ]);
    setProducts(prodRes.data.filter(p => p.is_available));
    setCategories(catRes.data);
  };

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category_id === parseInt(activeCategory));

  const addToCart = (product) => {
    setCart(prev => {
      const exist = prev.find(i => i.product_id === product.id);
      if (exist) return prev.map(i => i.product_id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product_id: product.id, product_name: product.name, price: product.price, qty: 1, notes: '' }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(i => {
      if (i.product_id === productId) {
        const newQty = i.qty + delta;
        return newQty > 0 ? { ...i, qty: newQty } : i;
      }
      return i;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.product_id !== productId));
  };

  const updateNotes = (productId, notes) => {
    setCart(prev => prev.map(i => i.product_id === productId ? { ...i, notes } : i));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const handleOrder = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'cash' && (parseFloat(amountPaid) || 0) < total) {
      setError('Jumlah bayar kurang');
      return;
    }
    setError('');
    try {
      const res = await api.post('/orders', {
        items: cart,
        payment_method: paymentMethod,
        amount_paid: paymentMethod === 'cash' ? parseFloat(amountPaid) : total,
      });
      setShowReceipt(res.data);
      setCart([]);
      setAmountPaid('');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat pesanan');
    }
  };

  const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

  if (showReceipt) {
    return (
      <div className="receipt-overlay">
        <div className="receipt-card">
          <h2>Struk Pembayaran</h2>
          <p className="receipt-number">{showReceipt.order_number}</p>
          <hr />
          {showReceipt.items.map((item, i) => (
            <div key={i} className="receipt-item">
              <span>{item.product_name} x{item.qty}</span>
              <span>{formatRp(item.price * item.qty)}</span>
            </div>
          ))}
          <hr />
          <div className="receipt-item"><span>Subtotal</span><span>{formatRp(showReceipt.subtotal)}</span></div>
          <div className="receipt-item"><span>Pajak (10%)</span><span>{formatRp(showReceipt.tax)}</span></div>
          <div className="receipt-item total"><span>Total</span><span>{formatRp(showReceipt.total)}</span></div>
          <div className="receipt-item"><span>Bayar ({showReceipt.payment_method})</span><span>{formatRp(showReceipt.amount_paid)}</span></div>
          {showReceipt.payment_method === 'cash' && (
            <div className="receipt-item"><span>Kembalian</span><span>{formatRp(showReceipt.change_amount)}</span></div>
          )}
          <button className="btn btn-primary btn-full" onClick={() => setShowReceipt(null)} style={{marginTop: '1rem'}}>
            Pesanan Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      <div className="menu-section">
        <h2>Menu</h2>
        <div className="category-tabs">
          <button className={activeCategory === 'all' ? 'active' : ''} onClick={() => setActiveCategory('all')}>Semua</button>
          {categories.map(c => (
            <button key={c.id} className={activeCategory === String(c.id) ? 'active' : ''} onClick={() => setActiveCategory(String(c.id))}>
              {c.name}
            </button>
          ))}
        </div>
        <div className="product-grid">
          {filtered.map(p => (
            <div key={p.id} className="product-card" onClick={() => addToCart(p)}>
              <h3>{p.name}</h3>
              <p className="product-category">{p.category_name}</p>
              <p className="product-price">{formatRp(p.price)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="cart-section">
        <h2><FiShoppingCart /> Pesanan</h2>
        {cart.length === 0 ? (
          <p className="cart-empty">Belum ada pesanan</p>
        ) : (
          <>
            {cart.map(item => (
              <div key={item.product_id} className="cart-item">
                <div className="cart-item-header">
                  <span className="cart-item-name">{item.product_name}</span>
                  <button className="btn-icon" onClick={() => removeFromCart(item.product_id)}><FiTrash2 /></button>
                </div>
                <div className="cart-item-controls">
                  <div className="qty-control">
                    <button onClick={() => updateQty(item.product_id, -1)}><FiMinus /></button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.product_id, 1)}><FiPlus /></button>
                  </div>
                  <span className="cart-item-price">{formatRp(item.price * item.qty)}</span>
                </div>
                <input
                  type="text"
                  placeholder="Catatan (opsional)"
                  value={item.notes}
                  onChange={e => updateNotes(item.product_id, e.target.value)}
                  className="cart-item-notes"
                />
              </div>
            ))}

            <div className="cart-summary">
              <div className="summary-row"><span>Subtotal</span><span>{formatRp(subtotal)}</span></div>
              <div className="summary-row"><span>Pajak (10%)</span><span>{formatRp(tax)}</span></div>
              <div className="summary-row total"><span>Total</span><span>{formatRp(total)}</span></div>
            </div>

            <div className="payment-section">
              <div className="form-group">
                <label>Metode Bayar</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="qris">QRIS</option>
                  <option value="debit">Debit</option>
                </select>
              </div>
              {paymentMethod === 'cash' && (
                <div className="form-group">
                  <label>Jumlah Bayar</label>
                  <input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} placeholder="0" />
                  {amountPaid && parseFloat(amountPaid) >= total && (
                    <p className="change-display">Kembalian: {formatRp(parseFloat(amountPaid) - total)}</p>
                  )}
                </div>
              )}
              {error && <div className="alert error">{error}</div>}
              <button className="btn btn-primary btn-full" onClick={handleOrder}>
                Bayar {formatRp(total)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
