import { useState, useEffect } from 'react';
import api from '../api';

export default function SalesReport() {
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState({ orders: [], summary: { total_revenue: 0, total_tax: 0, total_orders: 0 } });

  const loadData = async () => {
    const res = await api.get(`/reports/sales?start=${startDate}&end=${endDate}`);
    setData(res.data);
  };

  useEffect(() => { loadData(); }, []);

  const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
  const formatDate = (d) => new Date(d).toLocaleString('id-ID');

  return (
    <div className="sales-page">
      <h2>Laporan Penjualan</h2>
      <div className="filter-bar">
        <div className="form-group">
          <label>Dari</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Sampai</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={loadData}>Tampilkan</button>
      </div>

      <div className="stats-grid" style={{marginBottom:'1.5rem'}}>
        <div className="stat-card">
          <div className="stat-info">
            <p className="stat-label">Total Pendapatan</p>
            <p className="stat-value">{formatRp(data.summary.total_revenue)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <p className="stat-label">Total Pajak</p>
            <p className="stat-value">{formatRp(data.summary.total_tax)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <p className="stat-label">Total Order</p>
            <p className="stat-value">{data.summary.total_orders}</p>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr><th>No. Order</th><th>Waktu</th><th>Barista</th><th>Total</th><th>Metode</th></tr>
        </thead>
        <tbody>
          {data.orders.map(o => (
            <tr key={o.id}>
              <td>{o.order_number}</td>
              <td>{formatDate(o.created_at)}</td>
              <td>{o.barista_name}</td>
              <td>{formatRp(o.total)}</td>
              <td>{o.payment_method}</td>
            </tr>
          ))}
          {data.orders.length === 0 && <tr><td colSpan="5" style={{textAlign:'center'}}>Tidak ada data</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
