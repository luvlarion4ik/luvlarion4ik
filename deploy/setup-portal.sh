#!/usr/bin/env bash
# Разворачивает личный кабинет на сервере. Требует setup-admin.sh (пользователь, пароль админки).
# Токен бота: ssh HOST, затем в /etc/devlarion-portal.env задать
#   TELEGRAM_BOT_TOKEN=...  TELEGRAM_BOT_USERNAME=имя_бота   и выполнить systemctl restart devlarion-portal
set -euo pipefail
HOST="${1:-root@13.143.207.212}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
# одно общее SSH-соединение: сервер режет частые новые подключения
O="-o ControlMaster=auto -o ControlPath=/tmp/dlssh-%C -o ControlPersist=120"
ssh() { command ssh $O "$@"; }
scp() { command scp $O "$@"; }
rsync() { command rsync -e "ssh $O" "$@"; }
ssh "$HOST" 'mkdir -p /opt/devlarion/portal /var/lib/devlarion-portal'
rsync -az --delete "$REPO/portal/" "$HOST:/opt/devlarion/portal/" --exclude data
scp -q "$REPO/deploy/devlarion-portal.service" "$HOST:/etc/systemd/system/devlarion-portal.service"
scp -q "$REPO/deploy/nginx-devlarion-portal.conf" "$HOST:/etc/nginx/snippets/devlarion-portal.conf"
ssh "$HOST" bash -s <<'REMOTE'
set -euo pipefail
chown -R devlarion:devlarion /var/lib/devlarion-portal; chmod 700 /var/lib/devlarion-portal
[ -f /etc/devlarion-portal.env ] || { printf 'TELEGRAM_BOT_TOKEN=\nTELEGRAM_BOT_USERNAME=\n' > /etc/devlarion-portal.env; }
chown root:devlarion /etc/devlarion-portal.env; chmod 640 /etc/devlarion-portal.env
python3 - <<'PY'
p='/etc/nginx/sites-available/devlarion.conf'; s=open(p).read()
if 'snippets/devlarion-portal.conf' not in s:
    h='    include snippets/devlarion-admin.conf;\n'
    assert h in s
    s=s.replace(h,h+'    include snippets/devlarion-portal.conf;\n',1); open(p,'w').write(s)
PY
systemctl daemon-reload; systemctl enable devlarion-portal >/dev/null 2>&1; systemctl restart devlarion-portal
nginx -t 2>&1 | tail -1; systemctl reload nginx
REMOTE
echo "Кабинет: https://devlarion.ru/account/   Управление: https://devlarion.ru/account/admin/"
