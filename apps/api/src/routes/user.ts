import { FREE_CHECK_LIMIT } from "@bezbrehni/shared";
import { computeAccess } from "../access";
import { getRepo } from "../db/index";
import { error, json } from "../http";
import type { HttpResponse } from "../types";

export async function getMe(userId: string): Promise<HttpResponse> {
  const repo = await getRepo();
  const user = await repo.findUserById(userId);
  if (!user) return error(404, "user_not_found", "Пользователь не найден");
  const access = await computeAccess(repo, userId);
  return json(200, {
    user: { id: user.id, email: user.email, created_at: user.created_at },
    entitlement: {
      plan: access.plan,
      pro_until: access.proUntil ? access.proUntil.toISOString() : null,
    },
  });
}

export async function getUsage(userId: string): Promise<HttpResponse> {
  const repo = await getRepo();
  const access = await computeAccess(repo, userId);
  const analyses = await repo.listAnalyses(userId, 50);
  return json(200, {
    used_total: access.usedTotal,
    free_limit: FREE_CHECK_LIMIT,
    plan: access.plan,
    pro_until: access.proUntil ? access.proUntil.toISOString() : null,
    history: analyses,
  });
}
