import { AiService } from "@bezbrehni/ai";
import { isProAction, sanitizeText } from "@bezbrehni/shared";
import { randomUUID } from "node:crypto";
import { computeAccess } from "../access";
import { getRepo } from "../db/index";
import type { Env } from "../env";
import { error, json, parseBody } from "../http";
import type { HttpRequest, HttpResponse } from "../types";

function makeAi(env: Env) {
  return new AiService({
    apiKey: env.YANDEX_GPT_API_KEY,
    folderId: env.YANDEX_GPT_FOLDER_ID,
    model: env.YANDEX_GPT_MODEL,
  });
}

export async function postAnalyze(
  req: HttpRequest,
  env: Env,
  userId: string,
): Promise<HttpResponse> {
  const body = parseBody<{
    text?: unknown;
    page_url?: unknown;
    page_title?: unknown;
  }>(req);
  if (!body) return error(400, "bad_request", "Некорректный запрос");
  const text = sanitizeText(body.text, 12000);
  if (text.length < 10) return error(400, "text_too_short", "Текст слишком короткий для анализа");

  const repo = await getRepo();
  const access = await computeAccess(repo, userId);
  if (!access.canBasicCheck) {
    return error(
      402,
      "limit_reached",
      "Бесплатные проверки закончились. Оформите Pro, чтобы продолжить.",
    );
  }

  if (!env.YANDEX_GPT_API_KEY || !env.YANDEX_GPT_FOLDER_ID) {
    return error(
      503,
      "ai_not_configured",
      "AI временно недоступен. Попробуйте чуть позже.",
    );
  }

  const ai = makeAi(env);
  const result = await ai.basicCheck({
    text,
    pageTitle: typeof body.page_title === "string" ? body.page_title : undefined,
    pageUrl: typeof body.page_url === "string" ? body.page_url : undefined,
  });

  await repo.recordUsage(userId, "analyze");
  await repo.recordAnalysis({
    id: randomUUID(),
    user_id: userId,
    verdict: result.verdict,
    text_preview: text.slice(0, 200),
    page_url: typeof body.page_url === "string" ? body.page_url : null,
    created_at: new Date().toISOString(),
  });

  return json(200, { result, usage: { used_total: access.usedTotal + 1 } });
}

export async function postProAction(
  req: HttpRequest,
  env: Env,
  userId: string,
): Promise<HttpResponse> {
  const body = parseBody<{
    text?: unknown;
    action?: unknown;
    question?: unknown;
    page_url?: unknown;
    page_title?: unknown;
  }>(req);
  if (!body) return error(400, "bad_request", "Некорректный запрос");
  if (!isProAction(body.action)) return error(400, "bad_action", "Неизвестное действие");
  const text = sanitizeText(body.text, 12000);
  if (text.length < 10) return error(400, "text_too_short", "Текст слишком короткий");

  const repo = await getRepo();
  const access = await computeAccess(repo, userId);
  if (!access.canProAction) {
    return error(402, "pro_required", "Это действие доступно в Pro.");
  }

  if (!env.YANDEX_GPT_API_KEY || !env.YANDEX_GPT_FOLDER_ID) {
    return error(
      503,
      "ai_not_configured",
      "AI временно недоступен. Попробуйте чуть позже.",
    );
  }

  const ai = makeAi(env);
  const result = await ai.proAction({
    action: body.action,
    text,
    question: typeof body.question === "string" ? body.question : undefined,
    pageTitle: typeof body.page_title === "string" ? body.page_title : undefined,
    pageUrl: typeof body.page_url === "string" ? body.page_url : undefined,
  });

  await repo.recordUsage(userId, "pro_action");
  return json(200, { result });
}
