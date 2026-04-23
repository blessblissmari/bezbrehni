export const FREE_CHECK_LIMIT = 3;
export const PRO_DAYS_DEFAULT = 30;
export const PRO_PRICE_RUB_DEFAULT = 299;

export const PRODUCT_NAME = "Безбрехни";
export const PRODUCT_TAGLINE = "AI проверяет контент за вас";

export const PRO_ACTION_LABELS: Record<string, string> = {
  summarize: "Кратко пересказать",
  ask: "Задать вопрос по фрагменту",
  explain: "Объяснить простыми словами",
  find_risks: "Найти сомнительное",
  find_inconsistencies: "Найти противоречия",
  rewrite_clearer: "Переписать понятнее",
  generate_tasks: "Сгенерировать задачи",
};

export const VERDICT_LABELS: Record<string, string> = {
  reliable: "Похоже на достоверное",
  suspicious: "Есть сомнительные утверждения",
  contradictory: "Есть противоречия",
  opinion: "Это мнение, а не факт",
  unknown: "Недостаточно данных",
};

export const VERDICT_COLORS: Record<string, string> = {
  reliable: "#2E7D5B",
  suspicious: "#C77A1F",
  contradictory: "#B0463E",
  opinion: "#5A6B8A",
  unknown: "#6B6B6B",
};
