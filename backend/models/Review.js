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
        required: true
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
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
    images: {
        type: [String],
        default: []
    },
    isReported: {
        type: Boolean,
        default: false
    },
    reportReason: {
        type: String,
        enum: ['Spam', 'Abuse', 'Fake Review', 'Offensive Content']
    }
}, { timestamps: true });

// Compound unique index on user, order and product to prevent duplicate reviews
reviewSchema.index({ user: 1, order: 1, product: 1 }, { unique: true });
// Query optimization indexes
reviewSchema.index({ product: 1 });
reviewSchema.index({ farmer: 1 });

module.exports = mongoose.model('Review', reviewSchema);
