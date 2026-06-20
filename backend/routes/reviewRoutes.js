const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, requireEmailVerified } = require('../middleware/auth');
const { updateRatings } = require('../utils/ratingHelper');
const mongoose = require('mongoose');

// @route   GET /api/reviews/page-data
// @desc    Get aggregated reviews page data
// @access  Public
router.get('/page-data', async (req, res) => {
    try {
        // 1. Latest Reviews
        const latestReviews = await Review.find()
            .sort({ createdAt: -1 })
            .limit(6)
            .populate('user', 'name')
            .populate('product', 'name')
            .populate('farmer', 'name');

        // 2. Highest Rated Products
        const highestRatedProducts = await Product.find({ averageRating: { $gt: 0 } })
            .sort({ averageRating: -1, numReviews: -1 })
            .limit(5)
            .populate('farmer', 'name');

        // 3. Top Rated Farmers
        const topFarmers = await User.find({ role: 'farmer', averageRating: { $gt: 0 } })
            .sort({ averageRating: -1, numReviews: -1 })
            .limit(5)
            .select('name address location isVerified averageRating numReviews completedOrdersCount totalProductsSold');

        res.json({
            latestReviews,
            highestRatedProducts,
            topFarmers
        });
    } catch (error) {
        console.error('Get reviews page data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/reviews/recent
// @desc    Get the most recent reviews across all products
// @access  Public
router.get('/recent', async (req, res) => {
    try {
        const { search, rating } = req.query;
        let query = {};

        if (rating) {
            query.rating = parseInt(rating);
        }

        if (search) {
            const User = require('../models/User');
            const Product = require('../models/Product');
            
            const matchedUsers = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id');
            const matchedProducts = await Product.find({ name: { $regex: search, $options: 'i' } }).select('_id');
            
            const userIds = matchedUsers.map(u => u._id);
            const productIds = matchedProducts.map(p => p._id);
            
            query.$or = [
                { comment: { $regex: search, $options: 'i' } },
                { user: { $in: userIds } },
                { product: { $in: productIds } },
                { farmer: { $in: userIds } }
            ];
        }

        const reviews = await Review.find(query)
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('user', 'name')
            .populate('product', 'name')
            .populate('farmer', 'name');
        res.json(reviews);
    } catch (error) {
        console.error('Get recent reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/reviews/top-products
// @desc    Get top rated products
// @access  Public
router.get('/top-products', async (req, res) => {
    try {
        const products = await Product.find({ averageRating: { $gt: 0 } })
            .sort({ averageRating: -1, numReviews: -1 })
            .limit(10)
            .populate('farmer', 'name address location isVerified');
        res.json(products);
    } catch (error) {
        console.error('Get top products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/reviews/top-farmers
// @desc    Get top rated farmers
// @access  Public
router.get('/top-farmers', async (req, res) => {
    try {
        const farmers = await User.find({ role: 'farmer', averageRating: { $gt: 0 } })
            .sort({ averageRating: -1, numReviews: -1 })
            .limit(10)
            .select('name address location isVerified averageRating numReviews completedOrdersCount totalProductsSold');
        res.json(farmers);
    } catch (error) {
        console.error('Get top farmers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/reviews/my-reviews
// @desc    Get all reviews submitted by the logged-in user
// @access  Private
router.get('/my-reviews', protect, async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id })
            .populate('product', 'name')
            .populate('farmer', 'name');
        res.json(reviews);
    } catch (error) {
        console.error('Get my reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/reviews/eligible-order/:productId
// @desc    Checks if the user has an unreviewed delivered order <= 90 days old for a product
// @access  Private
router.get('/eligible-order/:productId', protect, async (req, res) => {
    try {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        // Find delivered orders placed in the last 90 days containing the product
        const orders = await Order.find({
            consumer: req.user._id,
            status: 'delivered',
            createdAt: { $gte: ninetyDaysAgo },
            'items.product': req.params.productId
        }).sort({ createdAt: -1 });

        if (orders.length === 0) {
            return res.json({ eligible: false });
        }

        // Check which of these orders does not have a review yet for this product
        for (const order of orders) {
            const reviewExists = await Review.findOne({
                user: req.user._id,
                order: order._id,
                product: req.params.productId
            });

            if (!reviewExists) {
                return res.json({ eligible: true, orderId: order._id });
            }
        }

        res.json({ eligible: false });
    } catch (error) {
        console.error('Check review eligibility error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/reviews/product/:productId
// @desc    Get all reviews for a product with ratings breakdown
// @access  Public
router.get('/product/:productId', async (req, res) => {
    try {
        const { sortBy = 'newest' } = req.query;
        let sortQuery = { createdAt: -1 };
        
        if (sortBy === 'highest') sortQuery = { rating: -1, createdAt: -1 };
        if (sortBy === 'lowest') sortQuery = { rating: 1, createdAt: -1 };

        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name')
            .sort(sortQuery);

        // Calculate ratings distribution breakdown
        const totalReviews = reviews.length;
        const breakdownCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        
        reviews.forEach(r => {
            const star = Math.floor(r.rating);
            if (breakdownCounts[star] !== undefined) {
                breakdownCounts[star]++;
            }
        });

        const breakdownPercentages = {};
        for (let star = 1; star <= 5; star++) {
            breakdownPercentages[star] = totalReviews > 0 
                ? Math.round((breakdownCounts[star] / totalReviews) * 100)
                : 0;
        }

        res.json({ 
            reviews, 
            breakdown: breakdownCounts,
            percentages: breakdownPercentages,
            totalReviews 
        });
    } catch (error) {
        console.error('Get product reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/reviews/farmer/:farmerId
// @desc    Get recent reviews for all crops belonging to a farmer
// @access  Public
router.get('/farmer/:farmerId', async (req, res) => {
    try {
        const reviews = await Review.find({ farmer: req.params.farmerId })
            .populate('user', 'name')
            .populate('product', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error('Get farmer reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/reviews
// @desc    Create a new review for a product under a delivered order
// @access  Private
router.post('/', protect, requireEmailVerified, async (req, res) => {
    try {
        const { productId, orderId, rating, comment, images = [] } = req.body;

        // Validation
        if (!productId || !orderId || !rating || !comment) {
            return res.status(400).json({ message: 'Product ID, Order ID, Rating, and Comment are required.' });
        }

        if (req.user.role === 'admin') {
            return res.status(400).json({ message: 'Administrators cannot submit reviews.' });
        }

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Rejects farmers writing reviews on their own crops
        if (product.farmer.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Farmers cannot review their own products.' });
        }

        // Verify order status, ownership, and age
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        if (order.consumer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not own this order.' });
        }

        if (order.status !== 'delivered') {
            return res.status(400).json({ message: 'You can only review items from delivered orders.' });
        }

        // Validate 90 day age limit
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        if (order.createdAt < ninetyDaysAgo) {
            return res.status(400).json({ message: 'This purchase is older than 90 days and can no longer be reviewed.' });
        }

        // Check if the product exists in the order items list
        const productInOrder = order.items.some(item => item.product.toString() === productId);
        if (!productInOrder) {
            return res.status(400).json({ message: 'This product was not purchased in the specified order.' });
        }

        // Check for duplicate reviews
        const duplicateReview = await Review.findOne({
            user: req.user._id,
            order: orderId,
            product: productId
        });

        if (duplicateReview) {
            return res.status(400).json({ message: 'You have already reviewed this product for this order.' });
        }

        // Create review
        const review = await Review.create({
            user: req.user._id,
            product: productId,
            farmer: product.farmer,
            order: orderId,
            rating: Number(rating),
            comment,
            images
        });

        // Recalculate and update ratings (product & farmer stats)
        await updateRatings(productId, product.farmer);

        const populatedReview = await Review.findById(review._id)
            .populate('user', 'name')
            .populate('product', 'name');

        res.status(201).json(populatedReview);
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// @route   PUT /api/reviews/:id
// @desc    Update an existing review
// @access  Private
router.put('/:id', protect, requireEmailVerified, async (req, res) => {
    try {
        const { rating, comment, images } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        // Restrict to the owner
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to edit this review.' });
        }

        // Verify order age is still within 90 days
        const order = await Order.findById(review.order);
        if (order) {
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            if (order.createdAt < ninetyDaysAgo) {
                return res.status(400).json({ message: 'The order date is older than 90 days. Reviews cannot be updated.' });
            }
        }

        if (rating !== undefined) review.rating = Number(rating);
        if (comment !== undefined) review.comment = comment;
        if (images !== undefined) review.images = images;

        await review.save();

        // Recalculate ratings
        await updateRatings(review.product, review.farmer);

        const populatedReview = await Review.findById(review._id)
            .populate('user', 'name')
            .populate('product', 'name');

        res.json(populatedReview);
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        // Restrict to owner or admin
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to delete this review.' });
        }

        const productId = review.product;
        const farmerId = review.farmer;

        await Review.deleteOne({ _id: review._id });

        // Recalculate ratings
        await updateRatings(productId, farmerId);

        res.json({ message: 'Review successfully removed.' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/reviews/:id/report
// @desc    Report an inappropriate review
// @access  Private
router.put('/:id/report', protect, async (req, res) => {
    try {
        const { reportReason } = req.body;
        const validReasons = ['Spam', 'Abuse', 'Fake Review', 'Offensive Content'];

        if (!reportReason || !validReasons.includes(reportReason)) {
            return res.status(400).json({ message: 'A valid report reason is required (Spam, Abuse, Fake Review, or Offensive Content).' });
        }

        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        review.isReported = true;
        review.reportReason = reportReason;
        await review.save();

        res.json({ message: 'Review has been reported and flagged for moderator review.' });
    } catch (error) {
        console.error('Report review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
