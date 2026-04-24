#!/usr/bin/env bash
# Собирает и публикует Yandex Cloud Function для API.
# Требует:
#   - yc CLI (авторизованный)
#   - собранный бандл apps/api/dist (pnpm build:api)
# Env:
#   YC_FOLDER_ID
#   YC_SERVICE_ACCOUNT_ID  — сервисный аккаунт для функции (нужен для YDB + Secret Manager)
#   API_FUNCTION_NAME      (default: bezbrehni-api)
#   YDB_ENDPOINT, YDB_DATABASE, YANDEX_GPT_API_KEY, YANDEX_GPT_FOLDER_ID,
#   YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY, JWT_SECRET, APP_URL, API_URL, YOOKASSA_RETURN_URL
set -euo pipefail

: "${YC_FOLDER_ID:?YC_FOLDER_ID is required}"
: "${YC_SERVICE_ACCOUNT_ID:?YC_SERVICE_ACCOUNT_ID is required}"
FUNC_NAME="${API_FUNCTION_NAME:-bezbrehni-api}"

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BUNDLE="${ROOT}/apps/api/dist"

if [[ ! -f "${BUNDLE}/index.js" ]]; then
  echo "Сначала запустите: pnpm --filter @bezbrehni/api build" >&2
  exit 1
fi

# Создаём функцию, если ещё нет
if ! yc serverless function get --name "${FUNC_NAME}" --folder-id "${YC_FOLDER_ID}" >/dev/null 2>&1; then
  echo "Создаём функцию ${FUNC_NAME}..."
  yc serverless function create \
    --name "${FUNC_NAME}" \
    --folder-id "${YC_FOLDER_ID}" \
    --description "Безбрехни API"
fi

TMP_ZIP="$(mktemp -d)/bundle.zip"
( cd "${BUNDLE}" && zip -qr "${TMP_ZIP}" . )

echo "Публикуем версию..."
yc serverless function version create \
  --function-name "${FUNC_NAME}" \
  --folder-id "${YC_FOLDER_ID}" \
  --runtime nodejs22 \
  --entrypoint "index.handler" \
  --memory 256m \
  --execution-timeout 30s \
  --service-account-id "${YC_SERVICE_ACCOUNT_ID}" \
  --source-path "${TMP_ZIP}" \
  --environment "JWT_SECRET=${JWT_SECRET:?}" \
  --environment "APP_URL=${APP_URL:-https://xn--90aalbii8aw0c.xn--p1ai}" \
  --environment "API_URL=${API_URL:-https://api.xn--90aalbii8aw0c.xn--p1ai}" \
  --environment "YOOKASSA_RETURN_URL=${YOOKASSA_RETURN_URL:-https://xn--90aalbii8aw0c.xn--p1ai/billing/success}" \
  --environment "YDB_ENDPOINT=${YDB_ENDPOINT:?}" \
  --environment "YDB_DATABASE=${YDB_DATABASE:?}" \
  --environment "YANDEX_GPT_API_KEY=${YANDEX_GPT_API_KEY:?}" \
  --environment "YANDEX_GPT_FOLDER_ID=${YANDEX_GPT_FOLDER_ID:?}" \
  --environment "YANDEX_GPT_MODEL=${YANDEX_GPT_MODEL:-yandexgpt-lite/latest}" \
  --environment "YOOKASSA_SHOP_ID=${YOOKASSA_SHOP_ID:?}" \
  --environment "YOOKASSA_SECRET_KEY=${YOOKASSA_SECRET_KEY:?}" \
  --environment "YOOKASSA_PRO_PRICE_RUB=${YOOKASSA_PRO_PRICE_RUB:-299}" \
  --environment "YOOKASSA_PRO_DAYS=${YOOKASSA_PRO_DAYS:-30}"

echo "Разрешаем публичный вызов..."
yc serverless function allow-unauthenticated-invoke --name "${FUNC_NAME}" --folder-id "${YC_FOLDER_ID}" || true

echo "Готово. Функция ${FUNC_NAME} опубликована."
yc serverless function get --name "${FUNC_NAME}" --folder-id "${YC_FOLDER_ID}" --format json | jq '{id, http_invoke_url}'
