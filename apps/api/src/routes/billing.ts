import { randomUUID } from "node:crypto";
import { computeAccess } from "../access";
import { YookassaClient } from "../billing/yookassa";
import { getRepo } from "../db/index";
import type { Env } from "../env";
import { error, json, parseBody } from "../http";
import type { HttpRequest, HttpResponse } from "../types";

function makeClient(env: Env) {
  return new YookassaClient({
    shopId: env.YOOKASSA_SHOP_ID,
    secretKey: env.YOOKASSA_SECRET_KEY,
    returnUrl: env.YOOKASSA_RETURN_URL,
    priceRub: Number(env.YOOKASSA_PRO_PRICE_RUB),
  });
}

export async function postCreatePayment(
  _req: HttpRequest,
  env: Env,
  userId: string,
): Promise<HttpResponse> {
  if (!env.YOOKASSA_SHOP_ID || !env.YOOKASSA_SECRET_KEY) {
    return error(503, "billing_not_configured", "Оплата временно недоступна");
  }
  const price = Number(env.YOOKASSA_PRO_PRICE_RUB);
  const repo = await getRepo();
  const client = makeClient(env);
  const paymentId = randomUUID();
  const yk = await client.createPayment({
    amountRub: price,
    description: `Безбрехни Pro на ${env.YOOKASSA_PRO_DAYS} дней`,
    metadata: { user_id: userId, payment_id: paymentId },
    idempotenceKey: paymentId,
  });

  await repo.createPendingPayment({
    id: paymentId,
    user_id: userId,
    yookassa_id: yk.id,
    status: "pending",
    amount: price,
    currency: "RUB",
    created_at: new Date().toISOString(),
  });

  return json(200, {
    payment_id: paymentId,
    yookassa_id: yk.id,
    confirmation_url: yk.confirmation?.confirmation_url ?? null,
    amount: price,
    currency: "RUB",
  });
}

export async function postWebhook(req: HttpRequest, env: Env): Promise<HttpResponse> {
  // ЮKassa шлёт нотификации. Для надёжности верифицируем через повторный GET к API.
  const body = parseBody<{
    event?: string;
    object?: { id?: string; status?: string; metadata?: Record<string, string> };
  }>(req);
  if (!body || !body.object?.id) return error(400, "bad_webhook", "Некорректный вебхук");
  if (!env.YOOKASSA_SHOP_ID || !env.YOOKASSA_SECRET_KEY) {
    return error(503, "billing_not_configured", "Вебхук не может быть обработан");
  }
  const client = makeClient(env);
  const fresh = await client.getPayment(body.object.id);
  const repo = await getRepo();
  const local = await repo.findPaymentByYookassaId(fresh.id);
  if (!local) {
    // Платёж нам неизвестен — игнорируем, но 200, чтобы ЮKassa не повторяла.
    return json(200, { ok: true, ignored: true });
  }

  if (fresh.status === "succeeded") {
    // Идемпотентно проставляем succeeded+paid_at и получаем актуальную запись.
    // Флаг entitlement_applied живёт отдельно: если предыдущий webhook упал
    // между markPaymentSucceeded и upgradeToPro, мы этим ретраем всё же применим тариф.
    const paid = await repo.markPaymentSucceeded(fresh.id, new Date());
    if (paid && !paid.entitlement_applied) {
      const days = Number(env.YOOKASSA_PRO_DAYS) || 30;
      const cur = await repo.getEntitlement(paid.user_id);
      const baseTime =
        cur.plan === "pro" && cur.pro_until && new Date(cur.pro_until).getTime() > Date.now()
          ? new Date(cur.pro_until).getTime()
          : Date.now();
      const until = new Date(baseTime + days * 86400 * 1000);
      await repo.upgradeToPro(paid.user_id, until);
      await repo.markPaymentApplied(paid.id);
    }
  } else if (fresh.status === "canceled") {
    await repo.markPaymentCanceled(fresh.id);
  }

  return json(200, { ok: true });
}

export async function getStatus(userId: string): Promise<HttpResponse> {
  const repo = await getRepo();
  const access = await computeAccess(repo, userId);
  const payments = await repo.listPayments(userId);
  return json(200, {
    plan: access.plan,
    pro_until: access.proUntil ? access.proUntil.toISOString() : null,
    payments,
  });
}
