import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const initials = user?.username?.substring(0, 2).toUpperCase() || '??';

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <div className="brand-icon">🗳️</div>
                <span>
                    Secure<span className="gradient-text">Vote</span>
                </span>
            </Link>

            <div className="navbar-actions">
                {user ? (
                    <>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="nav-link">
                                📊 Dashboard
                            </Link>
                        )}
                        <Link to="/" className="nav-link">
                            🗳️ Vote
                        </Link>
                        <div className="nav-pill">
                            <div className="user-avatar">{initials}</div>
                            <span style={{ fontSize: '0.82rem' }}>{user.username}</span>
                            <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                                {user.role}
                            </span>
                        </div>
                        <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
