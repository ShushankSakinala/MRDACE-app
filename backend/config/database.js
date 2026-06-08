const mongoose = require('mongoose');
const path = require('path');

// Ensure dotenv is configured (it loads from backend/.env or root context)
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('CRITICAL ERROR: MONGODB_URI environment variable is not defined.');
    process.exit(1);
}

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        // Standard Mongoose connection options
        const conn = await mongoose.connect(MONGODB_URI);
        
        console.log(`MongoDB Connected successfully to host: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// Monitor mongoose connection events for runtime status logging
mongoose.connection.on('connected', () => {
    console.log('Mongoose connection status: Connected');
});

mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection runtime error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose connection status: Disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose connection closed through application termination');
    process.exit(0);
});

module.exports = connectDB;
