const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(v: unknown): v is string {
  return typeof v === "string" && v.length <= 254 && EMAIL_RE.test(v);
}

export function isValidPassword(v: unknown): v is string {
  return typeof v === "string" && v.length >= 8 && v.length <= 200;
}

export function sanitizeText(v: unknown, maxLen = 20000): string {
  if (typeof v !== "string") return "";
  const trimmed = v.trim();
  if (trimmed.length > maxLen) return trimmed.slice(0, maxLen);
  return trimmed;
}

const PRO_ACTIONS = [
  "summarize",
  "ask",
  "explain",
  "find_risks",
  "find_inconsistencies",
  "rewrite_clearer",
  "generate_tasks",
] as const;

export function isProAction(v: unknown): v is (typeof PRO_ACTIONS)[number] {
  return typeof v === "string" && (PRO_ACTIONS as readonly string[]).includes(v);
}
