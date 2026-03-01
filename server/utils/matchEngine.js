const FeedItem = require("../models/feedItem");
const Notification = require("../models/notification");
const { User } = require("../models/user");
const { sendEmail } = require("./email");

// Calculate distance between two points in km using Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Extract tags/words
function getMeaningfulWords(text) {
    if (!text) return [];
    // remove the category prefix e.g. [Electronics]
    const cleanedText = text.replace(/^\[.*?\]/, '').toLowerCase();
    return cleanedText.match(/\b\w{4,}\b/g) || [];
}

async function runMatchEngine(newItem) {
    try {
        const oppType = newItem.type === "lost" ? "found" : "lost";

        // Extract category if it exists like [Electronics] Description...
        const categoryMatch = newItem.description.match(/^\[(.*?)\]/);
        const category = categoryMatch ? categoryMatch[1] : null;

        const query = { type: oppType, status: 'open' };

        // If a category was found, try to only match the other items with the same category prefix
        if (category) {
            query.description = new RegExp(`^\\[${category}\\]`, 'i');
        }

        const potentialMatches = await FeedItem.find(query);
        const newWords = getMeaningfulWords(newItem.description);

        for (const match of potentialMatches) {
            if (match.createdBy.toString() === newItem.createdBy.toString()) continue;

            let score = 0;

            // 1. Text similarity (Check overlapping meaningful words > 4 chars)
            const matchWords = getMeaningfulWords(match.description);
            const overlap = newWords.filter(word => matchWords.includes(word));

            // If we have some significant keyword overlaps
            if (overlap.length >= 2) score += 40;
            else if (overlap.length === 1) score += 20;

            // 2. Geographic proximity (If both have locations)
            if (newItem.location?.lat && match.location?.lat) {
                const distance = getDistanceFromLatLonInKm(
                    newItem.location.lat, newItem.location.lng,
                    match.location.lat, match.location.lng
                );
                if (distance !== null && distance <= 2) {
                    score += 40; // High confidence if extremely close (< 2km)
                } else if (distance !== null && distance <= 10) {
                    score += 20; // Medium confidence (< 10km)
                }
            }

            // Strong match confident threshold
            if (score >= 40) {
                // Dispatch notifications to the NEW item creator 
                const creatorUser = await User.findById(newItem.createdBy);

                const actionText = newItem.type === 'lost' ? 'Someone may have found your lost item!' : 'Someone lost an item that sounds like the one you found!';

                await new Notification({
                    userId: newItem.createdBy,
                    type: 'match_alert',
                    message: `Match Alert: ${actionText} Check the feed.`,
                    link: `/item/${match._id}`
                }).save();

                if (creatorUser && creatorUser.email) {
                    await sendEmail({
                        to: creatorUser.email,
                        subject: "UniFind - Potential Item Match Alert! 🔔",
                        text: `Hello ${creatorUser.firstName},\n\nWe found a potential match for the exact item you just reported.\n\nPlease check it out here: ${process.env.BASE_URL || 'http://localhost:3000'}/item/${match._id}\n\nThank you!`,
                        html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #3b82f6;">Potential Match Found! 🔔</h2>
                            <p>Hello ${creatorUser.firstName},</p>
                            <p>Our matching engine just found a highly similar item to the one you recently reported.</p>
                            <a href="${process.env.BASE_URL || 'https://unifind-lost-and-found.vercel.app'}/item/${match._id}" style="display: inline-block; padding: 10px 20px; margin-top: 10px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">View Potential Match</a>
                        </div>
                        `
                    });
                }

                // We can also notify the matched user (the older item's owner)
                const matchOwnerUser = await User.findById(match.createdBy);

                const oppActionText = match.type === 'lost' ? 'Someone may have found your lost item!' : 'Someone lost an item that sounds like the one you found!';

                await new Notification({
                    userId: match.createdBy,
                    type: 'match_alert',
                    message: `Match Alert: ${oppActionText} Check the feed.`,
                    link: `/item/${newItem._id}`
                }).save();

                if (matchOwnerUser && matchOwnerUser.email) {
                    await sendEmail({
                        to: matchOwnerUser.email,
                        subject: "UniFind - Potential Item Match Alert! 🔔",
                        text: `Hello ${matchOwnerUser.firstName},\n\nWe found a potential match for the item you previously reported. Someone just posted something very similar.\n\nPlease check it out here: ${process.env.BASE_URL || 'http://localhost:3000'}/item/${newItem._id}\n\nThank you!`,
                        html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #3b82f6;">Potential Match Activity! 🔔</h2>
                            <p>Hello ${matchOwnerUser.firstName},</p>
                            <p>Someone just posted an item that sounds very similar to the one you previously reported. It might be exactly what you're looking for!</p>
                            <a href="${process.env.BASE_URL || 'https://unifind-lost-and-found.vercel.app'}/item/${newItem._id}" style="display: inline-block; padding: 10px 20px; margin-top: 10px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">View New Listing</a>
                        </div>
                        `
                    });
                }
            }
        }
    } catch (err) {
        console.error("Match Engine Error", err);
    }
}

module.exports = { runMatchEngine };
