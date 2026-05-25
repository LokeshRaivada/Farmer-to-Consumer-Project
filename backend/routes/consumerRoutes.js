const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/consumer/products
// @desc    Get all products with location data
// @access  Public
router.get('/products', async (req, res) => {
    try {
        const { category, search, lat, lon, distance, city, pincode, state } = req.query;
        let query = { isAvailable: true };
        if (category && category !== '') query.category = category;
        if (search && search !== '') query.name = { $regex: search, $options: 'i' };

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

        let farmers = await User.find(query).select('name address location createdAt');

        if (lat && lon && distance) {
            const userLoc = [parseFloat(lon), parseFloat(lat)];
            farmers = farmers.filter(f => {
                if (!f.location?.coordinates) return false;
                const d = getDistanceFromLatLonInKm(userLoc[1], userLoc[0], f.location.coordinates[1], f.location.coordinates[0]);
                f._doc.distance = parseFloat(d.toFixed(1));
                return d <= parseFloat(distance);
            });
            farmers.sort((a, b) => a._doc.distance - b._doc.distance);
        }

        res.json(farmers);
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
        const orders = await Order.find({ consumer: req.user._id }).populate('items.product');
        res.json(orders);
    } catch (error) {
        console.error('Order history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/consumer/orders
// @desc    Place order
// @access  Private/Consumer
router.post('/orders', protect, authorize('consumer'), async (req, res) => {
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
                status: 'pending'
            });
            createdOrders.push(order);
            
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

module.exports = router;
