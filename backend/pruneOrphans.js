const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');
const Wishlist = require('./models/Wishlist');
const Notification = require('./models/Notification');
const Message = require('./models/Message');
require('dotenv').config();

const prune = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for pruning orphans...');

        const users = await User.find().select('_id');
        const userIds = new Set(users.map(u => u._id.toString()));

        const products = await Product.find().select('_id');
        const productIds = new Set(products.map(p => p._id.toString()));

        // 1. Prune products referring to deleted farmers
        const productsBefore = await Product.countDocuments();
        const allProducts = await Product.find();
        for (const p of allProducts) {
            if (!p.farmer || !userIds.has(p.farmer.toString())) {
                await Product.deleteOne({ _id: p._id });
            }
        }
        const productsAfter = await Product.countDocuments();
        console.log(`Pruned ${productsBefore - productsAfter} orphaned products.`);

        // 2. Prune orders referring to deleted consumers/farmers
        const ordersBefore = await Order.countDocuments();
        const allOrders = await Order.find();
        for (const o of allOrders) {
            if (!o.consumer || !userIds.has(o.consumer.toString()) || !o.farmer || !userIds.has(o.farmer.toString())) {
                await Order.deleteOne({ _id: o._id });
            }
        }
        const ordersAfter = await Order.countDocuments();
        console.log(`Pruned ${ordersBefore - ordersAfter} orphaned orders.`);

        // 3. Prune reviews referring to deleted users/products/farmers
        const reviewsBefore = await Review.countDocuments();
        const allReviews = await Review.find();
        for (const r of allReviews) {
            if (!r.user || !userIds.has(r.user.toString()) || !r.product || !productIds.has(r.product.toString()) || !r.farmer || !userIds.has(r.farmer.toString())) {
                await Review.deleteOne({ _id: r._id });
            }
        }
        const reviewsAfter = await Review.countDocuments();
        console.log(`Pruned ${reviewsBefore - reviewsAfter} orphaned reviews.`);

        // 4. Prune wishlists referring to deleted consumers
        const wishlistsBefore = await Wishlist.countDocuments();
        const allWishlists = await Wishlist.find();
        for (const w of allWishlists) {
            if (!w.consumer || !userIds.has(w.consumer.toString())) {
                await Wishlist.deleteOne({ _id: w._id });
            } else {
                // Filter out deleted products from wishlist
                const validProducts = w.products.filter(pId => pId && productIds.has(pId.toString()));
                if (validProducts.length !== w.products.length) {
                    w.products = validProducts;
                    await w.save();
                }
            }
        }
        const wishlistsAfter = await Wishlist.countDocuments();
        console.log(`Pruned ${wishlistsBefore - wishlistsAfter} orphaned wishlists.`);

        // 5. Prune notifications referring to deleted recipients
        const notificationsBefore = await Notification.countDocuments();
        const allNotifications = await Notification.find();
        for (const n of allNotifications) {
            if (!n.recipient || !userIds.has(n.recipient.toString())) {
                await Notification.deleteOne({ _id: n._id });
            }
        }
        const notificationsAfter = await Notification.countDocuments();
        console.log(`Pruned ${notificationsBefore - notificationsAfter} orphaned notifications.`);

        // 6. Prune messages referring to deleted senders/receivers
        const messagesBefore = await Message.countDocuments();
        const allMessages = await Message.find();
        for (const m of allMessages) {
            if (!m.sender || !userIds.has(m.sender.toString()) || !m.receiver || !userIds.has(m.receiver.toString())) {
                await Message.deleteOne({ _id: m._id });
            }
        }
        const messagesAfter = await Message.countDocuments();
        console.log(`Pruned ${messagesBefore - messagesAfter} orphaned messages.`);

        console.log('Database pruning completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Pruning failed:', err);
        process.exit(1);
    }
};

prune();
