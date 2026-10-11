import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiCoffee, FiLogOut } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <FiCoffee /> Coffee Shop POS
      </div>
      <div className="nav-links">
        {user.role === 'barista' && (
          <>
            <Link to="/">Pemesanan</Link>
            <Link to="/history">Riwayat</Link>
          </>
        )}
        {user.role === 'manager' && (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/products">Menu</Link>
            <Link to="/sales">Penjualan</Link>
            <Link to="/expenses">Pengeluaran</Link>
            <Link to="/users">Users</Link>
          </>
        )}
      </div>
      <div className="nav-user">
        <span>{user.name} ({user.role})</span>
        <button onClick={handleLogout} className="btn-logout">
          <FiLogOut /> Logout
        </button>
      </div>
    </nav>
  );
}
