const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');

// Helper Function: Distance Calculation
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// @route   GET /api/farmers/:id
// @desc    Get public farmer profile (privacy safe)
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const farmer = await User.findOne({ _id: req.params.id, role: 'farmer' })
            .select('name phone address.city address.state address.zip isVerified averageRating numReviews completedOrdersCount createdAt');
        
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        const activeCropsCount = await Product.countDocuments({ farmer: farmer._id, isAvailable: true });

        // Calculate "Top Seller" status based on completed orders and average rating
        const isTopSeller = (farmer.completedOrdersCount >= 50 && farmer.averageRating >= 4.5);

        res.json({
            farmer,
            activeCropsCount,
            isTopSeller
        });
    } catch (error) {
        console.error('Error fetching farmer profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/farmers/:id/summary
// @desc    Get lightweight farmer summary details
// @access  Public
router.get('/:id/summary', async (req, res) => {
    try {
        const farmer = await User.findOne({ _id: req.params.id, role: 'farmer' })
            .select('averageRating completedOrdersCount isVerified');
        
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        const activeCropsCount = await Product.countDocuments({ farmer: farmer._id, isAvailable: true });
        const isTopSeller = (farmer.completedOrdersCount >= 50 && farmer.averageRating >= 4.5);

        res.json({
            rating: farmer.averageRating,
            completedOrders: farmer.completedOrdersCount || 0,
            activeCrops: activeCropsCount,
            verified: farmer.isVerified || false,
            isTopSeller
        });
    } catch (error) {
        console.error('Error fetching farmer summary:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/farmers/:id/products
// @desc    Get active farmer products
// @access  Public
router.get('/:id/products', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        
        // Find products with details, populating farmer coordinates internally for distance calculation
        let products = await Product.find({ farmer: req.params.id, isAvailable: true })
            .populate('farmer', 'location')
            .sort({ createdAt: -1 });

        // Map product to calculate distance and remove raw location coordinates from public response
        const mappedProducts = products.map(p => {
            const productObj = p.toObject();
            if (lat && lon && p.farmer && p.farmer.location && p.farmer.location.coordinates) {
                const farmerLoc = p.farmer.location.coordinates;
                const d = getDistanceFromLatLonInKm(parseFloat(lat), parseFloat(lon), farmerLoc[1], farmerLoc[0]);
                productObj.distance = parseFloat(d.toFixed(1));
            }
            // Clean up coordinates for user privacy
            if (productObj.farmer) {
                delete productObj.farmer.location;
            }
            return productObj;
        });

        res.json(mappedProducts);
    } catch (error) {
        console.error('Error fetching farmer products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/farmers/:id/reviews
// @desc    Get reviews for farmer products
// @access  Public
router.get('/:id/reviews', async (req, res) => {
    try {
        // Find reviews where farmer is req.params.id and they are not reported
        const reviews = await Review.find({ farmer: req.params.id, isReported: { $ne: true } })
            .populate('user', 'name')
            .populate('product', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching farmer reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
