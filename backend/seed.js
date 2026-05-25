const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const PriceTrend = require('./models/PriceTrend');
require('dotenv').config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected for seeding...');

        // Clear existing
        await User.deleteMany({});
        await Product.deleteMany({});
        await PriceTrend.deleteMany({});

        // Create Admin
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@farmer.com',
            password: 'password123',
            role: 'admin',
            phone: '1234567890'
        });

        // Create Farmer
        const farmer = await User.create({
            name: 'Ramesh Rao',
            email: 'farmer@farmer.com',
            password: 'password123',
            role: 'farmer',
            phone: '0987654321',
            address: { city: 'Guntur', state: 'Andhra Pradesh' },
            location: { type: 'Point', coordinates: [80.4365, 16.3067] }
        });

        // Create Farmer 2
        const farmer2 = await User.create({
            name: 'Venkatesh',
            email: 'farmer2@farmer.com',
            password: 'password123',
            role: 'farmer',
            phone: '9988776655',
            address: { city: 'Nellore', state: 'Andhra Pradesh' },
            location: { type: 'Point', coordinates: [79.9865, 14.4426] }
        });

        // Create Consumer
        await User.create({
            name: 'Anjali',
            email: 'consumer@farmer.com',
            password: 'password123',
            role: 'consumer',
            phone: '1122334455',
            address: { city: 'Hyderabad', state: 'Telangana' }
        });

        // Create Products
        await Product.create([
            { name: 'Organic Tomatoes', price: 40, quantity: 100, category: 'vegetables', description: 'Fresh and sun-ripened organic tomatoes.', farmer: farmer._id },
            { name: 'Pure Sona Masuri Rice', price: 65, quantity: 500, category: 'grains', description: 'Premium quality grains directly from our mill.', farmer: farmer._id },
            { name: 'Alphonso Mangoes', price: 120, quantity: 50, category: 'fruits', description: 'Aromatic and sweet alphonso mangoes.', farmer: farmer2._id },
            { name: 'Green Chillies', price: 30, quantity: 30, category: 'vegetables', description: 'Fresh and spicy green chillies.', farmer: farmer2._id },
        ]);

        // Create Price Trends
        const dates = [
            '2026-03-01', '2026-03-05', '2026-03-10', '2026-03-15', '2026-03-20', '2026-03-25', '2026-04-01'
        ];
        const prices = [38, 42, 45, 43, 46, 48, 50];

        for(let i=0; i<dates.length; i++) {
            await PriceTrend.create({
                category: 'vegetables',
                avgPrice: prices[i],
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
