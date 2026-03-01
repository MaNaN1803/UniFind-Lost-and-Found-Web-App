const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const ClaimFoundItem = require("../models/claimFoundItem");
const FeedItem = require("../models/feedItem");
const Notification = require("../models/notification");
const { User } = require("../models/user");
const { sendEmail } = require("../utils/email");
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

    // [EXPANSION] Email the original poster that someone claimed their item
    try {
      const item = await FeedItem.findById(itemId).populate("createdBy");
      if (item && item.createdBy && item.createdBy.email) {

        await new Notification({
          userId: item.createdBy._id,
          type: 'claim_received',
          message: `Someone just submitted a claim for your post: "${item.description}"`,
          link: `/item/${item._id}`
        }).save();

        await sendEmail({
          to: item.createdBy.email,
          subject: "New Claim on your Found Item! 🔍",
          text: `Hello ${item.createdBy.firstName},\n\nSomeone just submitted a claim for the item you posted ("${item.description}").\n\nPlease log in to review the claim and photographic evidence.\n\nThank you for helping the community!`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #3b82f6;">New Claim Received! 🔍</h2>
              <p>Hello ${item.createdBy.firstName},</p>
              <p>Someone just submitted a claim for the item you posted ("<strong>${item.description}</strong>").</p>
              <div style="margin: 20px 0; padding: 20px; background: #fafafa; border-left: 4px solid #3b82f6;">
                <p style="margin: 0;">Please log into UniFind to review the claimant's photographic evidence and approve or reject the claim.</p>
              </div>
              <a href="${process.env.BASE_URL || 'https://unifind-lost-and-found.vercel.app'}/item/${item._id}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Claim</a>
            </div>
          `
        });
      }
    } catch (notificationError) {
      console.error("Failed to send claim notification email:", notificationError);
    }

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

      // [EXPANSION] Email the original poster that someone requested phone access
      try {
        const item = await FeedItem.findById(claim.itemId).populate("createdBy");
        if (item && item.createdBy && item.createdBy.email) {

          await new Notification({
            userId: item.createdBy._id,
            type: 'phone_access_request',
            message: `A claimant requested access to your phone number for coordination.`,
            link: `/item/${item._id}`
          }).save();

          await sendEmail({
            to: item.createdBy.email,
            subject: "Phone Number Access Requested 📱",
            text: `Hello ${item.createdBy.firstName},\n\nThe claimant for your item ("${item.description}") has requested access to your phone number to coordinate a pickup.\n\nPlease log in and review this request on the item page.\n\nThank you!`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #8b5cf6;">Phone Access Requested 📱</h2>
                <p>Hello ${item.createdBy.firstName},</p>
                <p>The claimant for your item ("<strong>${item.description}</strong>") has requested access to your private phone number to coordinate a pickup.</p>
                <div style="margin: 20px 0; padding: 20px; background: #fafafa; border-left: 4px solid #8b5cf6;">
                  <p style="margin: 0;">You can approve or deny this request securely from the item portal.</p>
                </div>
                <a href="${process.env.BASE_URL || 'https://unifind-lost-and-found.vercel.app'}/item/${item._id}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Manage Request</a>
              </div>
            `
          });
        }
      } catch (notificationError) {
        console.error("Failed to send phone access request email:", notificationError);
      }
    }

    res.status(200).json({ message: "Phone access requested successfully", claim });
  } catch (error) {
    console.error("Error requesting phone access:", error);
    res.status(500).json({ error: "Failed to request phone access" });
  }
});

module.exports = router;
