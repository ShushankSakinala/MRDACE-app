const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { User, Patient, MedicalRecord, AuditLog } = require('../models/mongoModels');

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ==========================================
// 1. User Management CRUD
// ==========================================

// GET all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users', detail: err.message });
    }
});

// GET single user by ID
router.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid User ID format' });
    }
    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user', detail: err.message });
    }
});

// POST create user
router.post('/users', async (req, res) => {
    const { name, email, password, role } = req.body;
    
    // Request Validation
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields: name, email, and password are required' });
    }
    if (role && !['admin', 'doctor', 'patient'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Role must be admin, doctor, or patient' });
    }

    try {
        // Check for existing user
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'A user with this email already exists' });
        }

        const newUser = await User.create({ name, email, password, role });
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create user', detail: err.message });
    }
});

// PUT update user
router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid User ID format' });
    }
    const { name, email, password, role } = req.body;

    try {
        // Find user first
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Validate unique email if changing
        if (email && email !== user.email) {
            const existing = await User.findOne({ email });
            if (existing) {
                return res.status(400).json({ error: 'Email already in use' });
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (password) user.password = password;
        if (role) {
            if (!['admin', 'doctor', 'patient'].includes(role)) {
                return res.status(400).json({ error: 'Invalid role' });
            }
            user.role = role;
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user', detail: err.message });
    }
});

// DELETE user
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid User ID format' });
    }
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully', user: deletedUser });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user', detail: err.message });
    }
});


// ==========================================
// 2. Patient Records CRUD
// ==========================================

// GET all patients
router.get('/patients', async (req, res) => {
    try {
        const patients = await Patient.find({});
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch patients', detail: err.message });
    }
});

// GET single patient by ID
router.get('/patients/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid Patient ID format' });
    }
    try {
        const patient = await Patient.findById(id);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch patient', detail: err.message });
    }
});

// POST create patient
router.post('/patients', async (req, res) => {
    const { patientName, age, gender, contact, user_id } = req.body;

    // Validation
    if (!patientName || age === undefined || !gender || !contact) {
        return res.status(400).json({ error: 'Missing fields: patientName, age, gender, and contact are required' });
    }

    try {
        // Validate user_id represents a valid User if supplied
        let linkedUserId = user_id;
        if (!linkedUserId) {
            // Create a dummy user link if none is provided
            linkedUserId = new mongoose.Types.ObjectId().toString();
        }

        const newPatient = await Patient.create({
            patientName,
            age,
            gender,
            contact,
            user_id: linkedUserId
        });
        res.status(201).json(newPatient);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create patient record', detail: err.message });
    }
});

// PUT update patient
router.put('/patients/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid Patient ID format' });
    }
    const { patientName, age, gender, contact } = req.body;

    try {
        const patient = await Patient.findById(id);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        if (patientName) patient.patientName = patientName;
        if (age !== undefined) patient.age = age;
        if (gender) patient.gender = gender;
        if (contact) patient.contact = contact;

        const updatedPatient = await patient.save();
        res.json(updatedPatient);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update patient record', detail: err.message });
    }
});

// DELETE patient
router.delete('/patients/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid Patient ID format' });
    }
    try {
        const deletedPatient = await Patient.findByIdAndDelete(id);
        if (!deletedPatient) return res.status(404).json({ error: 'Patient not found' });
        res.json({ message: 'Patient deleted successfully', patient: deletedPatient });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete patient', detail: err.message });
    }
});


// ==========================================
// 3. Medical Records CRUD
// ==========================================

// GET all medical records
router.get('/medical-records', async (req, res) => {
    try {
        const records = await MedicalRecord.find({});
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch medical records', detail: err.message });
    }
});

// GET single medical record by ID
router.get('/medical-records/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid Record ID format' });
    }
    try {
        const record = await MedicalRecord.findById(id);
        if (!record) return res.status(404).json({ error: 'Medical record not found' });
        res.json(record);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch medical record', detail: err.message });
    }
});

// POST create medical record
router.post('/medical-records', async (req, res) => {
    const { patientId, doctorId, diagnosis, imageUrl, uploadDate } = req.body;

    // Validation
    if (!patientId || !doctorId || !diagnosis) {
        return res.status(400).json({ error: 'Missing required fields: patientId, doctorId, and diagnosis are required' });
    }

    try {
        const newRecord = await MedicalRecord.create({
            patientId,
            doctorId,
            diagnosis,
            imageUrl: imageUrl || '',
            uploadDate: uploadDate || new Date()
        });
        res.status(201).json(newRecord);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create medical record', detail: err.message });
    }
});

// PUT update medical record
router.put('/medical-records/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid Record ID format' });
    }
    const { patientId, doctorId, diagnosis, imageUrl, uploadDate } = req.body;

    try {
        const record = await MedicalRecord.findById(id);
        if (!record) return res.status(404).json({ error: 'Medical record not found' });

        if (patientId) record.patientId = patientId;
        if (doctorId) record.doctorId = doctorId;
        if (diagnosis) record.diagnosis = diagnosis;
        if (imageUrl !== undefined) record.imageUrl = imageUrl;
        if (uploadDate) record.uploadDate = new Date(uploadDate);

        const updatedRecord = await record.save();
        res.json(updatedRecord);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update medical record', detail: err.message });
    }
});

// DELETE medical record
router.delete('/medical-records/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid Record ID format' });
    }
    try {
        const deletedRecord = await MedicalRecord.findByIdAndDelete(id);
        if (!deletedRecord) return res.status(404).json({ error: 'Medical record not found' });
        res.json({ message: 'Medical record deleted successfully', record: deletedRecord });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete medical record', detail: err.message });
    }
});


// ==========================================
// 4. Audit Logs CRUD
// ==========================================

// GET all audit logs
router.get('/audit-logs', async (req, res) => {
    try {
        const logs = await AuditLog.find({}).sort({ timestamp: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch audit logs', detail: err.message });
    }
});

// GET single audit log by ID
router.get('/audit-logs/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid Log ID format' });
    }
    try {
        const log = await AuditLog.findById(id);
        if (!log) return res.status(404).json({ error: 'Audit log not found' });
        res.json(log);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch audit log', detail: err.message });
    }
});

// POST create audit log
router.post('/audit-logs', async (req, res) => {
    const { userId, action, timestamp } = req.body;

    // Validation
    if (!userId || !action) {
        return res.status(400).json({ error: 'Missing required fields: userId and action are required' });
    }

    try {
        const newLog = await AuditLog.create({
            userId,
            action,
            timestamp: timestamp || new Date()
        });
        res.status(201).json(newLog);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create audit log', detail: err.message });
    }
});

// PUT update audit log (usually logs are immutable, but providing for full CRUD parity)
router.put('/audit-logs/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid Log ID format' });
    }
    const { userId, action, timestamp } = req.body;

    try {
        const log = await AuditLog.findById(id);
        if (!log) return res.status(404).json({ error: 'Audit log not found' });

        if (userId) log.userId = userId;
        if (action) log.action = action;
        if (timestamp) log.timestamp = new Date(timestamp);

        const updatedLog = await log.save();
        res.json(updatedLog);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update audit log', detail: err.message });
    }
});

// DELETE audit log
router.delete('/audit-logs/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid Log ID format' });
    }
    try {
        const deletedLog = await AuditLog.findByIdAndDelete(id);
        if (!deletedLog) return res.status(404).json({ error: 'Audit log not found' });
        res.json({ message: 'Audit log deleted successfully', log: deletedLog });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete audit log', detail: err.message });
    }
});

module.exports = router;
