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

const audit = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for audit...');

        const report = {
            users: { count: 0, duplicates: 0 },
            products: { count: 0, orphanedFarmers: 0 },
            orders: { count: 0, orphanedConsumers: 0, orphanedFarmers: 0, orphanedProducts: 0 },
            reviews: { count: 0, orphanedUsers: 0, orphanedProducts: 0, orphanedFarmers: 0 },
            wishlists: { count: 0, orphanedConsumers: 0, orphanedProducts: 0 },
            notifications: { count: 0, orphanedRecipients: 0 },
            messages: { count: 0, orphanedSenders: 0, orphanedReceivers: 0 }
        };

        // 1. Audit Users
        const users = await User.find();
        report.users.count = users.length;
        const emails = users.map(u => u.email);
        const uniqueEmails = new Set(emails);
        report.users.duplicates = emails.length - uniqueEmails.size;

        // Map for fast existence checks
        const userIds = new Set(users.map(u => u._id.toString()));

        // 2. Audit Products
        const products = await Product.find();
        report.products.count = products.length;
        const productIds = new Set(products.map(p => p._id.toString()));
        for (const p of products) {
            if (!p.farmer || !userIds.has(p.farmer.toString())) {
                report.products.orphanedFarmers++;
                console.log(`Orphaned Product found: ${p._id} refers to non-existent farmer ${p.farmer}`);
            }
        }

        // 3. Audit Orders
        const orders = await Order.find();
        report.orders.count = orders.length;
        for (const o of orders) {
            if (!o.consumer || !userIds.has(o.consumer.toString())) report.orders.orphanedConsumers++;
            if (!o.farmer || !userIds.has(o.farmer.toString())) report.orders.orphanedFarmers++;
            for (const item of o.items) {
                if (!item.product || !productIds.has(item.product.toString())) {
                    report.orders.orphanedProducts++;
                    console.log(`Order ${o._id} contains non-existent product ${item.product}`);
                }
            }
        }

        // 4. Audit Reviews
        const reviews = await Review.find();
        report.reviews.count = reviews.length;
        for (const r of reviews) {
            if (!r.user || !userIds.has(r.user.toString())) report.reviews.orphanedUsers++;
            if (!r.product || !productIds.has(r.product.toString())) report.reviews.orphanedProducts++;
            if (!r.farmer || !userIds.has(r.farmer.toString())) report.reviews.orphanedFarmers++;
        }

        // 5. Audit Wishlists
        const wishlists = await Wishlist.find();
        report.wishlists.count = wishlists.length;
        for (const w of wishlists) {
            if (!w.consumer || !userIds.has(w.consumer.toString())) report.wishlists.orphanedConsumers++;
            for (const pId of w.products) {
                if (!pId || !productIds.has(pId.toString())) report.wishlists.orphanedProducts++;
            }
        }

        // 6. Audit Notifications
        const notifications = await Notification.find();
        report.notifications.count = notifications.length;
        for (const n of notifications) {
            if (!n.recipient || !userIds.has(n.recipient.toString())) report.notifications.orphanedRecipients++;
        }

        // 7. Audit Messages
        const messages = await Message.find();
        report.messages.count = messages.length;
        for (const m of messages) {
            if (!m.sender || !userIds.has(m.sender.toString())) report.messages.orphanedSenders++;
            if (!m.receiver || !userIds.has(m.receiver.toString())) report.messages.orphanedReceivers++;
        }

        console.log('\n--- Database Integrity Report ---');
        console.log(JSON.stringify(report, null, 2));
        process.exit();
    } catch (err) {
        console.error('Audit failed:', err);
        process.exit(1);
    }
};

audit();
