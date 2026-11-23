# Задача для Codex: включить ИИ в «Карте роста»

Код уже готов и проверен. Нужно только поднять сервер ИИ, вставить ключ, включить его на сайте и проверить. Ничего в логике не переписывать.

## Что есть в репозитории

- `server/growth-map/` — сервер ИИ без npm-зависимостей (Node.js 22). Инструкция: `server/growth-map/README.md`.
- `server/growth-map/.env.example` — шаблон настроек. Настоящий `.env` в git не попадает (он в `.gitignore`).
- `server/growth-map/deploy/devlarion-growth-map.service` — unit для systemd.
- `server/growth-map/deploy/nginx.conf` — блок `location /gm-ai/` для nginx.
- `content/site.json` → `growthMap.ai` и `growthMap.endpoint` включают ИИ на сайте. Пока `ai` = `"off"`, сайт работает на встроенном движке.

## Входные данные от владельца

1. Ключ CLODEX (`CLODEX_API_KEY`). Не коммитить, не выводить в логи и в ответы.
2. Сервер с Node.js 22 и nginx с HTTPS: SSH-доступ и домен. Если такого сервера нет, используй вариант Б (Cloudflare Workers).

Если чего-то из этого нет, остановись и спроси владельца. Ничего не выдумывай.

## Шаги

### 0. Код

Смержи PR `luvlarion4ik/luvlarion4ik#21` в `main` (или работай из ветки `claude/business-analysis-automation-b5abe2`, если владелец так скажет). Затем локально выполни и убедись, что всё зелёное:

```sh
npm run check
npm run test:gm
npm run test:gm-server
```

Добавь в `.github/workflows/check.yml` последней строкой шаг тестов сервера (у Claude не было прав на этот файл) и закоммить в `main`:

```yaml
      - run: node --test scripts/test-growth-map-server.mjs
```

### 1А. Сервер на VPS (основной вариант)

```sh
sudo useradd --system --home /opt/devlarion --shell /usr/sbin/nologin devlarion 2>/dev/null || true
sudo git clone https://github.com/luvlarion4ik/luvlarion4ik.git /opt/devlarion
cd /opt/devlarion/server/growth-map
sudo cp .env.example .env
sudo chown devlarion:devlarion .env && sudo chmod 600 .env
```

В `.env` впиши:
- `CLODEX_API_KEY=` ключ владельца;
- `ALLOWED_ORIGINS=https://luvlarion4ik.github.io` (если у сайта есть свой домен, добавь его через запятую, без `/` в конце).

Узнай id модели GPT Sol 6.2:

```sh
sudo -u devlarion node server.mjs --check
```

Команда напечатает список моделей ключа. Впиши в `.env` строку `GM_MODEL=` с точным id GPT Sol 6.2 из этого списка и запусти `--check` ещё раз. Он должен закончиться строкой `OK: key works, GM_MODEL=… is available`. Если GPT Sol 6.2 в списке нет, остановись и пришли владельцу список моделей.

Запусти как сервис:

```sh
sudo cp deploy/devlarion-growth-map.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now devlarion-growth-map
sudo systemctl status devlarion-growth-map --no-pager
curl -s http://127.0.0.1:8787/health
```

Ответ `/health`: `{"ok":true,"configured":true,"model":"…"}`.

Добавь содержимое `deploy/nginx.conf` в блок `server { listen 443 ssl; … }` нужного домена, затем `sudo nginx -t && sudo systemctl reload nginx`.

Адрес для сайта (дальше `ENDPOINT`): `https://ДОМЕН/gm-ai`.

### 1Б. Cloudflare Workers (если VPS нет)

```sh
cd server/growth-map
npx wrangler login
npx wrangler secret put CLODEX_API_KEY
```

В `wrangler.toml` заполни `GM_MODEL` (id GPT Sol 6.2; узнать его можно так: `CLODEX_API_KEY=… node server.mjs --check` локально, ключ при этом в файлы не пиши) и `ALLOWED_ORIGINS`. Затем `npx wrangler deploy`. `ENDPOINT` — выданный адрес `https://devlarion-growth-map.<account>.workers.dev`.

### 2. Проверка сервера снаружи

```sh
curl -s ENDPOINT/health
curl -si -X OPTIONS ENDPOINT/analyze -H 'Origin: https://luvlarion4ik.github.io' | head -5
curl -s ENDPOINT/parse -H 'Origin: https://luvlarion4ik.github.io' -H 'content-type: application/json' \
  -d '{"lang":"ru","text":"Барбершоп в Казани, 3 мастера, клиенты из Яндекс Карт и Instagram, записываем в директе, чек 1800, 400 стрижек в месяц"}'
```

Ожидается:
- `/health`: `configured: true`;
- `OPTIONS`: статус `204` и заголовок `access-control-allow-origin: https://luvlarion4ik.github.io`;
- `/parse`: JSON вида `{"brief":{"category":"beauty","niche":"barber",…}}`;
- запрос с `Origin: https://example.com` получает `403`.

### 3. Включить ИИ на сайте

В `content/site.json`:

```json
"growthMap": { "ai": "on", "endpoint": "ENDPOINT", … остальные поля не трогать … }
```

`endpoint` должен быть с `https://` и без `/` в конце. Затем:

```sh
npm run build
npm run check
npm run test:gm
npm run test:gm-server
git add content/site.json docs README.md README.ru.md server/growth-map/data.mjs
git commit -m "Turn on the AI review in the growth map"
git push origin main
```

GitHub Pages обновится сам. Политика конфиденциальности при `ai: "on"` дополняется автоматически.

### 4. Проверка в браузере (после публикации)

Открой `https://luvlarion4ik.github.io/luvlarion4ik/ru/growth-map/`:

1. «Опишу своими словами», вставь текст про барбершоп, отметь галочку разбора с ИИ, «Разобрать». В DevTools → Network виден `POST ENDPOINT/parse` со статусом 200, поля брифа подсвечены «определили из текста».
2. Пройди бриф до конца. На шаге «Чего хотите» есть галочка «Разбор с ИИ». Нажми «Проанализировать»: идёт `POST ENDPOINT/analyze` (200), в сцене анализа шаг «Пишем разбор под вашу нишу».
3. На вкладке «Сравнение» тёмный блок называется «Разбор под вашу нишу», тексты про барбершоп, все суммы с ₽. Нигде нет фигурных скобок `{…}`.
4. То же на английской версии `/luvlarion4ik/growth-map/`.
5. Останови сервис (`sudo systemctl stop devlarion-growth-map`) и повтори анализ: карта всё равно строится, блок называется «Наша рекомендация». Запусти сервис обратно.

### 5. Отчёт владельцу

Пришли: `ENDPOINT`, id модели, вывод `--check` (без ключа), ответы `curl` из шага 2, ссылку на коммит с `site.json` и скриншоты пунктов 3 и 5.

## Нельзя

- Коммитить `.env` и ключ, выводить ключ в логи, в ответы и в issue.
- Менять тексты промптов, логику движка и проверку ответов.
- Вписывать в `growthMap.guarantees` и `growthMap.reviews` что-либо без владельца: туда идут только реальные гарантии и реальные отзывы со ссылкой.

## Если что-то не так

| Симптом | Что проверить |
| --- | --- |
| `/health` → `configured: false` | `.env` лежит рядом с `server.mjs`, в нём заполнены `CLODEX_API_KEY` и `GM_MODEL`, сервис перезапущен |
| `--check` → `CLODEX answered 401` | Неверный ключ |
| `403 forbidden_origin` | `ALLOWED_ORIGINS` точно совпадает с адресом сайта (схема, домен, без `/`) |
| `502 unavailable` | `journalctl -u devlarion-growth-map -n 50`: поле `reason` покажет ответ провайдера |
| `429 rate_limited` | Лимит 6 анализов и 20 разборов текста в час с одного IP, плюс `DAILY_LIMIT` в сутки |
| В браузере ошибка CORS | В nginx `location /gm-ai/` с `/` в конце у `proxy_pass http://127.0.0.1:8787/;` |
