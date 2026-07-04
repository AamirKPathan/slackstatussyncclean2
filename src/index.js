import express from "express";
import fetch from "node-fetch";

if (process.env.RAILWAY_ENVIRONMENT !== "production") {
  await import("./local-env.js");
}

const app = express();
const PORT = process.env.PORT || 8080;

// Hard-coded redirect URL (Railway does NOT provide this automatically)
const REDIRECT_URI = "https://slackstatussyncclean2-production.up.railway.app/oauth/callback";

// Route to start Slack OAuth
app.get("/oauth/slack", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID,
    user_scope: "users.profile:read,users.profile:write",
    redirect_uri: REDIRECT_URI
  });

  res.redirect(`https://slack.com/oauth/v2/authorize?${params.toString()}`);
});

// Route Slack redirects back to
app.get("/oauth/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("Missing code parameter.");
  }

  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID,
    client_secret: process.env.SLACK_CLIENT_SECRET,
    code,
    redirect_uri: REDIRECT_URI
  });

  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    body: params
  });

  const data = await response.json();

  if (!data.ok) {
    console.error("Slack OAuth error:", data);
    return res.status(500).send("Slack OAuth failed.");
  }

  const userToken = data.authed_user.access_token;

  console.log("User Slack Token:", userToken);

  res.send("SlackStatusSync installed successfully!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});