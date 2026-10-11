import { useState, useEffect } from 'react';
import api from '../api';
import { FiTrash2 } from 'react-icons/fi';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'barista' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const res = await api.get('/auth/users');
    setUsers(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/auth/register', form);
      setSuccess('User berhasil dibuat');
      setForm({ name: '', username: '', password: '', role: 'barista' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat user');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus user ini?')) return;
    await api.delete(`/auth/users/${id}`);
    loadData();
  };

  return (
    <div className="users-page">
      <h2>Manajemen User</h2>
      <div className="product-layout">
        <div className="product-form-section">
          <h3>Tambah User</h3>
          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nama</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="barista">Barista</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-full">Tambah User</button>
          </form>
        </div>
        <div className="product-list-section">
          <h3>Daftar User</h3>
          <table>
            <thead>
              <tr><th>Nama</th><th>Username</th><th>Role</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.username}</td>
                  <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                  <td>
                    {u.role !== 'manager' && (
                      <button className="btn-icon" onClick={() => handleDelete(u.id)}><FiTrash2 /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
