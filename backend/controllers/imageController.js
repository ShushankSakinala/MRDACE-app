const EncryptionService = require('../services/encryptionService');
const AccessControlService = require('../services/accessControlService');
const MedicalRecord = require('../models/MedicalRecord');
const { uploadToIPFS, downloadFromIPFS } = require('../utils/cloud');
const blockchain = require('../utils/blockchain');
const fs = require('fs');
const AuditService = require('../services/auditService');

class ImageController {
    /**
     * Handles file upload, encryption, and metadata storage
     */
    async uploadImage(req, res) {
        const { patient_id, record_type } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ detail: 'No file uploaded' });
        }

        try {
            // RBAC check: Patients can only upload for themselves
            if (req.user.role === 'patient') {
                const patient = await MedicalRecord.getPatientProfile(req.user.id);
                if (!patient || (patient.id !== patient_id && patient.firebaseId !== patient_id)) {
                    return res.status(403).json({ detail: 'Unauthorized: Patients can only upload for themselves.' });
                }
            }

            // 1. Generate unique AES key
            const recordKey = EncryptionService.generateAESKey();

            // 2. Encrypt the file
            const encryptedBuffer = EncryptionService.encryptData(file.buffer, recordKey);

            // 3. Protect AES key with RSA Configuration Persistent Key
            const { publicKey } = EncryptionService.generateRSAKeyPair();
            const encryptedAESKey = EncryptionService.encryptKeyWithRSA(recordKey, publicKey);

            // 4. Upload to IPFS (or Local Folder Simulation)
            const fileName = `${Date.now()}-${file.originalname}.enc`;
            const cid = await uploadToIPFS(encryptedBuffer, fileName);

            // 5. Store metadata on Blockchain (Simulated)
            const tx = await blockchain.recordToBlockchain(patient_id, cid, encryptedAESKey);

            // 6. Create record entries in MongoDB
            const { User: UserModel, Patient: PatientModel } = require('../models/mongoModels');
            const creator = await UserModel.findById(req.user.id);
            // patient_id might be a MongoDB _id or a legacy Firebase ID
            const patientData = await PatientModel.findOne({ $or: [{ _id: patient_id }, { user_id: patient_id }, { firebaseId: patient_id }] });
            
            const recordId = await MedicalRecord.create({
                patient_id,
                patient_name: patientData ? patientData.full_name : 'Unknown Patient',
                created_by: req.user.id,
                created_by_name: creator ? creator.full_name || creator.username : req.user.username,
                record_type
            });

            await MedicalRecord.createImage({
                record_id: recordId,
                file_path: cid,
                image_type: file.mimetype,
                encrypted_key: encryptedAESKey
            });

            res.status(201).json({
                detail: 'Record uploaded and verified by Blockchain',
                record_id: recordId,
                cid,
                tx_hash: tx.hash
            });
        } catch (err) {
            console.error('Upload error:', err);
            res.status(500).json({ detail: 'Upload error: ' + err.message });
        }
    }

    /**
     * Handles metadata retrieval, access check, and file decryption
     */
    async downloadImage(req, res) {
        try {
            const image = await MedicalRecord.findImageByRecordId(req.params.id);
            if (!image) {
                return res.status(404).json({ detail: 'Image metadata not found in system.' });
            }

            const record = await MedicalRecord.findById(req.params.id);
            if (!record) {
                return res.status(404).json({ detail: 'Medical record not found.' });
            }

            // --- REFACTORED AUTH CHECK ---
            const hasAccess = await AccessControlService.canAccessRecord(req.user, record);
            if (!hasAccess) {
                await AuditService.log(req.user.id, 'UNAUTHORIZED_VIEW_ATTEMPT', req.params.id, req.ip);
                return res.status(403).json({ detail: 'Access Denied: You do not have authorization to view this record.' });
            }

            // 1. Recover Metadata (Blockchain preference, then system DB)
            let cid = image.file_path;
            let encryptedAESKey = image.encrypted_key;

            try {
                const blockchainData = await blockchain.getRecordMetadata(record.patient_id);
                if (blockchainData) {
                    cid = blockchainData.cid;
                    encryptedAESKey = blockchainData.encryptedKey;
                }
            } catch (bcErr) {
                console.warn('Blockchain metadata lookup failed, falling back to local DB.');
            }

            if (!encryptedAESKey) {
                return res.status(500).json({ detail: 'Decryption Error: No encryption key found for this record.' });
            }

            // 2. Retrieve Encrypted Data from Storage (Local or IPFS)
            let encryptedBuffer;
            try {
                encryptedBuffer = await downloadFromIPFS(cid);
            } catch (storageErr) {
                return res.status(404).json({ detail: 'File Mismatch: Encrypted source file could not be retrieved from storage.' });
            }

            // 3. Recover AES Key with Persistent RSA Private Key
            const { privateKey } = EncryptionService.generateRSAKeyPair();
            let recordKey;
            try {
                recordKey = EncryptionService.decryptKeyWithRSA(encryptedAESKey, privateKey);
            } catch (rsaErr) {
                console.error('RSA Decryption Failure:', rsaErr.message);
                return res.status(422).json({ 
                    detail: 'System Key Mismatch: This record was encrypted with a different system key and cannot be viewed.',
                    recovery_hint: 'The encryption keys were likely reset or lost since this record was created.'
                });
            }

            // 4. Decrypt File with Recovered AES Key
            try {
                const decryptedData = EncryptionService.decryptData(encryptedBuffer, recordKey);
                // Audit successful decryption
                await AuditService.log(req.user.id, 'VIEW', req.params.id, req.ip);
                res.setHeader('Content-Type', image.image_type);
                res.send(decryptedData);
            } catch (aesErr) {
                return res.status(500).json({ detail: 'Data Corruption: Recovered key failed to decrypt the file content.' });
            }

        } catch (err) {
            console.error('Download Image FATAL Error:', err);
            res.status(500).json({
                detail: 'Internal Server Error during record retrieval.',
                error: err.message
            });
        }
    }

    /**
     * Handles file deletion and metadata cleaning
     */
    async deleteRecord(req, res) {
        try {
            const record = await MedicalRecord.findById(req.params.id);
            if (!record) {
                return res.status(404).json({ detail: 'Record not found.' });
            }

            const patient = await MedicalRecord.getPatientProfile(req.user.id);
            const isOwner = patient && (patient.id === record.patient_id || patient.firebaseId === record.patient_id);
            const isCreator = record.created_by === req.user.id;

            if (!isCreator && !isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ detail: 'Unauthorized to delete this record.' });
            }

            const image = await MedicalRecord.findImageByRecordId(req.params.id);
            if (image && fs.existsSync(image.file_path)) {
                fs.unlinkSync(image.file_path); // Physical removal for simulation
            }

            await MedicalRecord.deleteImage(req.params.id);
            await MedicalRecord.delete(req.params.id);

            await AuditService.log(req.user.id, 'DELETE', req.params.id, req.ip);
            res.status(200).json({ detail: 'Record and images deleted successfully.' });
        } catch (err) {
            console.error('Deletion Error:', err);
            res.status(500).json({ detail: 'Error deleting record.' });
        }
    }
}

module.exports = new ImageController();
