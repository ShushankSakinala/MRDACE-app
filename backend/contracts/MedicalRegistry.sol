// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalRegistry {
    struct Record {
        string cid;
        string encryptedKey;
        uint256 timestamp;
        bool exists;
    }

    mapping(uint256 => Record[]) private patientRecords;
    mapping(uint256 => mapping(address => bool)) private permissions;

    event RecordAdded(uint256 indexed patientId, string cid);
    event AccessGranted(uint256 indexed patientId, address indexed doctor);

    /**
     * @dev Record metadata for a medical file
     * @param patientId The ID of the patient
     * @param cid IPFS Content Identifier
     * @param encryptedKey The AES key encrypted for the storage system
     */
    function recordData(uint256 patientId, string memory cid, string memory encryptedKey) public {
        patientRecords[patientId].push(Record({
            cid: cid,
            encryptedKey: encryptedKey,
            timestamp: block.timestamp,
            exists: true
        }));
        emit RecordAdded(patientId, cid);
    }

    /**
     * @dev Get the latest record metadata for a patient
     * @param patientId The ID of the patient
     */
    function getLatestRecord(uint256 patientId) public view returns (string memory, string memory) {
        require(patientRecords[patientId].length > 0, "No records found");
        Record memory lastRecord = patientRecords[patientId][patientRecords[patientId].length - 1];
        return (lastRecord.cid, lastRecord.encryptedKey);
    }

    /**
     * @dev Grant access to a doctor
     */
    function grantAccess(uint256 patientId, address doctor) public {
        permissions[patientId][doctor] = true;
        emit AccessGranted(patientId, doctor);
    }

    /**
     * @dev Check if a doctor has access to a patient's records
     */
    function checkAccess(uint256 patientId, address doctor) public view returns (bool) {
        return permissions[patientId][doctor];
    }
}
