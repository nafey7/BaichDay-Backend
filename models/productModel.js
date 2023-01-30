const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');


const productSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    userID: {
        type: String
    },
    sold: {
        type: Boolean
    },
    bid: {
        // array will contain objects {bidderID, bidCost}
        type: Array
    }
},
 {
    timestamps: true
}

);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;