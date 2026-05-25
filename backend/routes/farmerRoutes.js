const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/farmer/products
// @desc    Add product
// @access  Private/Farmer
router.post('/products', protect, authorize('farmer'), async (req, res) => {
    try {
        const product = await Product.create({
            ...req.body,
            farmer: req.user._id
        });
        res.status(201).json(product);
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ message: 'Server error' });
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
router.put('/products/:id', protect, authorize('farmer'), async (req, res) => {
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
router.delete('/products/:id', protect, authorize('farmer'), async (req, res) => {
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
router.put('/orders/:id', protect, authorize('farmer'), async (req, res) => {
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

        order.status = status;
        await order.save();
        res.json(order);
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
