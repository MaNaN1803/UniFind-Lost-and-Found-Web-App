const router = require("express").Router();
const { User } = require("../models/user");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// @route   POST /api/password-reset/forgot
// @desc    Generate password reset token and email it to user
router.post("/forgot", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            // We return 200 even if not found to prevent email enumeration attacks
            return res.status(200).send({ message: "If that email exists in our system, a reset link has been sent." });
        }

        const token = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        const resetLink = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password/${token}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "UniFind Password Reset Request",
            text: `You requested a password reset for your UniFind account.\n\nPlease click on the following link, or paste it into your browser to complete the process within one hour of receiving it:\n\n${resetLink}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending reset email: ", error);
                return res.status(500).send({ message: "Failed to send reset email" });
            }
            res.status(200).send({ message: "If that email exists in our system, a reset link has been sent." });
        });
    } catch (error) {
        console.error("Forgot password error: ", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// @route   POST /api/password-reset/reset/:token
// @desc    Update password if token is valid
router.post("/reset/:token", async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).send({ message: "Password reset token is invalid or has expired." });
        }

        const SALT = 10;
        const salt = await bcrypt.genSalt(SALT);
        user.password = await bcrypt.hash(req.body.password, salt);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).send({ message: "Your password has been successfully updated." });
    } catch (error) {
        console.error("Reset password error: ", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;
