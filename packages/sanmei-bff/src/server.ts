import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { createCalculateDeps } from "./deps.js";

const deps = createCalculateDeps();
const app = createApp(deps);
const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`sanmei-bff listening on http://localhost:${info.port}`);
});
