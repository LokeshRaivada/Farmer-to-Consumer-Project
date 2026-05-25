const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// Helper to update product ratings
const updateProductRatings = async (productId) => {
    const reviews = await Review.find({ product: productId });
    const numReviews = reviews.length;
    const averageRating = numReviews > 0 
        ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews 
        : 0;

    await Product.findByIdAndUpdate(productId, {
        averageRating: parseFloat(averageRating.toFixed(1)),
        numReviews
    });
};

// @route   GET /api/reviews/product/:productId
// @desc    Get all reviews for a product
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

        // Calculate breakdown
        const breakdown = { 5:0, 4:0, 3:0, 2:0, 1:0 };
        reviews.forEach(r => breakdown[Math.floor(r.rating)]++);

        res.json({ reviews, breakdown });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user already reviewed
        const existingReview = await Review.findOne({ user: req.user._id, product: productId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // Check if verified purchase
        const order = await Order.findOne({ 
            consumer: req.user._id, 
            'items.product': productId,
            status: 'delivered' 
        });

        const review = await Review.create({
            user: req.user._id,
            product: productId,
            farmer: product.farmer,
            rating: Number(rating),
            comment,
            verifiedPurchase: !!order
        });

        await updateProductRatings(productId);

        const populatedReview = await Review.findById(review._id).populate('user', 'name');
        res.status(201).json(populatedReview);
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        review.rating = Number(rating);
        review.comment = comment;
        await review.save();

        await updateProductRatings(review.product);

        const populatedReview = await Review.findById(review._id).populate('user', 'name');
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
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const productId = review.product;
        await Review.deleteOne({ _id: review._id });

        await updateProductRatings(productId);

        res.json({ message: 'Review removed' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/reviews/farmer/stats
// @desc    Get farmer review analytics
// @access  Private/Farmer
router.get('/farmer/stats', protect, async (req, res) => {
    if (req.user.role !== 'farmer') return res.status(403).json({ message: 'Not authorized' });
    
    try {
        const reviews = await Review.find({ farmer: req.user._id }).populate('product', 'name').populate('user', 'name').sort({ createdAt: -1 });
        const numReviews = reviews.length;
        const averageRating = numReviews > 0 ? reviews.reduce((a, b) => a + b.rating, 0) / numReviews : 0;
        
        res.json({
            averageRating: parseFloat(averageRating.toFixed(1)),
            numReviews,
            recentReviews: reviews.slice(0, 10)
        });
    } catch (error) {
        console.error('Farmer stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
