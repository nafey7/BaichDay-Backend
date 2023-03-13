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
        type: Array
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    userID: {
        type: String
    },
    sold: {
        type: String
    },
    bid: {
        type: Array
    },
    timeRemaining: {
        type: Number
    },
    endTime: {
        type: Date
    },
    newOwner: {
        type: String,
        default: ''
    }
},
 {
    timestamps: true
}

);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;