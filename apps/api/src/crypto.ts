import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/** Хэш пароля через scrypt: формат `scrypt$<N>$<salt_hex>$<hash_hex>` */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const N = 16384;
  const hash = scryptSync(password, salt, 64, { N, r: 8, p: 1 });
  return `scrypt$${N}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "scrypt") return false;
  const N = Number(parts[1]);
  const salt = Buffer.from(parts[2] ?? "", "hex");
  const hash = Buffer.from(parts[3] ?? "", "hex");
  try {
    const computed = scryptSync(password, salt, hash.length, { N, r: 8, p: 1 });
    return computed.length === hash.length && timingSafeEqual(computed, hash);
  } catch {
    return false;
  }
}

/** Минимальный JWT HS256 (без зависимостей) */
export function signJwt(
  payload: Record<string, unknown>,
  secret: string,
  expiresInSec = 60 * 60 * 24 * 30,
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  // Порядок важен: iat/exp в конце — чтобы случайный ключ в payload не переопределил
  // системные поля токена.
  const full = { ...payload, iat: now, exp: now + expiresInSec };
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(full));
  const sig = createHmac("sha256", secret).update(`${h}.${p}`).digest();
  return `${h}.${p}.${b64urlBuf(sig)}`;
}

export function verifyJwt<T extends object = Record<string, unknown>>(
  token: string,
  secret: string,
): T | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts as [string, string, string];
  const expected = b64urlBuf(createHmac("sha256", secret).update(`${h}.${p}`).digest());
  if (expected.length !== s.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(s))) return null;
  } catch {
    return null;
  }
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(Buffer.from(p, "base64").toString("utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
  const exp = typeof payload.exp === "number" ? payload.exp : 0;
  if (exp < Math.floor(Date.now() / 1000)) return null;
  return payload as T;
}

function b64url(s: string): string {
  return Buffer.from(s).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function b64urlBuf(b: Buffer): string {
  return b.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
