const cron = require('node-cron');
const FeedItem = require('../models/feedItem');

const initializeCronJobs = () => {
    // Run every night at midnight (0 0 * * *)
    cron.schedule('0 0 * * *', async () => {
        console.log("⏰ Running Scheduled Maintenance: Archiving Stale Feed Items...");

        try {
            // Calculate Date 6 Months Ago
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            // Find items older than 6 months that are still open/pending
            const staleItems = await FeedItem.updateMany(
                {
                    createdAt: { $lt: sixMonthsAgo },
                    status: { $ne: 'resolved' }
                },
                {
                    $set: {
                        status: 'resolved',
                        description: "[SYSTEM ARCHIVED: Item Expired] "
                    }
                }
            );

            console.log(`✅ Archived ${staleItems.modifiedCount} stale items.`);
        } catch (error) {
            console.error("❌ Scheduled Maintenance Failed:", error);
        }
    });

    console.log("🕒 Cron Jobs Initialized (Midnight Maintenance active).");
};

module.exports = initializeCronJobs;
