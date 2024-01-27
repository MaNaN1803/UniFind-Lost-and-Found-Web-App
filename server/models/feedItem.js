// models/feedItem.js

const mongoose = require("mongoose");

const feedItemSchema = new mongoose.Schema({
  type: String, // "lost" or "found"
  description: String,
  imagePath: String,
});

const FeedItem = mongoose.model("FeedItem", feedItemSchema);

module.exports = FeedItem;
