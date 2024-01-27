const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const mongoose = require("mongoose");

const claimFoundItemSchema = new mongoose.Schema({
  description: String,
  imagePath: String,
});

const ClaimFoundItem = mongoose.model("ClaimFoundItem", claimFoundItemSchema);

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, uuidv4() + uniqueSuffix + fileExtension);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { description } = req.body;
    const imagePath = req.file.path;

    const newItem = new ClaimFoundItem({
      description,
      imagePath,
    });

    await newItem.save();

    res.status(200).json(newItem);
  } catch (error) {
    console.error("Error submitting claimed found item:", error);
    res.status(500).json({ error: "Failed to submit claimed found item" });
  }
});

module.exports = router;
