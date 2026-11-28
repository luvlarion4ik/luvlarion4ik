set -e
cat > /etc/systemd/system/tg-tunnel.service <<'EOF'
[Unit]
Description=SSH tunnel to the Telegram bridge in Riga (127.0.0.1:8088)
After=network-online.target

[Service]
ExecStart=/usr/bin/ssh -N -L 127.0.0.1:8088:127.0.0.1:8088 -i /etc/devlarion-tunnel -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=/etc/devlarion-tunnel.known_hosts -o ExitOnForwardFailure=yes -o ServerAliveInterval=15 -o ServerAliveCountMax=3 tgtunnel@81.85.74.248
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now tg-tunnel >/dev/null 2>&1
sleep 3
systemctl is-active tg-tunnel
. /etc/devlarion-portal.env
curl -s -m 15 "http://127.0.0.1:8088/bot${TELEGRAM_BOT_TOKEN}/getMe" | grep -o '"ok":[a-z]*\|"username":"[^"]*"'
