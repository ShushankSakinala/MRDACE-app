# MRDACE: Intelligence Architecture for Secure Medical Sharing

This project implements a secure, intelligent, and traceable system for sharing medical images and patient records. It addresses the vulnerabilities of centralized systems by implementing decentralized-style integrity checks, robust RBAC, and an immutable audit trail.

## Proposed Changes

### Backend (FastAPI + PostgreSQL)
- **FastAPI**: High-performance Python framework for building the API.
- **SQLAlchemy/PostgreSQL**: For storing patient records, user roles, and audit logs.
- **Auth Service**: Implementing JWT (JSON Web Tokens) with Argon2 hashing for secure authentication of Patients, Doctors, and Admins.
- **Encryption Service**: Using `cryptography.py` (Fernet/AES-256) for symmetric encryption of patient data, medical images, and their clinical metadata before storage.

### Security & Traceability
- **RBAC (Role-Based Access Control)**: Strict role definitions (Admin, Doctor, Lab Tech, Patient) verified at every middleware layer.
- **End-to-End Encrypted Storage**: All uploaded images (X-rays, CT, MRI, Ultrasound) are encrypted at the API layer before being written to disk/S3.
- **Audit Logging**: Immutable records of login attempts, data access, and image sharing.

### Intelligence Layer
- **DICOM/Image Metadata Processor**: Automatically extracts clinical metadata from uploaded images.
- **Integrity Verification Agent**: An "intelligent" background process that periodically verifies file hashes against the database records.

### Frontend (React/Vite)
- **Modern Dashboard**: High-quality UI for different roles.
- **Visual Audit Trail**: A timeline view for doctors to see who accessed which record.
- **Secure Image Viewer**: Integrated viewer with decryption on the fly.

## Verification Plan

### Automated Tests
- [ ] Test RBAC: Ensure a Patient cannot access another Patient's record.
- [ ] Test Encryption: Verify that data stored in PostgreSQL is encrypted.
- [ ] Test Integrity: Manually modify an image file and check if the system detects the "tamper".

### Manual Verification
- [ ] Walk through the flow: Lab Tech uploads MRI -> Doctor views it -> Audit trail is updated.
- [ ] Check the "Intelligence" dashboard for metadata accuracy.
