const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['vegetables', 'fruits', 'grains'],
        required: true
    },
    image: {
        type: String, // Path to image file
        default: '/uploads/product-placeholder.png'
    },
    images: {
        type: [String],
        default: []
    },
    isReported: {
        type: Boolean,
        default: false
    },
    reportReason: String,
    isAvailable: {
        type: Boolean,
        default: true
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// For keyword searching and location-based queries
productSchema.index({ name: 'text', description: 'text' });
// In consumer controller, we will combine product data with farmer location.

module.exports = mongoose.model('Product', productSchema);
