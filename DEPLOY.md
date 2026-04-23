# Деплой Безбрехни в production

## TL;DR

```bash
cp .env.example .env
# заполнить секреты (см. раздел ниже)
mkdir -p .secrets && cp ~/Downloads/sa-key.json .secrets/sa-key.json

make install
make deploy
```

## Требуемые секреты и ресурсы

| Переменная                | Где взять                                                                                     | Обязательна? |
| ------------------------- | --------------------------------------------------------------------------------------------- | ------------ |
| `JWT_SECRET`              | Сгенерировать: `openssl rand -hex 48`                                                         | Да           |
| `YC_FOLDER_ID`            | Yandex Cloud Console → папка → «Обзор»                                                        | Да           |
| `YC_SERVICE_ACCOUNT_ID`   | Создать SA с ролями `ydb.editor`, `ai.languageModels.user`, `functions.functionInvoker`       | Да           |
| `.secrets/sa-key.json`    | `yc iam key create --service-account-id <id> --output .secrets/sa-key.json`                   | Да           |
| `YDB_ENDPOINT`, `YDB_DATABASE` | Создать YDB Serverless database, скопировать endpoint+path из консоли                    | Да           |
| `YANDEX_GPT_API_KEY`      | `yc iam api-key create --service-account-id <ai-sa-id>`                                      | Да           |
| `YANDEX_GPT_FOLDER_ID`    | Обычно = `YC_FOLDER_ID`                                                                       | Да           |
| `YOOKASSA_SHOP_ID`        | ЛК ЮKassa → «Интеграция» → «Ключи»                                                           | Да для оплаты |
| `YOOKASSA_SECRET_KEY`     | Там же                                                                                        | Да для оплаты |
| `S3_BUCKET_WEB`           | Имя бакета для сайта (должно быть уникально)                                                  | Да           |
| `S3_ACCESS_KEY_ID`        | Создать статические ключи для SA в Yandex Cloud                                               | Да           |
| `S3_SECRET_ACCESS_KEY`    | То же                                                                                         | Да           |
| `SMARTCAPTCHA_SITE_KEY`   | Yandex SmartCaptcha → «Создать капчу»                                                         | Опц. (MVP)   |
| `SMARTCAPTCHA_SERVER_KEY` | Там же                                                                                        | Опц. (MVP)   |

## Шаги

### 1. Создать инфраструктуру Yandex Cloud

```bash
yc config profile create bezbrehni
yc config set cloud-id <cloud-id>
yc config set folder-id <folder-id>

# Сервисный аккаунт
yc iam service-account create --name bezbrehni-sa
SA_ID=$(yc iam service-account get --name bezbrehni-sa --format json | jq -r .id)

yc resource-manager folder add-access-binding --name <folder-name> --role ydb.editor --subject serviceAccount:$SA_ID
yc resource-manager folder add-access-binding --name <folder-name> --role ai.languageModels.user --subject serviceAccount:$SA_ID
yc resource-manager folder add-access-binding --name <folder-name> --role storage.editor --subject serviceAccount:$SA_ID

yc iam key create --service-account-id $SA_ID --output .secrets/sa-key.json

# YDB Serverless
yc ydb database create bezbrehni --serverless

# Object Storage bucket
yc storage bucket create --name $S3_BUCKET_WEB
```

### 2. Заполнить `.env`

Скопировать `.env.example` и заполнить значениями, полученными на шаге 1, плюс `JWT_SECRET`, ЮKassa и YandexGPT API key.

### 3. Запустить деплой

```bash
make install
make deploy
```

Это:

1. `make deploy-ydb` — применит `infra/ydb/schema.yql` к вашему YDB.
2. `make deploy-api` — соберёт backend и опубликует Cloud Function.
3. `make deploy-web` — соберёт Next.js сайт и загрузит в Object Storage.
4. `make zip-ext` — соберёт production-бандл расширения и упакует в `bezbrehni-extension.zip` для загрузки в Chrome Web Store.

### 4. Привязать домены

См. [docs/dns.md](docs/dns.md). После создания Cloud Function она получит URL вида
`https://functions.yandexcloud.net/<id>`. Перед ним поставьте Yandex Cloud API Gateway с custom domain `api.xn--80aaxzavh.xn--p1ai`.

Для сайта привяжите `xn--80aaxzavh.xn--p1ai` и `app.xn--80aaxzavh.xn--p1ai` к Object Storage website endpoint через CNAME (или настройте Cloud CDN c origin = бакет).

### 5. Настроить webhook ЮKassa

В ЛК ЮKassa → «Уведомления» добавить URL
`https://api.xn--80aaxzavh.xn--p1ai/billing/webhook` и включить события `payment.succeeded` и `payment.canceled`.

### 6. Загрузить расширение

- Chrome Web Store: https://chrome.google.com/webstore/devconsole — загрузить `bezbrehni-extension.zip`.
- Microsoft Edge Add-ons: https://partner.microsoft.com/en-us/dashboard/microsoftedge — тот же zip.
- Yandex Browser: работает через совместимость с Chrome Web Store.

## Permission warnings

При установке пользователь увидит:

- **Читать и изменять данные на всех сайтах, которые вы посещаете** — нужно для `activeTab` + работы content script на любой странице. Мы обращаемся только к выделенному блоку и никуда больше.
- **Сохранять данные в браузере** — для токена авторизации (`storage`).

Ни один host permission, кроме `api.xn--80aaxzavh.xn--p1ai`, мы не запрашиваем.
