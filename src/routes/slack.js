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

    // Clean up emoji format - remove colons if present
    const cleanEmoji = emoji ? emoji.replace(/:/g, '') : 'computer';

    console.log(`Updating Slack with text: "${text}", emoji: "${cleanEmoji}"`);

    const response = await axios.post(
      "https://slack.com/api/users.profile.set",
      {
        profile: {
          status_text: text,
          status_emoji: `:${cleanEmoji}:`
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Slack response:", response.data);

    if (!response.data.ok) {
      console.error("Slack API error:", response.data.error);
      return res.status(400).json({ ok: false, error: response.data.error });
    }

    res.json(response.data);
  } catch (err) {
    console.error("Slack status update error:", err.response?.data || err.message);
    res.status(500).json({ 
      ok: false, 
      error: err.response?.data?.error || err.message 
    });
  }
});

export default router;