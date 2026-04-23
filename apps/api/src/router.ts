import { verifyJwt } from "./crypto";
import type { Env } from "./env";
import { corsPreflight, error, getBearerToken, json } from "./http";
import { postAnalyze, postProAction } from "./routes/analyze";
import { postLogin, postLogout, postSignup } from "./routes/auth";
import {
  getStatus,
  postCreatePayment,
  postWebhook,
} from "./routes/billing";
import { getMe, getUsage } from "./routes/user";
import type { HttpRequest, HttpResponse } from "./types";

function requireAuth(req: HttpRequest, env: Env): string | HttpResponse {
  const token = getBearerToken(req);
  if (!token) return error(401, "unauthorized", "Требуется вход");
  const payload = verifyJwt<{ sub?: string }>(token, env.JWT_SECRET);
  if (!payload || !payload.sub) return error(401, "unauthorized", "Сессия истекла");
  return payload.sub;
}

export async function handleRequest(
  req: HttpRequest,
  env: Env,
): Promise<HttpResponse> {
  if (req.method === "OPTIONS") return corsPreflight();

  const p = req.path.replace(/\/+$/, "") || "/";

  if (p === "/" && req.method === "GET") {
    return json(200, { name: "bezbrehni-api", ok: true });
  }
  if (p === "/health" && req.method === "GET") {
    return json(200, { ok: true });
  }

  // Публичные
  if (p === "/auth/signup" && req.method === "POST") return postSignup(req, env);
  if (p === "/auth/login" && req.method === "POST") return postLogin(req, env);
  if (p === "/auth/logout" && req.method === "POST") return postLogout();
  if (p === "/billing/webhook" && req.method === "POST") return postWebhook(req, env);

  // Защищённые
  const auth = requireAuth(req, env);
  if (typeof auth !== "string") return auth;
  const userId = auth;

  if (p === "/user/me" && req.method === "GET") return getMe(userId);
  if (p === "/usage" && req.method === "GET") return getUsage(userId);
  if (p === "/analyze" && req.method === "POST") return postAnalyze(req, env, userId);
  if (p === "/analyze/pro-action" && req.method === "POST")
    return postProAction(req, env, userId);
  if (p === "/billing/create-payment" && req.method === "POST")
    return postCreatePayment(req, env, userId);
  if (p === "/billing/status" && req.method === "GET") return getStatus(userId);

  return error(404, "not_found", "Маршрут не найден");
}
