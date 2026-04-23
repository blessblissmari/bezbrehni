"use client";
import { useState } from "react";
import Link from "next/link";
import { apiCall, setToken } from "../../lib/api";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await apiCall<{ token: string }>("/auth/login", {
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
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Вход</h1>
          <p className="mt-2 text-ink-500">
            Рады видеть снова. Если ещё нет аккаунта —{" "}
            <Link href="/signup" className="text-accent hover:underline">
              создайте бесплатно
            </Link>
            .
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
                autoComplete="current-password"
              />
            </div>
            {err && <div className="text-bad text-sm">{err}</div>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Входим..." : "Войти"}
            </button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
