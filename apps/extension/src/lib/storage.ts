const TOKEN_KEY = "bezbrehni_token";

export async function getToken(): Promise<string | null> {
  const v = await chrome.storage.local.get(TOKEN_KEY);
  const t = v[TOKEN_KEY];
  return typeof t === "string" ? t : null;
}

export async function setToken(t: string | null) {
  if (t) await chrome.storage.local.set({ [TOKEN_KEY]: t });
  else await chrome.storage.local.remove(TOKEN_KEY);
}
