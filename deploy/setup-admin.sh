#!/usr/bin/env bash
# Разворачивает исходники классического сайта на сервере и запускает админку
# по адресу https://devlarion.ru/admin/. Повторный запуск обновляет код, не трогая
# content/site.json на сервере (его правят через админку) и пароль.
# Использование: deploy/setup-admin.sh [HOST]
set -euo pipefail
HOST="${1:-root@13.143.207.212}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"

ssh "$HOST" 'id devlarion >/dev/null 2>&1 || useradd --system --home /opt/devlarion --shell /usr/sbin/nologin devlarion; mkdir -p /opt/devlarion/classic'
rsync -az --exclude .git --exclude node_modules --exclude .omc \
  --exclude 'content/site.json' --exclude '.devlarion-referrals.json' \
  "$REPO/" "$HOST:/opt/devlarion/classic/"
ssh "$HOST" '[ -f /opt/devlarion/classic/content/site.json ]' || \
  rsync -az "$REPO/content/site.json" "$HOST:/opt/devlarion/classic/content/site.json"
scp -q "$REPO/deploy/devlarion-admin.service" "$HOST:/etc/systemd/system/devlarion-admin.service"
scp -q "$REPO/deploy/nginx-devlarion-admin.conf" "$HOST:/etc/nginx/snippets/devlarion-admin.conf"

ssh "$HOST" bash -s <<'REMOTE'
set -euo pipefail
chown -R devlarion:devlarion /opt/devlarion/classic
cd /opt/devlarion/classic
sudo -u devlarion env DEVLARION_SITE_URL=https://devlarion.ru/ DEVLARION_MOTION_URL=https://motion.devlarion.ru/ \
  DEVLARION_STUDIO_URL=https://studio.devlarion.ru/ /usr/local/bin/node scripts/build.mjs >/dev/null
chmod o+rx /opt/devlarion /opt/devlarion/classic
if [ ! -L /var/www/devlarion/classic ]; then rm -rf /var/www/devlarion/classic; ln -s /opt/devlarion/classic/docs /var/www/devlarion/classic; fi

if [ ! -f /etc/nginx/devlarion-admin.htpasswd ]; then
  pass="$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-20)"
  printf 'admin:%s\n' "$(openssl passwd -apr1 "$pass")" > /etc/nginx/devlarion-admin.htpasswd
  chown root:www-data /etc/nginx/devlarion-admin.htpasswd; chmod 640 /etc/nginx/devlarion-admin.htpasswd
  printf 'https://devlarion.ru/admin/\nлогин: admin\nпароль: %s\n' "$pass" > /root/devlarion-admin.txt; chmod 600 /root/devlarion-admin.txt
fi
echo 'limit_req_zone $binary_remote_addr zone=devlarion_admin:1m rate=30r/m;' > /etc/nginx/conf.d/devlarion-admin-limit.conf
python3 - <<'PY'
p='/etc/nginx/sites-available/devlarion.conf'; s=open(p).read()
if 'snippets/devlarion-admin.conf' not in s:
    head='    server_name devlarion.ru;\n'
    i=s.index(head)+len(head)
    s=s[:i]+'    include snippets/devlarion-admin.conf;\n'+s[i:]
    open(p,'w').write(s)
PY
systemctl daemon-reload
systemctl enable devlarion-admin >/dev/null 2>&1
systemctl restart devlarion-admin
nginx -t 2>&1 | tail -1
systemctl reload nginx
REMOTE
echo "Админка: https://devlarion.ru/admin/ (логин и пароль: ssh $HOST cat /root/devlarion-admin.txt)"
