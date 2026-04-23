import type { AnalysisRecord, Payment } from "@bezbrehni/shared";
import { randomUUID } from "node:crypto";
import type {
  EntitlementRow,
  Repository,
  UserRow,
} from "./types";

type YdbModule = typeof import("ydb-sdk");

// Dynamic `import()` of a CJS module из CJS-бандла в Node 22 может вернуть
// namespace-обёртку вида `{ default: moduleExports, ... }`. Используем
// внутри и `default`, и сам объект, чтобы работать с обоими случаями.
async function loadYdb(): Promise<YdbModule> {
  const m = (await import("ydb-sdk")) as unknown as {
    default?: YdbModule;
  } & YdbModule;
  if (m.Driver) return m;
  if (m.default && m.default.Driver) return m.default;
  return m;
}

/**
 * Репозиторий поверх YDB. Использует `ydb-sdk` — подключается по endpoint + database path.
 * Аутентификация:
 *  - В Cloud Functions: через metadata service (автоматически, если функция запущена с SA).
 *  - Локально: YDB_ACCESS_TOKEN_CREDENTIALS (IAM token) или YDB_SERVICE_ACCOUNT_KEY_FILE_CREDENTIALS.
 *
 * Схема таблиц — в `infra/ydb/schema.yql`.
 */
export class YdbRepository implements Repository {
  private driver: unknown = null;
  private ready = false;

  constructor(
    private readonly endpoint: string,
    private readonly database: string,
  ) {
    if (!endpoint || !database) {
      throw new Error("YDB_ENDPOINT и YDB_DATABASE обязательны");
    }
  }

  async init() {
    if (this.ready) return;
    const ydb = await loadYdb();
    const credentials = ydb.getCredentialsFromEnv();
    const driver = new ydb.Driver({
      endpoint: this.endpoint,
      database: this.database,
      authService: credentials,
    });
    const ok = await driver.ready(15_000);
    if (!ok) throw new Error("YDB driver не подключился за 15 сек");
    this.driver = driver;
    this.ready = true;
  }

  private async withSession<T>(fn: (sess: unknown) => Promise<T>): Promise<T> {
    await this.init();
    const ydb = await loadYdb();
    const driver = this.driver as InstanceType<(typeof ydb)["Driver"]>;
    return driver.tableClient.withSession(fn as (s: unknown) => Promise<T>);
  }

  private async exec(
    sql: string,
    params: Record<string, unknown> = {},
  ): Promise<{ resultSets: Array<{ rows: Array<Record<string, unknown>> }> }> {
    return this.withSession(async (sess) => {
      const ydb = await loadYdb();
      const tv = ydb.TypedValues as unknown as {
        utf8: (v: string) => unknown;
        double: (v: number) => unknown;
        uint64: (v: number | bigint) => unknown;
        bool: (v: boolean) => unknown;
      };
      // YDB требует типизированные значения (TypedValue). Оборачиваем базовые JS-типы,
      // чтобы вызовам на стороне было удобно передавать обычные значения.
      const typedParams: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(params)) {
        if (v === null || v === undefined) {
          typedParams[k] = null;
          continue;
        }
        if (typeof v === "string") typedParams[k] = tv.utf8(v);
        else if (typeof v === "boolean") typedParams[k] = tv.bool(v);
        else if (typeof v === "bigint") typedParams[k] = tv.uint64(v);
        else if (typeof v === "number")
          typedParams[k] = Number.isInteger(v) ? tv.uint64(v) : tv.double(v);
        else typedParams[k] = v;
      }
      const s = sess as {
        executeQuery: (
          q: string,
          p?: Record<string, unknown>,
        ) => Promise<{ resultSets: unknown[] }>;
      };
      const res = await s.executeQuery(sql, typedParams);
      const out = (res.resultSets ?? []).map((rs) => {
        const typed = ydb.TypedData.createNativeObjects(
          rs as never,
        ) as Array<Record<string, unknown>>;
        return { rows: typed };
      });
      return { resultSets: out };
    });
  }

  async createUser(args: { email: string; password_hash: string }): Promise<UserRow> {
    const id = randomUUID();
    const email = args.email.toLowerCase();
    const created_at = new Date().toISOString();
    const sql = `
      DECLARE $id AS Utf8;
      DECLARE $email AS Utf8;
      DECLARE $password_hash AS Utf8;
      DECLARE $created_at AS Utf8;
      UPSERT INTO users (id, email, password_hash, created_at)
      VALUES ($id, $email, $password_hash, $created_at);
      UPSERT INTO entitlements (user_id, plan, pro_until)
      VALUES ($id, "free", NULL);
    `;
    await this.exec(sql, {
      $id: id,
      $email: email,
      $password_hash: args.password_hash,
      $created_at: created_at,
    });
    return { id, email, password_hash: args.password_hash, created_at };
  }

  async findUserByEmail(email: string): Promise<UserRow | null> {
    const sql = `
      DECLARE $email AS Utf8;
      SELECT id, email, password_hash, created_at FROM users WHERE email = $email LIMIT 1;
    `;
    const res = await this.exec(sql, { $email: email.toLowerCase() });
    const row = res.resultSets[0]?.rows[0];
    return row ? (row as unknown as UserRow) : null;
  }

  async findUserById(id: string): Promise<UserRow | null> {
    const sql = `
      DECLARE $id AS Utf8;
      SELECT id, email, password_hash, created_at FROM users WHERE id = $id LIMIT 1;
    `;
    const res = await this.exec(sql, { $id: id });
    const row = res.resultSets[0]?.rows[0];
    return row ? (row as unknown as UserRow) : null;
  }

  async getEntitlement(user_id: string): Promise<EntitlementRow> {
    const sql = `
      DECLARE $uid AS Utf8;
      SELECT user_id, plan, pro_until FROM entitlements WHERE user_id = $uid LIMIT 1;
    `;
    const res = await this.exec(sql, { $uid: user_id });
    const row = res.resultSets[0]?.rows[0];
    if (!row) return { user_id, plan: "free", pro_until: null };
    return row as unknown as EntitlementRow;
  }

  async upgradeToPro(user_id: string, until: Date): Promise<EntitlementRow> {
    const sql = `
      DECLARE $uid AS Utf8;
      DECLARE $until AS Utf8;
      UPSERT INTO entitlements (user_id, plan, pro_until) VALUES ($uid, "pro", $until);
    `;
    await this.exec(sql, { $uid: user_id, $until: until.toISOString() });
    return { user_id, plan: "pro", pro_until: until.toISOString() };
  }

  async countUsage(user_id: string, kind?: "analyze" | "pro_action"): Promise<number> {
    const sql = kind
      ? `
      DECLARE $uid AS Utf8;
      DECLARE $kind AS Utf8;
      SELECT COUNT(*) AS c FROM usage_events WHERE user_id = $uid AND kind = $kind;
    `
      : `
      DECLARE $uid AS Utf8;
      SELECT COUNT(*) AS c FROM usage_events WHERE user_id = $uid;
    `;
    const params: Record<string, unknown> = { $uid: user_id };
    if (kind) params.$kind = kind;
    const res = await this.exec(sql, params);
    const row = res.resultSets[0]?.rows[0];
    const c = row?.c;
    return typeof c === "number" ? c : Number(c ?? 0);
  }

  async recordUsage(user_id: string, kind: "analyze" | "pro_action") {
    const sql = `
      DECLARE $id AS Utf8;
      DECLARE $uid AS Utf8;
      DECLARE $kind AS Utf8;
      DECLARE $created_at AS Utf8;
      UPSERT INTO usage_events (id, user_id, kind, created_at) VALUES ($id, $uid, $kind, $created_at);
    `;
    await this.exec(sql, {
      $id: randomUUID(),
      $uid: user_id,
      $kind: kind,
      $created_at: new Date().toISOString(),
    });
  }

  async recordAnalysis(rec: AnalysisRecord) {
    if (rec.page_url) {
      const sql = `
        DECLARE $id AS Utf8;
        DECLARE $uid AS Utf8;
        DECLARE $verdict AS Utf8;
        DECLARE $preview AS Utf8;
        DECLARE $url AS Utf8;
        DECLARE $created_at AS Utf8;
        UPSERT INTO analyses (id, user_id, verdict, text_preview, page_url, created_at)
        VALUES ($id, $uid, $verdict, $preview, $url, $created_at);
      `;
      await this.exec(sql, {
        $id: rec.id,
        $uid: rec.user_id,
        $verdict: rec.verdict,
        $preview: rec.text_preview,
        $url: rec.page_url,
        $created_at: rec.created_at,
      });
    } else {
      const sql = `
        DECLARE $id AS Utf8;
        DECLARE $uid AS Utf8;
        DECLARE $verdict AS Utf8;
        DECLARE $preview AS Utf8;
        DECLARE $created_at AS Utf8;
        UPSERT INTO analyses (id, user_id, verdict, text_preview, page_url, created_at)
        VALUES ($id, $uid, $verdict, $preview, NULL, $created_at);
      `;
      await this.exec(sql, {
        $id: rec.id,
        $uid: rec.user_id,
        $verdict: rec.verdict,
        $preview: rec.text_preview,
        $created_at: rec.created_at,
      });
    }
  }

  async listAnalyses(user_id: string, limit = 50): Promise<AnalysisRecord[]> {
    const sql = `
      DECLARE $uid AS Utf8;
      DECLARE $lim AS Uint64;
      SELECT id, user_id, verdict, text_preview, page_url, created_at
      FROM analyses WHERE user_id = $uid ORDER BY created_at DESC LIMIT $lim;
    `;
    const res = await this.exec(sql, { $uid: user_id, $lim: BigInt(limit) });
    return (res.resultSets[0]?.rows ?? []) as unknown as AnalysisRecord[];
  }

  async createPendingPayment(p: Omit<Payment, "paid_at">): Promise<void> {
    const sql = `
      DECLARE $id AS Utf8;
      DECLARE $uid AS Utf8;
      DECLARE $yid AS Utf8;
      DECLARE $status AS Utf8;
      DECLARE $amount AS Double;
      DECLARE $currency AS Utf8;
      DECLARE $created_at AS Utf8;
      UPSERT INTO payments (id, user_id, yookassa_id, status, amount, currency, created_at, paid_at)
      VALUES ($id, $uid, $yid, $status, $amount, $currency, $created_at, NULL);
    `;
    await this.exec(sql, {
      $id: p.id,
      $uid: p.user_id,
      $yid: p.yookassa_id,
      $status: p.status,
      $amount: p.amount,
      $currency: p.currency,
      $created_at: p.created_at,
    });
  }

  async markPaymentSucceeded(yookassa_id: string, paid_at: Date): Promise<Payment | null> {
    const existing = await this.findPaymentByYookassaId(yookassa_id);
    if (!existing) return null;
    // Идемпотентность: повторный webhook не должен продлевать подписку ещё раз.
    if (existing.status === "succeeded") return null;
    const sql = `
      DECLARE $yid AS Utf8;
      DECLARE $paid_at AS Utf8;
      UPDATE payments SET status = "succeeded", paid_at = $paid_at WHERE yookassa_id = $yid;
    `;
    await this.exec(sql, { $yid: yookassa_id, $paid_at: paid_at.toISOString() });
    return { ...existing, status: "succeeded", paid_at: paid_at.toISOString() };
  }

  async markPaymentCanceled(yookassa_id: string): Promise<void> {
    const sql = `
      DECLARE $yid AS Utf8;
      UPDATE payments SET status = "canceled" WHERE yookassa_id = $yid;
    `;
    await this.exec(sql, { $yid: yookassa_id });
  }

  async listPayments(user_id: string): Promise<Payment[]> {
    const sql = `
      DECLARE $uid AS Utf8;
      SELECT id, user_id, yookassa_id, status, amount, currency, created_at, paid_at
      FROM payments WHERE user_id = $uid ORDER BY created_at DESC LIMIT 50;
    `;
    const res = await this.exec(sql, { $uid: user_id });
    return (res.resultSets[0]?.rows ?? []) as unknown as Payment[];
  }

  async findPaymentByYookassaId(yookassa_id: string): Promise<Payment | null> {
    const sql = `
      DECLARE $yid AS Utf8;
      SELECT id, user_id, yookassa_id, status, amount, currency, created_at, paid_at
      FROM payments WHERE yookassa_id = $yid LIMIT 1;
    `;
    const res = await this.exec(sql, { $yid: yookassa_id });
    const row = res.resultSets[0]?.rows[0];
    return row ? (row as unknown as Payment) : null;
  }
}
