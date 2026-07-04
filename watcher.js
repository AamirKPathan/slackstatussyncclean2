import fs from "fs";
import axios from "axios";
import path from "path";

// Change this to a REAL Windows folder path
const WATCH_FOLDER = "C:\\Users\\gamin\\OneDrive\\Desktop"; 

let lastStatus = "";

// Send status to your backend
async function updateSlackStatus(folderName) {
  if (folderName === lastStatus) return;
  lastStatus = folderName;

  try {
    await axios.post(
      "https://slackstatussyncclean2-production.up.railway.app/slack/status",
      {
        text: `Working in ${folderName}`,
        emoji: ":computer:"
      }
    );

    console.log(`Updated Slack status: Working in ${folderName}`);
  } catch (err) {
    console.error("Failed to update Slack:", err.message);
  }
}

// Scan the folder
function scanFolder() {
  try {
    const items = fs.readdirSync(WATCH_FOLDER);
    const activeItem = items[0] || "Unknown";

    updateSlackStatus(activeItem);
  } catch (err) {
    console.error("Watcher error:", err.message);
  }
}

// Check every 5 seconds
setInterval(scanFolder, 5000);

console.log("Watcher started. Monitoring:", WATCH_FOLDER);