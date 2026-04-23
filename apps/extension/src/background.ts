/// <reference types="chrome" />
import { apiCall } from "./lib/api";
import type {
  AnalyzeRequest,
  AnalyzeResult,
  ProActionRequest,
  ProActionResult,
} from "@bezbrehni/shared";

export interface BgMessage {
  type:
    | "analyze"
    | "pro_action"
    | "get_usage"
    | "ping";
  payload?: unknown;
}

export interface AnalyzeMessage extends BgMessage {
  type: "analyze";
  payload: AnalyzeRequest;
}
export interface ProActionMessage extends BgMessage {
  type: "pro_action";
  payload: ProActionRequest;
}

chrome.runtime.onMessage.addListener((msg: BgMessage, _sender, sendResponse) => {
  (async () => {
    try {
      if (msg.type === "ping") {
        sendResponse({ ok: true });
        return;
      }
      if (msg.type === "analyze") {
        const p = (msg as AnalyzeMessage).payload;
        const res = await apiCall<{ result: AnalyzeResult; usage: { used_total: number } }>(
          "/analyze",
          { method: "POST", body: p },
        );
        sendResponse({ ok: true, data: res });
        return;
      }
      if (msg.type === "pro_action") {
        const p = (msg as ProActionMessage).payload;
        const res = await apiCall<{ result: ProActionResult }>(
          "/analyze/pro-action",
          { method: "POST", body: p },
        );
        sendResponse({ ok: true, data: res });
        return;
      }
      if (msg.type === "get_usage") {
        const res = await apiCall("/usage");
        sendResponse({ ok: true, data: res });
        return;
      }
      sendResponse({ ok: false, error: "unknown_message" });
    } catch (e) {
      const err = e as { status?: number; code?: string; message?: string };
      sendResponse({
        ok: false,
        error: err.code || "error",
        status: err.status ?? 500,
        message: err.message || "Ошибка",
      });
    }
  })();
  return true; // async response
});
