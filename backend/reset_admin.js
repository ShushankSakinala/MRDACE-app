const bcrypt = require('bcryptjs');
const connectMongoDB = require('./utils/mongodb');
const { User: UserModel } = require('./models/mongoModels');

async function resetAdmin() {
    await connectMongoDB();
    const newPassword = 'admin123';

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    try {
        const admin = await UserModel.findOne({ username: 'admin' });

        if (admin) {
            admin.hashed_password = hashedPassword;
            await admin.save();
            console.log(`Password for user 'admin' updated successfully to '${newPassword}'`);
        } else {
            console.log("User 'admin' not found. Creating admin user...");
            await UserModel.create({
                username: 'admin',
                hashed_password: hashedPassword,
                full_name: 'System Administrator',
                role: 'admin',
                is_active: 1
            });
            console.log(`Admin user created with password '${newPassword}'`);
        }
    } catch (err) {
        console.error('Error during admin reset:', err);
    } finally {
        // Give some time for Mongoose to finish and then exit
        setTimeout(() => process.exit(0), 1000);
    }
}

resetAdmin();
