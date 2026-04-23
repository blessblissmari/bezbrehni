/// <reference types="chrome" />
import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { BezbrehniPopup } from "./Popup";
import { extractContext, extractText, findContentBlock } from "./detect";
import { SHADOW_STYLES } from "./styles";
import { i18n } from "../lib/env";

const TRIGGER_OFFSET = 8;
const HIDE_DELAY_MS = 350;

class BezbrehniUI {
  private host: HTMLDivElement;
  private shadow: ShadowRoot;
  private triggerEl: HTMLButtonElement;
  private popupEl: HTMLDivElement;
  private popupRoot: Root | null = null;
  private currentBlock: HTMLElement | null = null;
  private hideTimer: number | null = null;
  private popupOpen = false;

  constructor() {
    this.host = document.createElement("div");
    this.host.setAttribute("id", "__bezbrehni_host");
    this.host.style.all = "initial";
    this.host.style.position = "fixed";
    this.host.style.top = "0";
    this.host.style.left = "0";
    this.host.style.width = "0";
    this.host.style.height = "0";
    this.host.style.pointerEvents = "none";
    this.host.style.zIndex = "2147483645";
    document.documentElement.appendChild(this.host);

    this.shadow = this.host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = SHADOW_STYLES;
    this.shadow.appendChild(style);

    this.triggerEl = document.createElement("button");
    this.triggerEl.className = "bz-trigger";
    this.triggerEl.type = "button";
    this.triggerEl.setAttribute("aria-label", i18n("action_check", "Проверить этот фрагмент"));
    this.triggerEl.innerHTML = logoSvg();
    this.triggerEl.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.openPopup();
    });
    this.shadow.appendChild(this.triggerEl);

    this.popupEl = document.createElement("div");
    this.popupEl.className = "bz-popup";
    this.popupEl.style.display = "none";
    this.shadow.appendChild(this.popupEl);
  }

  attach() {
    document.addEventListener("mousemove", this.onMouseMove, { passive: true });
    document.addEventListener("scroll", this.onScroll, { passive: true, capture: true });
    window.addEventListener("resize", this.onScroll, { passive: true });
    document.addEventListener("keydown", this.onKeyDown);
  }

  private onMouseMove = (e: MouseEvent) => {
    if (this.popupOpen) return;
    const target = e.target as Element | null;
    if (!target) return;
    if (this.isOurElement(target)) return;
    const block = findContentBlock(target);
    if (!block) {
      this.scheduleHide();
      return;
    }
    this.currentBlock = block;
    this.showTriggerFor(block);
  };

  private onScroll = () => {
    if (this.popupOpen) return;
    if (this.currentBlock) this.showTriggerFor(this.currentBlock);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && this.popupOpen) this.closePopup();
  };

  private isOurElement(el: Element | null): boolean {
    if (!el) return false;
    let cur: Node | null = el;
    while (cur) {
      if (cur === this.host) return true;
      cur = (cur as Node & { parentNode?: Node | null }).parentNode || null;
    }
    return false;
  }

  private scheduleHide() {
    if (this.hideTimer) window.clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(() => {
      if (!this.popupOpen) {
        this.triggerEl.classList.remove("visible");
        this.currentBlock = null;
      }
    }, HIDE_DELAY_MS);
  }

  private showTriggerFor(block: HTMLElement) {
    if (this.hideTimer) {
      window.clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    const rect = block.getBoundingClientRect();
    if (rect.width < 20 || rect.height < 20) return;
    const top = Math.max(6, rect.top + TRIGGER_OFFSET);
    const left = Math.min(
      window.innerWidth - 46,
      rect.right - 44,
    );
    this.triggerEl.style.top = `${top}px`;
    this.triggerEl.style.left = `${left}px`;
    this.triggerEl.classList.add("visible");
  }

  private openPopup() {
    const block = this.currentBlock;
    if (!block) return;
    const text = extractText(block);
    if (!text || text.length < 10) return;
    const ctx = extractContext(block);
    this.popupOpen = true;
    this.triggerEl.classList.remove("visible");
    this.positionPopup(block);
    this.popupEl.style.display = "block";
    if (!this.popupRoot) this.popupRoot = createRoot(this.popupEl);
    this.popupRoot.render(
      <BezbrehniPopup
        text={text}
        pageUrl={ctx.url}
        pageTitle={ctx.title}
        onClose={() => this.closePopup()}
      />,
    );

    document.addEventListener("mousedown", this.onOutside, true);
  }

  private onOutside = (e: MouseEvent) => {
    const t = e.target as Element | null;
    if (!t) return;
    if (this.isOurElement(t)) return;
    this.closePopup();
  };

  private closePopup() {
    this.popupOpen = false;
    this.popupEl.style.display = "none";
    if (this.popupRoot) {
      this.popupRoot.render(<></>);
    }
    document.removeEventListener("mousedown", this.onOutside, true);
  }

  private positionPopup(block: HTMLElement) {
    const rect = block.getBoundingClientRect();
    const popupWidth = 360;
    const popupMargin = 12;
    let left = rect.right + popupMargin;
    if (left + popupWidth > window.innerWidth - 8) {
      left = Math.max(8, rect.left - popupWidth - popupMargin);
      if (left < 8) left = Math.max(8, window.innerWidth - popupWidth - 8);
    }
    let top = Math.max(8, rect.top);
    if (top + 400 > window.innerHeight) {
      top = Math.max(8, window.innerHeight - 420);
    }
    this.popupEl.style.top = `${top}px`;
    this.popupEl.style.left = `${left}px`;
  }
}

function logoSvg(): string {
  return `<svg width="22" height="22" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <circle cx="26" cy="26" r="16" stroke="#1B2330" stroke-width="4"/>
    <path d="M38 38 L54 54" stroke="#1B2330" stroke-width="4" stroke-linecap="round"/>
    <path d="M26 26 Q40 22 52 14" stroke="#C77A1F" stroke-width="4" stroke-linecap="round" fill="none"/>
    <circle cx="52" cy="14" r="3" fill="#C77A1F"/>
  </svg>`;
}

// Init
if (!(window as unknown as { __bezbrehni_init?: boolean }).__bezbrehni_init) {
  (window as unknown as { __bezbrehni_init?: boolean }).__bezbrehni_init = true;
  const ui = new BezbrehniUI();
  ui.attach();
}
