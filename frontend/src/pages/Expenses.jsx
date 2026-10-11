import { useState, useEffect } from 'react';
import api from '../api';
import { FiTrash2 } from 'react-icons/fi';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '', date: new Date().toISOString().slice(0, 10) });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const res = await api.get('/reports/expenses');
    setExpenses(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/reports/expenses', { ...form, amount: parseFloat(form.amount) });
    setForm({ description: '', amount: '', date: new Date().toISOString().slice(0, 10) });
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus pengeluaran ini?')) return;
    await api.delete(`/reports/expenses/${id}`);
    loadData();
  };

  const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return (
    <div className="expenses-page">
      <h2>Pengeluaran</h2>
      <div className="product-layout">
        <div className="product-form-section">
          <h3>Tambah Pengeluaran</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Deskripsi</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Jumlah</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Tanggal</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full">Simpan</button>
          </form>
          <div className="stat-card" style={{marginTop:'1.5rem'}}>
            <div className="stat-info">
              <p className="stat-label">Total Pengeluaran</p>
              <p className="stat-value">{formatRp(totalExpenses)}</p>
            </div>
          </div>
        </div>
        <div className="product-list-section">
          <h3>Daftar Pengeluaran</h3>
          <table>
            <thead>
              <tr><th>Tanggal</th><th>Deskripsi</th><th>Jumlah</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id}>
                  <td>{new Date(e.date).toLocaleDateString('id-ID')}</td>
                  <td>{e.description}</td>
                  <td>{formatRp(e.amount)}</td>
                  <td><button className="btn-icon" onClick={() => handleDelete(e.id)}><FiTrash2 /></button></td>
                </tr>
              ))}
              {expenses.length === 0 && <tr><td colSpan="4" style={{textAlign:'center'}}>Tidak ada data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
