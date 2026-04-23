import { API_URL } from "./env";
import { getToken } from "./storage";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiCallOptions {
  method?: "GET" | "POST";
  body?: unknown;
  auth?: boolean;
}

export async function apiCall<T = unknown>(
  path: string,
  opts: ApiCallOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.auth !== false) {
    const tok = await getToken();
    if (tok) headers["Authorization"] = `Bearer ${tok}`;
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: opts.method ?? (opts.body ? "POST" : "GET"),
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "network", "Не удалось связаться с сервером");
  }
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: "bad_json", message: text };
  }
  if (!res.ok) {
    const d = data as { message?: string; error?: string };
    throw new ApiError(res.status, d?.error || "api_error", d?.message || "Ошибка сервера");
  }
  return data as T;
}
