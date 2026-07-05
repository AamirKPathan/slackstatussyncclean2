# SlackStatusSync Agent

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
   - Download it from [https://nodejs.org](https://nodejs.org)  
   - Choose the **LTS version** (recommended for stability)  
   - Follow the installer prompts and restart your computer if needed  

2. **SlackStatusSync backend** deployed  
   - You can host it on [Railway](https://railway.app) or any Node.js‑compatible hosting service  
   - The backend must expose an endpoint like:  
     `https://your-backend-url/slack/status`

3. **Slack app** connected to your workspace  
   - Go to [https://api.slack.com/apps](https://api.slack.com/apps)  
   - Create a new app or use an existing one  
   - Add these permissions under **OAuth & Permissions**:  
     - `users.profile:write`  
     - `users.profile:read`  
   - Reinstall the app to your workspace after adding permissions  

4. **Slack OAuth connection**  
   - Visit your SlackStatusSync website  
   - Click **Connect Slack**  
   - Complete the authorization flow  

---

## Files You Need

Your project folder should contain:

```
SlackStatusSync/
├── watcher.js
├── package.json
```

### watcher.js
This is the local script that:
- Watches your Desktop folders
- Detects the most recently active folder
- Sends updates to your backend

### package.json
This file defines dependencies and project info.  
It should include at least:

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

1. **Create a folder on your Desktop**
   ```
   C:\Users\gamin\OneDrive\Desktop\SlackStatusSync
   ```

2. **Download the files**
   - Copy `watcher.js` and `package.json` into that folder  
   - Or clone from your repository:
     ```
     git clone https://github.com/yourusername/SlackStatusSync.git
     ```

3. **Install dependencies**
   Open PowerShell or Command Prompt in that folder:
   ```
   cd C:\Users\gamin\OneDrive\Desktop\SlackStatusSync
   npm install
   ```

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
5. It sends that folder name to your backend.  
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
https://<your-backend>/slack/status
```

If you see any message, your backend is reachable.

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
