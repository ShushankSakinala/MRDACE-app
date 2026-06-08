const { 
    MedicalRecord, 
    Patient, 
    Doctor, 
    MedicalImage, 
    AccessPermission 
} = require('./mongoModels');

class MedicalRecordWrapper {
    async findById(id) {
        try {
            const record = await MedicalRecord.findById(id);
            if (!record) return await MedicalRecord.findOne({ firebaseId: id }).then(this._transform);
            return this._transform(record);
        } catch (e) {
             return await MedicalRecord.findOne({ firebaseId: id }).then(this._transform);
        }
    }

    async findByPatient(patientId) {
        const records = await MedicalRecord.find({ patient_id: patientId });
        return records.map(this._transform);
    }

    async listForDoctor(doctorId) {
        const accessPermissions = await AccessPermission.find({
            doctor_id: doctorId,
            status: 'active'
        });

        if (accessPermissions.length === 0) return [];

        const patientIds = accessPermissions.map(ap => ap.patient_id);
        const records = await MedicalRecord.find({ patient_id: { $in: patientIds } });
        return records.map(this._transform);
    }

    async create(recordData) {
        const { patient_id, patient_name, created_by, created_by_name, record_type } = recordData;
        const newRecord = await MedicalRecord.create({
            patient_id,
            patient_name,
            created_by,
            created_by_name,
            record_type
        });
        return newRecord._id.toString();
    }

    async findImageByRecordId(recordId) {
        const image = await MedicalImage.findOne({ record_id: recordId });
        return this._transform(image);
    }

    async createImage(imageData) {
        const { record_id, file_path, image_type, encrypted_key } = imageData;
        const newImage = await MedicalImage.create({
            record_id,
            file_path,
            image_type,
            encrypted_key
        });
        return newImage._id.toString();
    }

    async grantAccess(patientId, doctorId, patientName = null, doctorName = null) {
        await AccessPermission.findOneAndUpdate(
            { patient_id: patientId, doctor_id: doctorId },
            { 
                status: 'active', 
                granted_at: new Date().toISOString(),
                patient_name: patientName,
                doctor_name: doctorName 
            },
            { upsert: true }
        );
        return { changes: 1 };
    }

    async revokeAccess(patientId, doctorId) {
        await AccessPermission.findOneAndUpdate(
            { patient_id: patientId, doctor_id: doctorId },
            { status: 'revoked' }
        );
        return { changes: 1 };
    }

    async getPatientProfile(userId) {
        try {
            const patient = await Patient.findOne({ $or: [{ user_id: userId }, { firebaseId: userId }] });
            return this._transform(patient);
        } catch (e) {
            return null;
        }
    }

    async delete(id) {
        try {
            await MedicalRecord.findByIdAndDelete(id);
        } catch (e) {
            await MedicalRecord.findOneAndDelete({ firebaseId: id });
        }
        return { changes: 1 };
    }

    async deleteImage(recordId) {
        const result = await MedicalImage.deleteMany({ record_id: recordId });
        return { changes: result.deletedCount };
    }

    async createDoctorProfile(userId, doctorIdString, hospitalName, fullName = null) {
        await Doctor.findOneAndUpdate(
            { user_id: userId },
            { 
                doctor_id: doctorIdString, 
                hospital_name: hospitalName,
                full_name: fullName 
            },
            { upsert: true }
        );
        return { changes: 1 };
    }

    async createPatientProfile(userId, medicalId, dob, bloodGroup, fullName = null) {
        await Patient.findOneAndUpdate(
            { user_id: userId },
            { 
                medical_id: medicalId, 
                date_of_birth: dob, 
                blood_group: bloodGroup,
                full_name: fullName 
            },
            { upsert: true }
        );
        return { changes: 1 };
    }


    _transform(doc) {
        if (!doc) return null;
        const data = doc.toObject();
        const id = data._id.toString();
        return { id, ...data };
    }
}

module.exports = new MedicalRecordWrapper();

