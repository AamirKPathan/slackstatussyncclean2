# SlackStatusSync Agent

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-Required-green?logo=node.js)
![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen)
![Backend](https://img.shields.io/badge/Backend-Cloudflare%20Workers-orange?logo=cloudflare)

SlackStatusSync Agent automatically updates your Slack status based on the Desktop folder you are actively working in. When you open or edit a project folder, your Slack status becomes:

```text
Working in <folder name>
```

The local watcher detects folder activity. The hosted Cloudflare Worker receives that activity and updates Slack.

## Architecture

```text
watcher.js on your computer
  -> Cloudflare Worker backend
  -> Workers KV token storage
  -> Slack API
  -> your Slack status
```

The current production backend is:

```text
https://slackstatussyncclean2.programmingpathanaa.workers.dev
```

Cloudflare Workers runs the backend from [src/worker.js](src/worker.js). Workers KV stores the connected Slack token and the most recent status.

The older Express backend files in [src/index.js](src/index.js) and [src/routes](src/routes) are kept for normal Node hosting, but Cloudflare uses [src/worker.js](src/worker.js).

## Features

- Automatic Desktop folder tracking
- VS Code friendly
- Cloudflare Worker backend
- Workers KV token storage
- Slack OAuth connection
- Protected status update endpoint using `WATCHER_API_KEY`
- Only reads folder names, never file contents

## Requirements

Before running SlackStatusSync, you need:

1. Node.js installed locally.
2. A deployed Cloudflare Worker.
3. A Workers KV namespace bound to the Worker as `STATUS_STORE`.
4. A Slack app with these user scopes:

```text
users.profile:write
users.profile:read
```

5. A local `.env` file for your watcher settings. `.env` is ignored by Git.

## Cloudflare Setup

The Worker deploy config lives in [wrangler.jsonc](wrangler.jsonc).

Cloudflare build settings:

```text
Build command: echo "No build step"
Deploy command: npx wrangler deploy
Production branch: main
Non-production branch builds: Off
```

The KV namespace is configured in `wrangler.jsonc`:

```json
"kv_namespaces": [
  {
    "binding": "STATUS_STORE",
    "id": "6b5fe272b73f49debb1745b929671e7b"
  }
]
```

The Worker needs these runtime values in Cloudflare under **Settings -> Variables & Secrets**:

```text
SLACK_CLIENT_ID      Text/Variable  Slack app Client ID
SLACK_CLIENT_SECRET  Secret         Slack app Client Secret
SLACK_REDIRECT_URI   Text/Variable  https://slackstatussyncclean2.programmingpathanaa.workers.dev/oauth/callback
WATCHER_API_KEY      Secret         Long random shared key for watcher.js
```

Use the same `WATCHER_API_KEY` in Cloudflare and in your local `.env`.

## Slack App Setup

In your Slack app, go to **OAuth & Permissions** and add this redirect URL:

```text
https://slackstatussyncclean2.programmingpathanaa.workers.dev/oauth/callback
```

Make sure the Slack app has these user token scopes:

```text
users.profile:write
users.profile:read
```

Then open this URL in your browser:

```text
https://slackstatussyncclean2.programmingpathanaa.workers.dev/oauth/slack
```

Approve Slack. If it works, the page says:

```text
Slack connected! You can close this window.
```

The Worker stores the Slack user token in Workers KV under the `slackToken` key.

## Local Watcher Setup

Install dependencies:

```powershell
npm install
```

Create a local `.env` file with:

```text
BACKEND_URL=https://slackstatussyncclean2.programmingpathanaa.workers.dev
WATCHER_API_KEY=the-same-key-you-added-to-cloudflare
```

The watcher currently checks this Desktop path in [watcher.js](watcher.js):

```js
const DESKTOP = "C:\\Users\\gamin\\OneDrive\\Desktop";
```

Change it if your Desktop path is different.

Run the watcher:

```powershell
node watcher.js
```

Expected output:

```text
Automatic Desktop folder tracking started.
Updated Slack status: Working in <folder>
```

## How It Works

1. You open or edit a folder on your Desktop.
2. Windows updates that folder's last modified time.
3. `watcher.js` checks Desktop folders every 5 seconds.
4. It finds the newest modified folder.
5. It sends this request to the Worker:

```text
POST /slack/status
Authorization: Bearer <WATCHER_API_KEY>
```

6. The Worker reads the Slack token from Workers KV.
7. The Worker calls Slack's `users.profile.set` API.
8. Your Slack status changes to `Working in <folder name>`.

## Testing

Health check:

```text
https://slackstatussyncclean2.programmingpathanaa.workers.dev/health
```

Expected response:

```json
{"ok":true}
```

Slack connection check:

```text
https://slackstatussyncclean2.programmingpathanaa.workers.dev/slack/token
```

Expected response after OAuth:

```json
{"connected":true}
```

Manual status update test:

```powershell
curl.exe -X POST "https://slackstatussyncclean2.programmingpathanaa.workers.dev/slack/status" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_WATCHER_API_KEY" `
  -d "{\"text\":\"Working in TestProject\",\"emoji\":\":computer:\"}"
```

## Troubleshooting

**Cloudflare deploy fails with static file detection error**

Make sure [wrangler.jsonc](wrangler.jsonc) exists and points to:

```text
main: src/worker.js
```

**Worker says `Missing STATUS_STORE KV binding`**

Make sure the KV namespace is bound as:

```text
STATUS_STORE
```

**Worker says `Missing WATCHER_API_KEY secret`**

Add `WATCHER_API_KEY` under Cloudflare **Variables & Secrets**, then use the same value in local `.env`.

**Slack OAuth fails**

Check all three places use the same callback URL:

```text
https://slackstatussyncclean2.programmingpathanaa.workers.dev/oauth/callback
```

The URL must appear in:

- Cloudflare `SLACK_REDIRECT_URI`
- Slack app OAuth redirect URLs
- The browser URL used to start OAuth: `/oauth/slack`

**Watcher says updated but Slack does not change**

Check:

- Slack OAuth was completed.
- `/slack/token` returns `{"connected":true}`.
- Slack app has `users.profile:write`.
- Local `.env` has the correct `BACKEND_URL` and `WATCHER_API_KEY`.

## Security

- Do not commit `.env`.
- Store `SLACK_CLIENT_SECRET` and `WATCHER_API_KEY` as Cloudflare secrets.
- `POST /slack/status` requires `WATCHER_API_KEY`.
- Rotate any secret that was ever pushed to GitHub.

## Privacy

SlackStatusSync does not read your files, upload your code, or inspect file contents. The local watcher only reads Desktop folder names and modified timestamps.

## License

MIT License
