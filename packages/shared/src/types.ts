export type Plan = "free" | "pro";

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Entitlement {
  user_id: string;
  plan: Plan;
  pro_until?: string | null;
}

export interface UsageSummary {
  used_total: number;
  free_limit: number;
  plan: Plan;
  pro_until?: string | null;
}

export type ProAction =
  | "summarize"
  | "ask"
  | "explain"
  | "find_risks"
  | "find_inconsistencies"
  | "rewrite_clearer"
  | "generate_tasks";

export type AnalyzeVerdict =
  | "reliable"
  | "suspicious"
  | "contradictory"
  | "opinion"
  | "unknown";

export interface AnalyzeResult {
  verdict: AnalyzeVerdict;
  verdict_label: string;
  summary: string;
  reasons: string[];
  confidence: number;
}

export interface ProActionResult {
  action: ProAction;
  text: string;
}

export interface AnalyzeRequest {
  text: string;
  page_url?: string;
  page_title?: string;
  context?: string;
}

export interface ProActionRequest extends AnalyzeRequest {
  action: ProAction;
  question?: string;
}

export interface AuthTokenResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  message: string;
  code?: string;
}

export interface Payment {
  id: string;
  user_id: string;
  yookassa_id: string;
  status: "pending" | "succeeded" | "canceled";
  amount: number;
  currency: string;
  created_at: string;
  paid_at?: string | null;
  /**
   * Флаг «тариф Pro уже активирован по этому платежу». Нужен, чтобы повторный
   * webhook от ЮKassa не продлевал подписку ещё раз, а упавший между
   * `markPaymentSucceeded` и `upgradeToPro` webhook мог быть корректно повторён.
   */
  entitlement_applied?: boolean | null;
}

export interface AnalysisRecord {
  id: string;
  user_id: string;
  verdict: AnalyzeVerdict;
  text_preview: string;
  page_url?: string | null;
  created_at: string;
}
