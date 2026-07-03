const express = require("express");
const fs = require("fs");
const router = express.Router();

const DB_PATH = "./src/db/activity.json";

// POST /auth/slack
router.post("/slack", (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(400).json({ error: "Missing 'token' field" });
  }

  const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  data.slackToken = token;

  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

  res.json({ ok: true, message: "Slack token saved" });
});

module.exports = router;
