const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const product = new Product({
            farmer: new mongoose.Types.ObjectId(),
            name: "oranges",
            price: "50",
            quantity: "20",
            category: "fruits",
            description: ""
        });
        await product.save();
        console.log("Success");
    } catch (err) {
        console.error("Validation Error:", err.message);
    } finally {
        mongoose.disconnect();
    }
}
test();
