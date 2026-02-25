import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Voting from './pages/Voting';
import Dashboard from './pages/Dashboard';

const App = () => {
  const { user, logout, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
    return children;
  };

  return (
    <Router>
      <nav className="navbar">
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.5rem' }}>SecureVote</Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <>
              <span>Welcome, {user.username} {user.role === 'admin' ? '(Admin)' : ''}</span>
              {user.role === 'admin' && <Link to="/admin" style={{ color: 'white' }}>Dashboard</Link>}
              <Link to="/" style={{ color: 'white' }}>Vote</Link>
              <button onClick={logout} className="btn" style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'white' }}>Login</Link>
              <Link to="/register" style={{ color: 'white' }}>Register</Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Voting />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
