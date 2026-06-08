const db = require('./utils/firebase');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function test() {
    try {
        console.log("Fetching user 'admin' using User.findByUsername...");
        const user = await User.findByUsername('admin');
        console.log("User doc:", Boolean(user));
        if (user) {
            console.log("Username:", user.username);
            console.log("Hashed password length:", user.hashed_password?.length);
            
            console.log("Testing bcrypt...");
            const isMatch = await bcrypt.compare('admin123', user.hashed_password);
            console.log("Password match 'admin123':", isMatch);
        } else {
            console.log("All users in DB:");
            const snapshot = await db.collection('users').get();
            snapshot.forEach(doc => {
                console.log(doc.id, "=>", doc.data().username);
            });
        }
    } catch (e) {
        console.error(e);
    }
}
test();
