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
    review: {
        type: Array,
        "default" : []
    },
    ratingArray: {
        type: Array,
        "default" : []
    },
},
 {
    timestamps: true
}

);

const User = mongoose.model('User', userSchema);
module.exports = User;