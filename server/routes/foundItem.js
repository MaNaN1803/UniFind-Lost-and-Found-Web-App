const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const mongoose = require("mongoose");
const FeedItem = require("../models/feedItem");
const auth = require("../middleware/auth");
const { runMatchEngine } = require("../utils/matchEngine");
const { upload } = require("../utils/cloudinary");

const foundItemSchema = new mongoose.Schema({
  description: String,
  imagePath: String,
});

const FoundItem = mongoose.model("FoundItem", foundItemSchema);

router.post("/report-found", auth, upload.single("image"), async (req, res) => {
  try {
    const { description, lat, lng } = req.body;
    const imagePath = req.file.path;

    const newItem = new FeedItem({
      type: "found",
      description,
      imagePath,
      location: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined,
      createdBy: req.user._id,
    });

    await newItem.save();

    // Trigger background matching asynchronously
    runMatchEngine(newItem).catch(err => console.error("Match engine failed in background", err));

    res.status(200).json(newItem);
  } catch (error) {
    console.error("Error submitting found item:", error);
    res.status(500).json({ error: "Failed to submit found item" });
    res.status(500).json({ error: "Failed to submit found item" });
  }
});

module.exports = router;
