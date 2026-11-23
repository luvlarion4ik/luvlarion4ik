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
<<<<<<< HEAD
=======

## Дополнительные подписи приложения

| Ключ | RU | EN |
| --- | --- | --- |
| `auto.example1.label` | Барбершоп | Barbershop |
| `auto.example1.text` | Барбершоп в Казани, 3 мастера. Клиенты из Яндекс Карт и Instagram, записываем через WhatsApp. Средний чек 1800, в месяц около 400 стрижек, оборот около 700 тысяч | A barbershop in Manchester with 3 barbers. Customers find us on Google Maps and Instagram, bookings come through WhatsApp. Average ticket £28, about 400 cuts a month |
| `auto.example2.label` | Кухни на заказ | Custom kitchens |
| `auto.example2.text` | Делаю кухни на заказ. Заявки с Авито и от знакомых, считаю всё вручную в Excel. Чек от 250 тысяч, 10–15 заказов в месяц | I build custom kitchens. Leads come from Facebook Marketplace and referrals, I quote everything by hand in Excel. Jobs start at £9,000, 10–15 a month |
| `auto.example3.label` | Онлайн-курс | Online course |
| `auto.example3.text` | Онлайн-курс по иллюстрации. Продаю через Telegram-канал на 12 тысяч подписчиков, оплату принимаю переводом на карту | An online illustration course. I sell through a Telegram channel with 12k subscribers and take bank transfers |
| `brief.progress` | Шаг {step} из 6 | Step {step} of 6 |
| `brief.required` | Заполните обязательные поля, чтобы продолжить | Fill in the required fields to continue |
| `brief.search.empty` | Сфера не найдена | No matching industries |
| `brief.sources.other` | Другое | Other |
| `brief.sources.other.ph` | Укажите источник | Enter a source |
| `brief.cycle.day` | В тот же день | Same day |
| `brief.cycle.week` | До недели | Within a week |
| `brief.cycle.month` | До месяца | Within a month |
| `brief.cycle.long` | Дольше | Longer |
| `brief.size.solo` | Работаю один | Just me |
| `brief.size.team` | Команда до 10 человек | Team of up to 10 |
| `brief.size.mid` | 10–50 человек | 10–50 people |
| `brief.size.large` | Больше 50 человек | More than 50 people |
| `brief.revenue.below` | До {money} | Up to {money} |
| `brief.revenue.range` | {min}–{max} | {min}–{max} |
| `brief.revenue.above` | Больше {money} | Over {money} |
| `brief.repeat.0` | Почти нет | Almost none |
| `brief.repeat.1` | Около трети | Around a third |
| `brief.repeat.2` | Половина и больше | Half or more |
| `brief.timing.asap` | Как можно скорее | As soon as possible |
| `brief.timing.soon` | В течение 1–2 месяцев | Within 1–2 months |
| `brief.timing.browsing` | Присматриваюсь | Exploring options |
| `brief.optional` | Можно пропустить | Optional |
| `brief.insta.note` | * Meta признана экстремистской организацией в РФ. | * Russia has designated Meta as an extremist organisation. |
| `mode.demo.back` | Собрать свою карту | Build my own map |
| `mode.demo.name` | Кофейня | Coffee shop |
| `tb.zoomIn` | Приблизить | Zoom in |
| `tb.zoomOut` | Отдалить | Zoom out |
| `tb.list` | Показать списком | Show as a list |
| `tb.map` | Показать схему | Show the map |
| `tb.more` | Действия с картой | Map actions |
| `tb.close` | Закрыть | Close |
| `canvas.label` | Схема | Map |
| `canvas.keys` | Нажимайте стрелки, чтобы сдвинуть вид, плюс и минус для масштаба. Нажмите Tab, чтобы перейти к блокам, и Enter, чтобы открыть выбранный блок. | Use the arrow keys to pan and plus or minus to zoom. Press Tab to move through blocks and Enter to open the selected block. |
| `canvas.connections` | Связан с: {nodes} | Connected to: {nodes} |
| `canvas.disconnect` | Удалить связь | Remove connection |
| `canvas.return` | Клиент возвращается и приводит друзей | Customers come back and bring friends |
| `canvas.noReturn` | Клиенты не возвращаются | Customers aren’t coming back |
| `canvas.existing` | было | existing |
| `canvas.new` | новое | new |
| `canvas.edited` | изменён | edited |
| `fx.t` | +{n}% клиентов | +{n}% more enquiries |
| `fx.leak` | −{n}% потерь | −{n}% enquiries lost |
| `fx.conv` | +{n}% к продажам | +{n}% sales conversion |
| `fx.repeat` | +{n}% повторных | +{n}% repeat business |
| `fx.check` | +{n}% к чеку | +{n}% average order |
| `fx.hours` | −{n} ч/мес | −{n} h/month |
| `lib.empty` | Блоки не найдены | No matching blocks |
| `insp.connect` | Соединить с… | Connect to… |
| `insp.split` | Добавить рассрочку на карту | Add instalment payments to the map |
| `insp.readOnly` | Для правки блока выйдите из режима «Объём». | Exit 3D view to edit this block. |
| `cmp.guarantees` | Условия работы | What’s included |
| `cmp.reviews` | Что говорят клиенты | What clients say |
| `eco.announce` | {variant}: выручка {money} в месяц, прирост {growth}% | {variant}: monthly revenue {money}, growth {growth}% |
| `eco.expand` | Показать расчёт | Show estimate |
| `eco.collapse` | Свернуть расчёт | Hide estimate |
| `eco.hours` | {n} ч | {n} h |
| `act.share.short` | Ссылка сокращена. Полную карту сохраните файлом | Link shortened. Download the file to keep the full map |
| `act.share.error` | Скопируйте ссылку из этого поля | Copy the link from this field |
| `act.saveShared` | Сохранить себе | Save a copy |
| `act.nameFallback` | Мой бизнес | My business |
| `act.notFound` | Карта не найдена в этом браузере | This map isn’t saved in this browser |
| `act.noScript` | Включите JavaScript, чтобы собрать свою карту. | Enable JavaScript to build your map. |
| `act.openPortal` | Открыть кабинет | Open portal |
| `home.quiz.growthMap` | Хотите увидеть всю схему бизнеса? Соберите карту роста → | Want to see how the whole business fits together? Build a growth map → |

## Карточки разницы

| Ключ | RU | EN |
| --- | --- | --- |
| `diff.now.title` | Оставить как есть | Keep things as they are |
| `diff.now.body` | Каждый месяц ≈ {lostLeads} заявок уходят без ответа. Это {moneyLost} прибыли, которую вы недополучаете. Заявки помогут вернуть блоки «{top1}», «{top2}» и «{top3}». | Around {lostLeads} enquiries go unanswered each month. That’s {moneyLost} in missed profit. The blocks “{top1}”, “{top2}” and “{top3}” help recover those enquiries. |
| `diff.base.title` | Остановиться на «Фундаменте» | Stop at Foundation |
| `diff.base.body` | «Ускорение» добавляет {gap} прибыли в месяц, или {gapYear} за год. Основную разницу дают блоки «{top1}» и «{top2}». | Momentum adds {gap} in monthly profit, or {gapYear} over a year. The blocks “{top1}” and “{top2}” account for most of the difference. |
| `diff.boost.title` | Не включать «Автопилот» | Skip Autopilot |
| `diff.boost.body` | Главный вклад даёт блок «{top1}». Разница с «Ускорением» составляет {gap} в месяц, и вы освобождаете ещё ≈ {hoursGap} часов. | The block “{top1}” makes the biggest difference. Autopilot adds {gap} a month over Momentum and frees up around {hoursGap} more hours. |
| `diff.boost.small` | Для вашего масштаба «Ускорения» хватает с запасом. К «Автопилоту» можно вернуться, когда поток обращений вырастет. | Momentum covers your current scale. Revisit Autopilot as your enquiry volume grows. |
| `mode.example.edit` | Собрать свою карту | Build your own map |
| `act.handoff.error` | Не удалось открыть Telegram. Скопируйте ссылку на карту. | Telegram couldn’t open. Copy the map link to share it. |

## Подписи брифа и панели

| Ключ | RU | EN |
| --- | --- | --- |
| `brief.niche.ph` | Укажите направление | Enter your niche |
| `brief.item.remove` | Удалить «{item}» | Remove “{item}” |
| `brief.band.unset` | Пока не указывать | Leave blank for now |
| `brief.revenue.set` | Указать оборот | Add monthly revenue |
| `brief.revenue.clear` | Не указывать оборот | Clear monthly revenue |
| `brief.source.star` | Основной источник: {source} | Main source: {source} |
| `brief.source.one` | Выберите хотя бы один источник | Choose at least one source |
| `brief.business.badge` | Бизнес: {name} | Business: {name} |
| `auto.counter` | {n} из 2 000 символов | {n} of 2,000 characters |
| `auto.empty` | Добавьте описание бизнеса | Add a description of your business |
| `cmp.differences` | Что вы теряете, если… | What you miss out on if you… |
| `cmp.noValue` | — | — |
| `cmp.growth.month` | {money} в месяц | {money} a month |
| `eco.preview` | {variant}: {growth} · окупится за {months} | {variant}: {growth} · pays back in {months} |
| `eco.preview.noPayback` | {variant}: {growth} | {variant}: {growth} |
| `panel.size.closed` | Свернуть панель | Collapse panel |
| `panel.size.half` | Показать половину панели | Show half the panel |
| `panel.size.full` | Развернуть панель | Expand panel |
| `panel.tabs` | Панель карты | Map panel |
| `insp.unpriced` | Стоимость уточним после разбора | We’ll confirm the price after a review |
| `insp.effect.none` | Этот блок показывает, как устроен текущий процесс | This block shows how the current process works |
| `insp.provider.none` | Выбрать | Choose |
| `insp.service.landing` | Лендинг | Landing page |
| `insp.service.web` | Корпоративный сайт | Company website |
| `insp.service.shop` | Интернет-магазин | Online store |
| `insp.service.automation` | Боты и автоматизация | Bots and automation |
| `insp.service.assistant` | ИИ-ассистент | AI assistant |
| `insp.service.mini` | Мини-приложение | Mini app |
| `insp.service.platform` | Веб-приложение или личный кабинет | Web app or client portal |
| `insp.service.mobile` | Мобильное приложение | Mobile app |
| `insp.service.agents` | Мультиагентная система | Multi-agent system |
| `insp.service.design` | Дизайн | Design |
| `lib.limit.action` | Обсудить проект | Discuss the project |
>>>>>>> growth-map/8-verified
