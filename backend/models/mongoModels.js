const mongoose = require('mongoose');

// User Schema
// Requirements: name, email, password, role
const UserSchema = new mongoose.Schema({
    // Required fields by prompt
    name: { type: String },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    role: { type: String, default: 'patient' },

    // Compatibility fields
    username: { type: String, unique: true, sparse: true },
    hashed_password: { type: String },
    full_name: { type: String },
    is_active: { type: Number, default: 1 }
}, { timestamps: true });

// Sync middleware for User
UserSchema.pre('save', function(next) {
    if (this.full_name && !this.name) this.name = this.full_name;
    if (this.name && !this.full_name) this.full_name = this.name;
    
    if (this.username && !this.email) {
        // Fallback email from username if not present
        this.email = this.username.includes('@') ? this.username : `${this.username}@mrdace.local`;
    }
    if (this.email && !this.username) {
        this.username = this.email.split('@')[0];
    }
    
    if (this.hashed_password && !this.password) this.password = this.hashed_password;
    if (this.password && !this.hashed_password) this.hashed_password = this.password;

    next();
});

// Patient Schema
// Requirements: patientName, age, gender, contact
const PatientSchema = new mongoose.Schema({
    // Required fields by prompt
    patientName: { type: String },
    age: { type: Number },
    gender: { type: String },
    contact: { type: String },

    // Compatibility fields
    user_id: { type: String, required: true }, 
    full_name: { type: String }, // Denormalized for Compass
    medical_id: { type: String, unique: true, sparse: true },
    date_of_birth: { type: String },
    blood_group: { type: String }
}, { timestamps: true });

// Sync middleware for Patient
PatientSchema.pre('save', function(next) {
    if (this.full_name && !this.patientName) this.patientName = this.full_name;
    if (this.patientName && !this.full_name) this.full_name = this.patientName;

    // Fill sample values for required fields if they are missing (when created from compatibility registration)
    if (this.age === undefined || this.age === null) {
        // Derive age from date_of_birth or set default
        if (this.date_of_birth) {
            const birthYear = parseInt(this.date_of_birth.split('-')[0]);
            if (!isNaN(birthYear)) {
                this.age = new Date().getFullYear() - birthYear;
            }
        }
        if (this.age === undefined || this.age === null) this.age = 30; // fallback default
    }
    if (!this.gender) {
        // Map blood group or default
        this.gender = 'Not Specified';
    }
    if (!this.contact) {
        this.contact = '555-0100'; // default dummy contact
    }

    next();
});

// Doctor Schema (Untouched for compatibility)
const DoctorSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    full_name: { type: String },
    doctor_id: { type: String, unique: true },
    hospital_name: { type: String }
}, { timestamps: true });

// Medical Record Schema
// Requirements: patientId, doctorId, diagnosis, imageUrl, uploadDate
const MedicalRecordSchema = new mongoose.Schema({
    // Required fields by prompt
    patientId: { type: String },
    doctorId: { type: String },
    diagnosis: { type: String },
    imageUrl: { type: String },
    uploadDate: { type: Date, default: Date.now },

    // Compatibility fields
    firebaseId: { type: String, unique: true, sparse: true },
    patient_id: { type: String }, 
    patient_name: { type: String }, // Denormalized for Compass
    created_by: { type: String }, 
    created_by_name: { type: String }, // Denormalized for Compass
    record_type: { type: String },
    created_at: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

// Sync middleware for MedicalRecord
MedicalRecordSchema.pre('save', function(next) {
    if (this.patient_id && !this.patientId) this.patientId = this.patient_id;
    if (this.patientId && !this.patient_id) this.patient_id = this.patientId;

    if (this.created_by && !this.doctorId) this.doctorId = this.created_by;
    if (this.doctorId && !this.created_by) this.created_by = this.doctorId;

    if (this.record_type && !this.diagnosis) this.diagnosis = this.record_type;
    if (this.diagnosis && !this.record_type) this.record_type = this.diagnosis;

    // We can fetch imageUrl from associated MedicalImage if needed, or default
    if (!this.imageUrl) {
        this.imageUrl = '';
    }

    if (this.created_at && !this.uploadDate) {
        this.uploadDate = new Date(this.created_at);
    }
    if (this.uploadDate && !this.created_at) {
        this.created_at = this.uploadDate.toISOString();
    }

    next();
});

// Medical Image Schema (Keep for compatibility)
const MedicalImageSchema = new mongoose.Schema({
    firebaseId: { type: String, unique: true, sparse: true },
    record_id: { type: String, required: true },
    file_path: { type: String, required: true },
    image_type: { type: String },
    encrypted_key: { type: String },
    uploaded_at: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

// Audit Log Schema
// Requirements: userId, action, timestamp
const AuditLogSchema = new mongoose.Schema({
    // Required fields by prompt
    userId: { type: String },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },

    // Compatibility fields
    firebaseId: { type: String, unique: true, sparse: true },
    user_id: { type: String },
    user_name: { type: String }, // Denormalized for Compass
    resource_id: { type: String },
    ip_address: { type: String }
}, { timestamps: true });

// Sync middleware for AuditLog
AuditLogSchema.pre('save', function(next) {
    if (this.user_id && !this.userId) this.userId = this.user_id;
    if (this.userId && !this.user_id) this.user_id = this.userId;

    // Convert string ISO dates to Date object if needed
    if (this._id && !this.timestamp) {
        this.timestamp = new Date();
    }

    next();
});

// Access Permission Schema (Keep for compatibility)
const AccessPermissionSchema = new mongoose.Schema({
    firebaseId: { type: String, unique: true, sparse: true },
    patient_id: { type: String, required: true },
    patient_name: { type: String }, // Denormalized for Compass
    doctor_id: { type: String, required: true },
    doctor_name: { type: String }, // Denormalized for Compass
    granted_at: { type: String, default: () => new Date().toISOString() },
    status: { type: String, default: 'active' }
}, { timestamps: true });

module.exports = {
    User: mongoose.model('User', UserSchema),
    Patient: mongoose.model('Patient', PatientSchema),
    Doctor: mongoose.model('Doctor', DoctorSchema),
    MedicalRecord: mongoose.model('MedicalRecord', MedicalRecordSchema),
    MedicalImage: mongoose.model('MedicalImage', MedicalImageSchema),
    AuditLog: mongoose.model('AuditLog', AuditLogSchema),
    AccessPermission: mongoose.model('AccessPermission', AccessPermissionSchema)
};
