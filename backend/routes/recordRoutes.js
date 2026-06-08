const express = require('express');
const router = express.Router();
const multer = require('multer');
const RecordController = require('../controllers/recordController');
const ImageController = require('../controllers/imageController');
const { authenticate } = require('../middleware/auth');
const AccessControlService = require('../services/accessControlService');
const AuditService = require('../services/auditService');

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000 * 1024 * 1024 } // 1000MB
});

// List records
router.get('/records', authenticate, (req, res) => RecordController.listRecords(req, res));

// Upload record (Patient/Doctor/Admin)
router.post('/records/upload',
    authenticate,
    AccessControlService.authorize(['admin', 'doctor', 'patient']),
    upload.single('file'),
    AuditService.middleware('UPLOAD'),
    (req, res) => ImageController.uploadImage(req, res)
);

// Download/View record
router.get('/records/:id/image',
    authenticate,
    AuditService.middleware('VIEW'),
    (req, res) => ImageController.downloadImage(req, res)
);

// Permissions
router.post('/records/grant',
    authenticate,
    AccessControlService.authorize(['patient']),
    AuditService.middleware('GRANT_ACCESS'),
    (req, res) => RecordController.grantAccess(req, res)
);

router.post('/records/revoke',
    authenticate,
    AccessControlService.authorize(['patient']),
    AuditService.middleware('REVOKE_ACCESS'),
    (req, res) => RecordController.revokeAccess(req, res)
);

// Delete record
router.delete('/records/:id',
    authenticate,
    AuditService.middleware('DELETE'),
    (req, res) => ImageController.deleteRecord(req, res)
);

// Lookups
router.get('/doctors', authenticate, (req, res) => RecordController.listDoctors(req, res));
router.get('/patients/me', authenticate, AccessControlService.authorize(['patient']), (req, res) => RecordController.getMyProfile(req, res));

module.exports = router;
