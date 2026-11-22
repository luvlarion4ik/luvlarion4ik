# 02. Тексты интерфейса

Все строки готовы к вставке. Ключи используются в `content/growth-map.mjs` (разметка страницы) и в `gm-copy.js` (строки для скриптов). Подстановки в фигурных скобках.

## Правила для любого нового текста

Если агенту нужна строка, которой здесь нет, пишет по этим правилам и проверяет себя перед коммитом.

- Говорим с владельцем бизнеса на «вы», как опытный коллега, а не как реклама. Короткие предложения. Глагол важнее существительного: «теряете заявки», а не «наблюдается потеря заявок».
- Конкретика вместо оценок: «ответ клиенту за 30 секунд ночью» вместо «быстрая обработка».
- Деньги называем деньгами: «≈ 84 000 ₽ в месяц», а не «значительный рост».
- Запрещено: «уникальный», «инновационный», «эффективное решение», «в современном мире», «под ключ» в каждой строке, «синергия», «экосистема», «откройте для себя», «давайте разберёмся», «не просто X, а Y», тройные перечисления ради ритма, восклицательные знаки (кроме одного на экране успеха), эмодзи в интерфейсе.
- Длинное тире не чаще одного раза на абзац. Кавычки «ёлочки» в русском, “лапки” в английском.
- Английская версия — не дословный перевод, а нормальный английский. Валюту и числа форматирует `Intl.NumberFormat`.

## Страница и интро

| Ключ | RU | EN |
| --- | --- | --- |
| `meta.title` | Карта роста бизнеса — Devlarion | Business Growth Map — Devlarion |
| `meta.description` | Опишите бизнес и за минуту получите схему: откуда придут клиенты, где теряются деньги и сколько принесёт автоматизация. Бесплатно. | Describe your business and get a map in a minute: where customers come from, where money leaks and what automation would bring in. Free. |
| `intro.eyebrow` | Карта роста | Growth Map |
| `intro.h1` | Карта роста вашего бизнеса | A growth map for your business |
| `intro.lead` | Покажем, откуда придут клиенты, где сейчас теряются деньги и сколько вы заберёте, если это починить. | See where customers come from, where money slips away and how much you’d keep by fixing it. |
| `intro.step1` | Расскажите о бизнесе | Tell us about the business |
| `intro.step2` | Получите три варианта схемы с расчётом | Get three versions of the map with numbers |
| `intro.step3` | Подвигайте блоки и заберите карту себе | Rearrange it and keep the map |

## Выбор режима

| Ключ | RU | EN |
| --- | --- | --- |
| `mode.title` | Как удобнее начать? | How would you like to start? |
| `mode.manual.title` | Заполню сам | I’ll fill it in |
| `mode.manual.text` | 6 коротких шагов. Чем точнее ответы, тем точнее цифры | Six short steps. Better answers, sharper numbers |
| `mode.manual.time` | ≈ 3 минуты | ≈ 3 minutes |
| `mode.auto.title` | Опишу своими словами | I’ll describe it |
| `mode.auto.text` | Расскажите о бизнесе как другу, остальное мы разберём сами | Tell it like you would to a friend. We’ll sort out the rest |
| `mode.auto.time` | ≈ 1 минута | ≈ 1 minute |
| `mode.note` | Бесплатно и без регистрации. Ответы остаются в вашем браузере | Free, no sign-up. Your answers stay in your browser |
| `mode.example` | Сначала посмотреть пример | Show me an example first |
| `mode.resume` | С возвращением. Продолжить карту «{name}»? | Welcome back. Continue “{name}”? |
| `mode.resume.yes` | Продолжить | Continue |
| `mode.resume.no` | Начать заново | Start over |

## Бриф

| Ключ | RU | EN |
| --- | --- | --- |
| `brief.step1` | О бизнесе | The business |
| `brief.step2` | Что продаёте | What you sell |
| `brief.step3` | Масштаб | Scale |
| `brief.step4` | Откуда клиенты | Where customers come from |
| `brief.step5` | Как устроено сейчас | How it works today |
| `brief.step6` | Чего хотите | What you want |
| `brief.name` | Как называется бизнес | Business name |
| `brief.name.ph` | Например, «Барбершоп Борода» | e.g. “North Street Barbers” |
| `brief.category` | Сфера | Industry |
| `brief.category.ph` | Начните вводить: салон, ремонт, курсы… | Start typing: salon, renovation, courses… |
| `brief.niche` | Направление | Niche |
| `brief.model` | Как вы продаёте | How you sell |
| `brief.items` | Что именно продаёте | What exactly you sell |
| `brief.items.ph` | Впишите услугу или товар и нажмите Enter | Type a product or service and press Enter |
| `brief.check` | Средний чек | Average order |
| `brief.cycle` | Сколько думает клиент до покупки | How long customers take to buy |
| `brief.size` | Формат | Team size |
| `brief.revenue` | Оборот в месяц | Monthly revenue |
| `brief.leads` | Обращений в месяц | Enquiries per month |
| `brief.leads.hint` | Звонки, сообщения, заявки — всё вместе. Можно примерно | Calls, messages, forms — all together. A rough number is fine |
| `brief.repeat` | Сколько клиентов возвращается | How many customers come back |
| `brief.scale.why` | Оборот и поток нужны, чтобы посчитать нагрузку: сколько заявок схема должна принять без потерь и на каком объёме автоматизация окупается. Эти цифры никуда не отправляются. | We use revenue and volume to size the system: how many enquiries it has to handle without losing any, and at what point automation pays for itself. These numbers aren’t sent anywhere. |
| `brief.sources` | Откуда приходят клиенты | Where customers find you |
| `brief.sources.main` | Отметьте звёздочкой главный источник | Star your main source |
| `brief.intake` | Где принимаете заявки | Where enquiries arrive |
| `brief.payment` | Как берёте оплату | How you take payment |
| `brief.pains` | Что мешает больше всего | What gets in the way most |
| `brief.pains.hint` | Выберите до трёх | Pick up to three |
| `brief.wishes` | Что хотели бы получить | What you’d like to have |
| `brief.timing` | Когда запускаться | When to launch |
| `brief.next` | Дальше | Next |
| `brief.back` | Назад | Back |
| `brief.analyze` | Проанализировать | Build my map |
| `brief.recalc` | Пересчитать | Recalculate |
| `brief.defaults` | Часть цифр — средние по нише. Уточните бриф, и расчёт станет точнее | Some numbers are industry averages. Add detail to sharpen them |
| `brief.rebuild.ask` | Вариант «{variant}» вы меняли вручную. Пересобрать его заново? | You edited “{variant}” by hand. Rebuild it from scratch? |

## Режим «своими словами»

| Ключ | RU | EN |
| --- | --- | --- |
| `auto.title` | Расскажите о бизнесе | Tell us about the business |
| `auto.hint` | Чем занимаетесь, откуда клиенты, как принимаете заявки и оплату, примерный чек и оборот | What you do, where customers come from, how you take enquiries and payment, rough order size and revenue |
| `auto.examples` | Примеры | Examples |
| `auto.parse` | Разобрать | Read it |
| `auto.check` | Проверьте, правильно ли мы поняли. Поправьте, если нужно, и жмите «Проанализировать» | Check we got it right. Fix anything that’s off, then hit “Build my map” |
| `auto.detected` | определили из текста | picked up from your text |
| `auto.noCategory` | Не смогли понять сферу бизнеса. Выберите её, остальное уже заполнено | We couldn’t tell the industry. Pick it, the rest is filled in |

Примеры для подсказок: в 01-product-ux.md, раздел 6. Английские версии: “A barbershop in Manchester with 3 barbers. Customers find us on Google Maps and Instagram, bookings come through WhatsApp. Average ticket £28, about 400 cuts a month”; “I build custom kitchens. Leads come from Facebook Marketplace and referrals, I quote everything by hand in Excel. Jobs start at £9,000, 10–15 a month”; “An online illustration course. I sell through a Telegram channel with 12k subscribers and take bank transfers”.

## Сцена анализа

| Ключ | RU | EN |
| --- | --- | --- |
| `scan.1` | Изучаем нишу: {niche} | Studying your niche: {niche} |
| `scan.2` | Считаем поток заявок | Sizing your enquiry flow |
| `scan.3` | Ищем, где теряются клиенты | Finding where customers slip away |
| `scan.4` | Собираем три варианта | Assembling three versions |
| `scan.skip` | Пропустить | Skip |

## Этапы (колонки холста)

| id | RU | EN | Подпись RU (под заголовком колонки) |
| --- | --- | --- | --- |
| `traffic` | Источники | Sources | Откуда о вас узнают |
| `entry` | Точка входа | Entry point | Куда человек попадает |
| `capture` | Заявка | Enquiry | Как оставляет контакт |
| `process` | Обработка | Handling | Кто и как отвечает |
| `pay` | Оплата | Payment | Как платит |
| `deliver` | Исполнение | Delivery | Как получает результат |
| `retain` | Возврат | Retention | Что приводит его снова |
| `insight` | Аналитика | Analytics | Где видны цифры |

Подпись петли возврата на холсте: «Клиент возвращается и приводит друзей» / “Customers come back and bring friends”.

## Варианты

| Ключ | RU | EN |
| --- | --- | --- |
| `v.now` | Как сейчас | As is |
| `v.base` | Фундамент | Foundation |
| `v.boost` | Ускорение | Momentum |
| `v.auto` | Автопилот | Autopilot |
| `v.recommended` | Рекомендуем | Recommended |
| `v.now.tagline` | Так бизнес работает сегодня. Красным отмечены места, где уходят деньги | How the business runs today. Red marks show where money leaks |
| `v.base.tagline` | Ни одна заявка не теряется, оплата идёт онлайн, вы видите каждого клиента | No enquiry gets lost, payments go online, you see every customer |
| `v.boost.tagline` | Клиенты приходят из новых каналов и возвращаются сами. Рутину забирает автоматика | New channels bring customers, and they come back on their own. Automation takes the routine |
| `v.auto.tagline` | Бизнес отвечает, продаёт и напоминает о себе круглосуточно. Вы смотрите на цифры и решаете | The business answers, sells and follows up around the clock. You watch the numbers and decide |

## Тулбар и холст

| Ключ | RU | EN |
| --- | --- | --- |
| `tb.undo` | Отменить | Undo |
| `tb.redo` | Повторить | Redo |
| `tb.layout` | Выровнять | Tidy up |
| `tb.fit` | Вписать | Fit to screen |
| `tb.3d` | Объём | 3D view |
| `tb.3d.exit` | Выйти из 3D | Exit 3D |
| `tb.reset` | Вернуть сгенерированный вариант | Restore generated version |
| `tb.reset.ask` | Ручные правки этого варианта пропадут. Вернуть? | Your edits to this version will be lost. Restore? |
| `canvas.empty` | Схема пуста. Верните сгенерированную или перетащите блоки справа | The map is empty. Restore it or drag blocks in from the right |
| `canvas.restore` | Вернуть | Restore |
| `canvas.orphan` | Не связан с цепочкой, клиенты до него не дойдут | Not connected, customers won’t reach it |
| `canvas.leak` | теряется ≈ {percent}% заявок | ≈ {percent}% of enquiries lost |
| `canvas.limit` | На одной карте не больше 60 блоков. Это уже уровень отдельного проекта, давайте обсудим | One map holds up to 60 blocks. That’s a project in its own right, let’s talk |
| `canvas.dropHere` | Отпустите, чтобы добавить | Drop to add |

## Панель: блоки и инспектор

| Ключ | RU | EN |
| --- | --- | --- |
| `tab.brief` | Бриф | Brief |
| `tab.blocks` | Блоки | Blocks |
| `tab.compare` | Сравнение | Compare |
| `tab.block` | Блок | Block |
| `lib.search` | Найти блок: оплата, рассылка, бот… | Find a block: payment, email, bot… |
| `lib.suggested` | Рекомендуем добавить | Worth adding |
| `lib.onMap` | уже на карте | on the map |
| `lib.add` | Добавить | Add |
| `insp.why` | Зачем это вам | Why it matters for you |
| `insp.effect` | Что даст | What it brings |
| `insp.effect.money` | ≈ +{money} в месяц к выручке | ≈ +{money} a month in revenue |
| `insp.effect.hours` | ≈ {hours} ч ручной работы в месяц освобождается | ≈ {hours} hours of manual work freed each month |
| `insp.settings` | Настройки | Settings |
| `insp.built` | Из чего сделано | What it’s built with |
| `insp.price` | Ориентир: {price} | Guide price: {price} |
| `insp.price.included` | Входит в настройку схемы | Included in the setup |
| `insp.remove` | Удалить с карты | Remove from map |
| `insp.replace` | Заменить на… | Replace with… |

## Сравнение

| Ключ | RU | EN |
| --- | --- | --- |
| `cmp.revenue` | Выручка в месяц | Monthly revenue |
| `cmp.growth` | Прирост | Growth |
| `cmp.yearProfit` | Дополнительная прибыль за год | Extra profit per year |
| `cmp.leakLeads` | Заявок теряется в месяц | Enquiries lost per month |
| `cmp.hours` | Ручной работы в месяц | Manual work per month |
| `cmp.price` | Внедрение | Build cost |
| `cmp.payback` | Окупаемость | Payback |
| `cmp.launch` | Запуск | Launch |
| `cmp.show` | Показать на схеме | Show on map |
| `cmp.quote` | по смете | on quote |
| `cmp.paybackLong` | считаем на созвоне | we’ll work it out on a call |
| `cmp.months` | ≈ {n} мес. | ≈ {n} mo |
| `cmp.weeks` | {from}–{to} нед. | {from}–{to} wks |

## Экономика (нижняя панель)

| Ключ | RU | EN |
| --- | --- | --- |
| `eco.revenue` | Выручка в месяц | Monthly revenue |
| `eco.was` | было {money} | was {money} |
| `eco.growth` | Прирост | Growth |
| `eco.losing` | Теряете сейчас | Losing now |
| `eco.leaking` | Утекает | Leaking |
| `eco.payback` | Окупаемость | Payback |
| `eco.build` | Внедрение | Build cost |
| `eco.range` | от {min} до {max} | {min}–{max} |
| `eco.footnote` | Расчёт ориентировочный: он опирается на ваши ответы и средние показатели по нише. Точные цифры дадим после разбора. | These are estimates based on your answers and industry averages. We’ll give exact numbers after a review. |

## Действия

| Ключ | RU | EN |
| --- | --- | --- |
| `act.handoff` | Получить разбор бесплатно | Get a free review |
| `act.handoff.sub` | Илья посмотрит карту и за рабочий день пришлёт разбор с ценой и сроками | Ilia will look at your map and send a review with price and timeline within a working day |
| `act.download` | Скачать схему | Download map |
| `act.share` | Ссылка | Link |
| `act.share.done` | Ссылка скопирована | Link copied |
| `act.cabinet` | Сохранить в кабинет | Save to portal |
| `act.cabinet.done` | Карта сохранена. Она будет в кабинете на этом устройстве | Saved. You’ll find it in the portal on this device |
| `act.import` | Открыть файл карты | Open a map file |
| `act.import.bad` | Файл не похож на карту роста Devlarion | This doesn’t look like a Devlarion growth map |
| `act.storage.off` | Браузер не даёт сохранять. Скачайте схему файлом, чтобы не потерять | Your browser blocks saving. Download the map so you don’t lose it |
| `act.newer` | Карта создана в более новой версии сайта, обновите страницу | This map was made with a newer version of the site. Refresh the page |

### Черновик сообщения в Telegram

RU:
```
Здравствуйте, Илья! Собрал карту роста на сайте, хочу бесплатный разбор.

Бизнес: {name} ({niche})
Формат: {size}, оборот {revenue} в месяц
Выбрал вариант: {variant}, прирост по расчёту ≈ {growth}%
Главное, что хочу: {wishes}

Карта: {shareUrl}
```

EN:
```
Hi Ilia, I built a growth map on your site and would like the free review.

Business: {name} ({niche})
Size: {size}, revenue {revenue} a month
Chosen version: {variant}, estimated growth ≈ {growth}%
What I want most: {wishes}

Map: {shareUrl}
```

Пустые строки с незаполненными полями не выводятся.

## Кабинет

| Ключ | RU | EN |
| --- | --- | --- |
| `cab.title` | Ваши карты роста | Your growth maps |
| `cab.empty` | Здесь появятся карты, которые вы сохраните. Соберите первую за пару минут | Maps you save will show up here. Build your first in a couple of minutes |
| `cab.build` | Собрать карту | Build a map |
| `cab.open` | Открыть | Open |
| `cab.delete` | Удалить | Delete |
| `cab.delete.ask` | Удалить карту «{name}» с этого устройства? | Delete “{name}” from this device? |
| `cab.saved` | Сохранена {date} | Saved {date} |

## Анонс на главной

| Ключ | RU | EN |
| --- | --- | --- |
| `home.teaser.title` | Сколько денег теряет ваш бизнес? | How much is your business leaving on the table? |
| `home.teaser.text` | Опишите, как к вам приходят клиенты, и за минуту получите схему с расчётом: где утекают заявки и что вернёт их обратно. | Describe how customers reach you and get a costed map in a minute: where enquiries leak and what brings them back. |
| `home.teaser.cta` | Собрать карту роста | Build my growth map |
