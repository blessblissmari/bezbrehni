"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { apiCall, getToken } from "../../lib/api";
import type { Payment, Plan } from "@bezbrehni/shared";

interface StatusResp {
  plan: Plan;
  pro_until: string | null;
  payments: Payment[];
}

export default function BillingPage() {
  const [status, setStatus] = useState<StatusResp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = getToken();
    if (!t) {
      window.location.href = "/login";
      return;
    }
    apiCall<StatusResp>("/billing/status")
      .then(setStatus)
      .catch((e: Error) => setErr(e.message));
  }, []);

  async function buyPro() {
    setBusy(true);
    setErr(null);
    try {
      const res = await apiCall<{ confirmation_url: string | null }>(
        "/billing/create-payment",
        { method: "POST", body: {} },
      );
      if (res.confirmation_url) {
        window.location.href = res.confirmation_url;
      } else {
        setErr("ЮKassa не вернула ссылку оплаты. Попробуйте позже.");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  const isPro = status?.plan === "pro";

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader variant="app" />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-5 py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Тариф</h1>
          <p className="mt-2 text-ink-500">
            Pro открывает все действия расширения. Без автоматических списаний — платите один
            раз на 30 дней.
          </p>

          <div className="mt-8 card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-ink-500">Текущий статус</div>
                <div className="mt-1 text-2xl font-semibold text-ink-900">
                  {isPro ? "Pro активен" : "Бесплатный"}
                </div>
                {isPro && status?.pro_until && (
                  <div className="text-sm text-ink-500 mt-1">
                    До{" "}
                    {new Date(status.pro_until).toLocaleDateString("ru-RU", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-ink-500">30 дней</div>
                <div className="text-3xl font-semibold text-ink-900">299 ₽</div>
              </div>
            </div>
            <button onClick={buyPro} className="btn-primary mt-6 w-full" disabled={busy}>
              {busy ? "Создаём платёж..." : isPro ? "Продлить Pro" : "Оформить Pro"}
            </button>
            {err && <div className="text-bad text-sm mt-3">{err}</div>}
            <p className="text-xs text-ink-500 mt-4 leading-relaxed">
              Оплата проходит через ЮKassa. Мы не видим и не храним данные карты. После
              успешной оплаты Pro активируется автоматически.
            </p>
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-ink-900 mb-4">История платежей</h2>
            {!status || status.payments.length === 0 ? (
              <div className="card p-6 text-ink-500 text-sm">Платежей пока нет.</div>
            ) : (
              <div className="card divide-y divide-cream-200">
                {status.payments.map((p) => (
                  <div key={p.id} className="p-5 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-ink-900">
                        {p.amount} {p.currency}
                      </div>
                      <div className="text-sm text-ink-500">
                        {p.status === "succeeded"
                          ? `Оплачен ${p.paid_at ? new Date(p.paid_at).toLocaleDateString("ru-RU") : ""}`
                          : p.status === "canceled"
                          ? "Отменён"
                          : "Ожидает оплаты"}
                      </div>
                    </div>
                    <div className="text-xs text-ink-500 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString("ru-RU")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="mt-8 text-sm text-ink-500">
            <Link href="/app" className="text-accent hover:underline">
              ← Вернуться в кабинет
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
