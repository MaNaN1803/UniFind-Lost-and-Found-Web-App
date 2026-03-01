const express = require("express");
const router = express.Router();
const Notification = require("../models/notification");
const auth = require("../middleware/auth");

// Get all notifications for the logged-in user
router.get("/", auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20); // Limit to 20 most recent
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

// Mark a single notification as read
router.put("/:id/read", auth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { read: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: "Notification not found" });
        res.status(200).json(notification);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ error: "Failed to update notification" });
    }
});

// Mark all as read
router.put("/read-all", auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, read: false },
            { read: true }
        );
        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ error: "Failed to update notifications" });
    }
});

// Get ALL notifications for the logged-in user (History)
router.get("/all", auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching full notifications:", error);
        res.status(500).json({ error: "Failed to fetch full notifications history" });
    }
});

// Clear all notifications for user
router.delete("/clear", auth, async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.user._id });
        res.status(200).json({ message: "Notification history cleared" });
    } catch (error) {
        console.error("Error clearing notifications:", error);
        res.status(500).json({ error: "Failed to clear notifications" });
    }
});

module.exports = router;
