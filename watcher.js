import fs from "fs";
import axios from "axios";
import path from "path";

const POSSIBLE_PATHS = [
  // Standard VS Code install
  path.join(process.env.APPDATA, "Code", "User", "globalStorage", "state.json"),

  // VS Code (Microsoft Store)
  path.join(process.env.LOCALAPPDATA, "Packages", "Microsoft.VisualStudioCode_8wekyb3d8bbwe", "LocalState", "state.json"),

  // VS Code Insiders
  path.join(process.env.APPDATA, "Code - Insiders", "User", "globalStorage", "state.json"),

  // VSCodium
  path.join(process.env.APPDATA, "VSCodium", "User", "globalStorage", "state.json")
];

function findVSCodeStateFile() {
  for (const file of POSSIBLE_PATHS) {
    if (fs.existsSync(file)) {
      console.log("Found VS Code state file:", file);
      return file;
    }
  }
  console.log("No VS Code state.json found yet. Open a folder in VS Code.");
  return null;
}

let STATE_FILE = findVSCodeStateFile();
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

function getActiveVSCodeFolder() {
  try {
    if (!STATE_FILE || !fs.existsSync(STATE_FILE)) {
      STATE_FILE = findVSCodeStateFile();
      return null;
    }

    const raw = fs.readFileSync(STATE_FILE, "utf8");
    const json = JSON.parse(raw);

    const list = json.openedPathsList?.workspaces3;
    if (!list || list.length === 0) return null;

    const uri = list[0];
    const folderPath = uri.replace("file:///", "").replace(/\//g, "\\");
    const folderName = path.basename(folderPath);

    return folderName;
  } catch (err) {
    console.error("Watcher error:", err.message);
    return null;
  }
}

setInterval(() => {
  const folder = getActiveVSCodeFolder();
  if (folder) updateSlackStatus(folder);
}, 5000);

console.log("Automatic VS Code folder tracking started.");