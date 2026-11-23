// Sales copy for segment and topic pages: what it costs to wait, what changes, where to go next.
// Rule: no invented figures, testimonials, client counts or guarantees. Strength comes from specifics.

export const shared = {
  ru: {
    trust: [
      ['Ведёт Илья', 'Один контакт от первого созвона до сдачи.'],
      ['Смета до старта', 'Объём, цену и сроки фиксируем в договоре.'],
      ['2 месяца поддержки', 'Исправления в согласованном объёме входят в каждый проект.'],
      ['Кейсы и демо', 'Можно посмотреть, как работают проекты.'],
    ],
    capacityTitle: 'Когда можно начать',
    capacityText: 'Напишите, к какой дате хотите запуститься. Согласуем дату старта после первого разговора.',
    capacityCta: 'Уточнить сроки',
    nextTitle: 'Другие услуги',
    bundleTitle: 'Сайт, поиск и бот в одном проекте',
    bundleText: 'Одна команда настраивает сайт, поиск и бота, который передаёт заявки. Сопровождение можно включить в проект.',
    bundleCta: 'Как работает пакет',
    shiftsTitle: 'Что меняется',
    before: 'Сейчас',
    after: 'С Devlarion',
  },
  en: {
    trust: [
      ['Ilia, personally', 'One person is accountable from the first call to launch.'],
      ['A quote before we start', 'Scope, price and timing are agreed in the contract before any work begins.'],
      ['Two months of support', 'Fixes within the agreed scope are included in every project.'],
      ['Case studies and demos', 'See how the projects work.'],
    ],
    capacityTitle: 'Project start dates',
    capacityText: 'Tell us when you want to launch. We agree a start date after the first call.',
    capacityCta: 'Ask about timing',
    nextTitle: 'Related services',
    bundleTitle: 'Website, search and bot in one project',
    bundleText: 'One team sets up the website, search visibility and the bot that routes enquiries. You can include ongoing support in the project.',
    bundleCta: 'How the bundle works',
    shiftsTitle: 'What changes',
    before: 'Today',
    after: 'With Devlarion',
  },
};

export const sell = {
  'self-employed/': {
    ru: {
      lossTitle: 'Где теряются заявки',
      lossLead: 'Если заявки приходят в личные сообщения, их легко пропустить во время работы.',
      losses: [
        ['Клиент выбирает того, кто ответил первым', 'Человек пишет сразу нескольким мастерам и записывается к первому ответившему. Если вы ответили вечером, место уже занято.'],
        ['Комиссия за чужих клиентов', 'Заказ через агрегатор оставляет часть чека площадке, а клиент остаётся её клиентом. Свой сайт и бот делают его вашим.'],
        ['Ночью и в выходные запись не идёт', 'Пока вы заняты на заказе или спите, форма и бот принимают заявки, показывают цены и свободное время.'],
        ['Площадка меняет правила в один день', 'Блокировка аккаунта, новые тарифы, падение выдачи: без собственного канала вы остаётесь без клиентов в тот же день.'],
      ],
      shifts: [
        ['Ответы одним и тем же людям по кругу', 'Бот отвечает на частые вопросы, а к вам приходят уже готовые заявки.'],
        ['Заявки в пяти мессенджерах', 'Все обращения приходят в один Telegram-чат с нужными деталями.'],
        ['Клиенты приходят только с площадки', 'Вас находят в поиске, на картах и по прямой ссылке в профиле.'],
      ],
      cross: [
        ['seo/', 'Чтобы вас находили без рекламы', 'SEO-старт настроит Яндекс, карты и метатеги, чтобы сайт появлялся там, где ищут услугу.'],
        ['geo/', 'Чтобы вас советовали нейросети', 'Всё больше людей спрашивает ИИ, к кому обратиться. GEO учит его находить вас.'],
        ['support/', 'Чтобы сайт не устарел', 'Цены, акции, расписание: вносим изменения за вас.'],
      ],
      closeTitle: 'Обсудим сайт или запись через бота',
      closeText: 'Расскажите, чем занимаетесь и как сейчас принимаете заявки. Илья предложит подходящий вариант.',
    },
    en: {
      lossTitle: 'Where enquiries get lost',
      lossLead: 'It is easy to miss an enquiry in direct messages while you are working.',
      losses: [
        ['The customer picks whoever replied first', 'People message several providers and book with the first one who answers. Reply in the evening and the slot is often gone.'],
        ['Commission on customers who could be yours', 'An order through a platform leaves part of the fee with it, and the customer stays the platform’s. Your own site and bot make them yours.'],
        ['No bookings at night or at weekends', 'While you are working or asleep, a form and bot take enquiries and show prices and free slots.'],
        ['A platform can change its rules overnight', 'A suspended account, new fees or lower rankings: without your own channel you lose customers the same day.'],
      ],
      shifts: [
        ['The same questions, answered again and again', 'A bot answers the common ones and you receive ready-to-handle enquiries.'],
        ['Enquiries scattered across five apps', 'Everything arrives in one Telegram chat with the details you need.'],
        ['Customers only come from one platform', 'People find you through search, maps and a direct link in your profile.'],
      ],
      cross: [
        ['seo/', 'Be found without paying for ads', 'The SEO starter sets up Yandex, maps and metadata so your site appears where people search.'],
        ['geo/', 'Be recommended by AI assistants', 'More people ask AI who to contact. GEO helps it find you.'],
        ['support/', 'Keep the site from going stale', 'Prices, offers, schedule: we update them for you.'],
      ],
      closeTitle: 'Discuss a website or booking bot',
      closeText: 'Tell us what you do and how you currently take enquiries. Ilia will suggest a starting point.',
    },
  },

  'business/': {
    ru: {
      lossTitle: 'Во что обходится «пока и так работает»',
      lossLead: 'Проверьте, где сотрудники переносят заявки вручную и какие каналы приводят клиентов.',
      losses: [
        ['Менеджеры тратят часы на копирование', 'Заявки переносят в таблицы вручную, на одни и те же вопросы отвечают снова. Это оплаченное время, которое не приносит продаж.'],
        ['Реклама идёт вслепую', 'Без сквозной аналитики непонятно, какой канал приводит клиентов, а какой просто съедает бюджет.'],
        ['Устаревший сайт отпугивает до звонка', 'Клиент сравнивает вас с конкурентами за минуту. Медленный сайт, неудобный на телефоне, проигрывает ещё до первого контакта.'],
        ['Заявки теряются между каналами', 'Сайт, мессенджеры, маркетплейсы: пока нет одного места, часть обращений остаётся без ответа.'],
      ],
      shifts: [
        ['Заявки вручную в таблицах', 'Заявки сами попадают в CRM и уведомляют нужного менеджера.'],
        ['Непонятно, откуда клиенты', 'Видно путь каждого обращения: откуда пришёл и чем закончился.'],
        ['Сайт, который неудобно обновлять', 'Свои тексты и цены меняете сами, без программиста.'],
      ],
      cross: [
        ['seo/', 'Чтобы заявки шли из поиска', 'SEO-запуск собирает семантику, структуру и тексты под ваши услуги.'],
        ['geo/', 'Чтобы вас видели в ответах ИИ', 'GEO делает ваши услуги понятными для нейросетей и ИИ-поиска.'],
        ['bundle/', 'Собрать всё в одну систему', 'Сайт, бот, CRM и поиск, которые работают вместе и стоят дешевле, чем по отдельности.'],
      ],
      closeTitle: 'Пилот на одном процессе',
      closeText: 'Расскажите, где сейчас теряются заявки. Я предложу первый этап с понятной сметой, без обязательств на весь проект.',
    },
    en: {
      lossTitle: 'What “it works well enough” really costs',
      lossLead: 'Check where staff transfer enquiries by hand and which channels bring in customers.',
      losses: [
        ['Managers lose hours to copying', 'Enquiries are moved into spreadsheets by hand and the same questions are answered again. That is paid time that does not produce sales.'],
        ['Advertising runs blind', 'Without end-to-end analytics you cannot tell which channel brings customers and which one only burns budget.'],
        ['An outdated site puts people off before they call', 'Customers compare you with competitors in a minute. A slow site that is awkward on a phone loses before first contact.'],
        ['Enquiries fall between channels', 'Website, messengers, marketplaces: without one place for them, some enquiries go unanswered.'],
      ],
      shifts: [
        ['Enquiries copied into spreadsheets', 'Enquiries land in the CRM and notify the right manager.'],
        ['No idea where customers come from', 'You see each enquiry’s path: where it came from and how it ended.'],
        ['A site that is hard to update', 'You change copy and prices yourself, without a developer.'],
      ],
      cross: [
        ['seo/', 'Bring enquiries from search', 'The SEO launch builds keywords, structure and copy around your services.'],
        ['geo/', 'Be visible in AI answers', 'GEO makes your services clear to AI assistants and AI search.'],
        ['bundle/', 'Join it all into one system', 'Website, bot, CRM and search working together, for less than buying them separately.'],
      ],
      closeTitle: 'Pilot one workflow',
      closeText: 'Tell me where enquiries get lost today. I will propose a first stage with a clear quote and no commitment to the whole project.',
    },
  },

  'enterprise/': {
    ru: {
      lossTitle: 'Цена решения, которое откладывают',
      lossLead: 'В крупной компании промедление дорого не потому, что что-то сломается завтра, а потому что процессы, которые можно ускорить, остаются ручными ещё один квартал.',
      losses: [
        ['Данные нельзя отдавать наружу', 'Без ИИ в вашем контуре команды либо отказываются от технологии, либо используют её в обход политики безопасности.'],
        ['Системы живут отдельно', 'Данные между CRM, ERP и учётом переносят вручную: это ошибки, задержки и зависимость от конкретных людей.'],
        ['Согласования съедают месяцы', 'Подрядчик, который не говорит на языке безопасности и документации, тормозит проект ещё до начала разработки.'],
        ['Большой проект без пилота — риск', 'Масштабировать то, что не проверено на одном процессе, значит платить за ошибки по полной цене.'],
      ],
      shifts: [
        ['ИИ нельзя использовать из-за рисков', 'Модель работает на ваших серверах, а данные не выходят из контура.'],
        ['Долгое решение без доказательств', 'Пилот на одном процессе, метрики успеха фиксируем заранее.'],
        ['Много подрядчиков и размытая ответственность', 'Одна точка контакта и NDA до передачи материалов.'],
      ],
      cross: [
        ['support/', 'Чтобы решение жило после внедрения', 'Сопровождение с SLA и регулярными обновлениями.'],
        ['why-website/', 'Корпоративный сайт и заявки', 'Если нужен публичный канал, начните с понятной структуры и форм.'],
        ['bundle/', 'Собрать всё в одну систему', 'Как связать сайт, сервисы и поддержку в единый проект с общей ответственностью.'],
      ],
      closeTitle: 'Начните с бесплатной диагностики',
      closeText: 'Созвон, разбор процесса и оценка эффекта ничего не стоят и ни к чему не обязывают. Решение о пилоте вы принимаете после.',
    },
    en: {
      lossTitle: 'The price of a decision that keeps being postponed',
      lossLead: 'In a large company delay is costly not because something breaks tomorrow, but because processes that could be faster stay manual for another quarter.',
      losses: [
        ['Data cannot leave your perimeter', 'Without AI inside your own environment, teams either skip the technology or use it around your security policy.'],
        ['Systems live apart', 'Data moves between CRM, ERP and accounting by hand: errors, delays and dependence on specific people.'],
        ['Approvals eat months', 'A contractor who does not speak security and documentation slows a project before development even starts.'],
        ['A large project without a pilot is a risk', 'Scaling something not proven on one process means paying for mistakes at full price.'],
      ],
      shifts: [
        ['AI is off the table because of risk', 'The model runs on your servers and data never leaves your perimeter.'],
        ['A long decision without evidence', 'A pilot on one process, with success metrics agreed in advance.'],
        ['Many suppliers and blurred accountability', 'One point of contact and an NDA before any materials change hands.'],
      ],
      cross: [
        ['support/', 'Keep the solution alive after rollout', 'Support with an SLA and regular updates.'],
        ['why-website/', 'A corporate site and enquiries', 'If you need a public channel, start with a clear structure and forms.'],
        ['bundle/', 'Join it all into one system', 'How to connect the website, services and support into one project with shared accountability.'],
      ],
      closeTitle: 'Start with a free discovery call',
      closeText: 'The call, process review and impact estimate cost nothing and commit you to nothing. You decide on a pilot afterwards.',
    },
  },

  'why-website/': {
    ru: {
      lossTitle: 'Что происходит, пока у вас нет своего сайта и бота',
      lossLead: 'Клиенты никуда не исчезают. Они просто находят и выбирают кого-то другого, и вы об этом даже не узнаёте.',
      losses: [
        ['Вас нет там, где выбирают', 'Человек открывает поиск, карты или спрашивает ИИ. Если там нет вас, выбор делается без вас, и вы не увидите, что он был.'],
        ['Нет места, где вам верят', 'Цены, примеры работ, отзывы и реквизиты в одном месте создают доверие. Без них человек сомневается и уходит к тому, у кого они есть.'],
        ['Обращения не принимаются ночью', 'Заявка в 23:00 без ответа остыла к утру. Форма и бот принимают её сразу и сообщают вам.'],
        ['Всё держится на чужой площадке', 'Блокировка аккаунта или смена алгоритма оставляет вас без канала в один день. Сайт и бот принадлежат вам.'],
      ],
      shifts: [
        ['Только соцсети', 'Соцсети дают охват, сайт даёт решение о покупке.'],
        ['«Нет времени этим заниматься»', 'Структуру и тексты берём на себя. От вас — один созвон и материалы.'],
        ['«Это дорого»', 'Калькулятор покажет пример по вашему среднему чеку и доле заявок, которые доходят до оплаты.'],
      ],
      cross: [
        ['seo/', 'Чтобы сайт находили в поиске', 'Без SEO сайт может быть красивым и невидимым.'],
        ['geo/', 'Чтобы вас рекомендовали нейросети', 'GEO помогает попасть в ответы ИИ-ассистентов.'],
        ['bundle/', 'Всё вместе выгоднее', 'Сайт, SEO, GEO, бот и поддержка в одном проекте со скидкой за объём.'],
      ],
      closeTitle: 'Выберите, с чего начать именно вам',
      closeText: 'Не знаете, кто вы по нашей классификации? Выберите карточку ниже или просто напишите: подскажу в течение дня.',
    },
    en: {
      lossTitle: 'What happens while you have no website or bot of your own',
      lossLead: 'Customers do not disappear. They simply find and choose someone else, and you never even learn they were there.',
      losses: [
        ['You are absent where people choose', 'A person opens search or maps, or asks an AI. If you are not there, the choice is made without you and you never see it happen.'],
        ['No place where people can trust you', 'Prices, examples, reviews and business details in one place build trust. Without them people hesitate and go to whoever has them.'],
        ['Enquiries are not taken at night', 'An enquiry at 11 pm with no reply has gone cold by morning. A form and bot take it at once and tell you.'],
        ['Everything depends on someone else’s platform', 'A suspended account or an algorithm change removes your channel in a day. A website and bot belong to you.'],
      ],
      shifts: [
        ['Social media only', 'Social media gives reach, a website closes the decision.'],
        ['“I don’t have time for this”', 'We handle structure and copy. You bring one call and your materials.'],
        ['“It’s expensive”', 'Run an example using your average order value and the share of enquiries that become sales.'],
      ],
      cross: [
        ['seo/', 'Be found in search', 'Without SEO a site can be beautiful and invisible.'],
        ['geo/', 'Be recommended by AI assistants', 'GEO helps you appear in AI assistants’ answers.'],
        ['bundle/', 'Better together', 'Website, SEO, GEO, bot and support in one project with a volume discount.'],
      ],
      closeTitle: 'Choose where you should start',
      closeText: 'Not sure which group you belong to? Pick a card below or simply write: I will advise within a day.',
    },
  },

  'seo/': {
    ru: {
      lossTitle: 'Что вы теряете, пока сайт не настроен под поиск',
      lossLead: 'Сайт без SEO похож на магазин без вывески в переулке: товар хороший, но проходящие мимо его не видят.',
      losses: [
        ['Клиенты, которые уже ищут вашу услугу', 'Человек, вбивший в поиск «что-то + ваш город», уже готов купить. Если выдачу получили конкуренты, заявка ушла к ним.'],
        ['Деньги, которые уходят в рекламу', 'Платный трафик останавливается вместе с бюджетом. Правильно настроенный сайт приводит людей и после остановки.'],
        ['Технические ошибки, которые вы не видите', 'Медленная загрузка, дубли страниц, неверная разметка мешают поисковику понять сайт, а вы об этом не знаете.'],
        ['Карта и локальный поиск', 'Без актуальной карточки в Яндекс Картах вас не найдут люди из вашего района именно тогда, когда им нужна услуга рядом.'],
      ],
      shifts: [
        ['Сайт есть, заявок нет', 'Страницы отвечают на реальные запросы клиентов.'],
        ['Непонятно, что происходит с позициями', 'Подключаем инструменты поисковиков и видим состояние сайта.'],
        ['Зависимость от рекламы', 'Появляется второй источник заявок, который не требует ежедневной оплаты.'],
      ],
      cross: [
        ['geo/', 'Следующий шаг: ИИ-поиск', 'SEO и GEO используют одни данные. Сделав одно, вы наполовину подготовили второе.'],
        ['why-website/', 'Если сайта пока нет', 'Сначала сайт, который стоит оптимизировать.'],
        ['bundle/', 'SEO вместе с сайтом дешевле', 'Когда сайт делает та же команда, структура сразу строится под поиск.'],
      ],
      closeTitle: 'Начните с аудита',
      closeText: 'Я посмотрю, как поисковики видят ваш сайт, и скажу, что исправить в первую очередь. Это самый быстрый способ понять, сколько вы теряете. Без обещаний мест в выдаче: так честно.',
    },
    en: {
      lossTitle: 'What you lose while your site is not set up for search',
      lossLead: 'A site without SEO is like a shop with no sign down a side street: the goods are good, but people walking past cannot see them.',
      losses: [
        ['Customers who are already searching for you', 'Someone typing a service plus your city is ready to buy. If competitors own the results, the enquiry goes to them.'],
        ['Money that keeps flowing into ads', 'Paid traffic stops when the budget does. A well-configured site keeps bringing people after that.'],
        ['Technical problems you cannot see', 'Slow loading, duplicate pages and broken markup stop search engines understanding your site, and you never find out.'],
        ['Maps and local search', 'Without an up-to-date map listing, people nearby will not find you just when they need a service close to them.'],
      ],
      shifts: [
        ['A site exists, enquiries do not', 'Pages answer what customers actually search for.'],
        ['No idea what is happening to rankings', 'We connect search-engine tools and you can see the site’s status.'],
        ['Dependence on advertising', 'A second source of enquiries appears that does not need a daily payment.'],
      ],
      cross: [
        ['geo/', 'Next step: AI search', 'SEO and GEO use the same data. Doing one means you are halfway to the other.'],
        ['why-website/', 'If you have no site yet', 'First, a site that is worth optimising.'],
        ['bundle/', 'SEO is cheaper with the website', 'When the same team builds the site, its structure is built for search from day one.'],
      ],
      closeTitle: 'Start with an audit',
      closeText: 'I will look at how search engines see your site and tell you what to fix first. It is the fastest way to see what you are losing. No promises about rankings, because that would not be honest.',
    },
  },

  'geo/': {
    ru: {
      lossTitle: 'Что вы теряете, пока ИИ вас не знает',
      lossLead: 'Люди всё чаще спрашивают ChatGPT, Алису или Perplexity, к кому обратиться. Ответ получают одним абзацем, а не списком из десяти ссылок.',
      losses: [
        ['Вас нет в одном-единственном ответе', 'В выдаче поиска можно оказаться десятым. В ответе ИИ чаще называют нескольких. Если вас нет среди них, человек вас не увидит.'],
        ['ИИ собирает ответы из того, что находит', 'Если на сайте нет понятных услуг, цен и ответов на вопросы, нейросети нечего о вас сказать, и они расскажут о конкуренте.'],
        ['Конкуренты начинают раньше', 'Видимость в ИИ формируется месяцами. Те, кто занялся этим сейчас, будут появляться в ответах, когда ваш рынок только узнает об этом.'],
        ['Вы не знаете, что о вас говорят', 'Без аудита непонятно, называет ли вас ИИ, называет ли правильно и что именно он знает о вашей компании.'],
      ],
      shifts: [
        ['ИИ вас не упоминает', 'Страницы и разметка описывают ваши услуги так, чтобы их можно было процитировать.'],
        ['Нет понимания, как вас видят', 'Аудит показывает, что ИИ отвечает про ваш бренд.'],
        ['Информация противоречива', 'Контакты, цены и описание согласованы между сайтом и справочниками.'],
      ],
      cross: [
        ['seo/', 'Основа для GEO — SEO', 'Нейросети опираются на те же сайты, которые видят поисковики.'],
        ['support/', 'Видимость нужно поддерживать', 'Обновляем разметку и контент после изменений в вашем бизнесе.'],
        ['bundle/', 'GEO + SEO со скидкой', 'Это одна техническая работа, а не две. Пакет честно дешевле.'],
      ],
      closeTitle: 'Узнайте, что ИИ говорит о вашей компании',
      closeText: 'Начинаем с аудита видимости. Я не обещаю места в ответах ИИ: никто не может этого гарантировать. Я делаю так, чтобы вас было удобно находить и цитировать.',
    },
    en: {
      lossTitle: 'What you lose while AI does not know you',
      lossLead: 'People increasingly ask ChatGPT, Alice or Perplexity who to contact. They get one paragraph, not ten links.',
      losses: [
        ['You are missing from the one answer', 'In search results you can be tenth. An AI answer usually names a few. If you are not among them, the person never sees you.'],
        ['AI builds answers from what it can find', 'If your site has no clear services, prices and answers, the model has nothing to say about you and will talk about a competitor instead.'],
        ['Competitors are starting earlier', 'AI visibility builds over months. Those who start now will appear in answers when your market is only just learning about it.'],
        ['You do not know what is being said about you', 'Without an audit you cannot tell whether AI names you, names you correctly or what it knows about your company.'],
      ],
      shifts: [
        ['AI does not mention you', 'Pages and markup describe your services in a way that can be quoted.'],
        ['No idea how you are seen', 'An audit shows what AI says about your brand.'],
        ['Contradicting information', 'Contacts, prices and descriptions are consistent between your site and directories.'],
      ],
      cross: [
        ['seo/', 'GEO builds on SEO', 'AI models rely on the same sites search engines see.'],
        ['support/', 'Visibility needs upkeep', 'We update markup and content as your business changes.'],
        ['bundle/', 'GEO + SEO at a discount', 'It is one piece of technical work, not two. A bundle is honestly cheaper.'],
      ],
      closeTitle: 'Find out what AI says about your company',
      closeText: 'We start with a visibility audit. I do not promise a place in AI answers, because nobody can. I make you easy to find and easy to quote.',
    },
  },

  'support/': {
    ru: {
      lossTitle: 'Что случается с сайтом, за которым никто не следит',
      lossLead: 'Сайт не ломается громко. Он тихо устаревает: цены неверные, форма не отправляет, страница грузится вдвое дольше, и вы узнаёте об этом от клиента.',
      losses: [
        ['Форма перестала работать, а вы не знаете', 'Заявки не приходят, а сайт выглядит нормально. Вы теряете обращения неделями, пока кто-то не заметит.'],
        ['Информация на сайте устарела', 'Старые цены, неверный график, закончившаяся акция. Клиент видит расхождение и перестаёт доверять.'],
        ['Безопасность и обновления', 'Устаревшие компоненты становятся лазейкой. Обновлять их нужно вовремя, а не после взлома.'],
        ['Сайт стоит, пока бизнес растёт', 'Новая услуга, новый филиал, новый канал: если некому внести изменения, они откладываются месяцами.'],
      ],
      shifts: [
        ['Узнаёте о проблеме от клиента', 'Мониторим доступность и сообщаем вам первыми.'],
        ['Правки откладываются', 'Часы на изменения входят в подписку, пишете в Telegram.'],
        ['Нет понимания, что с сайтом', 'Ежемесячный отчёт с аналитикой на тарифах выше базового.'],
      ],
      cross: [
        ['seo/', 'Растить видимость', 'На тарифе «Рост» включены работы по SEO и GEO.'],
        ['geo/', 'Попасть в ответы ИИ', 'Поддержка включает актуализацию данных для нейросетей.'],
        ['bundle/', 'Всё вместе с самого начала', 'Если сайт делаем мы, поддержка встроена в проект.'],
      ],
      closeTitle: 'Пусть сайтом занимается тот, кто его знает',
      closeText: 'Первые два месяца после запуска исправления входят в проект. Дальше выберите тариф. Сайт, сделанный не нами, берём после аудита.',
    },
    en: {
      lossTitle: 'What happens to a website no one looks after',
      lossLead: 'A site does not break loudly. It quietly goes stale: prices are wrong, the form does not send, a page loads twice as slowly, and you hear about it from a customer.',
      losses: [
        ['The form stopped working and you do not know', 'Enquiries do not arrive while the site looks fine. You lose them for weeks until someone notices.'],
        ['Information on the site is out of date', 'Old prices, wrong opening hours, an offer that ended. Customers see the mismatch and stop trusting you.'],
        ['Security and updates', 'Outdated components become a way in. They need updating on time, not after a break-in.'],
        ['The site stands still while the business grows', 'A new service, branch or channel: with no one to make the changes, they wait for months.'],
      ],
      shifts: [
        ['You hear about problems from customers', 'We monitor availability and tell you first.'],
        ['Edits keep getting postponed', 'Hours for changes are included in the plan: message us on Telegram.'],
        ['No idea how the site is doing', 'A monthly analytics report on the higher plans.'],
      ],
      cross: [
        ['seo/', 'Grow visibility', 'The Growth plan includes SEO and GEO work.'],
        ['geo/', 'Appear in AI answers', 'Support includes keeping data fresh for AI models.'],
        ['bundle/', 'Everything together from the start', 'If we build the site, support is built into the project.'],
      ],
      closeTitle: 'Let the people who know the site look after it',
      closeText: 'For the first two months after launch, fixes are part of the project. After that, choose a plan. We take on sites we did not build after an audit.',
    },
  },
};

// The bundle page (route: bundle/)
export const bundle = {
  ru: {
    label: 'Пакетом выгоднее',
    title: 'Сайт, SEO, GEO, бот и поддержка в одном проекте',
    description: 'Одна команда вместо четырёх подрядчиков: всё работает вместе, стоит дешевле и не требует от вас склеивать результаты.',
    card: 'Почему пакет сильнее, чем отдельные услуги.',
    whyTitle: 'Почему по отдельности хуже',
    why: [
      ['Каждому подрядчику нужно объяснять бизнес заново', 'Дизайнер, разработчик, SEO-специалист и бот-мастер задают одни и те же вопросы. Вы тратите недели на пересказ, а результат всё равно не стыкуется.'],
      ['Никто не отвечает за целое', 'Сайт сделан, но не оптимизирован. SEO есть, но бот не принимает заявки. Когда что-то не работает, каждый показывает на соседа.'],
      ['Решения принимаются без учёта друг друга', 'Структура сайта, тексты для поиска и сценарии бота должны строиться вместе. Если они сделаны отдельно, их приходится переделывать.'],
      ['Дороже в сумме', 'У каждого подрядчика свой старт, своя настройка и своя наценка. В пакете общая работа делается один раз.'],
    ],
    flowTitle: 'Как части усиливают друг друга',
    flow: [
      ['Сайт', 'Собирает заявки и показывает цены'],
      ['SEO', 'Приводит тех, кто ищет вашу услугу'],
      ['GEO', 'Делает вас видимыми в ответах ИИ'],
      ['Бот', 'Отвечает сразу и передаёт заявку вам'],
      ['Поддержка', 'Держит всё свежим и рабочим'],
    ],
    compareTitle: 'По отдельности и пакетом',
    compareHead: ['', 'По отдельности', 'Пакетом'],
    compare: [
      ['Кто отвечает', 'Несколько подрядчиков', 'Один человек'],
      ['Описание бизнеса', 'Повторяете каждому', 'Один раз'],
      ['Стыковка частей', 'На вас', 'В проекте с самого начала'],
      ['Структура сайта и SEO', 'Делаются порознь', 'Строятся вместе'],
      ['Стоимость', 'Сумма цен', 'Скидка за объём'],
      ['После запуска', 'Ищете, кто чинит', 'Два месяца исправлений и поддержка'],
    ],
    plansTitle: 'С чего начать',
    plans: [
      ['Старт', 'Сайт, бот для заявок и базовая аналитика.', 'landing automation', 'small'],
      ['Рост', 'Сайт, ИИ-ассистент, CRM и личный кабинет клиента.', 'web assistant platform', 'medium'],
      ['Под ключ', 'Дизайн, сайт, приложение, боты и сопровождение.', 'design web mobile automation support', 'large'],
    ],
    discountNote: 'Скидку за объём калькулятор учитывает сам. Итоговую цену и состав фиксируем в договоре до старта.',
    faqTitle: 'Частые вопросы про пакет',
    faq: [
      ['Можно ли начать с малого, а потом расширить?', 'Да. Начните со «Старта» и добавляйте SEO, GEO, бота и сопровождение позже. Первые решения мы принимаем с расчётом на рост, поэтому переделывать не придётся.'],
      ['Скидка действует на любой состав?', 'Калькулятор учитывает скидку за объём, когда вы выбираете несколько услуг. Точную цену называю после короткого созвона.'],
      ['Что если мне нужна одна услуга?', 'Тогда покупайте одну. Пакет нужен тем, кому важен общий результат, а не отдельная часть.'],
    ],
  },
  en: {
    label: 'Why a bundle is better',
    title: 'Website, SEO, GEO, bot and support in one project',
    description: 'One team instead of four suppliers: everything works together, costs less and does not leave you stitching results together.',
    card: 'Why a bundle beats separate services.',
    whyTitle: 'Why separate purchases are worse',
    why: [
      ['Every supplier needs your business explained again', 'A designer, developer, SEO specialist and bot builder ask the same questions. You spend weeks retelling and the results still do not fit.'],
      ['Nobody owns the whole', 'The site is built but not optimised. SEO exists but the bot does not take enquiries. When something fails, each points at the next.'],
      ['Decisions are made without each other', 'Site structure, search copy and bot flows should be built together. If made separately, they get redone.'],
      ['Higher in total', 'Each supplier has its own kickoff, set-up and margin. In a bundle the shared work is done once.'],
    ],
    flowTitle: 'How the parts strengthen each other',
    flow: [
      ['Website', 'Collects enquiries and shows prices'],
      ['SEO', 'Brings people searching for your service'],
      ['GEO', 'Makes you visible in AI answers'],
      ['Bot', 'Replies at once and passes the enquiry to you'],
      ['Support', 'Keeps it all fresh and working'],
    ],
    compareTitle: 'Separately versus as a bundle',
    compareHead: ['', 'Separately', 'As a bundle'],
    compare: [
      ['Who is accountable', 'Several suppliers', 'One person'],
      ['Describing your business', 'Repeated for each', 'Once'],
      ['Fitting the parts together', 'Up to you', 'Built in from the start'],
      ['Site structure and SEO', 'Done apart', 'Built together'],
      ['Cost', 'The sum of prices', 'Volume discount'],
      ['After launch', 'You look for who fixes it', 'Two months of fixes plus support'],
    ],
    plansTitle: 'Where to start',
    plans: [
      ['Start', 'Website, enquiry bot and basic analytics.', 'landing automation', 'small'],
      ['Growth', 'Website, AI assistant, CRM and customer portal.', 'web assistant platform', 'medium'],
      ['End to end', 'Design, website, app, bots and support.', 'design web mobile automation support', 'large'],
    ],
    discountNote: 'The calculator applies the volume discount itself. We fix the final price and scope in the contract before starting.',
    faqTitle: 'Common questions about bundles',
    faq: [
      ['Can I start small and expand later?', 'Yes. Start with “Start” and add SEO, GEO, a bot and support later. We make the first decisions with growth in mind, so nothing needs redoing.'],
      ['Does the discount apply to any combination?', 'The calculator applies the volume discount when you choose several services. I confirm the exact price after a short call.'],
      ['What if I only need one service?', 'Then buy one. A bundle is for people who care about the overall result, not a single part.'],
    ],
  },
};
