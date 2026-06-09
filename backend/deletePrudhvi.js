const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const result = await User.deleteOne({ email: 'prudhvi@gmail.com' });
        console.log('Deleted user:', result);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
