// Native fallback for when pinata-sdk is not available
let pinata;
try {
    const pinataSDK = require('@pinata/sdk');
    pinata = new pinataSDK(
        process.env.PINATA_API_KEY || 'your-pinata-api-key',
        process.env.PINATA_SECRET_API_KEY || 'your-pinata-secret'
    );
} catch (e) {
    console.warn('pinata-sdk not installed. Cloud utility will run in Simulation Mode.');
}

const { Readable } = require('stream');

/**
 * Uploads a buffer to IPFS via Pinata (or simulates it)
 * @param {Buffer} buffer - The file content
 * @param {string} fileName - Name for the file in Pinata
 * @returns {Promise<string>} - The IPFS CID
 */
async function uploadToIPFS(buffer, fileName) {
    if (!pinata || !process.env.PINATA_API_KEY || process.env.PINATA_API_KEY === 'your_api_key_here' || process.env.PINATA_API_KEY === 'your_api_key_here') {
        const fs = require('fs');
        const path = require('path');
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

        const localPath = path.join(uploadDir, fileName);
        fs.writeFileSync(localPath, buffer);

        console.log(`[SIMULATION] Uploaded ${fileName} to Local Storage: ${localPath}`);
        return localPath;
    }

    try {
        const stream = Readable.from(buffer);
        const options = {
            pinataMetadata: {
                name: fileName,
            },
        };
        const result = await pinata.pinFileToIPFS(stream, options);
        return result.IpfsHash;
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw new Error('Cloud upload failed');
    }
}

/**
 * Downloads data from IPFS (or simulates it)
 * @param {string} cid - The IPFS CID or local path
 * @returns {Promise<Buffer>} - The file content
 */
async function downloadFromIPFS(cid) {
    // If it's a local path (Simulation Mode), read it directly
    const fs = require('fs');
    if (fs.existsSync(cid)) {
        console.log(`[SIMULATION] Retrieving from Local Storage: ${cid}`);
        return fs.readFileSync(cid);
    }

    // Real IPFS Retrieval (if configured)
    if (pinata && process.env.PINATA_API_KEY && process.env.PINATA_API_KEY !== 'your_api_key_here') {
        try {
            const axios = require('axios');
            const gateway = 'https://gateway.pinata.cloud/ipfs/';
            const response = await axios.get(`${gateway}${cid.replace('ipfs://', '')}`, { responseType: 'arraybuffer' });
            return Buffer.from(response.data);
        } catch (error) {
            console.error('IPFS Download Error:', error);
            throw new Error('Failed to download from Cloud');
        }
    }

    throw new Error('Asset not found in Cloud or Local Storage');
}

module.exports = { uploadToIPFS, downloadFromIPFS };
