#!/usr/bin/env bash
# Собирает четыре сайта Devlarion под devlarion.ru и выкладывает их на сервер.
# Нужен вход на сервер по SSH-ключу (ssh-copy-id root@HOST).
# Использование: deploy/deploy.sh [HOST]; MOTION_DIR=путь — собрать motion из локальной копии.
# nginx-конфиги и сертификаты уже на сервере (certbot правит devlarion.conf), скрипт их не перезаписывает.
set -euo pipefail

HOST="${1:-root@13.143.207.212}"
DOMAIN="devlarion.ru"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
STUDIO_DIR="${STUDIO_DIR:-$HOME/Desktop/Work/DevLarion_Studio}"
MOTION_REPO="${MOTION_REPO:-luvlarion4ik/devlarion-motion}"
WORK="$(mktemp -d)"
OUT="$WORK/out"
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$OUT"

export DEVLARION_SITE_URL="https://$DOMAIN/"
export DEVLARION_MOTION_URL="https://motion.$DOMAIN/"
export DEVLARION_STUDIO_URL="https://studio.$DOMAIN/"

echo "→ Motion-сайт"
if [ -n "${MOTION_DIR:-}" ]; then cp -R "$MOTION_DIR" "$WORK/motion"; else gh repo clone "$MOTION_REPO" "$WORK/motion" -- -q --depth 1; fi
(cd "$WORK/motion" && node src/build.mjs >/dev/null)
cp -R "$WORK/motion/docs" "$OUT/motion"

echo "→ Сборка и North Max"
(cd "$STUDIO_DIR" && VITE_DEVLARION_SITE_URL="https://$DOMAIN/" npx vite build --outDir "$OUT/studio" --emptyOutDir >/dev/null)
(cd "$STUDIO_DIR" && node scripts/build-north-max.mjs >/dev/null && cp -R dist-north-max "$OUT/north")

echo "→ Выкладка на $HOST"
ssh "$HOST" 'command -v nginx >/dev/null || (apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nginx rsync); mkdir -p /var/www/devlarion'
for site in motion studio north; do
  rsync -az --delete "$OUT/$site/" "$HOST:/var/www/devlarion/$site/"
done
# Классический сайт собирается на сервере вместе с админкой (content/site.json на сервере не перезаписывается).
"$REPO/deploy/setup-admin.sh" "$HOST"
echo "Готово."
