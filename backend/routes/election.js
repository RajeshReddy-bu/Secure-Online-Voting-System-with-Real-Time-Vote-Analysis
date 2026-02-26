const express = require('express');
const { body, validationResult } = require('express-validator');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

const multer = require('multer');
const path = require('path');

// Multer config for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images are allowed'));
    }
});

// POST /api/election/candidate — Add candidate (Admin only)
router.post('/candidate', authMiddleware, adminMiddleware, upload.single('flag'), [
    body('name').trim().notEmpty().withMessage('Candidate name is required'),
    body('party').trim().notEmpty().withMessage('Party name is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }
    try {
        const { name, party, symbol, color } = req.body;
        const flagUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const candidate = new Candidate({ name, party, symbol, color, flagUrl });
        await candidate.save();
        res.status(201).json({ message: 'Candidate added successfully', candidate });
    } catch (err) {
        res.status(400).json({ message: 'Error adding candidate', error: err.message });
    }
});

// GET /api/election/candidates — Get all candidates (public)
router.get('/candidates', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: -1 });
        res.json(candidates);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching candidates' });
    }
});

// DELETE /api/election/candidate/:id — Delete candidate (Admin only)
router.delete('/candidate/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const candidate = await Candidate.findByIdAndDelete(req.params.id);
        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
        res.json({ message: 'Candidate deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting candidate' });
    }
});

// POST /api/election/vote/:candidateId — Cast a vote (authenticated users)
router.post('/vote/:candidateId', authMiddleware, async (req, res) => {
    try {
        const { candidateId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.isVoted) {
            return res.status(400).json({ message: 'You have already voted. Each voter can only vote once.' });
        }

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        // Atomic update to prevent race conditions
        await Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } });

        user.isVoted = true;
        user.votedFor = candidateId;
        await user.save();

        res.json({
            message: 'Vote cast successfully',
            candidateName: candidate.name,
            party: candidate.party
        });
    } catch (err) {
        res.status(500).json({ message: 'Error casting vote', error: err.message });
    }
});

// GET /api/election/results — Public results with winner detection
router.get('/results', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: -1 });
        const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

        const results = candidates.map((c, index) => ({
            _id: c._id,
            name: c.name,
            party: c.party,
            symbol: c.symbol,
            color: c.color,
            voteCount: c.voteCount,
            percentage: totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(1) : '0.0',
            isWinner: index === 0 && c.voteCount > 0
        }));

        res.json({ results, totalVotes });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching results' });
    }
});

// GET /api/election/stats — Admin statistics
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: -1 });
        const totalVoters = await User.countDocuments({ role: 'user' });
        const votesCast = await User.countDocuments({ isVoted: true, role: 'user' });
        const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

        const candidatesWithStats = candidates.map((c, index) => ({
            _id: c._id,
            name: c.name,
            party: c.party,
            symbol: c.symbol,
            color: c.color,
            voteCount: c.voteCount,
            percentage: totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(1) : '0.0',
            isWinner: index === 0 && c.voteCount > 0
        }));

        const winner = candidatesWithStats.find(c => c.isWinner) || null;

        res.json({
            candidates: candidatesWithStats,
            totalVoters,
            votesCast,
            turnout: totalVoters > 0 ? ((votesCast / totalVoters) * 100).toFixed(1) : '0.0',
            winner,
            totalVotes
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

module.exports = router;
