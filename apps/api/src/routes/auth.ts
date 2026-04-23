import { isValidEmail, isValidPassword } from "@bezbrehni/shared";
import { hashPassword, signJwt, verifyPassword } from "../crypto";
import { getRepo } from "../db/index";
import type { Env } from "../env";
import { error, json, parseBody } from "../http";
import type { HttpRequest, HttpResponse } from "../types";

function makeToken(env: Env, userId: string) {
  return signJwt({ sub: userId }, env.JWT_SECRET);
}

export async function postSignup(req: HttpRequest, env: Env): Promise<HttpResponse> {
  const body = parseBody<{ email?: string; password?: string }>(req);
  if (!body) return error(400, "bad_request", "Некорректный запрос");
  const { email, password } = body;
  if (!isValidEmail(email)) return error(400, "invalid_email", "Неверный email");
  if (!isValidPassword(password))
    return error(400, "invalid_password", "Пароль должен быть не короче 8 символов");
  const repo = await getRepo();
  const existing = await repo.findUserByEmail(email);
  if (existing) return error(409, "email_taken", "Такой email уже зарегистрирован");
  const user = await repo.createUser({
    email,
    password_hash: hashPassword(password),
  });
  return json(200, {
    token: makeToken(env, user.id),
    user: { id: user.id, email: user.email, created_at: user.created_at },
  });
}

export async function postLogin(req: HttpRequest, env: Env): Promise<HttpResponse> {
  const body = parseBody<{ email?: string; password?: string }>(req);
  if (!body) return error(400, "bad_request", "Некорректный запрос");
  const { email, password } = body;
  if (!isValidEmail(email) || !isValidPassword(password))
    return error(401, "invalid_credentials", "Неверный email или пароль");
  const repo = await getRepo();
  const user = await repo.findUserByEmail(email);
  if (!user) return error(401, "invalid_credentials", "Неверный email или пароль");
  if (!verifyPassword(password, user.password_hash))
    return error(401, "invalid_credentials", "Неверный email или пароль");
  return json(200, {
    token: makeToken(env, user.id),
    user: { id: user.id, email: user.email, created_at: user.created_at },
  });
}

export async function postLogout(): Promise<HttpResponse> {
  // Токен JWT — stateless, клиент просто забывает его. Возвращаем 200 для симметрии.
  return json(200, { ok: true });
}
