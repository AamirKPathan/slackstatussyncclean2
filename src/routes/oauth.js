import express from "express";
import axios from "axios";
import fs from "fs";

const router = express.Router();

const CLIENT_ID = process.env.SLACK_CLIENT_ID;
const CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.SLACK_REDIRECT_URI ||
  "https://slackstatussyncclean2-production.up.railway.app/oauth/callback";

// Validate environment variables
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("ERROR: SLACK_CLIENT_ID or SLACK_CLIENT_SECRET is not set!");
}

// Step 1: Redirect user to Slack OAuth
router.get("/slack", (req, res) => {
  console.log("HIT /oauth/slack");

  if (!CLIENT_ID) {
    return res.status(500).send("Missing SLACK_CLIENT_ID environment variable");
  }

  const redirect = "https://slack.com/oauth/v2/authorize"
    + `?client_id=${CLIENT_ID}`
    + "&user_scope=users.profile:write,users.profile:read"
    + `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  console.log("Redirecting to Slack:", redirect);
  res.redirect(redirect);
});

// Step 2: Slack sends the temporary code here
router.get("/callback", async (req, res) => {
  console.log("HIT /oauth/callback");

  if (!CLIENT_SECRET) {
    return res.status(500).send("Missing SLACK_CLIENT_SECRET environment variable");
  }

  const code = req.query.code;
  console.log("Received code:", code);

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

    console.log("Slack OAuth response:", response.data);

    const token = response.data.authed_user?.access_token;
    console.log("Extracted user token:", token);

    // Show the exact file path being written
    const filePath = fs.realpathSync("./src/db/activity.json");
    console.log("Saving token to:", filePath);

    if (!token) {
      console.log("No token returned — NOT saving.");
      return res.status(500).send("OAuth failed: Slack did not return a user token.");
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    data.slackToken = token;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.send("Slack connected! You can close this window.");
  } catch (err) {
    console.error("OAuth error:", err.response?.data || err);
    res.status(500).send("OAuth failed");
  }
});

export default router;
