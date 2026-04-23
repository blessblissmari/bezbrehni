/// <reference types="chrome" />
import * as React from "react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { apiCall } from "../lib/api";
import { APP_URL, i18n } from "../lib/env";
import { getToken, setToken } from "../lib/storage";
import { FREE_CHECK_LIMIT, type Plan } from "@bezbrehni/shared";

interface MeResp {
  user: { email: string };
  entitlement: { plan: Plan; pro_until: string | null };
}
interface UsageResp {
  used_total: number;
  plan: Plan;
  pro_until: string | null;
}
interface AuthResp {
  token: string;
  user: { id: string; email: string };
}

function Popup() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [me, setMe] = useState<MeResp | null>(null);
  const [usage, setUsage] = useState<UsageResp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setErr(null);
    const tok = await getToken();
    if (!tok) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    setAuthed(true);
    try {
      const [m, u] = await Promise.all([
        apiCall<MeResp>("/user/me"),
        apiCall<UsageResp>("/usage"),
      ]);
      setMe(m);
      setUsage(u);
    } catch (e) {
      const err = e as { status?: number; message?: string };
      // Токен невалиден / истёк — показываем форму входа, не зацикливаем popup.
      if (err.status === 401) {
        await setToken(null);
        setAuthed(false);
      } else {
        setErr(err.message ?? "Ошибка");
      }
    } finally {
      setLoading(false);
    }
  }

  async function onAuthSuccess(token: string) {
    await setToken(token);
    setLoading(true);
    await refresh();
  }

  async function logout() {
    await setToken(null);
    setAuthed(false);
    setMe(null);
    setUsage(null);
  }

  function openTab(path: string) {
    chrome.tabs.create({ url: `${APP_URL}${path}` });
  }

  if (loading) {
    return (
      <div style={{ padding: 4, color: "#5C6475" }}>
        {i18n("loading", "Смотрим внимательно...")}
      </div>
    );
  }

  if (!authed) {
    return (
      <div>
        <Header />
        <p style={{ color: "#5C6475", margin: "10px 0 14px", lineHeight: 1.5 }}>
          {i18n(
            "popup_welcome_desc",
            "Войдите, чтобы начать. Нет аккаунта — создайте его прямо здесь.",
          )}
        </p>
        <AuthForm onSuccess={onAuthSuccess} />
        <div
          style={{
            textAlign: "center",
            color: "#5C6475",
            fontSize: 12,
            marginTop: 12,
          }}
        >
          {i18n("popup_open_site_hint", "Или открыть ")}
          <a
            href={`${APP_URL}/login`}
            onClick={(e) => {
              e.preventDefault();
              openTab("/login");
            }}
            style={{ color: "#2E5FCB" }}
          >
            {i18n("popup_open_site_link", "сайт")}
          </a>
        </div>
      </div>
    );
  }

  const isPro = usage?.plan === "pro";
  const remaining = Math.max(0, FREE_CHECK_LIMIT - (usage?.used_total ?? 0));

  return (
    <div>
      <Header />
      <div style={{ margin: "10px 0 4px", fontSize: 13, color: "#5C6475" }}>
        {me?.user.email}
      </div>
      <div
        style={{
          padding: "10px 12px",
          background: "#FFFFFF",
          border: "1px solid #E6E3DC",
          borderRadius: 10,
          margin: "10px 0",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          {isPro
            ? i18n("popup_plan_pro", "Pro активен")
            : i18n("popup_plan_free", "Бесплатный тариф")}
        </div>
        <div style={{ fontSize: 12, color: "#5C6475" }}>
          {isPro && usage?.pro_until
            ? `${i18n("popup_pro_until", "Pro до")} ${new Date(
                usage.pro_until,
              ).toLocaleDateString("ru-RU")}`
            : `${i18n("popup_checks_left", "Осталось проверок:")} ${remaining}`}
        </div>
      </div>
      {err && <div style={{ color: "#B0463E", fontSize: 12 }}>{err}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {!isPro && (
          <button style={btnPrimary} onClick={() => openTab("/billing")}>
            {i18n("popup_buy_pro", "Оформить Pro")}
          </button>
        )}
        <button style={btnSecondary} onClick={() => openTab("/app")}>
          {i18n("popup_open_cabinet", "Открыть кабинет")}
        </button>
        <button
          style={{ ...btnSecondary, color: "#B0463E", borderColor: "#E6E3DC" }}
          onClick={logout}
        >
          {i18n("popup_logout", "Выйти")}
        </button>
      </div>
    </div>
  );
}

function AuthForm({ onSuccess }: { onSuccess: (token: string) => void | Promise<void> }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!email.includes("@") || password.length < 8) {
      setError("Введите email и пароль не короче 8 символов");
      return;
    }
    setBusy(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/signup";
      const res = await apiCall<AuthResp>(path, {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password },
        auth: false,
      });
      await onSuccess(res.token);
    } catch (e) {
      const err = e as { message?: string };
      setError(err.message ?? "Не получилось войти");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        <button
          type="button"
          onClick={() => setMode("login")}
          style={mode === "login" ? tabActive : tabIdle}
        >
          {i18n("popup_login", "Войти")}
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          style={mode === "signup" ? tabActive : tabIdle}
        >
          {i18n("popup_signup", "Создать аккаунт")}
        </button>
      </div>
      <input
        type="email"
        autoComplete="email"
        placeholder="email@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
        required
      />
      <input
        type="password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        placeholder={i18n("popup_password_placeholder", "Пароль (минимум 8 символов)")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
        minLength={8}
        required
      />
      {error && <div style={{ color: "#B0463E", fontSize: 12 }}>{error}</div>}
      <button type="submit" style={btnPrimary} disabled={busy}>
        {busy
          ? i18n("popup_auth_busy", "Подождите…")
          : mode === "login"
            ? i18n("popup_login_submit", "Войти")
            : i18n("popup_signup_submit", "Создать аккаунт")}
      </button>
    </form>
  );
}

function Header() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width={22} height={22} viewBox="0 0 64 64" fill="none" aria-hidden>
        <circle cx="26" cy="26" r="16" stroke="#1B2330" strokeWidth="4" />
        <path d="M38 38 L54 54" stroke="#1B2330" strokeWidth="4" strokeLinecap="round" />
        <path d="M26 26 Q40 22 52 14" stroke="#C77A1F" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="52" cy="14" r="3" fill="#C77A1F" />
      </svg>
      <div style={{ fontWeight: 600, fontSize: 16 }}>Безбрехни</div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  background: "#2E5FCB",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  flex: 1,
};

const btnSecondary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  background: "#FFFFFF",
  color: "#1B2330",
  border: "1px solid #D6D1C6",
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  flex: 1,
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #D6D1C6",
  borderRadius: 10,
  fontSize: 13,
  outline: "none",
  background: "#FFFFFF",
  color: "#1B2330",
  fontFamily: "inherit",
};

const tabIdle: React.CSSProperties = {
  flex: 1,
  padding: "6px 10px",
  background: "transparent",
  color: "#5C6475",
  border: "1px solid transparent",
  borderRadius: 8,
  fontSize: 12,
  cursor: "pointer",
};

const tabActive: React.CSSProperties = {
  ...tabIdle,
  background: "#EFEEE7",
  color: "#1B2330",
  border: "1px solid #D6D1C6",
};

const root = document.getElementById("root");
if (root) createRoot(root).render(<Popup />);
