#!/usr/bin/env bash
# Применяет схему YDB. Требует установленного ydb CLI и авторизации.
# Env:
#   YDB_ENDPOINT  — полный grpcs://...:2135
#   YDB_DATABASE  — /ru-central1/<cloud>/<db-id>
#   YC_SA_KEY_FILE (опционально) — json-ключ сервисного аккаунта
set -euo pipefail

: "${YDB_ENDPOINT:?YDB_ENDPOINT is required}"
: "${YDB_DATABASE:?YDB_DATABASE is required}"

SCHEMA_FILE="$(cd "$(dirname "$0")/.." && pwd)/ydb/schema.yql"

AUTH_ARGS=()
if [[ -n "${YC_SA_KEY_FILE:-}" && -f "${YC_SA_KEY_FILE}" ]]; then
  AUTH_ARGS=(--sa-key-file "${YC_SA_KEY_FILE}")
elif [[ -n "${YC_IAM_TOKEN:-}" ]]; then
  AUTH_ARGS=(--iam-token "${YC_IAM_TOKEN}")
else
  echo "Внимание: ни YC_SA_KEY_FILE, ни YC_IAM_TOKEN не заданы — надеемся на yc config." >&2
fi

if ! command -v ydb >/dev/null 2>&1; then
  echo "ydb CLI не установлен. Установите: https://ydb.tech/ru/docs/reference/ydb-cli/install" >&2
  exit 1
fi

echo "Применяем схему к ${YDB_DATABASE}..."
ydb -e "${YDB_ENDPOINT}" -d "${YDB_DATABASE}" "${AUTH_ARGS[@]}" \
  scripting yql -f "${SCHEMA_FILE}"
echo "Схема применена."
