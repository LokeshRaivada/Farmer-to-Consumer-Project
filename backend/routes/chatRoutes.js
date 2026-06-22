const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');
const Order = require('../models/Order');

// Middleware to verify that the user is authorized to access chat messages for a specific order
const authorizeOrderChat = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const isConsumer = order.consumer.toString() === req.user._id.toString();
        const isFarmer = order.farmer.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isConsumer && !isFarmer && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to view this order chat room.' });
        }

        req.order = order; // Cache order document
        next();
    } catch (error) {
        console.error('Chat authorization middleware error:', error);
        res.status(500).json({ message: 'Server error during chat authorization.' });
    }
};

// @route   GET /api/chat/messages/:orderId
// @desc    Get chat history for an order (paginated, newest first)
// @access  Private
router.get('/messages/:orderId', protect, authorizeOrderChat, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const messages = await Message.find({ orderId: req.params.orderId })
            .sort({ createdAt: -1 }) // Sort by newest first for performance pagination
            .skip(skip)
            .limit(limit)
            .populate('sender', 'name role')
            .populate('receiver', 'name role');

        // Reverse to return them in chronological order for the chat box
        res.json(messages.reverse());
    } catch (error) {
        console.error('Fetch chat messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/chat/messages/:orderId/read
// @desc    Mark all messages in an order room as read
// @access  Private
router.put('/messages/:orderId/read', protect, authorizeOrderChat, async (req, res) => {
    try {
        await Message.updateMany(
            { orderId: req.params.orderId, receiver: req.user._id, isRead: false },
            { isRead: true, readAt: new Date() }
        );
        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Read chat messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/chat/unread-counts
// @desc    Get unread badge counts grouped by orderId
// @access  Private
router.get('/unread-counts', protect, async (req, res) => {
    try {
        const counts = await Message.aggregate([
            { $match: { receiver: req.user._id, isRead: false } },
            { $group: { _id: '$orderId', count: { $sum: 1 } } }
        ]);
        res.json(counts);
    } catch (error) {
        console.error('Fetch unread count error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
