import express from "express";
import fetch from "node-fetch";

if (process.env.RAILWAY_ENVIRONMENT !== "production") {
  await import("./local-env.js");
}

const app = express();
const PORT = process.env.PORT || 8080;

// Hard-coded redirect URL
const REDIRECT_URI = "https://slackstatussyncclean2-production.up.railway.app/oauth/callback";

// --- LOGGING TO CONFIRM ROUTES ARE HIT ---
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

// --- ROUTE: START SLACK OAUTH ---
app.get("/oauth/slack", (req, res) => {
  console.log("HIT /oauth/slack");

  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID,
    user_scope: "users.profile:read,users.profile:write",
    redirect_uri: REDIRECT_URI
  });

  const slackURL = `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  console.log("Redirecting to Slack:", slackURL);

  res.redirect(slackURL);
});

// --- ROUTE: SLACK CALLBACK ---
app.get("/oauth/callback", async (req, res) => {
  console.log("HIT /oauth/callback");

  const code = req.query.code;
  console.log("Received code:", code);

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
  console.log("Slack OAuth response:", data);

  if (!data.ok) {
    return res.status(500).send("Slack OAuth failed.");
  }

  const userToken = data.authed_user.access_token;
  console.log("User Slack Token:", userToken);

  res.send("SlackStatusSync installed successfully!");
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});