const { Patient, AccessPermission } = require('../models/mongoModels');

class AccessControlService {
    /**
     * Check if a user has one of the required roles
     */
    hasRole(user, allowedRoles) {
        if (!user || !user.role) return false;
        return allowedRoles.includes(user.role);
    }

    /**
     * Middleware for role-based access control
     */
    authorize(allowedRoles) {
        return (req, res, next) => {
            if (!this.hasRole(req.user, allowedRoles)) {
                return res.status(403).json({ detail: 'Access Denied: Insufficient permissions.' });
            }
            next();
        };
    }

    /**
     * Check if a patient owns a resource or a doctor has permission
     * @param {object} user - Authenticated user from JWT
     * @param {object} record - Medical record metadata from MongoDB
     */
    async canAccessRecord(user, record) {
        if (!user || !record) return false;
        if (user.role === 'admin') return true;

        if (user.role === 'patient') {
            const patient = await Patient.findOne({ user_id: user.id });
            if (!patient) {
                // Secondary check for legacy firebaseId mapping if needed
                const patientAlt = await Patient.findOne({ firebaseId: user.id });
                if (!patientAlt) return false;
                return patientAlt._id.toString() === record.patient_id || patientAlt.firebaseId === record.patient_id;
            }
            return patient._id.toString() === record.patient_id || patient.firebaseId === record.patient_id;
        }

        if (user.role === 'doctor') {
            const permission = await AccessPermission.findOne({
                patient_id: record.patient_id,
                doctor_id: user.id,
                status: 'active'
            });
            
            if (permission) return true;

            // Secondary check for legacy firebaseId mapping
            const permissionAlt = await AccessPermission.findOne({
                patient_id: record.patient_id,
                firebaseId: user.id, // If doctor_id was saved as firebaseId
                status: 'active'
            });

            return !!permissionAlt;
        }

        return false;
    }
}

module.exports = new AccessControlService();
