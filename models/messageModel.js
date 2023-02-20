const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');


const messageSchema = new Schema({

    sender: {
        type: String
    },
    receiver: {
        type: String
    },
    content: {
        type: String
    },
    conversationID: {
        type: String
    }
},
 {
    timestamps: true
}

);

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;