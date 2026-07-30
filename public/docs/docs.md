# SlackStatusSync API Docs

Base URL:

```text
https://slackstatussyncclean2.programmingpathanaa.workers.dev
```

## GET /

Returns a basic service response.

```json
{"ok":true,"service":"SlackStatusSync"}
```

## GET /health

Returns a health check response.

```json
{"ok":true}
```

## GET /oauth/slack

Starts Slack OAuth. Open this route in a browser.

```text
https://slackstatussyncclean2.programmingpathanaa.workers.dev/oauth/slack
```

## GET /oauth/callback

Slack redirects here after approval. The Worker exchanges the temporary code for a Slack user token and stores it in Workers KV.

Configured redirect URL:

```text
https://slackstatussyncclean2.programmingpathanaa.workers.dev/oauth/callback
```

## GET /slack/token

Checks whether a Slack token is stored.

Example response:

```json
{"connected":true}
```

## POST /slack/status

Updates the connected user's Slack status.

Requires:

```text
Authorization: Bearer <WATCHER_API_KEY>
```

Request body:

```json
{
  "text": "Working in TestProject",
  "emoji": ":computer:"
}
```

PowerShell example:

```powershell
curl.exe -X POST "https://slackstatussyncclean2.programmingpathanaa.workers.dev/slack/status" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_WATCHER_API_KEY" `
  -d "{\"text\":\"Working in TestProject\",\"emoji\":\":computer:\"}"
```

## GET /status

Returns the latest status payload stored in Workers KV.

Example response:

```json
{
  "current": {
    "text": "Working in TestProject",
    "emoji": ":computer:",
    "updatedAt": "2026-07-30T00:00:00.000Z"
  }
}
```

## Cloudflare Bindings

Workers KV binding:

```text
STATUS_STORE
```

Cloudflare variables and secrets:

```text
SLACK_CLIENT_ID
SLACK_CLIENT_SECRET
SLACK_REDIRECT_URI
WATCHER_API_KEY
```

## Local Watcher

The local watcher sends status updates to:

```text
POST /slack/status
```

Local `.env`:

```text
BACKEND_URL=https://slackstatussyncclean2.programmingpathanaa.workers.dev
WATCHER_API_KEY=the-same-key-used-in-cloudflare
```
