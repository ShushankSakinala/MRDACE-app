const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const { 
    User: UserModel, 
    MedicalRecord: MedicalRecordModel,
    AccessPermission: AccessPermissionModel 
} = require('../models/mongoModels');

class RecordController {
    async listRecords(req, res) {
        try {
            let records;
            if (req.user.role === 'admin') {
                const results = await MedicalRecordModel.find();
                records = results.map(doc => ({ id: doc._id.toString(), ...doc.toObject() }));
            } else if (req.user.role === 'doctor') {
                records = await MedicalRecord.listForDoctor(req.user.id);
            } else if (req.user.role === 'patient') {
                const patient = await MedicalRecord.getPatientProfile(req.user.id);
                if (patient) {
                    records = await MedicalRecord.findByPatient(patient.id);
                } else {
                    records = [];
                }
            } else {
                records = [];
            }
            res.json(records);
        } catch (err) {
            console.error(err);
            res.status(500).json({ detail: 'Error fetching records' });
        }
    }

    async grantAccess(req, res) {
        const { doctor_id } = req.body;
        if (!doctor_id) {
            return res.status(400).json({ detail: 'Doctor ID is required' });
        }

        try {
            const { User: UserModel, Patient: PatientModel } = require('../models/mongoModels');
            const patient = await MedicalRecord.getPatientProfile(req.user.id);
            if (!patient) {
                return res.status(404).json({ detail: 'Patient profile not found' });
            }

            const doctorUser = await UserModel.findById(doctor_id);
            if (!doctorUser || doctorUser.role !== 'doctor') {
                return res.status(404).json({ detail: 'Doctor not found' });
            }

            // Fetch patient's full name for denormalization
            const patientUser = await UserModel.findById(req.user.id);

            await MedicalRecord.grantAccess(
                patient.id, 
                doctor_id, 
                patientUser ? patientUser.full_name : 'Unknown Patient', 
                doctorUser.full_name
            );
            res.json({ detail: 'Access granted successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ detail: 'Error granting access' });
        }
    }

    async listDoctors(req, res) {
        try {
            if (req.user.role === 'patient') {
                const patient = await MedicalRecord.getPatientProfile(req.user.id);
                if (patient) {
                     // 1. Get all active doctors
                     const doctors = await UserModel.find({
                        role: 'doctor',
                        is_active: 1
                     });
                     
                     if (doctors.length === 0) return res.json([]);

                     // 2. Get permissions for this patient
                     const permissions = await AccessPermissionModel.find({
                        patient_id: patient.id
                     });

                     const permissionMap = {};
                     permissions.forEach(p => {
                         permissionMap[p.doctor_id] = p.status;
                     });

                     // 3. Merge
                     const result = doctors.map(doc => {
                         const uData = doc.toObject();
                         const id = doc._id.toString();
                         return {
                             id,
                             username: uData.username,
                             full_name: uData.full_name,
                             access_status: permissionMap[id] || null
                         };
                     });

                     return res.json(result);
                }
            }
            
            const doctors = await UserModel.find({
                role: 'doctor',
                is_active: 1
            });
            const result = doctors.map(doc => {
                const data = doc.toObject();
                return { id: doc._id.toString(), username: data.username, full_name: data.full_name };
            });
            res.json(result);
        } catch (err) {
            console.error(err);
            res.status(500).json({ detail: 'Error fetching doctors' });
        }
    }

    async revokeAccess(req, res) {
        const { doctor_id } = req.body;
        if (!doctor_id) {
            return res.status(400).json({ detail: 'Doctor ID is required' });
        }

        try {
            const patient = await MedicalRecord.getPatientProfile(req.user.id);
            if (!patient) {
                return res.status(404).json({ detail: 'Patient profile not found' });
            }

            const doctor = await User.findById(doctor_id);
            if (!doctor || doctor.role !== 'doctor') {
                return res.status(404).json({ detail: 'Doctor not found' });
            }

            await MedicalRecord.revokeAccess(patient.id, doctor_id);
            res.json({ detail: 'Access revoked successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ detail: 'Error revoking access' });
        }
    }

    async getMyProfile(req, res) {
        try {
            const patient = await MedicalRecord.getPatientProfile(req.user.id);
            res.json(patient);
        } catch (err) {
            console.error(err);
            res.status(500).json({ detail: 'Error fetching profile' });
        }
    }
}

module.exports = new RecordController();
