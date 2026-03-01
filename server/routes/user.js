const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const FeedItem = require("../models/feedItem");
const Reward = require("../models/reward");
const mongoose = require("mongoose");
const ClaimFoundItem = require("../models/claimFoundItem");
const { sendEmail } = require("../utils/email");

router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });
    if (user)
      return res
        .status(409)
        .send({ message: "User with given email already exists!" });

    const SALT = 10;
    const salt = await bcrypt.genSalt(SALT);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    await new User({ ...req.body, password: hashPassword }).save();

    // Send a rich HTML welcome email
    await sendEmail({
      to: req.body.email,
      subject: "Welcome to UniFind! 🎉",
      text: "Welcome to UniFind! Thank you for joining our platform.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #22c55e;">Welcome to UniFind, ${req.body.firstName}!</h2>
          <p>Thank you for joining our lost-and-found community. Your account has been successfully created.</p>
          <div style="background: #f4f4f5; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <h3>Getting Started</h3>
            <ul style="line-height: 1.6;">
              <li><strong>Lost something?</strong> Report it immediately so others can keep an eye out.</li>
              <li><strong>Found something?</strong> Post it anonymously or securely to help it get home.</li>
              <li><strong>Earn Rewards:</strong> Get recognized on the leaderboard for reuniting items with owners!</li>
            </ul>
          </div>
          <p>Click below to start exploring the live feed:</p>
          <a href="${process.env.BASE_URL || 'https://unifind-lost-and-found.vercel.app'}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Home page</a>
        </div>
      `,
    });

    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Comprehensive Profile Data
router.get("/me/full", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await FeedItem.find({ createdBy: req.user._id }).sort("-createdAt");
    const claims = await ClaimFoundItem.find({ createdBy: req.user._id }).populate("itemId").sort("-createdAt");
    const rewards = await Reward.find({ userId: req.user._id }).sort("-createdAt");

    res.status(200).json({
      user,
      posts,
      claims,
      rewards
    });
  } catch (error) {
    console.error("Error fetching full profile:", error);
    res.status(500).json({ error: "Failed to fetch profile data" });
  }
});

// Update Profile Picture
router.put("/me/avatar", auth, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "Image URL is required" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profilePicture = imageUrl;
    await user.save();

    res.status(200).json({ message: "Profile picture updated successfully", imageUrl });
  } catch (err) {
    console.error("Failed to update avatar:", err);
    res.status(500).json({ message: "Failed to update profile picture" });
  }
});

// [GET] /api/user/leaderboard
// Returns top users by points
router.get("/leaderboard", auth, async (req, res) => {
  try {
    const topUsers = await User.find()
      .select("firstName lastName points profilePicture")
      .sort({ points: -1 })
      .limit(50);

    res.status(200).json(topUsers);
  } catch (error) {
    console.error("Failed to fetch leaderboard", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
