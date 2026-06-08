const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-cbc';
        this.ivLength = 16;
        this.masterSecret = process.env.ENCRYPTION_SECRET || 'mrdace-default-secret';
        this.keyPath = path.join(__dirname, '../system_keys.json');
        this.cachedKeyPair = null;
        
        // Auto-initialize and self-test
        this.generateRSAKeyPair();
        this.testKeys();
    }

    /**
     * Generates a random AES-256 key
     */
    generateAESKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * RSA Key Pair Generation with Persistence
     */
    generateRSAKeyPair() {
        if (this.cachedKeyPair) return this.cachedKeyPair;

        if (fs.existsSync(this.keyPath)) {
            try {
                const data = fs.readFileSync(this.keyPath, 'utf8');
                this.cachedKeyPair = JSON.parse(data);
                if (this.cachedKeyPair.publicKey && this.cachedKeyPair.privateKey) {
                    console.log('[EncryptionService] Persistent RSA system keys loaded.');
                    return this.cachedKeyPair;
                }
            } catch (err) {
                console.error('[EncryptionService] CRITICAL: system_keys.json corrupted.');
            }
        }

        console.log('[EncryptionService] No persistent RSA keys found. Generating new keypair...');
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });

        this.cachedKeyPair = { publicKey, privateKey };

        try {
            fs.writeFileSync(this.keyPath, JSON.stringify(this.cachedKeyPair, null, 2), 'utf8');
            console.log('[EncryptionService] New system keypair saved.');
        } catch (err) {
            console.error('[EncryptionService] ERROR: Could not save keys:', err.message);
        }

        return this.cachedKeyPair;
    }

    /**
     * Performs a self-test to verify RSA/AES functionality
     */
    testKeys() {
        try {
            const testData = "MRDACE_SELF_TEST_SUCCESS";
            const testAESKey = this.generateAESKey();
            const { publicKey, privateKey } = this.generateRSAKeyPair();

            // 1. Test RSA
            const encryptedAES = this.encryptKeyWithRSA(testAESKey, publicKey);
            const decryptedAES = this.decryptKeyWithRSA(encryptedAES, privateKey);
            
            if (testAESKey !== decryptedAES) throw new Error("RSA Self-Test Failed: Key mismatch.");

            // 2. Test AES
            const encryptedData = this.encryptData(Buffer.from(testData), decryptedAES);
            const decryptedData = this.decryptData(encryptedData, decryptedAES).toString();

            if (testData !== decryptedData) throw new Error("AES Self-Test Failed: Data corruption.");

            console.log('[EncryptionService] Self-Test Passed: Encryption system is 100% healthy.');
            return true;
        } catch (err) {
            console.error('[EncryptionService] SELF-TEST FATAL ERROR:', err.message);
            return false;
        }
    }

    /**
     * Protect an AES key using RSA public key
     */
    encryptKeyWithRSA(aesKey, publicKey) {
        return crypto.publicEncrypt(publicKey, Buffer.from(aesKey, 'hex')).toString('base64');
    }

    /**
     * Recover an AES key using RSA private key
     */
    decryptKeyWithRSA(encryptedKey, privateKey) {
        return crypto.privateDecrypt(privateKey, Buffer.from(encryptedKey, 'base64')).toString('hex');
    }

    /**
     * Encrypt data with AES
     */
    encryptData(data, hexKey) {
        const key = hexKey ? Buffer.from(hexKey, 'hex') : crypto.scryptSync(this.masterSecret, 'salt', 32);
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv(this.algorithm, key, iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        return Buffer.concat([iv, encrypted]);
    }

    /**
     * Decrypt data with AES
     */
    decryptData(encryptedData, hexKey) {
        const key = hexKey ? Buffer.from(hexKey, 'hex') : crypto.scryptSync(this.masterSecret, 'salt', 32);
        const iv = encryptedData.slice(0, this.ivLength);
        const data = encryptedData.slice(this.ivLength);
        const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
        return Buffer.concat([decipher.update(data), decipher.final()]);
    }
}

module.exports = new EncryptionService();
