import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const userData = await login(username.trim(), password);
            toast.success(`Welcome back, ${userData.username}!`);
            navigate(userData.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid username or password';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Left hero panel */}
            <div className="auth-hero">
                <div className="auth-hero-bg">
                    <div className="auth-hero-orb" />
                    <div className="auth-hero-orb" />
                    <div className="auth-hero-orb" />
                </div>
                <div className="auth-hero-content">
                    <div className="auth-hero-icon">🗳️</div>
                    <h1 className="auth-hero-title">
                        Your Voice,<br />
                        <span className="gradient-text">Your Vote</span>
                    </h1>
                    <p className="auth-hero-desc">
                        Participate in a secure, transparent, and real-time online election
                        powered by advanced cryptographic security.
                    </p>
                    {/* Removed the bulleted auth-features list here per user request */}
                </div>
            </div>

            {/* Right form panel */}
            <div className="auth-panel">
                <div className="auth-form-box">
                    <div className="auth-form-header">
                        <h2 className="auth-form-title">Welcome back</h2>
                        <p className="auth-form-sub">Sign in to cast your vote</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <div className="input-wrapper">
                                <span className="input-icon">👤</span>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-wrapper">
                                <span className="input-icon">🔑</span>
                                <input
                                    className="form-input"
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="input-action"
                                    onClick={() => setShowPass(!showPass)}
                                    tabIndex={-1}
                                >
                                    {showPass ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-lg"
                            disabled={loading}
                            style={{ marginTop: '0.5rem' }}
                        >
                            {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In →'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don't have an account?{' '}
                        <Link to="/register">Create one</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
