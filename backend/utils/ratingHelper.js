const mongoose = require('mongoose');

/**
 * Aggregates and updates averageRating and review counts for a Product and a Farmer.
 * Uses MongoDB Aggregation pipeline for exact calculations.
 * 
 * @param {String|mongoose.Types.ObjectId} productId - ID of the product
 * @param {String|mongoose.Types.ObjectId} farmerId - ID of the farmer
 */
const updateRatings = async (productId, farmerId) => {
    try {
        // 1. Update Product Ratings
        if (productId) {
            const productStats = await mongoose.model('Review').aggregate([
                { $match: { product: new mongoose.Types.ObjectId(productId) } },
                {
                    $group: {
                        _id: '$product',
                        averageRating: { $avg: '$rating' },
                        totalReviews: { $sum: 1 }
                    }
                }
            ]);

            if (productStats.length > 0) {
                await mongoose.model('Product').findByIdAndUpdate(productId, {
                    averageRating: parseFloat(productStats[0].averageRating.toFixed(1)),
                    numReviews: productStats[0].totalReviews
                });
            } else {
                await mongoose.model('Product').findByIdAndUpdate(productId, {
                    averageRating: 0,
                    numReviews: 0
                });
            }
        }

        // 2. Update Farmer Ratings
        if (farmerId) {
            const farmerStats = await mongoose.model('Review').aggregate([
                { $match: { farmer: new mongoose.Types.ObjectId(farmerId) } },
                {
                    $group: {
                        _id: '$farmer',
                        averageRating: { $avg: '$rating' },
                        totalReviews: { $sum: 1 }
                    }
                }
            ]);

            if (farmerStats.length > 0) {
                await mongoose.model('User').findByIdAndUpdate(farmerId, {
                    averageRating: parseFloat(farmerStats[0].averageRating.toFixed(1)),
                    numReviews: farmerStats[0].totalReviews
                });
            } else {
                await mongoose.model('User').findByIdAndUpdate(farmerId, {
                    averageRating: 0,
                    numReviews: 0
                });
            }
        }
    } catch (error) {
        console.error('Error in updateRatings helper:', error);
    }
};

module.exports = { updateRatings };
