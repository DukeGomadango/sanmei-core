import { Hono } from "hono";
import { calculate, SanmeiError, type CalculateDeps } from "@sanmei/sanmei-core";
import {
  internalErrorBody,
  logPayloadFromSanmeiError,
  malformedJsonBody,
  sanmeiErrorToHttp,
} from "./mapSanmeiErrorToHttp.js";

/** 空白・JSON 以外は null（→ MALFORMED_JSON） */
export function parseJsonBodyOrNull(text: string): unknown | null {
  const t = text.trim();
  if (!t) return null;
  try {
    return JSON.parse(t) as unknown;
  } catch {
    return null;
  }
}

const playgroundHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>sanmei-bff playground</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 1rem auto; padding: 0 1rem; }
    textarea { width: 100%; min-height: 12rem; font-family: ui-monospace, monospace; font-size: 0.875rem; }
    pre { background: #f4f4f5; padding: 1rem; overflow: auto; font-size: 0.8rem; }
    button { margin-top: 0.5rem; padding: 0.35rem 0.75rem; }
  </style>
</head>
<body>
  <h1>POST /api/v1/calculate</h1>
  <p>ローカル検証用。本番向けの認証・CORS は未設定です。</p>
  <textarea id="body">{
  "user": {
    "birthDate": "2000-06-15",
    "birthTime": "12:00",
    "timeZoneId": "Asia/Tokyo",
    "gender": "male"
  },
  "context": { "asOf": "2026-01-01", "timeZone": "Asia/Tokyo" },
  "systemConfig": { "sect": "takao", "rulesetVersion": "mock-v1" }
}</textarea>
  <div><button type="button" id="run">送信</button></div>
  <h2>応答</h2>
  <pre id="out">（送信すると表示）</pre>
  <script>
    document.getElementById('run').onclick = async function () {
      const out = document.getElementById('out');
      try {
        const res = await fetch('/api/v1/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: document.getElementById('body').value,
        });
        const text = await res.text();
        out.textContent = res.status + ' ' + res.statusText + '\\n' + text;
      } catch (e) {
        out.textContent = String(e);
      }
    };
  </script>
</body>
</html>
`;

export function createApp(deps: CalculateDeps): Hono {
  const app = new Hono();

  app.onError((err, c) => {
    if (err instanceof SanmeiError) {
      console.error("[sanmei-bff]", JSON.stringify(logPayloadFromSanmeiError(err)));
      const { status, body } = sanmeiErrorToHttp(err);
      if (status === 400) return c.json(body, 400);
      if (status === 422) return c.json(body, 422);
      return c.json(body, 500);
    }
    console.error("[sanmei-bff]", err);
    return c.json(internalErrorBody(), 500);
  });

  app.get("/", (c) =>
    c.newResponse(playgroundHtml, 200, {
      "Content-Type": "text/html; charset=utf-8",
    }),
  );

  app.post("/api/v1/calculate", async (c) => {
    const text = await c.req.text();
    const parsed = parseJsonBodyOrNull(text);
    if (parsed === null) {
      return c.json(malformedJsonBody(), 400);
    }
    const result = calculate(parsed, deps);
    return c.json(result);
  });

  return app;
}
