# MRDACE - Execution Guide

Follow these steps to set up and run the Medical Record Sharing Architecture.

## 📋 Prerequisites
- **Node.js 18+** & **npm**

---

## 🚀 System Setup (One Command)

1. **Install Root Dependencies**:
   ```powershell
   cd "C:\major project"
   npm install
   ```

2. **Start the Unified System**:
   ```powershell
   # This starts both the Backend (port 5000) and Frontend (port 3000)
   npm run dev
   ```
   *The application is now live at `http://localhost:3000`*

---

## 🔑 Accessing the System

1. Open your browser and go to `http://localhost:3000`.
2. Log in using the following credentials:
   - **Username**: `admin`
   - **Password**: `admin123`
3. Or create a new account using the **"Create Account"** feature.

---

## 🛡️ Security Check
- **AES-256 Encryption**: Every file uploaded is encrypted before being stored in the `backend/uploads/` directory.
- **Role-Based Access Control (RBAC)**: Enforced via JWT. Doctors have upload/view access; Patients have restricted view.
- **Audit Logs**: Every sensitive action (Login, View, Upload) is logged in the `audit_logs` table within `mrdace.db`.
- **Traceability**: All interactions are tracked with timestamps and IP addresses.
