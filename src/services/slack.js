const axios = require("axios");

async function updateSlackStatus(token, text) {
  try {
    await axios.post(
      "https://slack.com/api/users.profile.set",
      {
        profile: {
          status_text: text,
          status_emoji: ":computer:"
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    return { ok: true };
  } catch (err) {
    console.error("Slack error:", err.response?.data || err.message);
    return { ok: false, error: "Slack API request failed" };
  }
}

module.exports = { updateSlackStatus };