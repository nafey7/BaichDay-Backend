const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bannedUserSchema = new Schema({

    // email, phone number, address 
    emailAddress: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    address: {
        type: String
    }
},
 {
    timestamps: true
}

);

const BannedUser = mongoose.model('bannedUser', bannedUserSchema);
module.exports = BannedUser;