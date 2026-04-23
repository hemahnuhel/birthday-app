require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const path = require("path");

const app = express();

//database

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  dob:      { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// middleware

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// routes

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// Add a user
app.post("/api/users", async (req, res) => {
  const { email, dob } = req.body;
  const username = req.body.username?.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  if (!username || !email || !dob)
    return res.status(400).json({ error: "All fields are required." });

  try {
    const user = await User.create({ username, email, dob });
    res.status(201).json({ message: "User added successfully.", user });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ error: "Email already registered." });
    res.status(500).json({ error: "Failed to add user." });
  }
});

// Delete a user
app.delete("/api/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user." });
  }
});

// Manual trigger for testing
app.post("/api/test-birthday-check", async (req, res) => {
  const result = await checkAndSendBirthdays();
  res.json(result);
});

// email

const birthdayEmailHTML = require("./emailTemplate");

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

async function checkAndSendBirthdays() {
  const now = new Date();
  const todayMonth = String(now.getMonth() + 1).padStart(2, "0");
  const todayDay = String(now.getDate()).padStart(2, "0");

  try {
    const users = await User.find();
    const celebrants = users.filter((u) => {
      const [, month, day] = u.dob.split("-");
      return month === todayMonth && day === todayDay;
    });

    if (celebrants.length === 0) {
      console.log(`[${new Date().toISOString()}] No birthdays today.`);
      return { sent: 0, celebrants: [] };
    }

    const transporter = createTransporter();
    const results = [];

    for (const user of celebrants) {
      try {
        await transporter.sendMail({
          from: `"Birthday Wishes 🎂" <${process.env.GMAIL_USER}>`,
          to: user.email,
          subject: `🎉 Happy Birthday, ${user.username}!`,
          html: birthdayEmailHTML(user.username),
        });
        console.log(`[Birthday] Email sent to ${user.email}`);
        results.push({ email: user.email, status: "sent" });
      } catch (err) {
        console.error(`[Birthday] Failed to send to ${user.email}:`, err.message);
        results.push({ email: user.email, status: "failed", error: err.message });
      }
    }

    return { sent: results.filter((r) => r.status === "sent").length, results };
  } catch (err) {
    console.error("[Birthday] DB error:", err.message);
    return { sent: 0, error: err.message };
  }
}

// cron: every day at 7:00 AM

cron.schedule("0 7 * * *", () => {
  console.log("[Cron] Running birthday check...");
  checkAndSendBirthdays();
});

// start

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Birthday App running at http://localhost:${PORT}`);
  console.log("Cron job scheduled: daily at 7:00 AM");
});