const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/db');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

const JWT_SECRET = process.env.JWT_SECRET || 'mrdace-jwt-secret';

router.post('/login', auditLog('LOGIN'), async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.getOne('SELECT * FROM users WHERE username = ?', [username]);

        if (!user || !bcrypt.compareSync(password, user.hashed_password)) {
            return res.status(401).json({ detail: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            access_token: token,
            token_type: 'bearer',
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                full_name: user.full_name
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: 'Internal server error' });
    }
});

router.post('/register', async (req, res) => {
    const { username, password, full_name, role } = req.body;

    if (!username || !password || !full_name) {
        return res.status(400).json({ detail: 'Missing required fields' });
    }

    try {
        const existingUser = await db.getOne('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser) {
            return res.status(400).json({ detail: 'Username already taken' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const userRole = role || 'patient'; // Default to patient

        const result = await db.execute(
            'INSERT INTO users (username, hashed_password, full_name, role, is_active) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, full_name, userRole, 1]
        );

        const userId = result.id;

        // If the user is a patient, create a corresponding entry in the patients table
        if (userRole === 'patient') {
            const medicalId = 'MID-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            await db.execute(
                'INSERT INTO patients (user_id, medical_id) VALUES (?, ?)',
                [userId, medicalId]
            );
        } else if (userRole === 'doctor') {
            const { doctor_id, hospital_name } = req.body;
            await db.execute(
                'INSERT INTO doctors (user_id, doctor_id, hospital_name) VALUES (?, ?, ?)',
                [userId, doctor_id || '', hospital_name || '']
            );
        }

        res.status(201).json({ detail: 'User registered successfully', user_id: userId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: 'Internal server error during registration' });
    }
});

router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await db.getOne('SELECT id, username, full_name, role FROM users WHERE id = ?', [req.user.id]);
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: 'Error fetching user data' });
    }
});

module.exports = router;
