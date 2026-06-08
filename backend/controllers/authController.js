const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const AuditService = require('../services/auditService');

class AuthController {
    async register(req, res) {
        const { username, password, full_name, role, doctor_id, hospital_name } = req.body;
        console.log('Registration attempt:', { username, role, full_name });

        try {
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                console.log('Username already exists:', username);
                return res.status(400).json({ detail: 'Username already registered' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = await User.create({
                username,
                hashed_password: hashedPassword,
                full_name: full_name,
                role: role || 'patient'
            });
            console.log('User created with ID:', userId);

            if (role === 'doctor' && hospital_name) {
                console.log('Creating doctor profile for ID:', userId);
                await MedicalRecord.createDoctorProfile(userId, doctor_id, hospital_name, full_name);
            } else if (role === 'patient') {
                console.log('Creating patient profile for ID:', userId);
                const medicalId = 'PAT' + (Math.floor(Math.random() * 100) + 1);
                await MedicalRecord.createPatientProfile(userId, medicalId, '1990-01-01', 'O+', full_name);
            }


            console.log('Registration successful for:', username);
            res.status(201).json({ detail: 'User registered successfully', user_id: userId });
        } catch (err) {
            console.error('Registration ERROR:', err);
            res.status(500).json({ detail: 'Registration failed: ' + err.message });
        }
    }

    async login(req, res) {
        const { username, password } = req.body;

        try {
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({ detail: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.hashed_password);
            if (!isMatch) {
                return res.status(401).json({ detail: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET || 'mrdace-secret',
                { expiresIn: '24h' }
            );

            // Log successful login
            await AuditService.log(user.id, 'LOGIN', null, req.ip || req.connection.remoteAddress);

            res.json({
                access_token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    full_name: user.full_name,
                    role: user.role
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ detail: 'Login failed' });
        }
    }

    async me(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ detail: 'User not found' });
            }
            res.json({
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                role: user.role
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ detail: 'Error fetching user' });
        }
    }
}

module.exports = new AuthController();
