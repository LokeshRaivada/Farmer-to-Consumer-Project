const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const PriceTrend = require('../models/PriceTrend');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { updateRatings } = require('../utils/ratingHelper');

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

        // Monthly Revenue Aggregation for overall marketplace
        const revenue = await Order.aggregate([
            { $match: { status: 'delivered' } },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { '_id.month': 1 } }
        ]);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedRevenue = months.map((m, i) => {
            const match = revenue.find(r => r._id.month === (i + 1));
            return {
                name: m,
                amount: match ? match.revenue : 0
            };
        });

        res.json({
            totalUsers, totalFarmers, totalProducts, totalOrders, totalSales, recentUsers, ordersByStatus, revenue: formattedRevenue
        });
    } catch (error) {
        console.error('Admin analytics error:', error);
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
        const { isReported, reportReason } = req.query;
        const filter = {};
        if (isReported === 'true') filter.isReported = true;
        if (reportReason) filter.reportReason = reportReason;

        const reviews = await Review.find(filter)
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
        const farmerId = review.farmer;

        await Review.findByIdAndDelete(req.params.id);

        // Recalculate ratings
        await updateRatings(productId, farmerId);

        res.json({ message: 'Review deleted' });
    } catch (error) {
        console.error('Admin review delete error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/reviews/:id/dismiss-report', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.isReported = false;
        review.reportReason = undefined;
        await review.save();

        res.json({ message: 'Review report dismissed successfully.' });
    } catch (error) {
        console.error('Admin review dismiss error:', error);
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

// @route   GET /api/admin/moderation/verifications
// @desc    Get all verification requests (pending or under_review)
// @access  Private/Admin
router.get('/moderation/verifications', async (req, res) => {
    try {
        const farmers = await User.find({
            role: 'farmer',
            verificationStatus: { $in: ['pending', 'under_review', 'approved', 'rejected'] }
        }).sort({ updatedAt: -1 });
        res.json(farmers);
    } catch (error) {
        console.error('Fetch verifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/moderation/verifications/:id/status
// @desc    Update farmer verification status
// @access  Private/Admin
router.put('/moderation/verifications/:id/status', async (req, res) => {
    try {
        const { status, feedback, expiresAt } = req.body;
        const validStatuses = ['under_review', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid verification status.' });
        }

        const farmer = await User.findById(req.params.id);
        if (!farmer || farmer.role !== 'farmer') {
            return res.status(404).json({ message: 'Farmer not found.' });
        }

        farmer.verificationStatus = status;
        if (feedback !== undefined) {
            farmer.verificationFeedback = feedback;
        }

        if (status === 'approved') {
            farmer.isVerified = true;
            farmer.verifiedAt = new Date();
            if (expiresAt) {
                farmer.verificationExpiresAt = new Date(expiresAt);
            } else {
                // Default expiration 1 year from now
                const oneYear = new Date();
                oneYear.setFullYear(oneYear.getFullYear() + 1);
                farmer.verificationExpiresAt = oneYear;
            }
        } else if (status === 'rejected') {
            farmer.isVerified = false;
        }

        await farmer.save();

        // Create notification for farmer
        await Notification.create({
            recipient: farmer._id,
            type: 'verification',
            title: status === 'approved' ? 'Verification Approved! 🎉' : status === 'rejected' ? 'Verification Rejected ⚠️' : 'Profile Under Review 🔍',
            message: status === 'approved' 
                ? 'Congratulations! Your farmer verification profile has been approved. You can now post crop listings.' 
                : status === 'rejected' 
                    ? `Your verification request was rejected. Feedback: ${feedback || 'Please update your documents.'}`
                    : 'Your verification request is now under active review by the admin team.',
            link: '/farmer'
        });

        res.json({ message: `Verification status updated to ${status}`, farmer });
    } catch (error) {
        console.error('Update verification status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/moderation/reported-products
// @desc    Get all reported products
// @access  Private/Admin
router.get('/moderation/reported-products', async (req, res) => {
    try {
        const products = await Product.find({ isReported: true })
            .populate('farmer', 'name email')
            .sort({ updatedAt: -1 });
        res.json(products);
    } catch (error) {
        console.error('Fetch reported products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/moderation/products/:id/dismiss-report
// @desc    Dismiss a reported product listing
// @access  Private/Admin
router.put('/moderation/products/:id/dismiss-report', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        product.isReported = false;
        product.reportReason = undefined;
        await product.save();

        res.json({ message: 'Product report dismissed successfully.', product });
    } catch (error) {
        console.error('Dismiss product report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/moderation/reported-users
// @desc    Get all reported users
// @access  Private/Admin
router.get('/moderation/reported-users', async (req, res) => {
    try {
        const users = await User.find({ isReported: true }).sort({ updatedAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Fetch reported users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/moderation/users/:id/dismiss-report
// @desc    Dismiss report for a user
// @access  Private/Admin
router.put('/moderation/users/:id/dismiss-report', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.isReported = false;
        user.reportReason = undefined;
        await user.save();

        res.json({ message: 'User report dismissed successfully.', user });
    } catch (error) {
        console.error('Dismiss user report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/admin/moderation/users/:id/report
// @desc    Manually flag/report a user (useful for admin tracing)
// @access  Private/Admin
router.post('/moderation/users/:id/report', async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ message: 'Reason is required.' });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        user.isReported = true;
        user.reportReason = reason;
        await user.save();
        res.json({ message: 'User flagged successfully.', user });
    } catch (error) {
        console.error('Report user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

