const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    verifiedPurchase: {
        type: Boolean,
        default: false
    },
    reviewType: {
        type: String,
        enum: ['product', 'farmer', 'website'],
        default: 'product'
    }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
