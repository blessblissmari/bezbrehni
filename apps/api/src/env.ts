export interface Env {
  JWT_SECRET: string;
  APP_URL: string;
  API_URL: string;
  YOOKASSA_RETURN_URL: string;
  YOOKASSA_SHOP_ID: string;
  YOOKASSA_SECRET_KEY: string;
  YOOKASSA_PRO_PRICE_RUB: string;
  YOOKASSA_PRO_DAYS: string;
  YDB_ENDPOINT: string;
  YDB_DATABASE: string;
  YANDEX_GPT_API_KEY: string;
  YANDEX_GPT_FOLDER_ID: string;
  YANDEX_GPT_MODEL: string;
}

export function loadEnv(): Env {
  const e = process.env;
  return {
    JWT_SECRET: e.JWT_SECRET ?? "",
    APP_URL: e.APP_URL ?? "https://xn--90aalbii8aw0c.xn--p1ai",
    API_URL: e.API_URL ?? "https://api.xn--90aalbii8aw0c.xn--p1ai",
    YOOKASSA_RETURN_URL:
      e.YOOKASSA_RETURN_URL ??
      "https://xn--90aalbii8aw0c.xn--p1ai/billing/success",
    YOOKASSA_SHOP_ID: e.YOOKASSA_SHOP_ID ?? "",
    YOOKASSA_SECRET_KEY: e.YOOKASSA_SECRET_KEY ?? "",
    YOOKASSA_PRO_PRICE_RUB: e.YOOKASSA_PRO_PRICE_RUB ?? "299",
    YOOKASSA_PRO_DAYS: e.YOOKASSA_PRO_DAYS ?? "30",
    YDB_ENDPOINT: e.YDB_ENDPOINT ?? "",
    YDB_DATABASE: e.YDB_DATABASE ?? "",
    YANDEX_GPT_API_KEY: e.YANDEX_GPT_API_KEY ?? "",
    YANDEX_GPT_FOLDER_ID: e.YANDEX_GPT_FOLDER_ID ?? "",
    YANDEX_GPT_MODEL: e.YANDEX_GPT_MODEL ?? "yandexgpt-lite/latest",
  };
}
