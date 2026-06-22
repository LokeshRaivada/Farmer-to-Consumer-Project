const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');
const Wishlist = require('./models/Wishlist');
const Notification = require('./models/Notification');
const Message = require('./models/Message');
const PriceTrend = require('./models/PriceTrend');
require('dotenv').config();

const resetData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for database reset...');

        // Delete all products, orders, reviews, wishlists, notifications, messages, price trends
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Review.deleteMany({});
        await Wishlist.deleteMany({});
        await Notification.deleteMany({});
        await Message.deleteMany({});
        await PriceTrend.deleteMany({});
        console.log('Cleared all products, orders, reviews, wishlists, notifications, messages, and price trends.');

        // Delete all users except the allowed admins
        await User.deleteMany({ email: { $nin: ['jubburuprudhviraju@gmail.com', 'raivadalokesh@gmail.com'] } });
        console.log('Cleared all users except the allowed Admins.');

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
            if (!admin) {
                await User.create(adminData);
                console.log(`Created ${adminData.name} Admin.`);
            } else {
                admin.name = adminData.name;
                admin.password = adminData.password; // Pre-save hook will hash it
                admin.role = 'admin';
                admin.isEmailVerified = true;
                admin.isVerified = true;
                admin.phone = adminData.phone;
                await admin.save();
                console.log(`${adminData.name} Admin already exists and has been updated.`);
            }
        }

        console.log('Database reset completed successfully! Only admins remain.');
        process.exit(0);
    } catch (err) {
        console.error('Reset error:', err);
        process.exit(1);
    }
};

resetData();
