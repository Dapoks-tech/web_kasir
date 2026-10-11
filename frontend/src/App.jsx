import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import OrderPage from './pages/OrderPage';
import OrderHistory from './pages/OrderHistory';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import SalesReport from './pages/SalesReport';
import Expenses from './pages/Expenses';
import UserManagement from './pages/UserManagement';
import './App.css';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Barista routes */}
          <Route path="/" element={
            <ProtectedRoute>
              {user?.role === 'manager' ? <Dashboard /> : <OrderPage />}
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute role="barista"><OrderHistory /></ProtectedRoute>
          } />
          {/* Manager routes */}
          <Route path="/products" element={
            <ProtectedRoute role="manager"><ProductManagement /></ProtectedRoute>
          } />
          <Route path="/sales" element={
            <ProtectedRoute role="manager"><SalesReport /></ProtectedRoute>
          } />
          <Route path="/expenses" element={
            <ProtectedRoute role="manager"><Expenses /></ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute role="manager"><UserManagement /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
