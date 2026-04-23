export const API_URL =
  (process.env.API_URL as string | undefined) ||
  "https://api.xn--80aaxzavh.xn--p1ai";

export const APP_URL =
  (process.env.APP_URL as string | undefined) ||
  "https://app.xn--80aaxzavh.xn--p1ai";

export function i18n(key: string, fallback = key): string {
  try {
    const v = chrome?.i18n?.getMessage?.(key);
    return v && v.length ? v : fallback;
  } catch {
    return fallback;
  }
}
