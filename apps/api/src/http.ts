import type { HttpRequest, HttpResponse } from "./types";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With, Idempotence-Key",
  "Access-Control-Max-Age": "86400",
};

export function json(
  statusCode: number,
  body: unknown,
  extra: Record<string, string> = {},
): HttpResponse {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
      ...extra,
    },
    body: JSON.stringify(body),
  };
}

export function text(
  statusCode: number,
  body: string,
  extra: Record<string, string> = {},
): HttpResponse {
  return {
    statusCode,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ...CORS_HEADERS,
      ...extra,
    },
    body,
  };
}

export function error(
  statusCode: number,
  code: string,
  message: string,
): HttpResponse {
  return json(statusCode, { error: code, message });
}

export function corsPreflight(): HttpResponse {
  return { statusCode: 204, headers: CORS_HEADERS, body: "" };
}

export function parseBody<T = unknown>(req: HttpRequest): T | null {
  if (!req.body) return null;
  try {
    return JSON.parse(req.body) as T;
  } catch {
    return null;
  }
}

export function getBearerToken(req: HttpRequest): string | null {
  const h = req.headers["authorization"] ?? req.headers["Authorization"];
  if (!h) return null;
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m && m[1] ? m[1].trim() : null;
}
