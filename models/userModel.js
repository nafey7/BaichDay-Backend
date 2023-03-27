const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');


const userSchema = new Schema({

    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    emailAddress: {
        type: String,
        unique: [true, 'Account with this email already exists'],
        sparse: true,
        autoIndexId: false,
        validate: [validator.isEmail, 'Enter a valid email']
    },
    password: {
        type: String,
        minlength: [6, 'Minimum password length is 6']
    },
    image: {
        type: String,
        default: 'img.png'
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    state: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    zipCode: {
        type: String,
        default: ''
    },
    role: {
        type: String
    },
    reviewAsSeller: {
        type: Array,
        "default" : []
    },
    ratingArrayAsSeller: {
        type: Array,
        "default" : []
    },
    ratingAsSeller: {
        type: Number,
        default: 0
    },
    reviewAsBidder: {
        type: Array,
        "default" : []
    },
    ratingArrayAsBidder: {
        type: Array,
        "default" : []
    },
    ratingAsBidder: {
        type: Number,
        default: 0
    },
    wallet: {
        type: Number
    },
    active: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    pin: {
        type: String
    }
},
 {
    timestamps: true
}

);

const User = mongoose.model('User', userSchema);
module.exports = User;