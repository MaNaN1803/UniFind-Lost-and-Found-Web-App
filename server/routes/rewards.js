const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Reward = require("../models/reward");
const { User } = require("../models/user");
const admin = require("../middleware/admin");

// Get current user's rewards
router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("points");
        const rewards = await Reward.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ points: user.points, history: rewards });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch rewards" });
    }
});

// Admin awards points to user
router.post("/award/:id", [auth, admin], async (req, res) => {
    try {
        const { points, reason, description } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send({ message: "User not found." });

        user.points += points;
        await user.save();

        const reward = new Reward({
            userId: user._id,
            pointsAwarded: points,
            reason,
            description
        });
        await reward.save();

        res.status(200).json({ message: "Points awarded successfully", user, reward });
    } catch (error) {
        res.status(500).json({ error: "Failed to award points" });
    }
});

module.exports = router;
