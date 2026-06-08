const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const db = require('../utils/db');
const { encrypt, decrypt, generateKey } = require('../utils/security');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');
const { uploadToIPFS } = require('../utils/cloud');
const blockchain = require('../utils/blockchain');

const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// List records
router.get('/records', authenticate, async (req, res) => {
    try {
        let records;
        if (req.user.role === 'admin') {
            records = await db.query('SELECT * FROM medical_records');
        } else if (req.user.role === 'doctor') {
            // Doctors can only see records for patients who have granted them access
            records = await db.query(`
                SELECT mr.* FROM medical_records mr
                JOIN access_permissions ap ON mr.patient_id = ap.patient_id
                WHERE ap.doctor_id = ? AND ap.status = 'active'
            `, [req.user.id]);
        } else if (req.user.role === 'patient') {
            // Patient can only see their own records
            const patient = await db.getOne('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);
            if (patient) {
                records = await db.query('SELECT * FROM medical_records WHERE patient_id = ?', [patient.id]);
            } else {
                records = [];
            }
        } else {
            records = [];
        }
        res.json(records);
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: 'Error fetching records' });
    }
});

// Upload record and image
router.post('/records/upload', authenticate, authorize(['admin', 'doctor', 'patient']), upload.single('file'), auditLog('UPLOAD'), async (req, res) => {
    const { patient_id, record_type } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ detail: 'No file uploaded' });
    }

    try {
        // Security check for patients: ensure they only upload for themselves
        if (req.user.role === 'patient') {
            const patient = await db.getOne('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);
            if (!patient || patient.id != patient_id) {
                return res.status(403).json({ detail: 'Unauthorized: Patients can only upload records to their own profile.' });
            }
        }

        // 1. Generate unique key for this record
        const recordKey = generateKey();

        // 2. Encrypt the file
        const encryptedBuffer = encrypt(file.buffer, recordKey);

        // 3. Upload to IPFS (Cloud)
        const fileName = `${Date.now()}-${file.originalname}.enc`;
        const cid = await uploadToIPFS(encryptedBuffer, fileName);

        // 4. Store metadata on Blockchain
        const tx = await blockchain.recordToBlockchain(patient_id, cid, recordKey);

        // 5. Create local medical record
        const recordResult = await db.execute(
            'INSERT INTO medical_records (patient_id, created_by, record_type, created_at) VALUES (?, ?, ?, ?)',
            [patient_id, req.user.id, record_type, new Date().toISOString()]
        );
        const recordId = recordResult.id;

        // 6. Store cloud reference in local DB
        await db.execute(
            'INSERT INTO medical_images (record_id, file_path, image_type, uploaded_at) VALUES (?, ?, ?, ?)',
            [recordId, cid, file.mimetype, new Date().toISOString()]
        );

        res.status(201).json({
            detail: 'Record uploaded to Cloud and verified by Blockchain',
            record_id: recordId,
            cid: cid,
            tx_hash: tx.hash
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: 'Cloud/Blockchain storage error: ' + err.message });
    }
});

// Download and decrypt image
router.get('/records/:id/image', authenticate, auditLog('VIEW'), async (req, res) => {
    try {
        const image = await db.getOne('SELECT * FROM medical_images WHERE record_id = ?', [req.params.id]);
        if (!image) {
            return res.status(404).json({ detail: 'Image not found' });
        }

        const record = await db.getOne('SELECT * FROM medical_records WHERE id = ?', [req.params.id]);

        // --- Role-Based Permission Check ---
        if (req.user.role === 'patient') {
            const patient = await db.getOne('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);
            if (!patient || patient.id !== record.patient_id) {
                return res.status(403).json({ detail: 'Unauthorized: You can only view your own records.' });
            }
        } else if (req.user.role === 'doctor') {
            const permission = await db.getOne(
                'SELECT id FROM access_permissions WHERE patient_id = ? AND doctor_id = ? AND status = "active"',
                [record.patient_id, req.user.id]
            );
            if (!permission) {
                return res.status(403).json({ detail: 'Unauthorized: Patient has not granted you access to this record.' });
            }
        }
        // Admin is allowed by default if they pass the 'authorize' middleware (if applicable)

        // 1. Fetch encrypted key from Blockchain (or local cache for simulation)
        const cid = image.file_path;

        // This is a simplification: in the simulation, we'll assume we can retrieve the key
        // If it were a real contract, we'd call: await blockchain.contract.getRecordMetadata(...)
        const recordKey = process.env.ENCRYPTION_SECRET || 'mrdace-default-secret'; // Fallback for simulation

        // 2. Fetch from IPFS (Simulation uses local file if exists or mock buffer)
        let encryptedData;
        if (fs.existsSync(cid)) {
            encryptedData = fs.readFileSync(cid);
        } else {
            // Mocking cloud fetch for simulation
            return res.status(501).json({ detail: 'Cloud retrieval not fully implemented in simulation environment' });
        }

        const decryptedData = decrypt(encryptedData, recordKey);

        res.setHeader('Content-Type', image.image_type);
        res.send(decryptedData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: 'Decryption error: ' + err.message });
    }
});

// Grant access to a doctor
router.post('/records/grant', authenticate, authorize(['patient']), auditLog('GRANT_ACCESS'), async (req, res) => {
    const { doctor_id } = req.body;
    if (!doctor_id) {
        return res.status(400).json({ detail: 'Doctor ID is required' });
    }

    try {
        const patient = await db.getOne('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);
        if (!patient) {
            return res.status(404).json({ detail: 'Patient profile not found' });
        }

        // Check if doctor exists and is actually a doctor
        const doctor = await db.getOne("SELECT id FROM users WHERE id = ? AND role = 'doctor'", [doctor_id]);
        if (!doctor) {
            return res.status(404).json({ detail: 'Doctor not found' });
        }

        // Check if permission already exists
        const existing = await db.getOne('SELECT id FROM access_permissions WHERE patient_id = ? AND doctor_id = ?', [patient.id, doctor_id]);
        if (existing) {
            await db.execute("UPDATE access_permissions SET status = 'active', granted_at = ? WHERE id = ?", [new Date().toISOString(), existing.id]);
        } else {
            await db.execute(
                'INSERT INTO access_permissions (patient_id, doctor_id, granted_at, status) VALUES (?, ?, ?, ?)',
                [patient.id, doctor_id, new Date().toISOString(), 'active']
            );
        }

        res.json({ detail: 'Access granted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: 'Error granting access' });
    }
});

// List doctors for patients to choose from
router.get('/doctors', authenticate, async (req, res) => {
    try {
        const doctors = await db.query("SELECT id, username, full_name FROM users WHERE role = 'doctor' AND is_active = 1");
        res.json(doctors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: 'Error fetching doctors' });
    }
});

// Get current patient's profile
router.get('/patients/me', authenticate, authorize(['patient']), async (req, res) => {
    try {
        const patient = await db.getOne('SELECT * FROM patients WHERE user_id = ?', [req.user.id]);
        res.json(patient);
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: 'Error fetching profile' });
    }
});

module.exports = router;
