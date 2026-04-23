# Безбрехни — AI-расширение для проверки контента

Production-ready MVP для домена **безбрехни.рф** (`xn--80aaxzavh.xn--p1ai`).

## Что внутри

Monorepo на pnpm workspaces:

- `apps/web` — сайт и личный кабинет (Next.js 14 + Tailwind, статический экспорт в Yandex Object Storage).
- `apps/extension` — браузерное расширение (React + Vite, Manifest V3 для Chrome/Edge/Yandex Browser).
- `apps/api` — backend (TypeScript + Yandex Cloud Functions, один HTTP-handler роутит все эндпоинты).
- `packages/shared` — общие типы, константы, валидаторы.
- `packages/ai` — промпты и клиент YandexGPT.
- `packages/ui` — общие UI-компоненты (тема, кнопки).
- `infra/` — схема YDB и deploy-скрипты.
- `docs/dns.md` — план DNS-записей для домена `безбрехни.рф`.

## Быстрый старт (локальная разработка)

```bash
corepack enable
pnpm install
cp .env.example .env
# заполнить переменные
pnpm dev:api   # backend на :8787 (эмулятор Cloud Functions)
pnpm dev:web   # сайт на :3000
pnpm dev:ext   # билд extension + watch
```

Загрузить в Chrome: `chrome://extensions` → «Загрузить распакованное расширение» → `apps/extension/dist`.

## Деплой

Требуются секреты из `.env` (см. `.env.example`). Затем:

```bash
make deploy          # всё сразу
make deploy-ydb      # применить схему YDB
make deploy-api      # опубликовать Cloud Functions
make deploy-web      # собрать и залить сайт в Object Storage
make build-ext       # production-сборка расширения (zip для Chrome Web Store)
```

Подробно: [DEPLOY.md](./DEPLOY.md).

## Архитектура

```
┌─────────────┐     ┌─────────────┐
│  Extension  │     │  Next.js    │
│  (MV3)      │     │  landing +  │
└──────┬──────┘     │  кабинет    │
       │            └──────┬──────┘
       │ fetch JSON + JWT  │
       ▼                   ▼
     ┌───────────────────────┐
     │  Yandex Cloud Function│
     │  /auth /user /usage   │
     │  /analyze /billing    │
     └──┬─────────┬──────┬───┘
        │         │      │
        ▼         ▼      ▼
      YDB    YandexGPT  ЮKassa
```

Весь пользовательский UI строго на русском. Локализация расширения — через `_locales/ru/messages.json` и `default_locale: "ru"`.

## Лимиты и тарифы

- **Free** — 3 проверки суммарно за всё время, только базовая проверка.
- **Pro** — на 30 дней, все действия (саммари, вопрос по фрагменту, объяснение, риски, противоречия, переписать понятнее, задачи).
- Все проверки прав — только на backend (`apps/api/src/access.ts`).

## Недостающие секреты для полного production-деплоя

После клонирования заполните `.env` (копия `.env.example`) и поместите JSON-ключ сервисного аккаунта в `.secrets/sa-key.json`. Подробный список — в `DEPLOY.md`.

## Лицензия

Proprietary. Все права защищены.
