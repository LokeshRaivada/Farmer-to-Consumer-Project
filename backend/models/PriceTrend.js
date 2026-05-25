const mongoose = require('mongoose');

const priceTrendSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ['vegetables', 'fruits', 'grains'],
        required: true
    },
    avgPrice: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PriceTrend', priceTrendSchema);
