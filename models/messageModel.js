const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');


const messageSchema = new Schema({

    senderID: {
        type: String
    },
    receiverID: {
        type: String
    },
    content: {
        type: String
    }
    // conversationID: {
    //     type: String
    // }
},
 {
    timestamps: true
}

);

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;