// Native fallback for when ethers is not available
let ethers;
try {
    ethers = require('ethers');
} catch (e) {
    console.warn('ethers not installed. Blockchain utility will run in Simulation Mode.');
}

// Simulated Smart Contract ABI
const ABI = [
    "function recordData(uint256 patientId, string cid, string encryptedKey) public",
    "function getRecordMetadata(uint256 patientId) public view returns (string, string)",
    "function grantAccess(address doctor) public",
    "function checkAccess(address doctor, uint256 patientId) public view returns (bool)"
];

class BlockchainService {
    constructor() {
        if (ethers) {
            this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_URL || 'http://localhost:8545');
            this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001', this.provider);
        }
        this.contractAddress = process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
    }

    /**
     * Records metadata on the blockchain
     * @param {number} patientId 
     * @param {string} cid - IPFS Content ID
     * @param {string} encryptedKey - The encrypted AES key for this record
     */
    async recordToBlockchain(patientId, cid, encryptedKey) {
        if (!ethers || !process.env.CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS.startsWith('0x0000')) {
            console.log(`[SIMULATION] Blockchain Record: Patient #${patientId} linked to ${cid}`);
            return { hash: `0xmock-tx-hash-${Date.now()}` };
        }

        try {
            const contract = new ethers.Contract(this.contractAddress, ABI, this.wallet);
            const tx = await contract.recordData(patientId, cid, encryptedKey);
            await tx.wait();
            return tx;
        } catch (error) {
            console.error('Blockchain error:', error);
            throw new Error('Blockchain verification failed');
        }
    }

    /**
     * Retrieves record metadata (CID and Encrypted Key) from the blockchain
     * @param {number} patientId 
     */
    async getRecordMetadata(patientId) {
        if (!ethers || !this.contractAddress || this.contractAddress.startsWith('0x0000')) {
            console.log(`[SIMULATION] Fetching Blockchain Metadata for Patient #${patientId}`);
            // In simulation, we return a mock object that signals the controller to use DB fallback
            // or we could mock specific data if needed.
            return null;
        }

        try {
            const contract = new ethers.Contract(this.contractAddress, ABI, this.provider);
            const [cid, encryptedKey] = await contract.getLatestRecord(patientId);
            return { cid, encryptedKey };
        } catch (error) {
            console.error('Blockchain Retrieval Error:', error);
            return null; // Fallback to DB if blockchain call fails or no records exist
        }
    }
}

module.exports = new BlockchainService();
