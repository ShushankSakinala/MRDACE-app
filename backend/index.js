require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectMongoDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');
const adminRoutes = require('./routes/admin'); 
const crudRoutes = require('./routes/crudRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectMongoDB();

app.use(cors());
app.use(express.json());

// Main API routes
app.use('/api', authRoutes);
app.use('/api', recordRoutes);
// Admin routes with /api/admin prefix
app.use('/api/admin', adminRoutes);
// CRUD routes
app.use('/api/crud', crudRoutes);


app.get('/', (req, res) => {
    res.json({ message: 'MRDACE Secure Node.js API is online (MongoDB Only)', status: 'secure' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
