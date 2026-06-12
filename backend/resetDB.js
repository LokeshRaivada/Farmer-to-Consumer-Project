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

        // Delete all non-admin users
        await User.deleteMany({ role: { $ne: 'admin' } });
        console.log('Cleared all non-admin users.');

        // Ensure System Admin exists
        let systemAdmin = await User.findOne({ email: 'admin@farmer.com' });
        if (!systemAdmin) {
            systemAdmin = await User.create({
                name: 'System Admin',
                email: 'admin@farmer.com',
                password: 'password123',
                role: 'admin',
                phone: '1234567890'
            });
            console.log('Created System Admin.');
        } else {
            console.log('System Admin already exists.');
        }

        // Ensure Prudhvi Admin exists
        let prudhviAdmin = await User.findOne({ email: 'jubburuprudhviraju@gmail.com' });
        if (!prudhviAdmin) {
            await User.create({
                name: 'Prudhvi',
                email: 'jubburuprudhviraju@gmail.com',
                password: 'Prudhvi@2005',
                role: 'admin',
                phone: '9999999999'
            });
            console.log('Created Prudhvi Admin.');
        } else {
            console.log('Prudhvi Admin already exists.');
        }

        console.log('Database reset completed successfully! Only admins remain.');
        process.exit(0);
    } catch (err) {
        console.error('Reset error:', err);
        process.exit(1);
    }
};

resetData();
