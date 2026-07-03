# SlackStatusSync API Docs

## GET /activity
Returns your current activity.

## GET /status
Returns your current Slack status.

## POST /activity
Updates your activity and updates Slack.

Example:

curl -X POST https://your-api.com/activity \
     -H "Content-Type: application/json" \
     -d '{"activity": "Working on RaspAPI"}'