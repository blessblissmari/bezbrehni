#!/usr/bin/env bash
# Собирает extension в production-режиме и пакует в zip для Chrome Web Store.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${ROOT}"

echo "Собираем extension..."
pnpm --filter @bezbrehni/extension build

DIST="${ROOT}/apps/extension/dist"
OUT="${ROOT}/bezbrehni-extension.zip"
rm -f "${OUT}"

( cd "${DIST}" && zip -qr "${OUT}" . )

echo "Готово: ${OUT}"
ls -la "${OUT}"
