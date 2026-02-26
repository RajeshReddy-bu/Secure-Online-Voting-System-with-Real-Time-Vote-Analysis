import React from 'react';

const StatCard = ({ icon, label, value, sub, color = '#6366f1', bg = 'rgba(99,102,241,0.1)' }) => {
    return (
        <div className="stat-card">
            <div className="stat-icon" style={{ background: bg, color }}>
                {icon}
            </div>
            <div className="stat-info">
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value ?? '—'}</div>
                {sub && <div className="stat-sub">{sub}</div>}
            </div>
        </div>
    );
};

export default StatCard;
