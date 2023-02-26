const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');


const adminSchema = new Schema({

    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    emailAddress: {
        type: String,
        required: true,
        unique: [true, 'Account with this email already exists'],
        sparse: true,
        autoIndexId: false,
        validate: [validator.isEmail, 'Enter a valid email']
    },
    password: {
        type: String,
        required: true
    },
    wallet: {
        type: Number
    }
},
 {
    timestamps: true
}

);

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;