# 06. Интеграция в сайт

Перед началом агент читает `scripts/build.mjs`, `content/portal.mjs`, `content/site.mjs`, `docs/assets/currency.js`, `docs/assets/studio.js`, `scripts/validate-site.mjs` и повторяет стиль кода репозитория: короткие функции, `esc()` для всего пользовательского текста в HTML, двуязычие через `l(ru, en)`.

## 1. Новые и изменённые файлы

| Файл | Что |
| --- | --- |
| `content/growth-map.mjs` | `renderGrowthMapPage(lang, ctx)` — HTML страницы: интро, оболочка приложения, разметка шагов брифа, тулбара, панели, экономики, `<noscript>`. Строки из 02-copy.md |
| `docs/assets/growth-map/gm-copy.js` | Строки интерфейса для скриптов: `DevlarionGM.copy = { ru: {...}, en: {...} }` |
| `docs/assets/growth-map/gm-catalog.js` | Данные из 03-catalog.md |
| `docs/assets/growth-map/gm-icons.js` | Иконки (05-canvas.md, раздел 8) |
| `docs/assets/growth-map/gm-engine.js` | Движок (04-engine.md) |
| `docs/assets/growth-map/gm-canvas.js` | Холст (05-canvas.md) |
| `docs/assets/growth-map/gm-panel.js` | Бриф, режим текста, библиотека, инспектор, сравнение, нижняя панель |
| `docs/assets/growth-map/gm-app.js` | Состояние, история, хранение, ссылка, импорт/экспорт, Telegram, связка модулей. Загружается последним |
| `docs/assets/growth-map/growth-map.css` | Все стили страницы карты |
| `scripts/build.mjs` | Маршрут, страница, ассеты, подключение скриптов, тизер на главной, ссылки |
| `content/portal.mjs`, `docs/assets/portal.js`, `docs/assets/portal.css` | Раздел «Ваши карты роста» в кабинете |
| `content/site.json`, `scripts/validate-site.mjs` | Блок настроек `growthMap` |
| `scripts/test-growth-map.mjs` | Тесты движка на фикстурах |
| `scripts/fixtures/growth-map/*.json` | 5 тестовых брифов |
| `package.json` | Скрипт `"test:gm": "node --test scripts/test-growth-map.mjs"` |
| `.github/workflows/check.yml` | Шаг `node --test scripts/test-growth-map.mjs` после проверки сборки |

Модули общаются только через `window.DevlarionGM` и события `CustomEvent` на `document` с префиксом `gm:` (`gm:change`, `gm:variant`, `gm:select`, `gm:analyze`). Глобальных переменных кроме `DevlarionGM` не заводить.

## 2. Сборка (`scripts/build.mjs`)

1. Импорт `renderGrowthMapPage` из `content/growth-map.mjs` и `estimator` из `content/pricing.mjs`.
2. Добавить `"growth-map/"` в `routes` (это добавит страницу в обе локали, sitemap и проверку).
3. В `otherPages` добавить `"growth-map/": renderGrowthMapPage(lang, { home, tg: id.telegram, icons, estimator, growthMap: site.growthMap, region: regionControl(lang) })`.
4. Заголовок и описание страницы для маршрута `growth-map/` — из 02-copy.md (`meta.title`, `meta.description`), по тому же тернарному шаблону, что у `cabinet/`.
5. В `versionedAssets` добавить все 9 файлов `growth-map/*` (путь с подпапкой: `"growth-map/gm-engine.js"` и т. д.).
6. Скрипты и стиль подключаются **только** на странице `growth-map/`, по образцу `portal.js` на `cabinet/`. Порядок `defer`: `gm-copy.js`, `gm-catalog.js`, `gm-icons.js`, `gm-engine.js`, `gm-canvas.js`, `gm-panel.js`, `gm-app.js`. Общие скрипты сайта (`theme.js`, `currency.js`, `motion.js`, `devlarion-logo.js`, `studio.js`, `settings.js`) остаются.
7. Ставки `estimator` вкладываются в страницу: `<script type="application/json" id="gm-pricing">${JSON.stringify(estimator)}</script>`. Движок читает их оттуда, в тестах — импортирует `content/pricing.mjs` напрямую.
8. Настройки `site.growthMap` вкладываются так же: `<script type="application/json" id="gm-config">`. Перед вставкой JSON экранировать `<` как `\u003c`.
9. Регион и валюта: на странице должен быть `regionControl(lang)` из `content/site.mjs` (в правой панели, над нижними кнопками), иначе `currency.js` не инициализируется. Деньги на карте показываются в валюте из `window.devlarionRegion` (`amountRub × rate`, форматирование `Intl.NumberFormat(lang, { style: 'currency', currency, maximumFractionDigits: 0 })`, при валюте не RUB — префикс «≈ »). Подписка на `document.addEventListener('devlarion:regionchange', …)` перерисовывает все суммы. При `code === 'other'` суммы показываются в рублях.
10. **Тизер на главной.** В `homeHTML` сразу после `renderOffers(...)` — секция `<section id="growth-map-teaser" class="section wrap gm-teaser">` с заголовком, текстом и кнопкой из 02-copy.md (`home.teaser.*`), справа — статичная SVG-миниатюра схемы (5 узлов, 4 связи, петля; рисуется прямо в `content/growth-map.mjs` функцией `renderGrowthMapTeaser(lang, home)`), с CSS-анимацией течения пунктира (выключена при reduced motion). Стили тизера — в `docs/assets/home.css`, чтобы не тянуть `growth-map.css` на главную.
11. **Ссылки:** в навигацию шапки после «Кабинет» — «Карта роста» / “Growth Map”; в подвал — рядом с «Кабинет»; на главной в секции `#quiz` под калькулятором строка «Хотите увидеть всю схему бизнеса? Соберите карту роста →»; в `README.md` и `README.ru.md` генерируемая строка ссылок дополняется «Карта роста».
12. `npm run build`, затем `npm run check` — оба зелёные. Сгенерированные `docs/**` коммитятся вместе с исходниками, как принято в репозитории.

## 3. Настройки в `content/site.json`

```json
"growthMap": {
  "ai": "off",
  "endpoint": "",
  "turnstileSiteKey": "",
  "handoffNote": "",
  "guarantees": [],
  "reviews": []
}
```

- `ai`: `"off"` | `"on"`. При `"on"` и непустом `endpoint` в режиме «своими словами» и в бриф-панели появляется ИИ (07-ai-worker.md). На этапе 1 всегда `"off"`.
- `handoffNote`: необязательная строка, добавляется в конец черновика Telegram (например, «Отвечаю в течение рабочего дня»).
- `guarantees`: список объектов `{ "ru": "...", "en": "..." }` — обещания, которые владелец действительно даёт (например, «Фиксируем цену в договоре до старта работ», «Два месяца поддержки после запуска входят в цену»). Показываются карточками под таблицей «Сравнение» и передаются ИИ на этапе 2. Пустой список — блок не выводится.
- `reviews`: список `{ "name": "...", "business": "...", "text": {"ru":"...","en":"..."}, "url": "...", "date": "ГГГГ-ММ-ДД" }` — реальные отзывы клиентов. `url` обязателен: ссылка на проект, кейс на сайте или публикацию отзыва. Показываются под гарантиями (максимум 3, ротация по дате) и передаются ИИ на этапе 2. Пустой список — блок не выводится.

`scripts/validate-site.mjs` проверяет: `ai` из двух значений; `endpoint` — пустая строка или `https://` URL; `guarantees` — объекты с непустыми `ru` и `en`; `reviews` — обязательные `name`, `text.ru`, `text.en`, `url` (https), `date` (функция `date()` уже есть). В админке (`scripts/admin.html` / `admin.mjs`) добавить вкладку «Карта роста» с этими полями по образцу существующих вкладок.

## 4. Хранение и кабинет

- Ключ `localStorage`: `devlarion-growth-maps` — массив до 10 документов (новые в начале, при превышении удаляется самый старый). Ключ `devlarion-growth-map-active` — id открытой карты.
- Автосохранение при каждом изменении (дебаунс 600 мс). Ошибка записи (квота, приватный режим) → плашка `act.storage.off` один раз за сессию.
- **Скачать схему:** файл `devlarion-growth-map-{slug(name) || 'map'}-{ГГГГ-ММ-ДД}.json`, `application/json`, отступ 2 пробела.
- **Открыть файл карты:** кнопка в меню «…» тулбара и в кабинете; `<input type="file" accept="application/json,.json">`, затем `migrate()`, при ошибке `act.import.bad`.
- **Сохранить в кабинет:** помечает документ `saved: true` и показывает `act.cabinet.done` со ссылкой на `cabinet/`.
- **Кабинет** (`content/portal.mjs`): во вкладке «Мой проект» (`project`) над текущим содержимым — карточка «Ваши карты роста». `portal.js` читает `devlarion-growth-maps` и рисует список: название, сфера, выбранный вариант, «Сохранена {дата}», мини-превью (5–7 цветных точек по этапам), кнопки «Открыть» (ведёт на `growth-map/#open={id}`) и «Удалить» (с `confirm` по тексту `cab.delete.ask`). Ниже кнопка «Открыть файл карты». Пустое состояние — `cab.empty` + кнопка `cab.build`.
- `growth-map/#open={id}` открывает карту из хранилища, `#map=…` — из ссылки (с предложением «Сохранить себе»), без хэша — экран выбора режима или «С возвращением».

## 5. Telegram

Кнопка «Получить разбор бесплатно»:
1. Генерирует ссылку на карту (04-engine.md, раздел 2).
2. Собирает черновик по шаблону из 02-copy.md.
3. Открывает `id.telegram + '?text=' + encodeURIComponent(текст)` в новой вкладке, как `portalLoginLink` и калькулятор. Если `encodeURIComponent(текст).length > 3500`, в черновик вместо полной ссылки ставится короткая (только бриф и активный вариант).
4. Отправляет цель аналитики `growthmap_handoff`.

## 6. Аналитика

Цели отправляются через существующий механизм: `document.dispatchEvent(new CustomEvent('bureau-goal', { detail: 'имя' }))` (обработчик в `studio.js`). Метрика включается только после согласия пользователя, этот механизм уже работает на сайте. Кнопки со ссылками можно размечать `data-goal`.

| Цель | Когда |
| --- | --- |
| `growthmap_open` | Страница открыта (один раз за сессию) |
| `growthmap_mode_manual` / `growthmap_mode_text` / `growthmap_example` | Выбор режима |
| `growthmap_parse` | Разбор текста выполнен |
| `growthmap_analyze` | Нажато «Проанализировать» |
| `growthmap_variant_base` / `_boost` / `_auto` | Первое переключение на вариант за сессию |
| `growthmap_edit` | Первая ручная правка за сессию |
| `growthmap_block_add` | Добавлен блок из библиотеки (одна цель за сессию) |
| `growthmap_3d` | Включён «Объём» |
| `growthmap_download` / `growthmap_share` / `growthmap_cabinet` | Действия |
| `growthmap_handoff` | Отправка в Telegram — главная конверсия |
| `growthmap_teaser` | Клик по тизеру на главной (`data-goal`) |

## 7. Приватность

В `privacyText` (в `scripts/build.mjs`) добавить предложение: RU «Карта роста хранит ваши ответы и схемы только в этом браузере. Они попадают к нам, только если вы сами отправите карту в Telegram.» EN “Growth Map keeps your answers and maps in this browser only. They reach us only if you send the map via Telegram yourself.” На этапе 2 при `ai: "on"` текст расширяется (07-ai-worker.md, раздел 6).

## 8. Тесты

`scripts/test-growth-map.mjs` на `node:test` и `node:assert/strict`, без зависимостей:
- загружает `gm-catalog.js` и `gm-engine.js` в `vm.createContext({ window: {} , globalThis })` и берёт `DevlarionGM`;
- импортирует `estimator` из `content/pricing.mjs`.

Фикстуры (`scripts/fixtures/growth-map/`):

| Файл | Бриф |
| --- | --- |
| `barber.json` | beauty/barber, team (3 мастера), booking, чек 1800, 400 обращений, Яндекс Карты + Instagram, личные сообщения, перевод на карту, боли: теряем заявки, клиенты не возвращаются |
| `kitchens.json` | repair/furniture, team, services+goods, чек 250 000, 12 обращений, Авито + сарафан, таблица, перевод, боль: много ручной работы |
| `course.json` | education/online_school, solo, digital, чек 15 000, обращений нет (оборот 300 тыс.–1 млн), Telegram-канал, перевод на карту, желание: мобильное приложение |
| `coffee.json` | food/coffee, team, goods, чек 450, обращений нет, Яндекс Карты + Instagram, терминал, боль: клиенты не возвращаются. Это же демо «Сначала посмотреть пример» |
| `logistics.json` | logistics/cargo, mid, b2b+services, чек 60 000, 200 обращений, холодные продажи + тендеры + сайт, CRM, счёт для юрлиц, боли: долго отвечаем, не вижу цифр |

Проверки для каждой фикстуры:
1. `buildAll` не бросает ошибок, у всех узлов известный `block`, у всех связей существующие `from`/`to`.
2. Размеры вариантов в пределах из 04-engine.md, раздел 4, шаг 8.
3. Монотонность: блоки `base ⊆ boost ⊆ auto` с учётом `replaces`.
4. Выручка строго растёт: `now < base < boost < auto`; прирост в пределах потолков и полов (раздел 5.3).
5. Цены: `base.max ≤ boost.max ≤ auto.max`, у `mobile`/`agents` при `small` уровне — пометка «по смете».
6. Окупаемость — число от 1 до 24 или `null`.
7. Детерминированность: два вызова `buildAll` с одним брифом дают одинаковый JSON.
8. `migrate(JSON.parse(JSON.stringify(doc)))` возвращает тот же документ; документ с `version: 99` бросает ошибку `newer`.
9. Шаблоны разницы собираются без `{` и `undefined` в тексте на обоих языках.
10. `parseText` для трёх примеров из 01-product-ux.md даёт ожидаемые поля (04-engine.md, раздел 8).
11. Для `kitchens.json`: в «Ускорении» есть `cap_quiz` и `proc_kp`; для `barber.json`: в «Фундаменте» есть `cap_booking` и `del_remind`; для `course.json`: `ent_app` есть в «Ускорении» (желание поднимает уровень), `del_access` есть в «Фундаменте».

## 9. `<noscript>` и SEO

Без JS страница показывает интро, три шага «как это работает», пример карты кофейни картинкой-SVG (тот же рендер, что у тизера, но крупнее) и кнопку в Telegram. Страница попадает в sitemap. JSON-LD: `WebApplication`, `applicationCategory: "BusinessApplication"`, `offers.price: 0`.
