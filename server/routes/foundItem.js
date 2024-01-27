const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const mongoose = require("mongoose");
const FeedItem = require("../models/feedItem");

const foundItemSchema = new mongoose.Schema({
  description: String,
  imagePath: String,
});

const FoundItem = mongoose.model("FoundItem", foundItemSchema);

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, uuidv4() + uniqueSuffix + fileExtension);
  },
});

const upload = multer({ storage });

router.post("/report-found", upload.single("image"), async (req, res) => {
  try {
    const { description } = req.body;
    const imagePath = req.file.path;

    const newItem = new FeedItem({
      type: "found",
      description,
      imagePath,
    });

    await newItem.save();

    res.status(200).json(newItem);
  } catch (error) {
    console.error("Error submitting found item:", error);
    res.status(500).json({ error: "Failed to submit found item" });
  }
});

router.post("/report-found", upload.single("image"), async (req, res) => {
  try {
    const { description } = req.body;
    const imagePath = req.file.path;

    const newItem = new FoundItem({
      description,
      imagePath,
    });

    await newItem.save();

    res.status(200).json(newItem);
  } catch (error) {
    console.error("Error submitting found item:", error);
    res.status(500).json({ error: "Failed to submit found item" });
  }
});

module.exports = router;
