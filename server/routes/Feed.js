const express = require("express");
const router = express.Router();
const FeedItem = require("../models/feedItem");

router.get("/", async (req, res) => {
  try {
    const feedItems = await FeedItem.find();
    res.status(200).json(feedItems);
  } catch (error) {
    console.error("Error fetching feed items:", error);
    res.status(500).json({ error: "Failed to fetch feed items" });
  }
});

module.exports = router;
