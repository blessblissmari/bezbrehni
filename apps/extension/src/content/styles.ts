export const SHADOW_STYLES = `
:host {
  all: initial;
  color-scheme: light;
}
* { box-sizing: border-box; }
.bz-root {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "PT Sans", Roboto, "Noto Sans", Arial, sans-serif;
  color: #1B2330;
  line-height: 1.5;
  font-size: 14px;
}
.bz-trigger {
  position: fixed;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: #FFFFFF;
  border: 1px solid #E6E3DC;
  box-shadow: 0 8px 28px rgba(27, 35, 48, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2147483645;
  transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease;
  opacity: 0;
  transform: scale(0.9);
  pointer-events: none;
}
.bz-trigger.visible {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}
.bz-trigger:hover {
  box-shadow: 0 14px 42px rgba(27, 35, 48, 0.16);
  transform: scale(1.04);
}
.bz-trigger:focus-visible {
  outline: 3px solid rgba(46, 95, 203, 0.35);
  outline-offset: 2px;
}

.bz-popup {
  position: fixed;
  width: 360px;
  max-width: calc(100vw - 24px);
  background: #FFFFFF;
  border: 1px solid #E6E3DC;
  border-radius: 14px;
  box-shadow: 0 14px 42px rgba(27, 35, 48, 0.16);
  padding: 16px 16px 14px;
  z-index: 2147483646;
  animation: bz-fade-in 0.18s ease;
  /* Важно: shadow-host выставляет pointer-events: none (чтобы ловить hover под
     собой на странице), и без явного auto клики уходят сквозь popup — кнопки
     «не нажимаются», а document-level mousedown-хэндлер видит цель вне shadow
     и закрывает окно. */
  pointer-events: auto;
}
@keyframes bz-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.bz-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.bz-popup-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1B2330;
}
.bz-close {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #5C6475;
  font-size: 20px;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 8px;
}
.bz-close:hover { background: #F4F0E8; color: #1B2330; }

.bz-verdict {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  margin-bottom: 8px;
}
.bz-verdict-dot {
  width: 8px; height: 8px; border-radius: 999px; background: currentColor;
}
.bz-summary {
  color: #1B2330;
  font-size: 14px;
  line-height: 1.5;
  margin: 2px 0 10px;
}
.bz-reasons {
  margin: 0 0 8px;
  padding-left: 18px;
  color: #5C6475;
  font-size: 13px;
}
.bz-reasons li { margin-bottom: 2px; }
.bz-confidence {
  font-size: 12px;
  color: #5C6475;
  margin-bottom: 10px;
}
.bz-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.bz-action {
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid #E6E3DC;
  background: #FAF8F4;
  font-size: 12px;
  color: #1B2330;
  cursor: pointer;
  transition: background 0.12s;
}
.bz-action:hover { background: #F4F0E8; }
.bz-action:disabled { opacity: 0.5; cursor: not-allowed; }

.bz-pro-result {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #FAF8F4;
  border: 1px solid #E6E3DC;
  color: #1B2330;
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
}

.bz-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #5C6475;
  padding: 6px 0;
}
.bz-spinner {
  width: 14px; height: 14px; border-radius: 999px;
  border: 2px solid #E6E3DC; border-top-color: #2E5FCB;
  animation: bz-spin 0.8s linear infinite;
}
@keyframes bz-spin { to { transform: rotate(360deg); } }

.bz-paywall {
  background: #F4F0E8;
  border: 1px solid #E6E3DC;
  border-radius: 10px;
  padding: 12px;
  margin-top: 10px;
}
.bz-paywall h4 { margin: 0 0 4px; font-size: 14px; color: #1B2330; }
.bz-paywall p { margin: 0 0 10px; font-size: 13px; color: #5C6475; }
.bz-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  background: #2E5FCB;
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
}
.bz-btn-primary:hover { background: #244FA8; }
.bz-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  background: #FFFFFF;
  color: #1B2330;
  border: 1px solid #E6E3DC;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
}

.bz-error {
  color: #B0463E;
  font-size: 13px;
  margin-top: 6px;
}

.bz-ask-form { display: flex; gap: 6px; margin-top: 8px; }
.bz-ask-form input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #E6E3DC;
  border-radius: 10px;
  background: #FFFFFF;
  font-size: 13px;
  color: #1B2330;
  font-family: inherit;
}
.bz-ask-form input:focus {
  outline: none;
  border-color: #2E5FCB;
  box-shadow: 0 0 0 3px rgba(46, 95, 203, 0.15);
}
`;
