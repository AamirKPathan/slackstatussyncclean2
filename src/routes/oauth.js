const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");

const CLIENT_ID = process.env.SLACK_CLIENT_ID;
const CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;
const BASE_URL = process.env.SLACK_APP_URL || process.env.APP_URL || "http://localhost:3000";
const REDIRECT_URI = `${BASE_URL.replace(/\/$/, "")}/oauth/callback`;

// Step 1: Redirect user to Slack OAuth
router.get("/slack", (req, res) => {
  const redirect = "https://slack.com/oauth/v2/authorize"
    + `?client_id=${CLIENT_ID}`
    + "&scope=users.profile:write"
    + "&user_scope=users.profile:write"
    + `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  res.redirect(redirect);
});

// Step 2: Slack sends the temporary code here
router.get("/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("Missing code");
  }

  try {
    const response = await axios.post(
      "https://slack.com/api/oauth.v2.access",
      null,
      {
        params: {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri: REDIRECT_URI
        }
      }
    );

    const token = response.data.authed_user.access_token;

    // Save token
    const data = JSON.parse(fs.readFileSync("./src/db/activity.json", "utf8"));
    data.slackToken = token;
    fs.writeFileSync("./src/db/activity.json", JSON.stringify(data, null, 2));

    res.send("Slack connected! You can close this window.");
  } catch (err) {
    console.error(err);
    res.status(500).send("OAuth failed");
  }
});

module.exports = router;