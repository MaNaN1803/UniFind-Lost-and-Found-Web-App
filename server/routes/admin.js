const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { User } = require("../models/user");
const FedItem = require("../models/feedItem");
const Reward = require("../models/reward");
const Notification = require("../models/notification");
const mongoose = require("mongoose");
const ClaimFoundItem = require("../models/claimFoundItem");
const { sendEmail } = require("../utils/email");

const calculateReward = (description) => {
    if (!description) return 10;
    const lowerDesc = description.toLowerCase();
    let score = 10;
    if (lowerDesc.includes('electronics') || lowerDesc.includes('laptop') || lowerDesc.includes('phone') || lowerDesc.includes('macbook') || lowerDesc.includes('ipad') || lowerDesc.includes('airpods') || lowerDesc.includes('headphones')) {
        score = 30;
        if (lowerDesc.includes('pro') || lowerDesc.includes('max') || lowerDesc.includes('ultra') || lowerDesc.includes('gaming')) score += 20;
    } else if (lowerDesc.includes('wallet') || lowerDesc.includes('purse') || lowerDesc.includes('cash') || lowerDesc.includes('card')) {
        score = 25;
    } else if (lowerDesc.includes('keys') || lowerDesc.includes('glasses') || lowerDesc.includes('watch') || lowerDesc.includes('jewelry')) {
        score = 20;
    } else if (lowerDesc.includes('document') || lowerDesc.includes('id') || lowerDesc.includes('passport')) {
        score = 50;
    }
    return score;
};

// Get all users
router.get("/users", [auth, admin], async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Delete a user
router.delete("/users/:id", [auth, admin], async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send({ message: "User not found." });
        res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

// Delete a feed item
router.delete("/feed/:id", [auth, admin], async (req, res) => {
    try {
        const item = await FeedItem.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).send({ message: "Item not found." });
        res.status(200).json({ message: "Item deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete item" });
    }
});

// Get all claims
router.get("/claims", [auth, admin], async (req, res) => {
    try {
        const claims = await ClaimFoundItem.find().populate("createdBy", "firstName lastName email").sort("-createdAt");
        res.status(200).json(claims);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch claims" });
    }
});

// Delete a claim
router.delete("/claims/:id", [auth, admin], async (req, res) => {
    try {
        const claim = await ClaimFoundItem.findByIdAndDelete(req.params.id);
        if (!claim) return res.status(404).send({ message: "Claim not found." });
        res.status(200).json({ message: "Claim deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete claim" });
    }
});

// Update claim status
router.put("/claims/:id/status", [auth, admin], async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) return res.status(400).send({ message: "Invalid status" });

        const claim = await ClaimFoundItem.findById(req.params.id)
            .populate("createdBy", "firstName lastName email")
            .populate({ path: "itemId", model: "FeedItem" });

        if (!claim) return res.status(404).send({ message: "Claim not found." });

        claim.status = status;
        await claim.save();

        if (status === 'approved') {
            // Mark item as resolved
            const item = await FedItem.findById(claim.itemId._id);
            if (item) {
                item.status = 'resolved';
                await item.save();

                // Award points to the finder
                const finder = await User.findById(item.createdBy);
                if (finder) {
                    const points = calculateReward(item.description);
                    finder.points = (finder.points || 0) + points;
                    await finder.save();

                    // Generate Reward History Log
                    const rewardLog = new Reward({
                        userId: finder._id,
                        pointsAwarded: points,
                        reason: 'found_item_returned',
                        description: `Bonus for successfully returning: ${item.title || item.type}`
                    });
                    await rewardLog.save();

                    // Generate Notification for Finder
                    await new Notification({
                        userId: finder._id,
                        type: 'system',
                        message: `A claim on your found item was approved! You've been awarded ${points} pts.`,
                        link: `/item/${item._id}`
                    }).save();

                    // Mail finder
                    await sendEmail({
                        to: finder.email,
                        subject: "Item successfully returned! Bounty Awarded 🏆",
                        text: `Great news! The item you posted ("${item.description}") has been successfully claimed and verified. \n\nAs a thank you for benefiting the community, you've been awarded ${points} Reward Points!\nYour new balance is ${finder.points} PTS! Keep up the great work.`,
                        html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #22c55e;">Item Resolved & Bounty Awarded! 🏆</h2>
                            <p>Great news! The item you posted ("<strong>${item.description}</strong>") has been successfully returned and verified by the Administration.</p>
                            <div style="margin: 20px 0; padding: 20px; background: #fafafa; border-left: 4px solid #f59e0b;">
                                <h3 style="margin-top: 0; color: #f59e0b;">+${points} Reward Points</h3>
                                <p style="margin-bottom: 0;">As a thank you for benefiting the community, your new balance is <strong>${finder.points} PTS</strong>! Keep climbing the leaderboard.</p>
                            </div>
                        </div>
                        `
                    });
                }
            }

            // Generate Notification for Claimant
            await new Notification({
                userId: claim.createdBy._id,
                type: 'claim_approved',
                message: `Your claim for "${claim.itemId?.description || 'Found Item'}" has been approved!`,
                link: `/item/${claim.itemId?._id}`
            }).save();

            // Mail claimant
            await sendEmail({
                to: claim.createdBy.email,
                subject: "Claim Approved! ✔️",
                text: `Congratulations ${claim.createdBy.firstName}! \n\nYour recent claim request for the item ("${claim.itemId?.description || 'Found Item'}") has been officially approved. \n\nPlease coordinate with the original poster using the Live Chat to schedule a secure pickup. Have a great day!`,
                html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #22c55e;">Claim Approved! ✔️</h2>
                            <p>Congratulations ${claim.createdBy.firstName},</p>
                            <p>Your recent claim request for "<strong>${claim.itemId?.description || 'Found Item'}</strong>" has been officially approved by the Administration.</p>
                            <div style="margin: 20px 0; padding: 20px; background: #fafafa; border-left: 4px solid #22c55e;">
                                <h3 style="margin-top: 0;">Next Steps</h3>
                                <p style="margin-bottom: 0;">You can now view the finder's contact details or use the Live Chat on the item page to coordinate a secure pickup.</p>
                            </div>
                            <a href="${process.env.BASE_URL || 'https://unifind-lost-and-found.vercel.app'}/item/${claim.itemId?._id}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">View Item Status</a>
                        </div>
                `
            });

        } else if (status === 'rejected') {
            // Generate Notification for Claimant
            await new Notification({
                userId: claim.createdBy._id,
                type: 'claim_rejected',
                message: `Your claim for "${claim.itemId?.description || 'Found Item'}" has been rejected.`,
                link: `/item/${claim.itemId?._id}`
            }).save();

            // Mail claimant
            await sendEmail({
                to: claim.createdBy.email,
                subject: "Claim Rejected ❌",
                text: `Hello ${claim.createdBy.firstName}, \n\nUnfortunately, your recent claim request for the item ("${claim.itemId?.description || 'Found Item'}") has been rejected. \n\nThis usually occurs due to insufficient or inaccurate proof of ownership. If you believe this is a mistake, you may submit a new claim with higher quality photographic evidence or better descriptions.`,
                html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #ef4444;">Claim Rejected ❌</h2>
                            <p>Hello ${claim.createdBy.firstName},</p>
                            <p>Unfortunately, your recent claim request for "<strong>${claim.itemId?.description || 'Found Item'}</strong>" has been reviewed and rejected.</p>
                            <div style="margin: 20px 0; padding: 20px; background: #fff1f2; border-left: 4px solid #ef4444;">
                                <p style="margin: 0;">This usually occurs due to insufficient or inaccurate proof of ownership. If you believe this is a mistake, you may submit a new claim with higher quality photographic evidence or a more detailed description of the item.</p>
                            </div>
                        </div>
                `
            });
        }

        res.status(200).json({ message: `Claim ${status} successfully`, claim });
    } catch (error) {
        console.error("Status Update Error:", error);
        res.status(500).json({ error: "Failed to update claim status" });
    }
});

// Approve phone access request
router.put("/claims/:id/phone-access", [auth, admin], async (req, res) => {
    try {
        const claim = await ClaimFoundItem.findById(req.params.id);
        if (!claim) return res.status(404).send({ message: "Claim not found." });

        claim.contactPhoneAccess = 'approved';
        await claim.save();

        await new Notification({
            userId: claim.createdBy,
            type: 'system',
            message: `Admin has approved your request to view the poster's private phone number.`,
            link: `/item/${claim.itemId}`
        }).save();

        res.status(200).json({ message: "Phone access approved successfully", claim });
    } catch (error) {
        console.error("Phone Access Error:", error);
        res.status(500).json({ error: "Failed to approve phone access" });
    }
});

module.exports = router;
