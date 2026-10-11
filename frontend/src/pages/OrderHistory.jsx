import { useState, useEffect } from 'react';
import api from '../api';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/orders/today').then(res => setOrders(res.data));
  }, []);

  const viewDetail = async (id) => {
    const res = await api.get(`/orders/${id}`);
    setSelected(res.data);
  };

  const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
  const formatTime = (d) => new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="history-page">
      <h2>Riwayat Transaksi Hari Ini</h2>
      <div className="history-layout">
        <div className="history-list">
          <table>
            <thead>
              <tr>
                <th>No. Order</th>
                <th>Waktu</th>
                <th>Total</th>
                <th>Bayar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>{o.order_number}</td>
                  <td>{formatTime(o.created_at)}</td>
                  <td>{formatRp(o.total)}</td>
                  <td>{o.payment_method}</td>
                  <td><button className="btn btn-sm" onClick={() => viewDetail(o.id)}>Detail</button></td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan="5" style={{textAlign:'center'}}>Belum ada transaksi</td></tr>}
            </tbody>
          </table>
        </div>
        {selected && (
          <div className="history-detail">
            <h3>{selected.order_number}</h3>
            <p>Barista: {selected.barista_name}</p>
            <p>Waktu: {new Date(selected.created_at).toLocaleString('id-ID')}</p>
            <hr />
            {selected.items.map((item, i) => (
              <div key={i} className="receipt-item">
                <span>{item.product_name} x{item.qty} {item.notes ? `(${item.notes})` : ''}</span>
                <span>{formatRp(item.subtotal)}</span>
              </div>
            ))}
            <hr />
            <div className="receipt-item"><span>Subtotal</span><span>{formatRp(selected.subtotal)}</span></div>
            <div className="receipt-item"><span>Pajak</span><span>{formatRp(selected.tax)}</span></div>
            <div className="receipt-item total"><span>Total</span><span>{formatRp(selected.total)}</span></div>
            <div className="receipt-item"><span>Bayar ({selected.payment_method})</span><span>{formatRp(selected.amount_paid)}</span></div>
            <div className="receipt-item"><span>Kembalian</span><span>{formatRp(selected.change_amount)}</span></div>
            <button className="btn btn-sm" onClick={() => setSelected(null)} style={{marginTop:'1rem'}}>Tutup</button>
          </div>
        )}
      </div>
    </div>
  );
}
