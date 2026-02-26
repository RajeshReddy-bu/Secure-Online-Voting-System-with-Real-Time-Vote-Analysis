import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import VoteModal from '../components/VoteModal';
import toast from 'react-hot-toast';

const COLORS = [
    'linear-gradient(135deg, #6366f1, #4f46e5)',
    'linear-gradient(135deg, #06b6d4, #0891b2)',
    'linear-gradient(135deg, #f472b6, #db2777)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
];

const Voting = () => {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [votedCandidate, setVotedCandidate] = useState(null);
    const [voteLoading, setVoteLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const { user, refreshUser } = useContext(AuthContext);

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/election/candidates');
            setCandidates(res.data);
        } catch (err) {
            toast.error('Failed to load candidates');
        } finally {
            setPageLoading(false);
        }
    };

    const handleVote = async () => {
        if (!selectedCandidate) return;
        setVoteLoading(true);
        try {
            const res = await axios.post(`http://localhost:5000/api/election/vote/${selectedCandidate._id}`);
            setVotedCandidate(selectedCandidate);
            setSelectedCandidate(null);
            toast.success(`🗳️ Vote cast for ${selectedCandidate.name}!`);
            await refreshUser();
            fetchCandidates();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to cast vote';
            toast.error(msg);
            setSelectedCandidate(null);
        } finally {
            setVoteLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="page-loader">
                <div className="spinner" />
                <span>Loading candidates...</span>
            </div>
        );
    }

    if (user?.isVoted) {
        const chosenName = votedCandidate?.name || 'your candidate';
        return (
            <div className="page container">
                <div className="voted-state">
                    <div className="voted-icon">✅</div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Vote Cast!</h1>
                    <p className="text-muted" style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
                        You have successfully cast your vote for{' '}
                        <strong style={{ color: 'var(--text)' }}>{chosenName}</strong>.
                        Thank you for participating in this election.
                    </p>
                    <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤫</div>
                        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', color: 'var(--text)' }}>
                            Results are Hidden
                        </h2>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                            Live results are currently restricted to the admin panel to maintain election integrity.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page container">
            <div className="voting-header">
                <h1>🗳️ Cast Your Vote</h1>
                <p className="text-muted mt-1">
                    Select a candidate to vote. You can only vote <strong>once</strong>.
                </p>
            </div>

            {candidates.length === 0 ? (
                <div className="glass-card empty-state">
                    <div className="empty-state-icon">🗳️</div>
                    <h3>No candidates yet</h3>
                    <p className="text-muted text-sm" style={{ marginTop: '0.4rem' }}>
                        The admin hasn't added any candidates yet. Check back soon!
                    </p>
                </div>
            ) : (
                <div className="candidate-grid">
                    {candidates.map((candidate, i) => (
                        <div
                            key={candidate._id}
                            className="candidate-card"
                            style={{ animationDelay: `${i * 0.08}s` }}
                            onClick={() => setSelectedCandidate(candidate)}
                        >
                            <div
                                className="candidate-avatar"
                                style={{ background: candidate.flagUrl ? 'transparent' : COLORS[i % COLORS.length] }}
                            >
                                {candidate.flagUrl ? (
                                    <img
                                        src={`http://localhost:5000${candidate.flagUrl}`}
                                        alt={`${candidate.name} flag`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                    />
                                ) : (
                                    candidate.symbol || candidate.name.charAt(0)
                                )}
                            </div>
                            <div className="candidate-name">{candidate.name}</div>
                            <div className="candidate-party">
                                <span>🏛️</span> {candidate.party}
                            </div>
                            <div className="candidate-votes">
                                {candidate.voteCount} vote{candidate.voteCount !== 1 ? 's' : ''}
                            </div>
                            <button className="btn btn-primary btn-full btn-sm">
                                Vote for {candidate.name.split(' ')[0]}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {selectedCandidate && (
                <VoteModal
                    candidate={selectedCandidate}
                    onConfirm={handleVote}
                    onCancel={() => setSelectedCandidate(null)}
                    loading={voteLoading}
                />
            )}
        </div>
    );
};

export default Voting;
