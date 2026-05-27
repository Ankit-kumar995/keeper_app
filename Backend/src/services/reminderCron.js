import cron from "node-cron";
import nodemailer from "nodemailer";
import Item from "../models/item.js";
import User from "../models/user.js";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Runs daily at 9:00 AM
cron.schedule("0 9 * * *", async () => {
  console.log("Running daily maintenance & warranty expiry audit...");
  try {
    const today = new Date();
    const alertLimit = new Date();
    alertLimit.setDate(today.getDate() + 7);

    const items = await Item.find({
      $or: [
        { warrantyExpiry:  { $gte: today, $lte: alertLimit } },
        { nextServiceDate: { $gte: today, $lte: alertLimit } },
      ],
    }).populate("userId");

    for (const item of items) {
      if (!item.userId || !item.userId.email) continue;

      const userEmail = item.userId.email;
      const userName  = item.userId.name;

      const mailOptions = {
        from:    `"Keeper Reminder" <${process.env.EMAIL_USER}>`,
        to:      userEmail,
        subject: `⚠️ Upcoming Reminder for: ${item.itemName}`,
        html: `
          <p>Hello ${userName},</p>
          <p>This is a notification for your item: <strong>${item.itemName}</strong>.</p>
          <ul>
            ${item.warrantyExpiry  && item.warrantyExpiry  <= alertLimit ? `<li><strong>Warranty Expiry Date:</strong> ${item.warrantyExpiry.toDateString()}</li>`  : ""}
            ${item.nextServiceDate && item.nextServiceDate <= alertLimit ? `<li><strong>Next Service Date:</strong> ${item.nextServiceDate.toDateString()}</li>` : ""}
          </ul>
          <p>Please log in to your Keeper App dashboard to view more details.</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    }
    console.log("Audit completed and reminder emails sent.");
  } catch (error) {
    console.error("Reminder service error:", error);
  }
});