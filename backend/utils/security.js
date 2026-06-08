const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const DEFAULT_KEY = crypto.scryptSync(process.env.ENCRYPTION_SECRET || 'mrdace-default-secret', 'salt', 32);

/**
 * Generates a random AES-256 key
 * @returns {string} - Hex encoded key
 */
function generateKey() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Encrypts a buffer or string using AES-256-CBC
 * @param {Buffer|string} data 
 * @param {string} [hexKey] - Optional hex encoded key
 * @returns {Buffer} - [iv concatenated with encrypted data]
 */
function encrypt(data, hexKey) {
    const key = hexKey ? Buffer.from(hexKey, 'hex') : DEFAULT_KEY;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    return Buffer.concat([iv, encrypted]);
}

/**
 * Decrypts a buffer using AES-256-CBC
 * @param {Buffer} encryptedData - [iv concatenated with encrypted data]
 * @param {string} [hexKey] - Optional hex encoded key
 * @returns {Buffer}
 */
function decrypt(encryptedData, hexKey) {
    const key = hexKey ? Buffer.from(hexKey, 'hex') : DEFAULT_KEY;
    const iv = encryptedData.slice(0, IV_LENGTH);
    const data = encryptedData.slice(IV_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    return Buffer.concat([decipher.update(data), decipher.final()]);
}

module.exports = { encrypt, decrypt, generateKey };
