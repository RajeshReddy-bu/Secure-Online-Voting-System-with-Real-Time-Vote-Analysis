import React from 'react';

const VoteModal = ({ candidate, onConfirm, onCancel, loading }) => {
    if (!candidate) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${candidate.color || '#6366f1'}, #4f46e5)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.8rem', margin: '0 auto 1rem',
                        boxShadow: '0 4px 20px rgba(99,102,241,0.3)'
                    }}>
                        {candidate.symbol || candidate.name?.charAt(0)}
                    </div>
                    <h2 style={{ marginBottom: '0.4rem' }}>Confirm Your Vote</h2>
                    <p className="text-muted text-sm">This action cannot be undone.</p>
                </div>

                <div className="glass-card-flat" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                        {candidate.name}
                    </div>
                    <div className="text-muted text-sm">{candidate.party}</div>
                </div>

                <p className="text-muted text-sm" style={{ textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                    Are you sure you want to cast your vote for <strong style={{ color: 'var(--text)' }}>{candidate.name}</strong>?
                    You can only vote once per election.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-ghost btn-full" onClick={onCancel} disabled={loading}>
                        Cancel
                    </button>
                    <button className="btn btn-primary btn-full" onClick={onConfirm} disabled={loading}>
                        {loading ? <><span className="spinner" /> Voting...</> : '✅ Confirm Vote'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoteModal;
