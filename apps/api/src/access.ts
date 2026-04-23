import { FREE_CHECK_LIMIT, type Plan } from "@bezbrehni/shared";
import type { Repository } from "./db/index";

export interface AccessState {
  plan: Plan;
  proUntil: Date | null;
  usedTotal: number;
  canBasicCheck: boolean;
  canProAction: boolean;
  reason?: "limit_reached" | "pro_required" | "pro_expired";
}

export async function computeAccess(repo: Repository, user_id: string): Promise<AccessState> {
  const ent = await repo.getEntitlement(user_id);
  // На free-лимит считаем только базовые проверки ("analyze"),
  // чтобы после окончания Pro пользователь не оказался заблокирован из-за
  // накопленных pro_action событий.
  const used = await repo.countUsage(user_id, "analyze");
  const now = Date.now();
  const proUntil = ent.pro_until ? new Date(ent.pro_until) : null;
  const isPro = ent.plan === "pro" && proUntil !== null && proUntil.getTime() > now;

  if (isPro) {
    return {
      plan: "pro",
      proUntil,
      usedTotal: used,
      canBasicCheck: true,
      canProAction: true,
    };
  }

  const canBasic = used < FREE_CHECK_LIMIT;
  const st: AccessState = {
    plan: "free",
    proUntil,
    usedTotal: used,
    canBasicCheck: canBasic,
    canProAction: false,
    reason: canBasic ? undefined : "limit_reached",
  };
  return st;
}
