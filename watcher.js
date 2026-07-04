import fs from "fs";
import path from "path";
import axios from "axios";

// Change this to the folder you want to watch
const WATCH_FOLDER = "/Users/aamir/Projects";

let lastStatus = "";

function updateStatus(folderName) {
  if (folderName === lastStatus) return;
  lastStatus = folderName;

  axios.post("https://slackstatussyncclean2-production.up.railway.app/slack/status", {
    text: `Working in ${folderName}`,
    emoji: ":computer:"
  }).catch(err => {
    console.error("Failed to update Slack:", err.message);
  });
}

function scan() {
  try {
    const items = fs.readdirSync(WATCH_FOLDER);
    const active = items[0] || "Unknown";

    updateStatus(active);
  } catch (err) {
    console.error("Watcher error:", err.message);
  }
}

setInterval(scan, 5000); // check every 5 seconds