const JSON_HEADERS = {
  "Content-Type": "application/json",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}

function text(message, status = 200) {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

function getRedirectUri(request, env) {
  if (env.SLACK_REDIRECT_URI) {
    return env.SLACK_REDIRECT_URI;
  }

  const url = new URL(request.url);
  return `${url.origin}/oauth/callback`;
}

function getBearerToken(request) {
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

function hasWatcherAccess(request, env) {
  if (!env.WATCHER_API_KEY) {
    throw new Error("Missing WATCHER_API_KEY secret");
  }

  const token = getBearerToken(request) || request.headers.get("X-API-Key");
  return token === env.WATCHER_API_KEY;
}

async function getSlackToken(env) {
  if (!env.STATUS_STORE) {
    throw new Error("Missing STATUS_STORE KV binding");
  }

  return env.STATUS_STORE.get("slackToken");
}

async function handleOAuthStart(request, env) {
  if (!env.SLACK_CLIENT_ID) {
    return text("Missing SLACK_CLIENT_ID environment variable", 500);
  }

  const slackUrl = new URL("https://slack.com/oauth/v2/authorize");
  slackUrl.searchParams.set("client_id", env.SLACK_CLIENT_ID);
  slackUrl.searchParams.set("user_scope", "users.profile:write,users.profile:read");
  slackUrl.searchParams.set("redirect_uri", getRedirectUri(request, env));

  return Response.redirect(slackUrl.toString(), 302);
}

async function handleOAuthCallback(request, env) {
  if (!env.SLACK_CLIENT_ID) {
    return text("Missing SLACK_CLIENT_ID environment variable", 500);
  }

  if (!env.SLACK_CLIENT_SECRET) {
    return text("Missing SLACK_CLIENT_SECRET environment variable", 500);
  }

  if (!env.STATUS_STORE) {
    return text("Missing STATUS_STORE KV binding", 500);
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return text("Missing code", 400);
  }

  const body = new URLSearchParams({
    client_id: env.SLACK_CLIENT_ID,
    client_secret: env.SLACK_CLIENT_SECRET,
    code,
    redirect_uri: getRedirectUri(request, env),
  });

  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await response.json();
  const token = data.authed_user?.access_token;

  if (!data.ok || !token) {
    return json(
      {
        ok: false,
        error: data.error || "Slack did not return a user token",
      },
      500
    );
  }

  await env.STATUS_STORE.put("slackToken", token);

  return text("Slack connected! You can close this window.");
}

async function handleTokenCheck(env) {
  const token = await getSlackToken(env);
  return json({ connected: Boolean(token) });
}

async function handleStatusUpdate(request, env) {
  if (!hasWatcherAccess(request, env)) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const token = await getSlackToken(env);

  if (!token) {
    return text("No Slack token saved.", 400);
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const textValue = payload.text || "";
  const cleanEmoji = payload.emoji ? payload.emoji.replace(/:/g, "") : "computer";

  const response = await fetch("https://slack.com/api/users.profile.set", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      profile: {
        status_text: textValue,
        status_emoji: `:${cleanEmoji}:`,
      },
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    return json({ ok: false, error: data.error }, 400);
  }

  await env.STATUS_STORE.put(
    "current",
    JSON.stringify({
      text: textValue,
      emoji: `:${cleanEmoji}:`,
      updatedAt: new Date().toISOString(),
    })
  );

  return json(data);
}

async function handleCurrentStatus(env) {
  if (!env.STATUS_STORE) {
    return json({ ok: false, error: "Missing STATUS_STORE KV binding" }, 500);
  }

  const current = await env.STATUS_STORE.get("current", "json");
  return json({ current: current || null });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (request.method === "GET" && url.pathname === "/") {
        return json({ ok: true, service: "SlackStatusSync" });
      }

      if (request.method === "GET" && url.pathname === "/health") {
        return json({ ok: true });
      }

      if (request.method === "GET" && url.pathname === "/oauth/slack") {
        return handleOAuthStart(request, env);
      }

      if (request.method === "GET" && url.pathname === "/oauth/callback") {
        return handleOAuthCallback(request, env);
      }

      if (request.method === "GET" && url.pathname === "/slack/token") {
        return handleTokenCheck(env);
      }

      if (request.method === "POST" && url.pathname === "/slack/status") {
        return handleStatusUpdate(request, env);
      }

      if (request.method === "GET" && url.pathname === "/status") {
        return handleCurrentStatus(env);
      }

      return json({ ok: false, error: "Not found" }, 404);
    } catch (error) {
      return json({ ok: false, error: error.message }, 500);
    }
  },
};
