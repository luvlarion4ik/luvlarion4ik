set -e
install -d /opt/tg-bridge
cat > /opt/tg-bridge/bridge.mjs <<'EOF'
// Пересылает запросы на api.telegram.org. Слушает только localhost; доступен через SSH-туннель.
import { createServer } from 'node:http';
import { request } from 'node:https';
createServer((req, res) => {
  if (!/^\/(bot|file\/bot)[0-9]+:[\w-]+\//.test(req.url)) { res.writeHead(404).end(); return; }
  const up = request({ host: 'api.telegram.org', path: req.url, method: req.method, headers: { ...req.headers, host: 'api.telegram.org' }, timeout: 30000 }, r => {
    res.writeHead(r.statusCode, r.headers); r.pipe(res);
  });
  up.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
  up.on('timeout', () => up.destroy());
  req.pipe(up);
}).listen(8088, '127.0.0.1');
EOF
cat > /etc/systemd/system/tg-bridge.service <<'EOF'
[Unit]
Description=Telegram API bridge for devlarion.ru (localhost only)
After=network-online.target

[Service]
User=tgtunnel
ExecStart=/usr/bin/node /opt/tg-bridge/bridge.mjs
Restart=always
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now tg-bridge >/dev/null 2>&1
sleep 1
systemctl is-active tg-bridge
curl -s -m 8 -o /dev/null -w 'bridge /: %{http_code}\n' http://127.0.0.1:8088/
