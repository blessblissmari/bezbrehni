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
    path: resolveRealPath(event),
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
    return decodeURIComponent(u.pathname);
  } catch {
    return decodeURIComponent(p.split("?")[0] || "/");
  }
}

/**
 * Yandex Cloud API Gateway + Cloud Functions (proxy_integration): когда маршрут
 * задан как `/{proxy+}`, в event.path приходит буквальный шаблон `/{proxy+}`,
 * а настоящий путь запроса — либо в event.url (там весь URL), либо в
 * event.params.proxy (там matched subpath), либо в event.requestContext.
 * Пробуем все источники.
 */
function resolveRealPath(event: YcFunctionEvent): string {
  const e = event as unknown as {
    path?: string;
    url?: string;
    params?: { proxy?: string };
    pathParameters?: { proxy?: string };
    requestContext?: { path?: string; resourcePath?: string; http?: { path?: string } };
  };

  const rawPath = e.path ?? "";
  const isProxyTemplate = /\{.*\+?\}/.test(decodeURIComponent(rawPath));

  if (!isProxyTemplate && rawPath) return normalizePath(rawPath);

  // Из event.url — это полная ссылка, из неё берём pathname
  if (e.url) {
    try {
      const u = new URL(e.url);
      return decodeURIComponent(u.pathname);
    } catch {
      /* ignore */
    }
  }
  // Из сопоставленного параметра proxy
  const proxy =
    e.params?.proxy ??
    e.pathParameters?.proxy ??
    e.requestContext?.path ??
    e.requestContext?.http?.path ??
    null;
  if (proxy) {
    const clean = proxy.startsWith("/") ? proxy : "/" + proxy;
    return normalizePath(clean);
  }
  return normalizePath(rawPath || "/");
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
