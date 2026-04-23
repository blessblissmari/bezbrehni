/**
 * Локальный dev-сервер. Эмулирует Yandex Cloud Functions HTTP trigger,
 * проксируя запросы в `handler` из `src/index.ts`.
 * Запускается через `pnpm dev:api`.
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { handler } from "./index";

function loadDotEnv() {
  try {
    const path = resolve(process.cwd(), "../../.env");
    const content = readFileSync(path, "utf8");
    for (const line of content.split("\n")) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (!m) continue;
      const [, k, v] = m as unknown as [string, string, string];
      if (!(k in process.env)) process.env[k] = v.replace(/^"|"$/g, "");
    }
    console.log("Loaded .env from", path);
  } catch {
    // no-op
  }
}

loadDotEnv();
if (!process.env.BEZBREHNI_DB) process.env.BEZBREHNI_DB = "memory";
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = "dev-insecure-secret-change-me";

const port = Number(process.env.PORT || 8787);

const server = createServer(async (req, res) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const body = Buffer.concat(chunks).toString("utf8");
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const query: Record<string, string> = {};
  for (const [k, v] of url.searchParams.entries()) query[k] = v;
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === "string") headers[k] = v;
    else if (Array.isArray(v)) headers[k] = v.join(",");
  }

  const event = {
    httpMethod: req.method || "GET",
    path: url.pathname,
    headers,
    queryStringParameters: query,
    body,
    isBase64Encoded: false,
  };

  try {
    const result = await handler(event);
    res.writeHead(result.statusCode, result.headers);
    res.end(result.body);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "dev_server", message: msg }));
  }
});

server.listen(port, () => {
  console.log(`bezbrehni-api dev-server on http://localhost:${port}`);
});
