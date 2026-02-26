import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const getStrength = (pwd) => {
    if (pwd.length === 0) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
        { label: '', color: '' },
        { label: 'Very Weak', color: '#f43f5e' },
        { label: 'Weak', color: '#f59e0b' },
        { label: 'Fair', color: '#eab308' },
        { label: 'Strong', color: '#22c55e' },
        { label: 'Very Strong', color: '#10b981' },
    ];
    return { score, ...levels[score] };
};

const Register = () => {
    const [form, setForm] = useState({ username: '', password: '', role: 'user', adminSecret: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
    const strength = getStrength(form.password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.username.length < 3) { toast.error('Username must be at least 3 characters'); return; }
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/auth/register', form);
            toast.success('Account created! Please sign in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Left hero */}
            <div className="auth-hero">
                <div className="auth-hero-bg">
                    <div className="auth-hero-orb" />
                    <div className="auth-hero-orb" />
                    <div className="auth-hero-orb" />
                </div>
                <div className="auth-hero-content">
                    <div className="auth-hero-icon">🏛️</div>
                    <h1 className="auth-hero-title">
                        Join the<br />
                        <span className="gradient-text">Democracy</span>
                    </h1>
                    <p className="auth-hero-desc">
                        Register to participate in the election. Your vote is anonymous,
                        secure, and counted in real time.
                    </p>
                    <div className="auth-features">
                        {[
                            ['✅', 'Instant registration'],
                            ['🔒', 'Encrypted credentials'],
                            ['👁️', 'Anonymous voting'],
                            ['📱', 'Accessible anywhere'],
                        ].map(([icon, text]) => (
                            <div key={text} className="auth-feature">
                                <div className="auth-feature-icon">{icon}</div>
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form */}
            <div className="auth-panel">
                <div className="auth-form-box">
                    <div className="auth-form-header">
                        <h2 className="auth-form-title">Create account</h2>
                        <p className="auth-form-sub">Register to cast your vote</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <div className="input-wrapper">
                                <span className="input-icon">👤</span>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="Choose a username (3-30 chars)"
                                    value={form.username}
                                    onChange={set('username')}
                                    minLength={3}
                                    maxLength={30}
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
                                    placeholder="At least 6 characters"
                                    value={form.password}
                                    onChange={set('password')}
                                    required
                                />
                                <button type="button" className="input-action" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                                    {showPass ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {form.password.length > 0 && (
                                <>
                                    <div className="strength-bar">
                                        <div className="strength-bar-fill" style={{
                                            width: `${(strength.score / 5) * 100}%`,
                                            background: strength.color
                                        }} />
                                    </div>
                                    <div className="strength-text" style={{ color: strength.color }}>
                                        {strength.label}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select className="form-select" value={form.role} onChange={set('role')}>
                                <option value="user">Voter</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {form.role === 'admin' && (
                            <div className="form-group">
                                <label className="form-label">Admin Secret Code</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">🛡️</span>
                                    <input
                                        className="form-input"
                                        type="password"
                                        placeholder="Enter admin secret code"
                                        value={form.adminSecret}
                                        onChange={set('adminSecret')}
                                        required
                                    />
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.3rem' }}>
                                    ⚠️ Admin access requires a secret code from the system administrator.
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-lg"
                            disabled={loading}
                            style={{ marginTop: '0.5rem' }}
                        >
                            {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account →'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account?{' '}
                        <Link to="/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
