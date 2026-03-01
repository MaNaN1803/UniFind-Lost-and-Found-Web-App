const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const ClaimFoundItem = require("../models/claimFoundItem");
const { upload } = require("../utils/cloudinary");

router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { description, itemId } = req.body;
    const imagePath = req.file.path;

    const newItem = new ClaimFoundItem({
      description,
      imagePath,
      itemId, // [NEW] Save item connection
      createdBy: req.user._id,
    });

    await newItem.save();

    res.status(200).json(newItem);
  } catch (error) {
    console.error("Error submitting claimed found item:", error);
    res.status(500).json({ error: "Failed to submit claimed found item" });
  }
});

// [NEW] Get all claims for a specific item
router.get("/item/:itemId", auth, async (req, res) => {
  try {
    const claims = await ClaimFoundItem.find({ itemId: req.params.itemId }).populate("createdBy", "firstName lastName email phoneNumber");
    res.status(200).json(claims);
  } catch (error) {
    console.error("Error fetching claims for item:", error);
    res.status(500).json({ error: "Failed to fetch claims" });
  }
});

// [NEW] Request phone access
router.put("/:id/request-phone", auth, async (req, res) => {
  try {
    const claim = await ClaimFoundItem.findById(req.params.id);
    if (!claim) return res.status(404).json({ error: "Claim not found" });

    if (claim.contactPhoneAccess !== 'approved') {
      claim.contactPhoneAccess = 'requested';
      await claim.save();
    }

    res.status(200).json({ message: "Phone access requested successfully", claim });
  } catch (error) {
    console.error("Error requesting phone access:", error);
    res.status(500).json({ error: "Failed to request phone access" });
  }
});

module.exports = router;
