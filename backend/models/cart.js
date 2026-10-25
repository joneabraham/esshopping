const mongoose = require('mongoose');

const Cartschema = new mongoose.Schema({
    product_id: String,
    user_id: String,
    quantity: { type: Number, default: 1, min: 1 }
});

const Cart = mongoose.model('Cart', Cartschema);
module.exports = Cart;
