import fs from "fs";
import axios from "axios";
import path from "path";

const VSCODE_STATE = path.join(
  process.env.APPDATA,
  "Code",
  "User",
  "globalStorage",
  "state.json"
);

let lastFolder = "";

// Send status to your backend
async function updateSlackStatus(folderName) {
  if (folderName === lastFolder) return;
  lastFolder = folderName;

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

// Read VS Code active folder
function getActiveVSCodeFolder() {
  try {
    const raw = fs.readFileSync(VSCODE_STATE, "utf8");
    const json = JSON.parse(raw);

    const list = json.openedPathsList?.workspaces3;

    if (!list || list.length === 0) return null;

    // VS Code stores paths like: file:///c:/Users/gamin/Desktop/Project
    const uri = list[0];
    const folderPath = uri.replace("file:///", "").replace(/\//g, "\\");

    const folderName = path.basename(folderPath);

    return folderName;
  } catch (err) {
    console.error("Watcher error:", err.message);
    return null;
  }
}

// Check every 5 seconds
setInterval(() => {
  const folder = getActiveVSCodeFolder();
  if (folder) updateSlackStatus(folder);
}, 5000);

console.log("Automatic VS Code folder tracking started.");