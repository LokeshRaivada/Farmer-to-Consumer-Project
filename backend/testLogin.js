const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'prudhvi@gmail.com' }).select('+password');
        console.log('User found:', user.email);
        console.log('Hashed password:', user.password);
        
        // try comparing typical passwords
        const pass1 = '123456';
        const pass2 = 'prudhvi';
        
        const match1 = await user.comparePassword(pass1);
        const match2 = await user.comparePassword(pass2);
        
        console.log('Match 123456:', match1);
        console.log('Match prudhvi:', match2);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
