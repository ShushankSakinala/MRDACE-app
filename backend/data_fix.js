const mongoose = require('mongoose');
const { User, Patient, Doctor, MedicalRecord, MedicalImage, AccessPermission, AuditLog } = require('./models/mongoModels');

async function reconcileData() {
    console.log('Starting Data Reconciliation...');
    await mongoose.connect('mongodb://127.0.0.1:27017/mrdace');

    // 1. Create a map of Firebase ID -> MongoDB _id
    const users = await User.find();
    const userMap = {};
    users.forEach(u => {
        if (u.firebaseId) {
            userMap[u.firebaseId] = u._id.toString();
        }
    });
    console.log(`Mapped ${Object.keys(userMap).length} users from Firebase to MongoDB.`);

    // 2. Update Patient records
    const patients = await Patient.find();
    for (const p of patients) {
        if (userMap[p.user_id]) {
            p.user_id = userMap[p.user_id];
            await p.save();
        }
    }
    console.log('Reconciled Patient user_id values.');

    // 3. Update Doctor records
    const doctors = await Doctor.find();
    for (const d of doctors) {
        if (userMap[d.user_id]) {
            d.user_id = userMap[d.user_id];
            await d.save();
        }
    }
    console.log('Reconciled Doctor user_id values.');

    // 4. Create a map of Firebase Patient ID -> MongoDB Patient _id
    const patientMap = {};
    const updatedPatients = await Patient.find();
    updatedPatients.forEach(p => {
        if (p.firebaseId) {
            patientMap[p.firebaseId] = p._id.toString();
        }
    });

    // 5. Update Medical Records
    const records = await MedicalRecord.find();
    for (const r of records) {
        let changed = false;
        if (patientMap[r.patient_id]) {
            r.patient_id = patientMap[r.patient_id];
            changed = true;
        }
        if (userMap[r.created_by]) {
            r.created_by = userMap[r.created_by];
            changed = true;
        }
        if (changed) await r.save();
    }
    console.log('Reconciled MedicalRecord patient_id and created_by values.');

    // 6. Update Access Permissions
    const permissions = await AccessPermission.find();
    for (const ap of permissions) {
        let changed = false;
        if (patientMap[ap.patient_id]) {
            ap.patient_id = patientMap[ap.patient_id];
            changed = true;
        }
        if (userMap[ap.doctor_id]) {
            ap.doctor_id = userMap[ap.doctor_id];
            changed = true;
        }
        if (changed) await ap.save();
    }
    console.log('Reconciled AccessPermission patient_id and doctor_id values.');

    // 7. Update Audit Logs (optional but cleaner)
    const logs = await AuditLog.find();
    for (const log of logs) {
        if (userMap[log.user_id]) {
            log.user_id = userMap[log.user_id];
            await log.save();
        }
    }
    console.log('Reconciled AuditLog user_id values.');

    console.log('Data Reconciliation Completed Successfully!');
    process.exit(0);
}

reconcileData().catch(err => {
    console.error('Reconciliation Failed:', err);
    process.exit(1);
});
