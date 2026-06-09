const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({});
        console.log('Users in DB:', users);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
