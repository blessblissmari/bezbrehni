"use client";
import { useState } from "react";
import Link from "next/link";
import { apiCall, setToken } from "../../lib/api";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { FREE_CHECK_LIMIT } from "@bezbrehni/shared";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!agree) {
      setErr("Чтобы продолжить, нужно принять условия");
      return;
    }
    setLoading(true);
    try {
      const res = await apiCall<{ token: string }>("/auth/signup", {
        method: "POST",
        body: { email, password },
        auth: false,
      });
      setToken(res.token);
      window.location.href = "/app";
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader variant="public" />
      <main className="flex-1 flex items-center">
        <div className="mx-auto max-w-md w-full px-5 py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Регистрация</h1>
          <p className="mt-2 text-ink-500">
            Первые {FREE_CHECK_LIMIT} проверки — бесплатно. Без карты.
          </p>
          <form onSubmit={submit} className="mt-8 space-y-4 card p-6">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="вы@пример.рф"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="Не меньше 8 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <label className="flex items-start gap-2 text-sm text-ink-500">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1"
              />
              <span>
                Я принимаю{" "}
                <Link href="/terms" className="text-accent hover:underline">
                  пользовательское соглашение
                </Link>{" "}
                и{" "}
                <Link href="/privacy" className="text-accent hover:underline">
                  политику конфиденциальности
                </Link>
                .
              </span>
            </label>
            {err && <div className="text-bad text-sm">{err}</div>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Создаём аккаунт..." : "Создать аккаунт"}
            </button>
            <p className="text-sm text-ink-500 text-center">
              Уже есть аккаунт?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Войти
              </Link>
            </p>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
