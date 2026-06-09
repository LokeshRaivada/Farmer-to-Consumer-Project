const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');

// Use dummy keys if environment variables are not set
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_key',
});

router.post('/create-razorpay-order', async (req, res) => {
    try {
        const { orderId, amount } = req.body;

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: 'INR',
            receipt: `receipt_order_${orderId}`,
        };

        const order = await razorpay.orders.create(options);
        
        // Send back the order ID so the frontend can initialize the popup
        res.json({ id: order.id, currency: order.currency, amount: order.amount });
    } catch (error) {
        console.error('Razorpay Error:', error);
        if (error.statusCode === 401) {
            return res.status(500).json({ error: 'Razorpay Authentication Failed: The RAZORPAY_KEY_SECRET is missing or invalid in your backend .env file.' });
        }
        res.status(500).json({ error: error.message || 'Payment gateway error' });
    }
});

module.exports = router;
