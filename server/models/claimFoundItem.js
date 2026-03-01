const mongoose = require("mongoose");

const claimFoundItemSchema = new mongoose.Schema({
    description: String,
    imagePath: String,
    itemId: String, // Link claim to the actual feed item ID
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, default: "pending" }, // pending, approved, rejected
    contactPhoneAccess: { type: String, enum: ['none', 'requested', 'approved'], default: 'none' }
}, { timestamps: true });

const ClaimFoundItem = mongoose.model("ClaimFoundItem", claimFoundItemSchema);

module.exports = ClaimFoundItem;
