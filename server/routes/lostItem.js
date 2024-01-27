const express = require("express");
const app = express();
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const mongoose = require("mongoose");
const FeedItem = require("../models/feedItem");
app.use(express.static("Public"));
app.use(express.json());
const lostItemSchema = new mongoose.Schema({
  description: String,
  imagePath: String,
});

const LostItem = mongoose.model("LostItem", lostItemSchema);

const storage = multer.diskStorage({
  destination: "Public/images",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, uuidv4() + uniqueSuffix + fileExtension);
  },
});

const upload = multer({ storage });

router.post("/report-lost", upload.single("image"), async (req, res) => {
  try {
    const { description } = req.body;
    const imagePath = req.file.path;

    const newItem = new FeedItem({
      type: "lost",
      description,
      imagePath,
    });

    await newItem.save();

    res.status(200).json(newItem);
  } catch (error) {
    console.error("Error submitting lost item:", error);
    res.status(500).json({ error: "Failed to submit lost item" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const lostItems = await LostItem.find();
    res.status(200).json(lostItems);
  } catch (error) {
    console.error("Error fetching lost items:", error);
    res.status(500).json({ error: "Failed to fetch lost items" });
  }
});

module.exports = router;
