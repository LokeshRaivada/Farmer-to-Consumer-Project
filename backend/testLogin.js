const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const admins = [
            { email: 'jubburuprudhviraju@gmail.com', pass: 'Prudhvi@2005' },
            { email: 'raivadalokesh@gmail.com', pass: 'Lokesh@2006' }
        ];

        for (const admin of admins) {
            const user = await User.findOne({ email: admin.email }).select('+password');
            if (!user) {
                console.log(`Admin ${admin.email} not found!`);
                continue;
            }
            console.log(`\nUser found: ${user.email}`);
            console.log(`Hashed password: ${user.password}`);
            const isMatch = await user.comparePassword(admin.pass);
            console.log(`Match password ${admin.pass}: ${isMatch}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
