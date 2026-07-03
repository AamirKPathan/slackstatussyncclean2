const express = require("express");
const fs = require("fs");
const router = express.Router();

const DB_PATH = "./src/db/activity.json";
const { updateSlackStatus } = require("../services/slack");

// GET /activity
router.get("/", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  res.json({
    current: data.current
  });
});

// POST /activity
router.post("/", async (req, res) => {
  const newActivity = req.body.activity;

  if (!newActivity) {
    return res.status(400).json({ error: "Missing 'activity' field" });
  }

  // Load DB
  const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));

  // Update current activity
  data.current = newActivity;

  // Add to history
  data.history.push({
    activity: newActivity,
    timestamp: Date.now()
  });

  // Save DB
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

  // Update Slack if token exists
  if (data.slackToken) {
    await updateSlackStatus(data.slackToken, newActivity);
  }

  res.json({ ok: true, activity: newActivity });
});

module.exports = router;
