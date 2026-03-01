// models/FoundItem.js
const { string } = require("joi");
const mongoose = require("mongoose");

const foundItemSchema = new mongoose.Schema({
  description: String,
  imagePath: String,
  image: String,
});

const FoundItem = mongoose.model("FoundItem", foundItemSchema);

module.exports = FoundItem;
