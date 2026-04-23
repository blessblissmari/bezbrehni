import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  PRO_ACTION_LABELS,
  VERDICT_COLORS,
  VERDICT_LABELS,
  type AnalyzeResult,
  type ProAction,
  type ProActionResult,
} from "@bezbrehni/shared";
import { APP_URL, i18n } from "../lib/env";

interface BgResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
  message?: string;
}

async function send<T>(type: string, payload?: unknown): Promise<BgResponse<T>> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, payload }, (r: BgResponse<T>) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: "runtime", message: chrome.runtime.lastError.message });
      } else {
        resolve(r);
      }
    });
  });
}

export interface PopupProps {
  text: string;
  pageUrl: string;
  pageTitle: string;
  onClose: () => void;
}

type State =
  | { kind: "loading" }
  | { kind: "result"; result: AnalyzeResult }
  | { kind: "paywall"; title: string; desc: string }
  | { kind: "need_login" }
  | { kind: "error"; message: string };

const PRO_ACTIONS: ProAction[] = [
  "summarize",
  "explain",
  "find_risks",
  "find_inconsistencies",
  "rewrite_clearer",
  "generate_tasks",
  "ask",
];

export function BezbrehniPopup({ text, pageUrl, pageTitle, onClose }: PopupProps) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [proResult, setProResult] = useState<ProActionResult | null>(null);
  const [proBusy, setProBusy] = useState<ProAction | null>(null);
  const [askText, setAskText] = useState("");
  const [askOpen, setAskOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await send<{ result: AnalyzeResult }>("analyze", {
        text,
        page_url: pageUrl,
        page_title: pageTitle,
      });
      if (cancelled) return;
      if (r.ok && r.data?.result) {
        setState({ kind: "result", result: r.data.result });
      } else if (r.status === 401) {
        setState({ kind: "need_login" });
      } else if (r.status === 402 && r.error === "limit_reached") {
        setState({
          kind: "paywall",
          title: i18n("paywall_title", "Бесплатные проверки закончились"),
          desc: i18n(
            "paywall_desc",
            "Чтобы продолжить, оформите Pro — это открывает все действия на 30 дней.",
          ),
        });
      } else {
        setState({
          kind: "error",
          message: r.message || i18n("error_generic", "Что-то пошло не так"),
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [text, pageUrl, pageTitle]);

  async function runPro(action: ProAction, question?: string) {
    setProBusy(action);
    setProResult(null);
    const r = await send<{ result: ProActionResult }>("pro_action", {
      action,
      text,
      question,
      page_url: pageUrl,
      page_title: pageTitle,
    });
    setProBusy(null);
    if (r.ok && r.data?.result) {
      setProResult(r.data.result);
    } else if (r.status === 402 && r.error === "pro_required") {
      setState({
        kind: "paywall",
        title: i18n("pro_required_title", "Это действие в Pro"),
        desc: i18n(
          "pro_required_desc",
          "Оформите Pro, чтобы пользоваться всеми инструментами.",
        ),
      });
    } else if (r.status === 401) {
      setState({ kind: "need_login" });
    } else {
      setProResult({
        action,
        text: r.message || i18n("error_generic", "Что-то пошло не так"),
      });
    }
  }

  return (
    <div className="bz-root">
      <div className="bz-popup-header">
        <div className="bz-popup-title">
          <LogoSvg />
          <span>Безбрехни</span>
        </div>
        <button
          className="bz-close"
          onClick={onClose}
          aria-label={i18n("btn_close", "Закрыть")}
        >
          ×
        </button>
      </div>

      {state.kind === "loading" && (
        <div className="bz-loading">
          <div className="bz-spinner" />
          <span>{i18n("loading", "Смотрим внимательно...")}</span>
        </div>
      )}

      {state.kind === "error" && (
        <>
          <div className="bz-error">{state.message}</div>
        </>
      )}

      {state.kind === "need_login" && (
        <NeedLogin />
      )}

      {state.kind === "paywall" && (
        <Paywall title={state.title} desc={state.desc} />
      )}

      {state.kind === "result" && (
        <>
          <VerdictBadge verdict={state.result.verdict} />
          <div className="bz-summary">{state.result.summary}</div>
          {state.result.reasons.length > 0 && (
            <ul className="bz-reasons">
              {state.result.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
          <div className="bz-confidence">
            {i18n("confidence", "Уверенность")}:{" "}
            {Math.round(state.result.confidence * 100)}%
          </div>

          <div className="bz-actions">
            {PRO_ACTIONS.filter((a) => a !== "ask").map((a) => (
              <button
                key={a}
                className="bz-action"
                onClick={() => runPro(a)}
                disabled={proBusy !== null}
                title={PRO_ACTION_LABELS[a]}
              >
                {PRO_ACTION_LABELS[a]}
              </button>
            ))}
            <button
              className="bz-action"
              onClick={() => setAskOpen((v) => !v)}
              disabled={proBusy !== null}
            >
              {PRO_ACTION_LABELS.ask}
            </button>
          </div>

          {askOpen && (
            <form
              className="bz-ask-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (askText.trim().length < 2) return;
                runPro("ask", askText.trim());
              }}
            >
              <input
                type="text"
                placeholder={i18n("ask_placeholder", "Ваш вопрос по этому фрагменту...")}
                value={askText}
                onChange={(e) => setAskText(e.target.value)}
              />
              <button type="submit" className="bz-btn-primary" disabled={proBusy !== null}>
                {i18n("ask_send", "Спросить")}
              </button>
            </form>
          )}

          {proBusy && (
            <div className="bz-loading" style={{ marginTop: 10 }}>
              <div className="bz-spinner" />
              <span>{i18n("loading", "Смотрим внимательно...")}</span>
            </div>
          )}

          {proResult && !proBusy && (
            <div className="bz-pro-result">
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {PRO_ACTION_LABELS[proResult.action] ?? proResult.action}
              </div>
              <div>{proResult.text}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const color = VERDICT_COLORS[verdict] ?? "#5C6475";
  const label = VERDICT_LABELS[verdict] ?? verdict;
  const softBg = useMemo(() => hexToSoft(color), [color]);
  return (
    <div
      className="bz-verdict"
      style={{ color, background: softBg }}
    >
      <span className="bz-verdict-dot" />
      <span>{label}</span>
    </div>
  );
}

function Paywall({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bz-paywall">
      <h4>{title}</h4>
      <p>{desc}</p>
      <a
        href={`${APP_URL}/billing`}
        target="_blank"
        rel="noreferrer"
        className="bz-btn-primary"
      >
        {i18n("paywall_btn", "Оформить Pro")}
      </a>
    </div>
  );
}

function NeedLogin() {
  return (
    <div className="bz-paywall">
      <h4>{i18n("need_login_title", "Войдите, чтобы продолжить")}</h4>
      <p>{i18n("need_login_desc", "Откройте расширение (значок вверху браузера) и войдите в аккаунт.")}</p>
      <a
        href={`${APP_URL}/login`}
        target="_blank"
        rel="noreferrer"
        className="bz-btn-primary"
      >
        {i18n("popup_login", "Войти")}
      </a>
    </div>
  );
}

function LogoSvg() {
  return (
    <svg width={18} height={18} viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="26" cy="26" r="16" stroke="#1B2330" strokeWidth="4" />
      <path d="M38 38 L54 54" stroke="#1B2330" strokeWidth="4" strokeLinecap="round" />
      <path d="M26 26 Q40 22 52 14" stroke="#C77A1F" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="52" cy="14" r="3" fill="#C77A1F" />
    </svg>
  );
}

function hexToSoft(hex: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m || !m[1]) return "#F4F0E8";
  const h = m[1];
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * 0.86);
  const hex2 = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex2(mix(r))}${hex2(mix(g))}${hex2(mix(b))}`;
}
