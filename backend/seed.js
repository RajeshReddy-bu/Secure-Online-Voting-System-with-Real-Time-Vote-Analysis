const mongoose = require('mongoose');
require('dotenv').config();

const Candidate = require('./models/Candidate');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voting-system';



async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Optional: Clear existing candidates
        // await Candidate.deleteMany({});
        // console.log('Cleared existing candidates');

        // Check if candidates already exist
        const count = await Candidate.countDocuments();
        if (count > 0) {
            console.log(`Database already has ${count} candidates. Skipping seed.`);
            mongoose.connection.close();
            return;
        }

        await Candidate.insertMany(candidates);
        console.log('🎉 Successfully seeded candidates!');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        mongoose.connection.close();
    }
}

seed();
