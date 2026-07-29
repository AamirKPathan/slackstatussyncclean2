import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, service: "SlackStatusSync" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// OAuth routes
import oauthRoutes from "./routes/oauth.js";
app.use("/oauth", oauthRoutes);

// Slack routes (including /slack/token)
import slackRoutes from "./routes/slack.js";
app.use("/slack", slackRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
