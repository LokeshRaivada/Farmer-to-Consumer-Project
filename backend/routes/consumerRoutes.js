const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize, requireEmailVerified } = require('../middleware/auth');

// @route   GET /api/consumer/home
// @desc    Get aggregated homepage data in a single request
// @access  Public
router.get('/home', async (req, res) => {
    try {
        // 1. Stats
        const totalFarmers = await User.countDocuments({ role: 'farmer' });
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const stats = { totalFarmers, totalProducts, totalOrders };

        // 2. Featured Products (top 8)
        const featuredProducts = await Product.find({ isAvailable: true })
            .populate('farmer', 'name location address averageRating isVerified')
            .sort({ averageRating: -1, createdAt: -1 })
            .limit(8);
        const filteredFeatured = featuredProducts.filter(p => p.farmer != null);

        // 3. Categories (derived from Product aggregation)
        const categoryAggregation = await Product.aggregate([
            { $match: { isAvailable: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        const categories = categoryAggregation.map(c => ({
            name: c._id,
            count: c.count
        }));

        // 4. Verified Farmers (top 3)
        const farmers = await User.find({ role: 'farmer' })
            .select('name address location createdAt isVerified')
            .limit(10); // get top 10 to filter dynamically or calculate rating
        
        const Review = require('../models/Review');
        const farmersWithStats = await Promise.all(farmers.map(async (f) => {
            const reviews = await Review.find({ farmer: f._id });
            const ratingCount = reviews.length;
            const avgRating = ratingCount > 0 
                ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount).toFixed(1))
                : 0;

            const productsCount = await Product.countDocuments({ farmer: f._id, isAvailable: true });
            return {
                _id: f._id,
                name: f.name,
                address: f.address,
                location: f.location,
                isVerified: f.isVerified,
                createdAt: f.createdAt,
                rating: avgRating,
                productsCount
            };
        }));
        // Sort by verified and rating, slice top 3
        const topFarmers = farmersWithStats
            .sort((a, b) => (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0) || b.rating - a.rating)
            .slice(0, 3);

        // 5. Recent Reviews (limit 6)
        const recentReviews = await Review.find()
            .sort({ createdAt: -1 })
            .limit(6)
            .populate('user', 'name')
            .populate('product', 'name');

        // 6. Price Trends & Fallback
        const PriceTrend = require('../models/PriceTrend');
        let trends = await PriceTrend.find().sort({ date: 1 });
        
        if (trends.length === 0) {
            // Fallback: Group products by category and use current average price as trend data
            const productPrices = await Product.aggregate([
                { $match: { isAvailable: true } },
                { $group: { _id: '$category', avgPrice: { $avg: '$price' } } }
            ]);
            // Create dummy trend points using today's avg price as fallback
            trends = productPrices.map(p => ({
                category: p._id,
                avgPrice: parseFloat(p.avgPrice.toFixed(1)),
                date: new Date()
            }));
        }

        res.json({
            stats,
            featuredProducts: filteredFeatured,
            categories,
            farmers: topFarmers,
            reviews: recentReviews,
            trends
        });
    } catch (error) {
        console.error('Home API error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/consumer/products
// @desc    Get all products with location data
// @access  Public
router.get('/products', async (req, res) => {
    try {
        const { category, search, lat, lon, distance, city, pincode, state, farmerId } = req.query;
        let query = { isAvailable: true };
        if (category && category !== '') query.category = category;
        if (search && search !== '') query.name = { $regex: search, $options: 'i' };
        if (farmerId && farmerId !== '') query.farmer = farmerId;

        let products = await Product.find(query).populate('farmer', 'name location address averageRating');
        products = products.filter(p => p.farmer != null);

        // Filter by City/Pincode/State from populated farmer
        if (city) products = products.filter(p => p.farmer.address?.city?.toLowerCase() === city.toLowerCase());
        if (pincode) products = products.filter(p => p.farmer.address?.zip === pincode);
        if (state) products = products.filter(p => p.farmer.address?.state?.toLowerCase() === state.toLowerCase());

        // Distance filter
        if (lat && lon && distance) {
            const userLoc = [parseFloat(lon), parseFloat(lat)];
            products = products.filter(p => {
                const farmerLoc = p.farmer.location?.coordinates;
                if (!farmerLoc) return false;
                const d = getDistanceFromLatLonInKm(userLoc[1], userLoc[0], farmerLoc[1], farmerLoc[0]);
                p._doc.distance = parseFloat(d.toFixed(1)); // inject distance
                return d <= parseFloat(distance);
            });
            // Sort by distance if location provided
            products.sort((a, b) => a._doc.distance - b._doc.distance);
        }

        res.json(products);
    } catch (error) {
        console.error('Browse products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/consumer/farmers
// @desc    Get nearby farmers
// @access  Public
router.get('/farmers', async (req, res) => {
    try {
        const { lat, lon, distance, city, pincode } = req.query;
        let query = { role: 'farmer' };

        if (city) query['address.city'] = { $regex: new RegExp(`^${city}$`, 'i') };
        if (pincode) query['address.zip'] = pincode;

        let farmers = await User.find(query).select('name address location createdAt isVerified phone averageRating numReviews completedOrdersCount totalProductsSold');

        let farmersWithReviews = await Promise.all(farmers.map(async (f) => {
            const Review = require('../models/Review');
            const reviews = await Review.find({ farmer: f._id });
            const ratingCount = reviews.length;
            const avgRating = ratingCount > 0 
                ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount).toFixed(1))
                : 0;

            const productsCount = await Product.countDocuments({ farmer: f._id, isAvailable: true });
            
            f._doc.rating = avgRating;
            f._doc.reviewsCount = ratingCount;
            f._doc.productsCount = productsCount;
            return f;
        }));

        if (lat && lon && distance) {
            const userLoc = [parseFloat(lon), parseFloat(lat)];
            farmersWithReviews = farmersWithReviews.filter(f => {
                if (!f.location?.coordinates) return false;
                const d = getDistanceFromLatLonInKm(userLoc[1], userLoc[0], f.location.coordinates[1], f.location.coordinates[0]);
                f._doc.distance = parseFloat(d.toFixed(1));
                return d <= parseFloat(distance);
            });
            farmersWithReviews.sort((a, b) => a._doc.distance - b._doc.distance);
        }

        res.json(farmersWithReviews);
    } catch (error) {
        console.error('Get farmers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/consumer/orders
// @desc    Get consumer order history
// @access  Private/Consumer
router.get('/orders', protect, authorize('consumer'), async (req, res) => {
    try {
        const orders = await Order.find({ consumer: req.user._id }).populate('items.product').populate('farmer');
        res.json(orders);
    } catch (error) {
        console.error('Order history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/consumer/orders
// @desc    Place order
// @access  Private/Consumer
router.post('/orders', protect, authorize('consumer'), requireEmailVerified, async (req, res) => {
    try {
        const { items, shippingAddress, deliverySchedule, paymentMethod } = req.body;
        
        // Group items by farmer
        // Note: The frontend must pass `farmer` ID in the items, or we need to lookup the product to find the farmer.
        // Let's look up products to be secure
        const groupedByFarmer = {};

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) continue;

            const farmerId = product.farmer.toString();
            if (!groupedByFarmer[farmerId]) {
                groupedByFarmer[farmerId] = {
                    items: [],
                    totalAmount: 0
                };
            }
            
            groupedByFarmer[farmerId].items.push({
                product: product._id,
                quantity: item.quantity,
                price: item.price // Using price from request, ideally should validate against DB
            });
            groupedByFarmer[farmerId].totalAmount += item.quantity * item.price;
        }

        const createdOrders = [];
        
        for (const [farmerId, data] of Object.entries(groupedByFarmer)) {
            const order = await Order.create({
                consumer: req.user._id,
                farmer: farmerId,
                items: data.items,
                totalAmount: data.totalAmount,
                shippingAddress,
                deliverySchedule: new Date(deliverySchedule),
                paymentMethod: paymentMethod || 'COD',
                status: 'pending',
                statusHistory: [{
                    status: 'pending',
                    timestamp: new Date(),
                    updatedBy: req.user._id,
                    note: 'Order placed by consumer'
                }]
            });
            createdOrders.push(order);
            
            // Create notification for farmer (with real-time socket delivery)
            const notificationHelper = require('../utils/notificationHelper');
            await notificationHelper.createNotification(req.app, {
                recipient: farmerId,
                sender: req.user._id,
                type: 'order_created',
                title: 'New Order Received 📦',
                message: `You have received a new order from ${req.user.name} for a total of ₹${data.totalAmount}.`,
                link: '/farmer'
            });
            
            // Optional: Reduce product quantity here
            for(let item of data.items) {
                await Product.findByIdAndUpdate(item.product, { $inc: { quantity: -item.quantity }});
            }
        }

        res.status(201).json(createdOrders);
    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/consumer/wishlist
// @desc    Get consumer wishlist
// @access  Private/Consumer
router.get('/wishlist', protect, authorize('consumer'), async (req, res) => {
    try {
        const Wishlist = require('../models/Wishlist');
        let wishlist = await Wishlist.findOne({ consumer: req.user._id }).populate({
            path: 'products',
            populate: { path: 'farmer', select: 'name location address' }
        });
        
        if (!wishlist) {
            wishlist = await Wishlist.create({ consumer: req.user._id, products: [] });
        }
        res.json(wishlist.products);
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/consumer/wishlist/:productId
// @desc    Add or remove product from wishlist
// @access  Private/Consumer
router.post('/wishlist/:productId', protect, authorize('consumer'), async (req, res) => {
    try {
        const Wishlist = require('../models/Wishlist');
        let wishlist = await Wishlist.findOne({ consumer: req.user._id });
        
        if (!wishlist) {
            wishlist = new Wishlist({ consumer: req.user._id, products: [] });
        }

        const productIndex = wishlist.products.indexOf(req.params.productId);
        if (productIndex > -1) {
            // Remove if already exists
            wishlist.products.splice(productIndex, 1);
        } else {
            // Add if not exists
            wishlist.products.push(req.params.productId);
        }

        await wishlist.save();
        res.json(wishlist.products);
    } catch (error) {
        console.error('Toggle wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper Function: Distance Calculation
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// @route   GET /api/consumer/notifications
// @desc    Get user notifications
// @access  Private
router.get('/notifications', protect, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit);
        const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/consumer/notifications/read-all
// @desc    Mark all user notifications as read
// @access  Private
router.put('/notifications/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all read notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/consumer/notifications/:id/read
// @desc    Mark a single notification as read
// @access  Private
router.put('/notifications/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { read: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json(notification);
    } catch (error) {
        console.error('Mark read notification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/consumer/products/:id/report
// @desc    Report a product listing
// @access  Private/Consumer
router.post('/products/:id/report', protect, authorize('consumer'), async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason || reason.trim() === '') {
            return res.status(400).json({ message: 'Report reason is required.' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        product.isReported = true;
        product.reportReason = reason;
        await product.save();

        res.json({ message: 'Product reported successfully. Administrators will review it.', product });
    } catch (error) {
        console.error('Report product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/consumer/reviews/:id/report
// @desc    Report a review
// @access  Private/Consumer
router.post('/reviews/:id/report', protect, authorize('consumer'), async (req, res) => {
    try {
        const { reason } = req.body;
        const Review = require('../models/Review');
        
        const validReasons = ['Spam', 'Abuse', 'Fake Review', 'Offensive Content'];
        if (!reason || !validReasons.includes(reason)) {
            return res.status(400).json({ message: `Invalid or missing report reason. Must be one of: ${validReasons.join(', ')}` });
        }

        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        review.isReported = true;
        review.reportReason = reason;
        await review.save();

        res.json({ message: 'Review reported successfully. Administrators will review it.', review });
    } catch (error) {
        console.error('Report review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
