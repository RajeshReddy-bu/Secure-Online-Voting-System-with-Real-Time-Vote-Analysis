const express = require('express');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// Create Candidate (Admin only)
router.post('/candidate', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name, party } = req.body;
        const candidate = new Candidate({ name, party });
        await candidate.save();
        res.status(201).json({ message: 'Candidate added' });
    } catch (err) {
        res.status(400).json({ message: 'Error adding candidate', error: err.message });
    }
});

// Get all candidates
router.get('/candidates', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: -1 });
        res.json(candidates);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching candidates' });
    }
});

// Vote
router.post('/vote/:candidateId', authMiddleware, async (req, res) => {
    try {
        const { candidateId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (user.isVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        candidate.voteCount += 1;
        await candidate.save();

        user.isVoted = true;
        user.votedFor = candidateId;
        await user.save();

        res.json({ message: 'Vote cast successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error casting vote', error: err.message });
    }
});

// Statistics (Admin only)
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const candidates = await Candidate.find();
        const totalVoters = await User.countDocuments({ role: 'user' });
        const votesCast = await User.countDocuments({ isVoted: true });

        res.json({
            candidates,
            totalVoters,
            votesCast,
            turnout: (votesCast / totalVoters * 100).toFixed(2)
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

module.exports = router;
