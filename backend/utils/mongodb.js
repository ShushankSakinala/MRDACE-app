const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mrdace';

const connectMongoDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Successfully connected to MongoDB.');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        // Don't exit process, as Firestore is primary
    }
};

module.exports = connectMongoDB;
