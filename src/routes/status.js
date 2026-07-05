import express from "express";
import fs from "fs";
import axios from "axios";

const router = express.Router();

const DB_PATH = "./src/db/activity.json";

router.get("/", (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    res.json({
        slackStatus: data.current,
    });
});

router.post("/", async (req, res) => {
    try {
        const { text, emoji } = req.body;
        
        if (!text) {
            return res.status(400).json({ ok: false, error: "Missing text field" });
        }

        // Read the stored Slack token
        const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
        const token = data.slackToken;

        if (!token) {
            return res.status(500).json({ ok: false, error: "Slack token not found. Run OAuth first." });
        }

        // Update Slack status
        const response = await axios.post(
            "https://slack.com/api/users.profile.set",
            {
                profile: {
                    status_text: text,
                    status_emoji: emoji || ":computer:"
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.data.ok) {
            console.error("Slack error:", response.data);
            return res.status(500).json({ ok: false, error: response.data.error });
        }

        // Save current status to database
        data.current = {
            text,
            emoji: emoji || ":computer:",
            timestamp: new Date().toISOString()
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

        console.log(`✓ Updated Slack status: ${text}`);
        res.json({ ok: true, message: "Status updated" });

    } catch (err) {
        console.error("Status update error:", err.message);
        res.status(500).json({ ok: false, error: err.message });
    }
});

export default router;