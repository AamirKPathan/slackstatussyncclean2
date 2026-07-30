import fs from "fs";
import axios from "axios";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Your Desktop path
const DESKTOP = "C:\\Users\\gamin\\OneDrive\\Desktop";
const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://slackstatussyncclean2-production.up.railway.app";
const WATCHER_API_KEY = process.env.WATCHER_API_KEY;

let lastFolder = "";

// Send status to your backend
async function updateSlackStatus(folderName) {
  if (folderName === lastFolder) return;
  lastFolder = folderName;

  try {
    await axios.post(
      `${BACKEND_URL.replace(/\/$/, "")}/slack/status`,
      {
        text: `Working in ${folderName}`,
        emoji: ":computer:"
      },
      {
        headers: WATCHER_API_KEY
          ? { Authorization: `Bearer ${WATCHER_API_KEY}` }
          : {}
      }
    );

    console.log(`Updated Slack status: Working in ${folderName}`);
  } catch (err) {
    console.error("Failed to update Slack:", err.message);
  }
}

// Detect the most recently active folder on Desktop
function getActiveDesktopFolder() {
  try {
    const items = fs.readdirSync(DESKTOP);

    let newestFolder = null;
    let newestTime = 0;

    for (const item of items) {
      const fullPath = path.join(DESKTOP, item);
      const stats = fs.statSync(fullPath);

      // Only track folders
      if (stats.isDirectory()) {
        const modified = stats.mtimeMs;

        // VS Code updates the folder when you open or save files
        if (modified > newestTime) {
          newestTime = modified;
          newestFolder = item;
        }
      }
    }

    return newestFolder || null;
  } catch (err) {
    console.error("Watcher error:", err.message);
    return null;
  }
}

// Check every 5 seconds
setInterval(() => {
  const folder = getActiveDesktopFolder();
  if (folder) updateSlackStatus(folder);
}, 5000);

console.log("Automatic Desktop folder tracking started.");
