const mongoose = require('mongoose');
const EncryptionService = require('./services/encryptionService');
const { User, Patient, MedicalRecord, MedicalImage } = require('./models/mongoModels');
const fs = require('fs');
const path = require('path');

async function testEncryptionFlow() {
    console.log('--- Starting Encryption System E2E Test ---');
    await mongoose.connect('mongodb://127.0.0.1:27017/mrdace');

    try {
        // 1. Create a dummy test patient
        const username = 'testuser_' + Date.now();
        const testUser = await User.create({
            username,
            full_name: 'Test Encryption User',
            role: 'patient',
            is_active: 1
        });
        const testPatient = await Patient.create({
            user_id: testUser._id.toString(),
            medical_id: 'TEST' + Date.now()
        });
        console.log(`Step 1: Test User Created (${username})`);

        // 2. Encryption Step (Simulating Upload)
        const rawData = Buffer.from("CONFIDENTIAL_MEDICAL_DATA_E2E_SUCCESS");
        const aesKey = EncryptionService.generateAESKey();
        const encryptedData = EncryptionService.encryptData(rawData, aesKey);
        
        const { publicKey, privateKey } = EncryptionService.generateRSAKeyPair();
        const encryptedAESKey = EncryptionService.encryptKeyWithRSA(aesKey, publicKey);
        console.log('Step 2: Data Encrypted with AES and Protected by RSA.');

        // 3. Save to Metadata
        const record = await MedicalRecord.create({
            patient_id: testPatient._id.toString(),
            created_by: testUser._id.toString(),
            record_type: 'E2E_TEST'
        });
        const image = await MedicalImage.create({
            record_id: record._id.toString(),
            file_path: 'e2e-test-path',
            image_type: 'text/plain',
            encrypted_key: encryptedAESKey
        });
        console.log('Step 3: Metadata Saved to MongoDB.');

        // 4. Decryption Step (Simulating Download)
        console.log('Step 4: Attempting Decryption...');
        const recoveredAESKey = EncryptionService.decryptKeyWithRSA(image.encrypted_key, privateKey);
        const decryptedData = EncryptionService.decryptData(encryptedData, recoveredAESKey);

        if (decryptedData.toString() === rawData.toString()) {
            console.log('RESULT: SUCCESS! Encryption and Decryption are fully functional.');
        } else {
            throw new Error("RESULT: FAILED! Decrypted data mismatch.");
        }

        // Cleanup
        await User.findByIdAndDelete(testUser._id);
        await Patient.findByIdAndDelete(testPatient._id);
        await MedicalRecord.findByIdAndDelete(record._id);
        await MedicalImage.findByIdAndDelete(image._id);
        console.log('Step 5: Test Data Cleaned up.');

    } catch (err) {
        console.error('E2E TEST FAILED:', err.message);
        process.exit(1);
    }

    console.log('--- E2E Test Completed Successfully ---');
    process.exit(0);
}

testEncryptionFlow().catch(err => {
    console.error('Fatal Test Error:', err);
    process.exit(1);
});
