"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiCall, getToken, setToken } from "../../lib/api";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import {
  FREE_CHECK_LIMIT,
  VERDICT_LABELS,
  type AnalysisRecord,
  type Plan,
} from "@bezbrehni/shared";

interface MeResp {
  user: { id: string; email: string; created_at: string };
  entitlement: { plan: Plan; pro_until: string | null };
}
interface UsageResp {
  used_total: number;
  free_limit: number;
  plan: Plan;
  pro_until: string | null;
  history: AnalysisRecord[];
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function AppHomePage() {
  const [me, setMe] = useState<MeResp | null>(null);
  const [usage, setUsage] = useState<UsageResp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = getToken();
    if (!t) {
      window.location.href = "/login";
      return;
    }
    Promise.all([apiCall<MeResp>("/user/me"), apiCall<UsageResp>("/usage")])
      .then(([m, u]) => {
        setMe(m);
        setUsage(u);
      })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    setToken(null);
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader variant="app" />
        <main className="flex-1 flex items-center justify-center text-ink-500">
          Загружаем кабинет...
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (err || !me || !usage) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader variant="app" />
        <main className="flex-1 flex items-center justify-center text-bad">
          {err || "Не удалось загрузить данные"}
        </main>
        <SiteFooter />
      </div>
    );
  }

  const isPro = usage.plan === "pro";
  const used = usage.used_total;
  const remaining = Math.max(0, FREE_CHECK_LIMIT - used);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader variant="app" />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-5 py-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-ink-900">
                Личный кабинет
              </h1>
              <p className="mt-1 text-ink-500">{me.user.email}</p>
            </div>
            <button onClick={logout} className="btn-secondary">
              Выйти
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="text-sm text-ink-500">Текущий тариф</div>
              <div className="mt-1 text-2xl font-semibold text-ink-900">
                {isPro ? "Pro" : "Бесплатный"}
              </div>
              <div className="mt-2 text-sm text-ink-500">
                {isPro
                  ? `До ${formatDate(usage.pro_until)}`
                  : `${remaining} из ${FREE_CHECK_LIMIT} проверок осталось`}
              </div>
            </div>
            <div className="card p-5">
              <div className="text-sm text-ink-500">Использовано всего</div>
              <div className="mt-1 text-2xl font-semibold text-ink-900">{used}</div>
              <div className="mt-2 text-sm text-ink-500">проверок за всё время</div>
            </div>
            <div className="card p-5">
              <div className="text-sm text-ink-500">{isPro ? "Продлить" : "Улучшить"}</div>
              <Link href="/billing" className="btn-primary mt-3 inline-flex">
                {isPro ? "Продлить Pro" : "Оформить Pro"}
              </Link>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-ink-900 mb-4">История проверок</h2>
            {usage.history.length === 0 ? (
              <div className="card p-8 text-center text-ink-500">
                Здесь пока пусто. Установите расширение и наведите курсор на любую статью —
                результат появится тут.
              </div>
            ) : (
              <div className="card divide-y divide-cream-200">
                {usage.history.map((a) => (
                  <div key={a.id} className="p-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-medium text-ink-900">
                        {VERDICT_LABELS[a.verdict] ?? a.verdict}
                      </div>
                      <div className="text-sm text-ink-500 truncate">
                        {a.text_preview}
                      </div>
                      {a.page_url && (
                        <a
                          href={a.page_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-accent hover:underline truncate block mt-1"
                        >
                          {a.page_url}
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-ink-500 whitespace-nowrap">
                      {formatDate(a.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
