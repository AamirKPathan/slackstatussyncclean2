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

- Node.js installed  
- SlackStatusSync backend deployed  
- Slack app with:  
  - `users.profile:write`  
  - `users.profile:read`  
- Slack OAuth connected to your backend

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

## Installation

1. Place `watcher.js` and `package.json` in a folder.  
2. Open a terminal in that folder.  
3. Run:

```
npm install
```

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

---

# Step-by-Step Setup

## Step 1: Put the project on your Desktop
Create a folder named `SlackStatusSync` on your Desktop.  
Place `watcher.js` and `package.json` inside it.

## Step 2: Install dependencies
Open PowerShell in that folder and run:
```
npm install
```

## Step 3: Connect Slack
Go to your SlackStatusSync website.  
Click “Connect Slack”.  
Complete OAuth.  
Ensure your Slack app has:
- `users.profile:write`
- `users.profile:read`

## Step 4: Set your Desktop path
Open `watcher.js`.  
Find:
```js
const DESKTOP = "C:\\Users\\gamin\\OneDrive\\Desktop";
```
Change it if your Desktop is somewhere else.

## Step 5: Run the watcher
```
node watcher.js
```

## Step 6: Open a folder on your Desktop in VS Code
Your Slack status will update automatically.

## Step 7: Keep the watcher running
Leave the terminal open while you work.