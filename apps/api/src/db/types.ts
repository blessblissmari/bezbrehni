import type { AnalysisRecord, Payment, Plan } from "@bezbrehni/shared";

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface EntitlementRow {
  user_id: string;
  plan: Plan;
  pro_until?: string | null;
}

export interface UsageEventRow {
  id: string;
  user_id: string;
  kind: "analyze" | "pro_action";
  created_at: string;
}

export interface Repository {
  init(): Promise<void>;
  createUser(args: { email: string; password_hash: string }): Promise<UserRow>;
  findUserByEmail(email: string): Promise<UserRow | null>;
  findUserById(id: string): Promise<UserRow | null>;

  getEntitlement(user_id: string): Promise<EntitlementRow>;
  upgradeToPro(user_id: string, until: Date): Promise<EntitlementRow>;

  countUsage(user_id: string, kind?: "analyze" | "pro_action"): Promise<number>;
  recordUsage(user_id: string, kind: "analyze" | "pro_action"): Promise<void>;

  recordAnalysis(rec: AnalysisRecord): Promise<void>;
  listAnalyses(user_id: string, limit?: number): Promise<AnalysisRecord[]>;

  createPendingPayment(p: Omit<Payment, "paid_at">): Promise<void>;
  /**
   * Идемпотентно проставляет status="succeeded" и paid_at (если ещё не стоял).
   * Всегда возвращает актуальную запись платежа (или null, если платёж неизвестен),
   * чтобы вызывающий мог увидеть флаг `entitlement_applied` и решить, нужен ли апгрейд.
   */
  markPaymentSucceeded(yookassa_id: string, paid_at: Date): Promise<Payment | null>;
  /** Отмечает, что тариф Pro уже активирован по этому платежу. */
  markPaymentApplied(payment_id: string): Promise<void>;
  markPaymentCanceled(yookassa_id: string): Promise<void>;
  listPayments(user_id: string): Promise<Payment[]>;
  findPaymentByYookassaId(yookassa_id: string): Promise<Payment | null>;
}
