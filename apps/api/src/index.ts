import { loadEnv } from "./env";
import { handleRequest } from "./router";
import type { HttpRequest, HttpResponse, YcFunctionEvent } from "./types";

/** Entry point для Yandex Cloud Function (HTTP trigger). */
export async function handler(
  event: YcFunctionEvent,
): Promise<HttpResponse> {
  const env = loadEnv();
  const req: HttpRequest = {
    method: (event.httpMethod || "GET").toUpperCase(),
    path: normalizePath(event.path || event.url || "/"),
    headers: lowercaseHeaders(event.headers || {}),
    query: event.queryStringParameters || {},
    body: decodeBody(event),
  };
  try {
    return await handleRequest(req, env);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        error: "internal",
        message: "Внутренняя ошибка сервера",
        detail: msg,
      }),
    };
  }
}

function normalizePath(p: string): string {
  try {
    const u = new URL(p, "http://x");
    return u.pathname;
  } catch {
    return p.split("?")[0] || "/";
  }
}

function lowercaseHeaders(h: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of Object.keys(h)) {
    const v = h[k];
    if (typeof v === "string") out[k.toLowerCase()] = v;
  }
  return out;
}

function decodeBody(e: YcFunctionEvent): string {
  if (!e.body) return "";
  if (e.isBase64Encoded) return Buffer.from(e.body, "base64").toString("utf8");
  return e.body;
}

export default { handler };
