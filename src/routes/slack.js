import express from "express";
import axios from "axios";
import fs from "fs";

const router = express.Router();

// View the saved Slack token
router.get("/token", (req, res) => {
  try {
    const filePath = fs.realpathSync("./src/db/activity.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    res.json({ slackToken: data.slackToken });
  } catch (err) {
    console.error("Error reading token:", err);
    res.status(500).send("Failed to read Slack token.");
  }
});

// Update Slack status
router.post("/status", async (req, res) => {
  const { text, emoji } = req.body;

  try {
    const filePath = fs.realpathSync("./src/db/activity.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const token = data.slackToken;

    if (!token) {
      return res.status(400).send("No Slack token saved.");
    }

    const response = await axios.post(
      "https://slack.com/api/users.profile.set",
      {
        profile: {
          status_text: text,
          status_emoji: emoji
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Slack status update error:", err.response?.data || err);
    res.status(500).send("Failed to update Slack status.");
  }
});

export default router;