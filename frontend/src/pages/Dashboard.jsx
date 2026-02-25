import React, { useState, useEffect } from 'react';
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [candidateName, setCandidateName] = useState('');
    const [party, setParty] = useState('');

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Live updates every 5s
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/election/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching stats');
        }
    };

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/election/candidate', { name: candidateName, party });
            setCandidateName('');
            setParty('');
            fetchStats();
        } catch (err) {
            alert('Error adding candidate');
        }
    };

    if (!stats) return <div className="container">Loading stats...</div>;

    const chartData = {
        labels: stats.candidates.map(c => c.name),
        datasets: [{
            label: 'Votes',
            data: stats.candidates.map(c => c.voteCount),
            backgroundColor: [
                'rgba(99, 102, 241, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(234, 179, 8, 0.8)',
                'rgba(168, 85, 247, 0.8)',
            ],
            borderColor: 'white',
            borderWidth: 1,
        }]
    };

    const exportToCSV = () => {
        if (!stats) return;
        const headers = ["Candidate Name", "Party", "Vote Count"];
        const rows = stats.candidates.map(c => [c.name, c.party, c.voteCount]);
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "election_results.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Admin Dashboard</h1>
                <button className="btn btn-primary" onClick={exportToCSV}>Export Report (CSV)</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div className="glass-card">
                    <h2>Election Stats</h2>
                    <div style={{ marginTop: '1rem' }}>
                        <p>Total Voters: {stats.totalVoters}</p>
                        <p>Votes Cast: {stats.votesCast}</p>
                        <p>Turnout: {stats.turnout}%</p>
                    </div>
                </div>

                <div className="glass-card">
                    <h2>Add New Candidate</h2>
                    <form onSubmit={handleAddCandidate} style={{ marginTop: '1rem' }}>
                        <input
                            placeholder="Name"
                            value={candidateName}
                            onChange={(e) => setCandidateName(e.target.value)}
                            required
                        />
                        <input
                            placeholder="Party"
                            value={party}
                            onChange={(e) => setParty(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Candidate</button>
                    </form>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div className="glass-card">
                    <h2>Vote Distribution (Bar Chart)</h2>
                    <div style={{ height: '300px' }}>
                        <Bar data={chartData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
                <div className="glass-card">
                    <h2>Vote Share (Pie Chart)</h2>
                    <div style={{ height: '300px' }}>
                        <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
