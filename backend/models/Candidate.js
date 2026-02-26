const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    party: { type: String, required: true, trim: true },
    symbol: { type: String, default: '🗳️' },
    flagUrl: { type: String },
    color: { type: String, default: '#6366f1' },
    voteCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);
