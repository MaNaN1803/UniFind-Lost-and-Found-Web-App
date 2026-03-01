const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    pointsAwarded: { type: Number, required: true },
    reason: { type: String, enum: ['found_item_returned', 'active_participation'], required: true },
    createdAt: { type: Date, default: Date.now }
});

const Reward = mongoose.model("Reward", rewardSchema);

module.exports = Reward;
