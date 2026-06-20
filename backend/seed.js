const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const PriceTrend = require('./models/PriceTrend');
const Review = require('./models/Review');
const Notification = require('./models/Notification');
require('dotenv').config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected for seeding...');

        // Clear existing
        await User.deleteMany({});
        await Product.deleteMany({});
        await PriceTrend.deleteMany({});
        await Review.deleteMany({});
        await Notification.deleteMany({});

        // Create Admin
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@farmer.com',
            password: 'password123',
            role: 'admin',
            phone: '1234567890',
            isEmailVerified: true
        });

        // Create Prudhvi Admin
        await User.create({
            name: 'Prudhvi',
            email: 'jubburuprudhviraju@gmail.com',
            password: 'Prudhvi@2005',
            role: 'admin',
            phone: '9999999999',
            isEmailVerified: true
        });

        // Create Farmer
        const farmer = await User.create({
            name: 'Ramesh Rao',
            email: 'farmer@farmer.com',
            password: 'password123',
            role: 'farmer',
            phone: '0987654321',
            address: { city: 'Guntur', state: 'Andhra Pradesh' },
            location: { type: 'Point', coordinates: [80.4365, 16.3067] },
            isVerified: true,
            isEmailVerified: true
        });

        // Create Farmer 2
        const farmer2 = await User.create({
            name: 'Venkatesh K.',
            email: 'farmer2@farmer.com',
            password: 'password123',
            role: 'farmer',
            phone: '9988776655',
            address: { city: 'Nellore', state: 'Andhra Pradesh' },
            location: { type: 'Point', coordinates: [79.9865, 14.4426] },
            isVerified: true,
            isEmailVerified: true
        });

        // Create Consumer
        const consumer = await User.create({
            name: 'Anjali Sharma',
            email: 'consumer@farmer.com',
            password: 'password123',
            role: 'consumer',
            phone: '1122334455',
            address: { city: 'Hyderabad', state: 'Telangana' },
            isEmailVerified: true
        });

        // Create Products
        const products = await Product.create([
            { name: 'Organic Tomatoes', price: 40, quantity: 100, category: 'vegetables', description: 'Fresh and sun-ripened organic tomatoes.', farmer: farmer._id },
            { name: 'Pure Sona Masuri Rice', price: 65, quantity: 500, category: 'grains', description: 'Premium quality grains directly from our mill.', farmer: farmer._id },
            { name: 'Alphonso Mangoes', price: 120, quantity: 50, category: 'fruits', description: 'Aromatic and sweet alphonso mangoes.', farmer: farmer2._id },
            { name: 'Green Chillies', price: 30, quantity: 30, category: 'vegetables', description: 'Fresh and spicy green chillies.', farmer: farmer2._id },
        ]);

        // Create Reviews
        await Review.create([
            { user: consumer._id, product: products[0]._id, farmer: farmer._id, rating: 5, comment: 'Fresh tomatoes arrived within 3 hours. Outstanding quality!', verifiedPurchase: true },
            { user: consumer._id, product: products[1]._id, farmer: farmer._id, rating: 4, comment: 'Very clean rice grains, cooks perfectly. Direct from farm pricing is great!', verifiedPurchase: true },
            { user: consumer._id, product: products[2]._id, farmer: farmer2._id, rating: 5, comment: 'Extremely sweet alphonso mangoes. Will order again next season.', verifiedPurchase: true }
        ]);

        // Update ratings on products
        for(let p of products) {
            const productReviews = await Review.find({ product: p._id });
            const count = productReviews.length;
            if(count > 0) {
                p.averageRating = parseFloat((productReviews.reduce((s, r) => s + r.rating, 0) / count).toFixed(1));
                p.numReviews = count;
                await p.save();
            }
        }

        // Create Price Trends
        const dates = [
            '2026-03-01', '2026-03-05', '2026-03-10', '2026-03-15', '2026-03-20', '2026-03-25', '2026-04-01'
        ];
        
        // Vegetables
        const vegPrices = [38, 42, 45, 43, 46, 48, 50];
        for(let i=0; i<dates.length; i++) {
            await PriceTrend.create({
                category: 'vegetables',
                avgPrice: vegPrices[i],
                date: new Date(dates[i])
            });
        }

        // Fruits
        const fruitPrices = [100, 105, 110, 108, 115, 120, 118];
        for(let i=0; i<dates.length; i++) {
            await PriceTrend.create({
                category: 'fruits',
                avgPrice: fruitPrices[i],
                date: new Date(dates[i])
            });
        }

        // Grains
        const grainPrices = [60, 61, 62, 62, 63, 64, 65];
        for(let i=0; i<dates.length; i++) {
            await PriceTrend.create({
                category: 'grains',
                avgPrice: grainPrices[i],
                date: new Date(dates[i])
            });
        }

        console.log('Seeding completed successfully!');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedData();
