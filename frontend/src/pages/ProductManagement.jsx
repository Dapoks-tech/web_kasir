import { useState, useEffect } from 'react';
import api from '../api';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', category_id: '', price: '' });
  const [editId, setEditId] = useState(null);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [p, c] = await Promise.all([api.get('/products'), api.get('/products/categories')]);
    setProducts(p.data);
    setCategories(c.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: form.name, category_id: parseInt(form.category_id), price: parseFloat(form.price) };
    if (editId) {
      await api.put(`/products/${editId}`, { ...payload, is_available: true });
    } else {
      await api.post('/products', payload);
    }
    setForm({ name: '', category_id: '', price: '' });
    setEditId(null);
    loadData();
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setForm({ name: p.name, category_id: String(p.category_id), price: String(p.price) });
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus produk ini?')) return;
    await api.delete(`/products/${id}`);
    loadData();
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await api.post('/products/categories', { name: newCategory });
    setNewCategory('');
    loadData();
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Hapus kategori ini?')) return;
    await api.delete(`/products/categories/${id}`);
    loadData();
  };

  const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

  return (
    <div className="product-page">
      <div className="product-layout">
        <div className="product-form-section">
          <h3>{editId ? 'Edit Produk' : 'Tambah Produk'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nama</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Kategori</label>
              <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
                <option value="">Pilih kategori</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Harga</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full">
              {editId ? 'Update' : 'Tambah'}
            </button>
            {editId && <button type="button" className="btn btn-full" onClick={() => { setEditId(null); setForm({ name: '', category_id: '', price: '' }); }} style={{marginTop:'0.5rem'}}>Batal</button>}
          </form>

          <h3 style={{marginTop:'2rem'}}>Kategori</h3>
          <form onSubmit={handleAddCategory} className="inline-form">
            <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Nama kategori baru" />
            <button type="submit" className="btn btn-primary"><FiPlus /></button>
          </form>
          <ul className="category-list">
            {categories.map(c => (
              <li key={c.id}>
                {c.name}
                <button className="btn-icon" onClick={() => handleDeleteCategory(c.id)}><FiTrash2 /></button>
              </li>
            ))}
          </ul>
        </div>

        <div className="product-list-section">
          <h3>Daftar Menu</h3>
          <table>
            <thead>
              <tr><th>Nama</th><th>Kategori</th><th>Harga</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category_name}</td>
                  <td>{formatRp(p.price)}</td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEdit(p)}><FiEdit2 /></button>
                    <button className="btn-icon" onClick={() => handleDelete(p.id)}><FiTrash2 /></button>
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
