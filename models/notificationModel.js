const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    userID: {
        type: String
    },
    notify: {
        type: Boolean
    },
    notification: {
        type: Array,
        "default": []
    }
}
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;