const express = require("express");
const router = express.Router();
const FeedItem = require("../models/feedItem");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const feedItems = await FeedItem.find()
      .populate("createdBy", "firstName lastName email phoneNumber points");
    res.status(200).json(feedItems);
  } catch (error) {
    console.error("Error fetching feed items:", error);
    res.status(500).json({ error: "Failed to fetch feed items" });
  }
});
// [NEW] Get a specific Feed item by its ID
router.get("/:id", auth, async (req, res) => {
  try {
    const feedItem = await FeedItem.findById(req.params.id)
      .populate("createdBy", "firstName lastName email phoneNumber points");

    if (!feedItem) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json(feedItem);
  } catch (error) {
    console.error("Error fetching single feed item:", error);
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

module.exports = router;
