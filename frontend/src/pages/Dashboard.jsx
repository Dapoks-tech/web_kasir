import { useState, useEffect } from 'react';
import api from '../api';
import { FiTrendingUp, FiShoppingCart, FiDollarSign, FiStar } from 'react-icons/fi';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/reports/dashboard').then(res => setData(res.data));
  }, []);

  const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

  if (!data) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><FiDollarSign /></div>
          <div className="stat-info">
            <p className="stat-label">Pendapatan Hari Ini</p>
            <p className="stat-value">{formatRp(data.today.revenue)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FiShoppingCart /></div>
          <div className="stat-info">
            <p className="stat-label">Order Hari Ini</p>
            <p className="stat-value">{data.today.orders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FiTrendingUp /></div>
          <div className="stat-info">
            <p className="stat-label">Pendapatan Bulan Ini</p>
            <p className="stat-value">{formatRp(data.month.revenue)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FiDollarSign /></div>
          <div className="stat-info">
            <p className="stat-label">Pengeluaran Hari Ini</p>
            <p className="stat-value">{formatRp(data.todayExpenses)}</p>
          </div>
        </div>
      </div>

      <div className="top-products">
        <h3><FiStar /> Menu Terlaris Bulan Ini</h3>
        <table>
          <thead>
            <tr><th>Menu</th><th>Terjual</th><th>Pendapatan</th></tr>
          </thead>
          <tbody>
            {data.topProducts.map((p, i) => (
              <tr key={i}>
                <td>{p.product_name}</td>
                <td>{p.total_qty}</td>
                <td>{formatRp(p.total_revenue)}</td>
              </tr>
            ))}
            {data.topProducts.length === 0 && <tr><td colSpan="3" style={{textAlign:'center'}}>Belum ada data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
