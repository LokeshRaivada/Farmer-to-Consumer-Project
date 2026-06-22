const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize, requireEmailVerified } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { uploadToCloudinary } = require('../utils/cloudinary');

const requireApprovedFarmer = (req, res, next) => {
    if (!req.user.isVerified) {
        return res.status(403).json({ message: 'Your farmer profile is pending administrator approval. You cannot list or update crops yet.' });
    }
    next();
};

// @route   POST /api/farmer/verify/upload
// @desc    Upload farmer verification documents to Cloudinary
// @access  Private/Farmer
router.post('/verify/upload', protect, authorize('farmer'), upload.fields([
    { name: 'governmentId', maxCount: 1 },
    { name: 'farmerCertificate', maxCount: 1 },
    { name: 'farmImages', maxCount: 5 }
]), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'Farmer not found.' });

        const governmentIdFiles = req.files['governmentId'];
        const farmerCertificateFiles = req.files['farmerCertificate'];
        const farmImagesFiles = req.files['farmImages'];

        if (!governmentIdFiles || governmentIdFiles.length === 0) {
            return res.status(400).json({ message: 'Government ID is required for verification.' });
        }

        console.log('Uploading government ID to Cloudinary...');
        const governmentIdUrl = await uploadToCloudinary(governmentIdFiles[0].buffer, 'farmer_verifications/govt_ids');

        let farmerCertificateUrl = '';
        if (farmerCertificateFiles && farmerCertificateFiles.length > 0) {
            console.log('Uploading farmer certificate to Cloudinary...');
            farmerCertificateUrl = await uploadToCloudinary(farmerCertificateFiles[0].buffer, 'farmer_verifications/certificates');
        }

        const farmImagesUrls = [];
        if (farmImagesFiles && farmImagesFiles.length > 0) {
            console.log(`Uploading ${farmImagesFiles.length} farm images to Cloudinary...`);
            for (const file of farmImagesFiles) {
                const url = await uploadToCloudinary(file.buffer, 'farmer_verifications/farm_photos');
                farmImagesUrls.push(url);
            }
        }

        // Update user state
        user.verificationDocs = {
            governmentId: governmentIdUrl,
            farmerCertificate: farmerCertificateUrl,
            farmImages: farmImagesUrls
        };
        user.verificationStatus = 'pending';
        user.verificationFeedback = ''; // Clear previous feedback
        await user.save();

        res.json({
            message: 'Verification documents uploaded successfully. Profile status set to pending review.',
            verificationStatus: user.verificationStatus,
            verificationDocs: user.verificationDocs
        });
    } catch (error) {
        console.error('Farmer verification upload error:', error);
        res.status(500).json({ message: 'Server error during upload: ' + error.message });
    }
});

// @route   POST /api/farmer/products
// @desc    Add product
// @access  Private/Farmer
router.post('/products', protect, authorize('farmer'), requireEmailVerified, requireApprovedFarmer, async (req, res) => {
    try {
        const product = await Product.create({
            ...req.body,
            farmer: req.user._id
        });
        res.status(201).json(product);
    } catch (error) {
        console.error('Add product error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// @route   GET /api/farmer/products
// @desc    Get farmer products
// @access  Private/Farmer
router.get('/products', protect, authorize('farmer'), async (req, res) => {
    try {
        const products = await Product.find({ farmer: req.user._id });
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/farmer/products/:id
// @desc    Update product
// @access  Private/Farmer
router.put('/products/:id', protect, authorize('farmer'), requireEmailVerified, requireApprovedFarmer, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product || product.farmer.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/farmer/products/:id
// @desc    Delete product
// @access  Private/Farmer
router.delete('/products/:id', protect, authorize('farmer'), requireEmailVerified, requireApprovedFarmer, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product || product.farmer.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product removed' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/farmer/orders
// @desc    View orders for farmer's products
// @access  Private/Farmer
router.get('/orders', protect, authorize('farmer'), async (req, res) => {
    try {
        // This query finds orders where AT LEAST ONE product belongs to the farmer
        const orders = await Order.find({
            'items.product': { $in: await Product.find({ farmer: req.user._id }).distinct('_id') }
        }).populate('consumer', 'name email address phone').populate('items.product');

        res.json(orders);
    } catch (error) {
        console.error('View orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/farmer/orders/:id
// @desc    Update order status
// @access  Private/Farmer
router.put('/orders/:id', protect, authorize('farmer'), requireEmailVerified, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'accepted', 'packed', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Check if the order belongs to this farmer (at least one product)
        const order = await Order.findById(req.params.id).populate('items.product');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const isFarmerOrder = order.items.some(item => 
            item.product && item.product.farmer.toString() === req.user._id.toString()
        );

        if (!isFarmerOrder) {
            return res.status(403).json({ message: 'Unauthorized access to this order' });
        }

        const previousStatus = order.status;
        order.status = status;
        
        let auditNote = `Order status updated to ${status}.`;
        if (status === 'accepted') {
            auditNote = 'Accepted by Farmer';
        } else if (status === 'packed') {
            auditNote = 'Ready for Dispatch';
        } else if (status === 'shipped') {
            auditNote = 'Dispatched to delivery location';
        } else if (status === 'delivered') {
            auditNote = 'Handed to Customer';
        } else if (status === 'cancelled') {
            auditNote = 'Order cancelled';
        }

        order.statusHistory.push({
            status,
            timestamp: new Date(),
            updatedBy: req.user._id,
            note: auditNote
        });

        if (status === 'delivered' && order.paymentMethod === 'COD') {
            order.paymentStatus = 'Completed';
        }

        await order.save();

        // Update farmer completed orders and total products sold
        if (status === 'delivered' && previousStatus !== 'delivered') {
            const itemsQuantity = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
            await User.findByIdAndUpdate(order.farmer, {
                $inc: { 
                    completedOrdersCount: 1,
                    totalProductsSold: itemsQuantity
                }
            });
        } else if (previousStatus === 'delivered' && status !== 'delivered') {
            const itemsQuantity = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
            await User.findByIdAndUpdate(order.farmer, {
                $inc: { 
                    completedOrdersCount: -1,
                    totalProductsSold: -itemsQuantity
                }
            });
        }

        // Create notification for consumer
        let title = 'Order Update 🚜';
        let message = `Your order status has been updated to ${status}.`;
        if (status === 'accepted') {
            title = 'Order Accepted 🚜';
            message = `Farmer ${req.user.name} has accepted your order. Fulfilling shortly.`;
        } else if (status === 'packed') {
            title = 'Order Packed 📦';
            message = `Farmer ${req.user.name} has packed your items. Preparing for dispatch.`;
        } else if (status === 'shipped') {
            title = 'Order Shipped 🚚';
            message = `Your order has been shipped by Farmer ${req.user.name}.`;
        } else if (status === 'delivered') {
            title = 'Order Delivered 🎉';
            message = `Your order of fresh produce has been successfully delivered by Farmer ${req.user.name}.`;
        } else if (status === 'cancelled') {
            title = 'Order Cancelled ❌';
            message = `Your order has been cancelled by Farmer ${req.user.name}.`;
        }

        const notificationHelper = require('../utils/notificationHelper');
        await notificationHelper.createNotification(req.app, {
            recipient: order.consumer,
            sender: req.user._id,
            type: ['accepted', 'packed'].includes(status) ? 'order' : 'delivery',
            title,
            message,
            link: '/orders'
        });

        res.json(order);
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/farmer/analytics
// @desc    Get consolidated farmer analytics
// @access  Private/Farmer
router.get('/analytics', protect, authorize('farmer'), async (req, res) => {
    try {
        // 1. Monthly Revenue Aggregation
        const revenue = await Order.aggregate([
            { $match: { farmer: req.user._id, status: 'delivered' } },
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
                revenue: match ? match.revenue : 0
            };
        });

        // 2. Category Distribution
        const categoryDistribution = await Product.aggregate([
            { $match: { farmer: req.user._id } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        // 3. Stock Analytics
        const stockRes = await Product.aggregate([
            { $match: { farmer: req.user._id } },
            {
                $group: {
                    _id: null,
                    totalStock: { $sum: '$quantity' }
                }
            }
        ]);
        const stock = stockRes.length > 0 ? stockRes[0].totalStock : 0;

        // 4. Order Stats
        const totalOrders = await Order.countDocuments({ farmer: req.user._id });
        const deliveredOrders = await Order.countDocuments({ farmer: req.user._id, status: 'delivered' });
        const pendingOrders = await Order.countDocuments({ farmer: req.user._id, status: { $in: ['pending', 'accepted', 'packed', 'shipped'] } });
        const cancelledOrders = await Order.countDocuments({ farmer: req.user._id, status: 'cancelled' });

        const orderStats = {
            total: totalOrders,
            delivered: deliveredOrders,
            pending: pendingOrders,
            cancelled: cancelledOrders
        };

        // 5. Review Ratings
        const Review = require('../models/Review');
        const reviews = await Review.find({ farmer: req.user._id });
        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0
            ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
            : 0;

        res.json({
            revenue: formattedRevenue,
            categoryDistribution,
            stock,
            orderStats,
            rating: {
                averageRating: avgRating,
                numReviews: totalReviews
            }
        });
    } catch (error) {
        console.error('Farmer analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
