# SlackStatusSync Agent

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-Required-green?logo=node.js)
![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen)
![Backend](https://img.shields.io/badge/Backend-Railway-blue?logo=railway)

SlackStatusSync Agent automatically updates your Slack status based on which folder on your Desktop you are actively working in. When you open or edit a project folder on your Desktop (especially in VS Code), your Slack status becomes:

**Working in <folder name>**

No manual updates. No clicking. Just automatic status based on your current project.

---

## Features

- **Automatic Desktop folder tracking**
- **VS Code friendly**
- **Instant Slack updates**
- **Runs locally and safely**
- **Only reads folder names, never file contents**

---

## Requirements

Before running SlackStatusSync Agent, make sure you have:

1. **Node.js** installed  
   Download from: https://nodejs.org  
   Install the LTS version.

2. **SlackStatusSync backend**  
   You do NOT need to deploy anything.  
   Use the official backend here:

   **https://slackstatussyncclean2-production.up.railway.app**

3. **Slack app permissions**  
   Your Slack app must have:  
   - `users.profile:write`  
   - `users.profile:read`

4. **Slack OAuth connection**  
   Visit your SlackStatusSync website and click **Connect Slack**.

---

## Files You Need

Your SlackStatusSync folder must contain:

```
SlackStatusSync/
├── watcher.js
├── package.json
```

### watcher.js  
This script:
- Watches your Desktop folders  
- Detects the most recently active folder  
- Sends updates to your backend  

### package.json  
This file defines dependencies:

```json
{
  "name": "slackstatussync",
  "version": "1.0.0",
  "main": "watcher.js",
  "dependencies": {
    "axios": "^1.6.0"
  }
}
```

---

## Download and Setup

### 1. Create the project folder

Create this folder on your Desktop:

```
C:\Users\gamin\OneDrive\Desktop\SlackStatusSync
```

### 2. Add the required files

Place these two files inside the folder:

- `watcher.js`
- `package.json`

(If you cloned from GitHub, they will already be there.)

### 3. Install dependencies

Open PowerShell or Command Prompt:

```
cd C:\Users\gamin\OneDrive\Desktop\SlackStatusSync
npm install
```

This installs `axios`.

---

## Configuration

Inside `watcher.js`, set your Desktop path:

```js
const DESKTOP = "C:\\Users\\gamin\\OneDrive\\Desktop";
```

Change it if your Desktop is somewhere else.

---

## How It Works

1. You open or edit a folder on your Desktop.  
2. Windows updates that folder’s “last modified” time.  
3. The watcher checks all Desktop folders.  
4. It finds the folder with the newest modified time.  
5. It sends that folder name to your backend:  
   https://slackstatussyncclean2-production.up.railway.app/slack/status  
6. Your backend updates your Slack status.

---

## Running the Watcher

Start the watcher:

```
node watcher.js
```

You should see:

```
Automatic Desktop folder tracking started.
Updated Slack status: Working in <folder>
```

---

## Testing

Open your backend URL:

```
https://slackstatussyncclean2-production.up.railway.app/slack/status
```

If you see any message, the backend is reachable.

---

## Troubleshooting

**Slack does not update**  
- Reconnect Slack OAuth  
- Ensure Slack app has `users.profile:write`  
- Check backend logs  

**Watcher errors**  
- Make sure the DESKTOP path is correct  

**Console says “Updated Slack status” but Slack did not change**  
- Backend received the request but Slack rejected it  
- Reinstall your Slack app to your workspace

---

## Privacy

SlackStatusSync Agent does not read your files, upload your code, track activity outside your Desktop, or store personal data. It only reads folder names.

---

## License

MIT License