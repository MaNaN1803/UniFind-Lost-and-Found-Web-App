// models/feedItem.js

const mongoose = require("mongoose");

const feedItemSchema = new mongoose.Schema({
  type: String, // "lost" or "found"
  description: String,
  imagePath: String,
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

const FeedItem = mongoose.model("FeedItem", feedItemSchema);

module.exports = FeedItem;
