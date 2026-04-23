#!/usr/bin/env bash
# Собирает Next.js сайт в статический export и заливает в Yandex Object Storage.
# Требует:
#   - собранный out/ из apps/web (pnpm build:web)
#   - aws CLI (используем S3-совместимый endpoint Yandex Object Storage)
# Env:
#   S3_BUCKET_WEB
#   S3_ENDPOINT (default https://storage.yandexcloud.net)
#   S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
#   S3_REGION (default ru-central1)
set -euo pipefail

: "${S3_BUCKET_WEB:?S3_BUCKET_WEB is required}"
: "${S3_ACCESS_KEY_ID:?S3_ACCESS_KEY_ID is required}"
: "${S3_SECRET_ACCESS_KEY:?S3_SECRET_ACCESS_KEY is required}"
ENDPOINT="${S3_ENDPOINT:-https://storage.yandexcloud.net}"
REGION="${S3_REGION:-ru-central1}"

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${ROOT}/apps/web/out"

if [[ ! -d "${OUT}" ]]; then
  echo "Сначала запустите: pnpm --filter @bezbrehni/web build" >&2
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI не установлен." >&2
  exit 1
fi

export AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY}"
export AWS_DEFAULT_REGION="${REGION}"

echo "Создаём bucket ${S3_BUCKET_WEB} (если ещё нет)..."
aws --endpoint-url "${ENDPOINT}" s3api create-bucket --bucket "${S3_BUCKET_WEB}" 2>/dev/null || true

echo "Включаем статический веб-хостинг..."
aws --endpoint-url "${ENDPOINT}" s3 website "s3://${S3_BUCKET_WEB}/" \
  --index-document index.html --error-document 404/index.html || true

echo "Заливаем файлы..."
aws --endpoint-url "${ENDPOINT}" s3 sync "${OUT}" "s3://${S3_BUCKET_WEB}/" \
  --delete \
  --cache-control "public, max-age=300"

# Публичный доступ на чтение
aws --endpoint-url "${ENDPOINT}" s3api put-bucket-acl --bucket "${S3_BUCKET_WEB}" --acl public-read || true

echo "Готово. Bucket: https://${S3_BUCKET_WEB}.website.yandexcloud.net/"
