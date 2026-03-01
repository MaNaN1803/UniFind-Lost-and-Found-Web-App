const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify connection configuration on startup
if (process.env.NODE_ENV !== "test") {
    transporter.verify((error, success) => {
        if (error) {
            console.error(
                "\n❌ [EMAIL SYSTEM ERROR] Nodemailer failed to connect to SMTP."
            );
            console.error("Reason:", error.message);
            console.error(
                "Action Required: Ensure EMAIL_PASS is a 16-character Google App Password, not your regular Gmail password.\n"
            );
        } else {
            console.log("✅ [EMAIL] SMTP Server is Ready to take messages");
        }
    });
}

/**
 * Global utility to send emails.
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject line
 * @param {string} options.text - Plain text content
 * @param {string} [options.html] - Optional HTML content
 */
const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const mailOptions = {
            from: `"UniFind Alerts" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html, // Optional rich HTML body
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Email sent to ${to}: ${info.response}`);
        return { success: true, info };
    } catch (error) {
        console.error(`❌ Error sending email to ${to}:`, error);
        return { success: false, error };
    }
};

module.exports = { transporter, sendEmail };
