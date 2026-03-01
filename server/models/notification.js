const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['chat_invite', 'claim_approved', 'claim_rejected', 'system'], default: 'system' },
    message: { type: String, required: true },
    link: { type: String }, // Optional frontend route to navigate to on click
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
