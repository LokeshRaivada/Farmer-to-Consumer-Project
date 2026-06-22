const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        // Delete all admins EXCEPT the ones we want to keep
        const deleteResult = await User.deleteMany({
            role: 'admin',
            email: { $nin: ['jubburuprudhviraju@gmail.com', 'raivadalokesh@gmail.com'] }
        });
        console.log(`Deleted ${deleteResult.deletedCount} admin users.`);

        const admins = [
            {
                name: 'Prudhvi',
                email: 'jubburuprudhviraju@gmail.com',
                password: 'Prudhvi@2005',
                role: 'admin',
                phone: '9999999999',
                isEmailVerified: true,
                isVerified: true
            },
            {
                name: 'Lokesh',
                email: 'raivadalokesh@gmail.com',
                password: 'Lokesh@2006',
                role: 'admin',
                phone: '8888888888',
                isEmailVerified: true,
                isVerified: true
            }
        ];

        for (const adminData of admins) {
            let admin = await User.findOne({ email: adminData.email });
            if (admin) {
                console.log(`Admin ${adminData.email} already exists. Updating credentials...`);
                admin.name = adminData.name;
                admin.password = adminData.password; // Pre-save hook will hash it
                admin.role = 'admin';
                admin.isEmailVerified = true;
                admin.isVerified = true;
                admin.phone = adminData.phone;
                await admin.save();
                console.log(`Admin ${adminData.email} updated successfully.`);
            } else {
                console.log(`Admin ${adminData.email} does not exist. Creating...`);
                await User.create(adminData);
                console.log(`Admin ${adminData.email} created successfully.`);
            }
        }

        console.log('Admin accounts configuration complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error configuring admins:', err);
        process.exit(1);
    }
}

run();
