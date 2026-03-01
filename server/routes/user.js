const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const auth = require("../middleware/auth");
const FeedItem = require("../models/feedItem");
const Reward = require("../models/reward");
const mongoose = require("mongoose");
const ClaimFoundItem = require("../models/claimFoundItem");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

    // Send a welcome email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.body.email,
      subject: "Welcome to UniFind",
      text: "Welcome to UniFind! Thank you for joining our platform. Start exploring the live feed to help recover lost items!",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending welcome email: ", error);
      } else {
        console.log("Welcome email sent: " + info.response);
      }
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
