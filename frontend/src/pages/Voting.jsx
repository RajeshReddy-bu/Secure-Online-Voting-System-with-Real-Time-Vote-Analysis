import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Voting = () => {
    const [candidates, setCandidates] = useState([]);
    const [message, setMessage] = useState('');
    const { user, setUser } = useContext(AuthContext);

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/election/candidates');
            setCandidates(res.data);
        } catch (err) {
            console.error('Error fetching candidates');
        }
    };

    const handleVote = async (id) => {
        try {
            const res = await axios.post(`http://localhost:5000/api/election/vote/${id}`);
            setMessage(res.data.message);
            // Update local user state
            const updatedUser = { ...user, isVoted: true };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            fetchCandidates();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error casting vote');
        }
    };

    return (
        <div className="container">
            <h1 style={{ marginBottom: '2rem' }}>Cast Your Vote</h1>
            {message && <div className="glass-card" style={{ marginBottom: '1.5rem', color: message.includes('successfully') ? 'var(--success)' : 'var(--danger)' }}>{message}</div>}

            {user?.isVoted ? (
                <div className="glass-card">
                    <h2>You have already cast your vote.</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Thank you for participating in the election.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {candidates.map(candidate => (
                        <div key={candidate._id} className="glass-card">
                            <h3>{candidate.name}</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{candidate.party}</p>
                            <button className="btn btn-primary" onClick={() => handleVote(candidate._id)}>Vote for {candidate.name}</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Voting;
