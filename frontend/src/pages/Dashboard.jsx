import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ResultsTable from '../components/ResultsTable';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const CHART_COLORS = [
    '#6366f1', '#06b6d4', '#f472b6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'
];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [form, setForm] = useState({ name: '', party: '', flag: null, color: '#6366f1' });
    const [addLoading, setAddLoading] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/election/stats');
            setStats(res.data);
        } catch (err) {
            // Don't spam toast on auto-refresh failures
        }
    };

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.party.trim()) {
            toast.error('Name and party are required');
            return;
        }
        setAddLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('party', form.party);
            if (form.color) formData.append('color', form.color);
            if (form.flag) formData.append('flag', form.flag);

            await axios.post('http://localhost:5000/api/election/candidate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(`${form.name} added as candidate!`);
            setForm({ name: '', party: '', flag: null });
            // Reset file input manually
            if (document.getElementById('flagUpload')) {
                document.getElementById('flagUpload').value = '';
            }
            fetchStats();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error adding candidate');
        } finally {
            setAddLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Remove candidate "${name}"? This cannot be undone.`)) return;
        setDeleteId(id);
        try {
            await axios.delete(`http://localhost:5000/api/election/candidate/${id}`);
            toast.success(`${name} removed`);
            fetchStats();
        } catch (err) {
            toast.error('Failed to delete candidate');
        } finally {
            setDeleteId(null);
        }
    };

    const exportCSV = () => {
        if (!stats) return;
        const rows = [
            ['Rank', 'Candidate', 'Party', 'Votes', 'Percentage', 'Status'],
            ...stats.candidates.map((c, i) => [
                i + 1, c.name, c.party, c.voteCount, `${c.percentage}%`,
                c.isWinner ? 'WINNER' : ''
            ]),
            [],
            ['Total Voters', stats.totalVoters],
            ['Votes Cast', stats.votesCast],
            ['Voter Turnout', `${stats.turnout}%`],
            ['Winner', stats.winner?.name || 'No winner yet'],
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `election_results_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Report exported as CSV');
    };

    if (!stats) {
        return (
            <div className="page-loader">
                <div className="spinner" />
                <span>Loading dashboard...</span>
            </div>
        );
    }

    const chartLabels = stats.candidates.map(c => c.name);
    const chartVotes = stats.candidates.map(c => c.voteCount);
    const chartColors = stats.candidates.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#94a3b8', font: { size: 12 } } },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
            }
        },
        scales: {
            x: {
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(255,255,255,0.05)' }
            },
            y: {
                ticks: { color: '#94a3b8', stepSize: 1 },
                grid: { color: 'rgba(255,255,255,0.05)' }
            }
        }
    };

    const barData = {
        labels: chartLabels,
        datasets: [{
            label: 'Votes',
            data: chartVotes,
            backgroundColor: chartColors.map(c => c + 'cc'),
            borderColor: chartColors,
            borderWidth: 2,
            borderRadius: 8,
        }]
    };

    const pieData = {
        labels: chartLabels,
        datasets: [{
            data: chartVotes,
            backgroundColor: chartColors.map(c => c + 'cc'),
            borderColor: '#050b18',
            borderWidth: 3,
            hoverOffset: 6,
        }]
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#94a3b8', font: { size: 11 }, padding: 16 }
            },
            tooltip: chartOptions.plugins.tooltip,
        }
    };

    return (
        <div className="page container">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>📊 Admin Dashboard</h1>
                    <div className="live-indicator mt-1">
                        <div className="live-dot" />
                        Live — refreshing every 5s
                    </div>
                </div>
                <button className="btn btn-ghost" onClick={exportCSV}>
                    📥 Export CSV
                </button>
            </div>

            {/* Stat Cards */}
            <div className="stat-cards-grid">
                <StatCard
                    icon="👥"
                    label="Registered Voters"
                    value={stats.totalVoters.toLocaleString()}
                    sub="total users"
                    color="#6366f1"
                    bg="rgba(99,102,241,0.12)"
                />
                <StatCard
                    icon="🗳️"
                    label="Votes Cast"
                    value={stats.votesCast.toLocaleString()}
                    sub={`of ${stats.totalVoters} voters`}
                    color="#06b6d4"
                    bg="rgba(6,182,212,0.12)"
                />
                <StatCard
                    icon="📈"
                    label="Voter Turnout"
                    value={`${stats.turnout}%`}
                    sub={stats.turnout >= 50 ? 'Good participation' : 'Growing'}
                    color="#10b981"
                    bg="rgba(16,185,129,0.12)"
                />
                <StatCard
                    icon="🏆"
                    label="Current Leader"
                    value={stats.winner?.name || 'No votes yet'}
                    sub={stats.winner ? `${stats.winner.percentage}% of votes` : '—'}
                    color="#f59e0b"
                    bg="rgba(245,158,11,0.12)"
                />
            </div>

            {/* Charts */}
            {stats.candidates.length > 0 ? (
                <div className="charts-row" style={{ marginBottom: '2rem' }}>
                    <div className="glass-card">
                        <h2 style={{ marginBottom: '1.2rem', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Vote Distribution
                        </h2>
                        <div style={{ height: 260 }}>
                            <Bar data={barData} options={chartOptions} />
                        </div>
                    </div>
                    <div className="glass-card">
                        <h2 style={{ marginBottom: '1.2rem', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Vote Share
                        </h2>
                        <div style={{ height: 260 }}>
                            <Pie data={pieData} options={pieOptions} />
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Results Table + Add Candidate */}
            <div className="admin-grid">
                {/* Results table */}
                <div className="glass-card">
                    <h2 style={{ marginBottom: '1.2rem', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Election Results
                    </h2>
                    <ResultsTable candidates={stats.candidates} />

                    {/* Candidate delete actions */}
                    {stats.candidates.length > 0 && (
                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.2rem' }}>
                            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8rem' }}>
                                Manage Candidates
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {stats.candidates.map(c => (
                                    <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                                        <span className="text-sm">{c.name} — <span className="text-muted">{c.party}</span></span>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            disabled={deleteId === c._id}
                                            onClick={() => handleDelete(c._id, c.name)}
                                        >
                                            {deleteId === c._id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '🗑️ Remove'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Add candidate form */}
                <div className="glass-card" style={{ alignSelf: 'start' }}>
                    <h2 style={{ marginBottom: '1.2rem', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Add Candidate
                    </h2>
                    <form onSubmit={handleAddCandidate}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="e.g. Jane Smith"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Party / Affiliation</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="e.g. National Party"
                                value={form.party}
                                onChange={e => setForm({ ...form, party: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Flag Image</label>
                            <input
                                id="flagUpload"
                                className="form-input"
                                type="file"
                                accept="image/*"
                                onChange={e => setForm({ ...form, flag: e.target.files[0] })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Theme Color</label>
                            <input
                                className="form-input"
                                type="color"
                                value={form.color}
                                onChange={e => setForm({ ...form, color: e.target.value })}
                                style={{ height: '40px', padding: '0.2rem' }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={addLoading}
                        >
                            {addLoading ? <><span className="spinner" /> Adding...</> : '➕ Add Candidate'}
                        </button>
                    </form>

                    {/* Summary stats */}
                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.2rem' }}>
                        <h3 style={{ fontSize: '0.8rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8rem' }}>
                            Quick Stats
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {[
                                ['Total Candidates', stats.candidates.length],
                                ['Total Votes', stats.totalVotes],
                                ['Abstentions', stats.totalVoters - stats.votesCast],
                            ].map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span className="text-muted">{k}</span>
                                    <span style={{ fontWeight: 600 }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
