const mongoose = require('mongoose');
require('dotenv').config();
const { 
    User, 
    Patient, 
    Doctor, 
    MedicalRecord, 
    AuditLog, 
    AccessPermission 
} = require('./models/mongoModels');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mrdace';

async function backfill() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected.');

        const allUsers = await User.find();
        const userMap = {}; // ID -> { full_name, username }
        allUsers.forEach(u => {
            userMap[u._id.toString()] = { name: u.full_name || u.username, username: u.username };
            if (u.firebaseId) {
                userMap[u.firebaseId] = { name: u.full_name || u.username, username: u.username };
            }
        });

        // 1. Backfill Patients
        console.log('Backfilling Patients...');
        const patients = await Patient.find();
        for (let p of patients) {
            const u = userMap[p.user_id];
            if (u && !p.full_name) {
                await Patient.findByIdAndUpdate(p._id, { full_name: u.name });
            }
        }

        // 2. Backfill Doctors
        console.log('Backfilling Doctors...');
        const doctors = await Doctor.find();
        for (let d of doctors) {
            const u = userMap[d.user_id];
            if (u && !d.full_name) {
                await Doctor.findByIdAndUpdate(d._id, { full_name: u.name });
            }
        }

        const patientMap = {}; // Patient ID -> Name
        const allPatients = await Patient.find();
        allPatients.forEach(p => {
             patientMap[p._id.toString()] = p.full_name;
             if (p.medical_id) patientMap[p.medical_id] = p.full_name;
        });

        // 3. Backfill Medical Records
        console.log('Backfilling Medical Records...');
        const records = await MedicalRecord.find();
        for (let r of records) {
            const update = {};
            const creator = userMap[r.created_by];
            if (creator && !r.created_by_name) update.created_by_name = creator.name;
            
            const pName = patientMap[r.patient_id];
            if (pName && !r.patient_name) update.patient_name = pName;

            if (Object.keys(update).length > 0) {
                await MedicalRecord.findByIdAndUpdate(r._id, update);
            }
        }

        // 4. Backfill Audit Logs
        console.log('Backfilling Audit Logs...');
        const logs = await AuditLog.find();
        let logCount = 0;
        for (let l of logs) {
            const u = userMap[l.user_id];
            if (u && !l.user_name) {
                await AuditLog.findByIdAndUpdate(l._id, { user_name: u.username });
                logCount++;
            }
        }
        console.log(`Updated ${logCount} audit logs.`);

        // 5. Backfill Access Permissions
        console.log('Backfilling Access Permissions...');
        const perms = await AccessPermission.find();
        for (let pr of perms) {
            const update = {};
            const pName = patientMap[pr.patient_id];
            if (pName && !pr.patient_name) update.patient_name = pName;

            const dUser = userMap[pr.doctor_id];
            if (dUser && !pr.doctor_name) update.doctor_name = dUser.name;

            if (Object.keys(update).length > 0) {
                await AccessPermission.findByIdAndUpdate(pr._id, update);
            }
        }

        console.log('Backfill complete!');
        process.exit(0);
    } catch (err) {
        console.error('Backfill error:', err);
        process.exit(1);
    }
}

backfill();
