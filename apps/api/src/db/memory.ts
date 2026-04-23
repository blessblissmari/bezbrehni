import type { AnalysisRecord, Payment } from "@bezbrehni/shared";
import { randomUUID } from "node:crypto";
import type {
  EntitlementRow,
  Repository,
  UsageEventRow,
  UserRow,
} from "./types";

/**
 * Репозиторий на памяти процесса. Используется только в локальной разработке
 * и никогда в production (данные теряются между вызовами Cloud Function).
 */
export class MemoryRepository implements Repository {
  private users = new Map<string, UserRow>();
  private usersByEmail = new Map<string, string>();
  private entitlements = new Map<string, EntitlementRow>();
  private usage: UsageEventRow[] = [];
  private analyses: AnalysisRecord[] = [];
  private payments = new Map<string, Payment>();

  async init() {}

  async createUser(args: { email: string; password_hash: string }): Promise<UserRow> {
    const id = randomUUID();
    const row: UserRow = {
      id,
      email: args.email.toLowerCase(),
      password_hash: args.password_hash,
      created_at: new Date().toISOString(),
    };
    this.users.set(id, row);
    this.usersByEmail.set(row.email, id);
    this.entitlements.set(id, { user_id: id, plan: "free", pro_until: null });
    return row;
  }

  async findUserByEmail(email: string): Promise<UserRow | null> {
    const id = this.usersByEmail.get(email.toLowerCase());
    if (!id) return null;
    return this.users.get(id) ?? null;
  }

  async findUserById(id: string): Promise<UserRow | null> {
    return this.users.get(id) ?? null;
  }

  async getEntitlement(user_id: string): Promise<EntitlementRow> {
    return (
      this.entitlements.get(user_id) ?? {
        user_id,
        plan: "free",
        pro_until: null,
      }
    );
  }

  async upgradeToPro(user_id: string, until: Date): Promise<EntitlementRow> {
    const row: EntitlementRow = {
      user_id,
      plan: "pro",
      pro_until: until.toISOString(),
    };
    this.entitlements.set(user_id, row);
    return row;
  }

  async countUsage(user_id: string, kind?: "analyze" | "pro_action"): Promise<number> {
    return this.usage.filter(
      (u) => u.user_id === user_id && (kind ? u.kind === kind : true),
    ).length;
  }

  async recordUsage(user_id: string, kind: "analyze" | "pro_action") {
    this.usage.push({
      id: randomUUID(),
      user_id,
      kind,
      created_at: new Date().toISOString(),
    });
  }

  async recordAnalysis(rec: AnalysisRecord) {
    this.analyses.push(rec);
  }

  async listAnalyses(user_id: string, limit = 50): Promise<AnalysisRecord[]> {
    return this.analyses
      .filter((a) => a.user_id === user_id)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .slice(0, limit);
  }

  async createPendingPayment(p: Omit<Payment, "paid_at">): Promise<void> {
    this.payments.set(p.yookassa_id, {
      ...p,
      paid_at: null,
      entitlement_applied: false,
    });
  }

  async markPaymentSucceeded(yookassa_id: string, paid_at: Date): Promise<Payment | null> {
    const p = this.payments.get(yookassa_id);
    if (!p) return null;
    // Идемпотентно. Если уже succeeded — возвращаем как есть, не трогая paid_at.
    // Решение о применении тарифа принимает вызывающий по флагу entitlement_applied.
    if (p.status === "succeeded") return p;
    const updated: Payment = { ...p, status: "succeeded", paid_at: paid_at.toISOString() };
    this.payments.set(yookassa_id, updated);
    return updated;
  }

  async markPaymentApplied(payment_id: string): Promise<void> {
    for (const [k, p] of this.payments) {
      if (p.id === payment_id) {
        this.payments.set(k, { ...p, entitlement_applied: true });
        return;
      }
    }
  }

  async markPaymentCanceled(yookassa_id: string) {
    const p = this.payments.get(yookassa_id);
    if (!p) return;
    this.payments.set(yookassa_id, { ...p, status: "canceled" });
  }

  async listPayments(user_id: string): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter((p) => p.user_id === user_id)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }

  async findPaymentByYookassaId(yookassa_id: string): Promise<Payment | null> {
    return this.payments.get(yookassa_id) ?? null;
  }
}
