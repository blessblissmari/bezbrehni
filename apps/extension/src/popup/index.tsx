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

function Popup() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [me, setMe] = useState<MeResp | null>(null);
  const [usage, setUsage] = useState<UsageResp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
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
        setErr(e instanceof Error ? e.message : "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
            "Наведите курсор на абзац на любой странице — рядом появится кнопка с лупой.",
          )}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={btnPrimary} onClick={() => openTab("/login")}>
            {i18n("popup_login", "Войти")}
          </button>
          <button style={btnSecondary} onClick={() => openTab("/signup")}>
            {i18n("popup_signup", "Создать аккаунт")}
          </button>
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
  fontWeight: 500,
  cursor: "pointer",
};
const btnSecondary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  background: "#FFFFFF",
  color: "#1B2330",
  border: "1px solid #E6E3DC",
  borderRadius: 10,
  fontSize: 13,
  cursor: "pointer",
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
