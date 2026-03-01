const express = require("express");
const app = express();
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const mongoose = require("mongoose");
const FeedItem = require("../models/feedItem");
const auth = require("../middleware/auth");
const { runMatchEngine } = require("../utils/matchEngine");
const { upload } = require("../utils/cloudinary");

app.use(express.static("Public"));

app.use(express.json());
const lostItemSchema = new mongoose.Schema({
  description: String,
  imagePath: String,
});

const LostItem = mongoose.model("LostItem", lostItemSchema);

router.post("/report-lost", auth, upload.single("image"), async (req, res) => {
  try {
    const { description, lat, lng } = req.body;
    const imagePath = req.file.path;

    const newItem = new FeedItem({
      type: "lost",
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
    console.error("Error submitting lost item:", error);
    res.status(500).json({ error: "Failed to submit lost item" });
  }
});

router.get("/all", auth, async (req, res) => {
  try {
    const lostItems = await LostItem.find();
    res.status(200).json(lostItems);
  } catch (error) {
    console.error("Error fetching lost items:", error);
    res.status(500).json({ error: "Failed to fetch lost items" });
  }
});

module.exports = router;
