import React from 'react';

const ResultsTable = ({ candidates }) => {
    if (!candidates || candidates.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <p>No candidates to display</p>
            </div>
        );
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="results-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Candidate</th>
                        <th>Party</th>
                        <th>Votes</th>
                        <th>Share</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.map((c, i) => (
                        <tr key={c._id} className={c.isWinner ? 'winner-row' : ''}>
                            <td style={{ color: 'var(--text-faint)', fontWeight: 600 }}>
                                {i === 0 && c.voteCount > 0 ? '🏆' : `#${i + 1}`}
                            </td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: c.flagUrl ? 'transparent' : `linear-gradient(135deg, ${c.color || '#6366f1'}, #4f46e5)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
                                        overflow: 'hidden'
                                    }}>
                                        {c.flagUrl ? (
                                            <img
                                                src={`http://localhost:5000${c.flagUrl}`}
                                                alt="flag"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            c.symbol || c.name?.charAt(0)
                                        )}
                                    </div>
                                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                                </div>
                            </td>
                            <td className="text-muted text-sm">{c.party}</td>
                            <td style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                                {c.voteCount.toLocaleString()}
                            </td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div className="progress-bar-wrap" style={{ minWidth: '60px' }}>
                                        <div className="progress-bar-fill" style={{ width: `${c.percentage}%` }} />
                                    </div>
                                    <span className="text-sm" style={{ color: 'var(--text-muted)', minWidth: '38px' }}>
                                        {c.percentage}%
                                    </span>
                                </div>
                            </td>
                            <td>
                                {c.isWinner ? (
                                    <span className="winner-badge">🏆 Winner</span>
                                ) : (
                                    <span className="text-muted text-sm">—</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ResultsTable;
