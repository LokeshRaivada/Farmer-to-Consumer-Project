const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const PriceTrend = require('../models/PriceTrend');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalFarmers = await User.countDocuments({ role: 'farmer' });
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalSalesRes = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalSales = totalSalesRes.length > 0 ? totalSalesRes[0].total : 0;

        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
        const ordersByStatus = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

        res.json({
            totalUsers, totalFarmers, totalProducts, totalOrders, totalSales, recentUsers, ordersByStatus
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/users/:id/block', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Cannot block admin' });
        
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/users/:id/verify', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'farmer') return res.status(400).json({ message: 'Invalid farmer profile' });
        
        user.isVerified = !user.isVerified;
        await user.save();

        if (user.isVerified) {
            await Notification.create({
                recipient: user._id,
                type: 'farmer_verified',
                title: 'Farmer Verified 🛡️',
                message: 'Your farmer account has been verified successfully. You can now list and sell products!',
                link: '/farmer'
            });
        }

        res.json({ message: `Farmer ${user.isVerified ? 'verified' : 'unverified'}`, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin' });

        await Product.deleteMany({ farmer: req.params.id });
        await Review.deleteMany({ user: req.params.id });
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().populate('farmer', 'name email').sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/reviews', async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'name')
            .populate('product', 'name')
            .populate('farmer', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/reviews/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        const productId = review.product;
        await Review.findByIdAndDelete(req.params.id);

        // Update product ratings
        const reviews = await Review.find({ product: productId });
        const numReviews = reviews.length;
        const averageRating = numReviews > 0 
            ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews 
            : 0;

        await Product.findByIdAndUpdate(productId, {
            averageRating: parseFloat(averageRating.toFixed(1)),
            numReviews
        });

        res.json({ message: 'Review deleted' });
    } catch (error) {
        console.error('Admin review delete error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('consumer', 'name email')
            .populate('farmer', 'name')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
