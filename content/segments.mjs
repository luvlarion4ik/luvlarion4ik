import { esc, formatStartingPrice } from './site.mjs';
import { pageArt } from './page-art.mjs';
import { sell, shared, bundle } from './persuasion.mjs';
import { crmStartingPrice, packageStartingPrice } from './pricing.mjs';

export const segments = [
  {
    route: 'self-employed/',
    icon: 'web',
    starting: ['automation', 'small'],
    estimateServices: ['landing', 'automation'],
    paybackPackages: ['landing', 'automation', 'mini'],
    related: ['why-website/', 'seo/'],
    ru: {
      label: 'Самозанятым и ИП',
      title: 'Сайт или бот для самозанятых и ИП',
      card: 'Сайт или бот, чтобы клиенты писали вам напрямую.',
      description: 'Клиенты находят вас, видят цены и пишут напрямую — без агрегаторов и комиссий. Запуск за 1–2 недели.',
      benefits: [
        ['Заявки теряются в личке', 'Сообщения приходят из разных мессенджеров, на часть не успеваете ответить.'],
        ['Одни и те же вопросы', '«Сколько стоит», «есть ли время», «где находитесь» по десять раз в день.'],
        ['Зависимость от площадок', 'Клиенты приходят только через агрегатор, который берёт комиссию и меняет правила.'],
      ],
      packages: [
        { id: 'landing', title: 'Сайт для заявок', price: ['landing', 'small'], term: '5–7 дней', items: ['Одна страница до 5 блоков', 'Адаптив под телефон', 'Форма заявки', 'Заявки в почту или Telegram', 'Подключение домена'] },
        { id: 'automation', title: 'Telegram- или MAX-бот', price: ['automation', 'small'], term: '5–7 дней', items: ['Меню', 'Один сценарий записи или заявки', 'Уведомление вам в чат', 'Инструкция по управлению'] },
        { id: 'mini', title: 'Мини-приложение с каталогом', price: ['mini', 'small'], term: '2–3 недели', items: ['Каталог до 10 позиций', 'Карточки с фото и ценой', 'Заявка продавцу в один клик'] },
        { id: 'seo', title: 'SEO-старт', price: ['seo', 'small'], term: '3–5 дней', items: ['Аудит', 'Яндекс Вебмастер и Search Console', 'Метатеги', 'Карта сайта', 'Карточка в Яндекс Картах'] },
      ],
      faq: [
        ['Мне нужен договор, я самозанятый?', 'Да, работаем по договору, чек выдаём. Из реквизитов нужны только ваши ФИО и контакт.'],
        ['Смогу сам менять цены и тексты?', 'Да. Покажем, как это делать, и оставим короткую инструкцию.'],
        ['Что если нужно больше, чем в пакете?', 'Дополнительные функции оценим отдельно до начала работ.'],
        ['Сколько стоит содержание?', 'Хостинг простого сайта на GitHub Pages может быть бесплатным. Платный хостинг может стоить несколько сотен рублей в месяц. Домен — около 200–1 000 ₽ в год.'],
      ],
    },
    en: {
      label: 'Self-employed and sole traders',
      title: 'Websites and bots for sole traders',
      card: 'A website or bot so customers can contact you directly.',
      description: 'Customers find you, see your prices and contact you directly without platform fees. Launch in one to two weeks.',
      benefits: [
        ['Enquiries get buried in chats', 'Messages come in through several apps, and some go unanswered.'],
        ['The same questions come up', 'Customers keep asking about prices, availability and how to find you.'],
        ['You rely on platforms', 'Customers come through a platform that charges commission and can change its terms.'],
      ],
      packages: [
        { id: 'landing', title: 'Enquiry website', price: ['landing', 'small'], term: '5–7 days', items: ['One page with up to five sections', 'Mobile-friendly layout', 'Enquiry form', 'Enquiries sent to email or Telegram', 'Domain connection'] },
        { id: 'automation', title: 'Telegram or MAX bot', price: ['automation', 'small'], term: '5–7 days', items: ['Menu', 'One booking or enquiry workflow', 'Chat notification', 'Operating guide'] },
        { id: 'mini', title: 'Catalogue mini app', price: ['mini', 'small'], term: '2–3 weeks', items: ['Catalogue of up to ten items', 'Product photos and prices', 'One-click enquiry to the seller'] },
        { id: 'seo', title: 'SEO starter', price: ['seo', 'small'], term: '3–5 days', items: ['Audit', 'Yandex Webmaster and Search Console', 'Metadata', 'Sitemap', 'Yandex Maps business listing'] },
      ],
      faq: [
        ['Do I need a contract if I am self-employed?', 'Yes. We work under contract and issue a receipt. We only need your full name and contact details.'],
        ['Can I change prices and text myself?', 'Yes. We’ll show you how and leave a short guide.'],
        ['What if I need more than the package includes?', 'We quote for extra features before work starts.'],
        ['What are the running costs?', 'A simple site can be hosted for free on GitHub Pages. Paid hosting can cost a few hundred roubles per month. A domain costs around RUB 200–1,000 per year.'],
      ],
    },
  },
  {
    route: 'business/',
    icon: 'layers',
    starting: ['web', 'small'],
    estimateServices: ['web', 'automation'],
    paybackPackages: ['web', 'bot-crm', 'mini'],
    related: ['seo/', 'support/'],
    ru: {
      label: 'Малому и среднему бизнесу',
      title: 'Сайт, бот и CRM для малого и среднего бизнеса',
      card: 'Сайт с каталогом, CRM, бот и личный кабинет.',
      description: 'Собираем заявки из сайта, мессенджеров и маркетплейсов в одно место и убираем ручные операции у менеджеров.',
      benefits: [
        ['Менеджеры тонут в рутине', 'Копируют заявки в таблицы и отвечают на одни и те же вопросы.'],
        ['Непонятно, откуда клиенты', 'Без аналитики сложно понять, на что тратить рекламный бюджет.'],
        ['Сайт устарел', 'Неудобно с телефона, сложно обновлять, мало заявок.'],
      ],
      packages: [
        { id: 'web', title: 'Сайт компании с админкой', price: ['web', 'small'], term: '3–4 недели', items: ['До 10 страниц', 'Каталог услуг', 'Формы', 'Аналитика', 'Управление контентом'] },
        { id: 'shop', title: 'Интернет-магазин', price: ['shop', 'small'], term: '4–6 недель', items: ['Каталог', 'Корзина', 'Оплата', 'Уведомления о заказах'] },
        { id: 'bot-crm', title: 'Бот + CRM', price: 'bot-crm', term: '2–3 недели', items: ['Бот для заявок', 'Передача в amoCRM или Битрикс24', 'Уведомления менеджерам'] },
        { id: 'assistant', title: 'ИИ-ассистент для заявок', price: ['assistant', 'small'], term: '2–4 недели', items: ['Ответы по базе знаний', 'Квалификация заявки', 'Передача в CRM'] },
        { id: 'growth', title: 'Комбо «Рост»', price: 'growth', term: 'По смете', items: ['Сайт', 'ИИ-ассистент', 'CRM', 'Личный кабинет клиента', 'Скидка за объём'] },
        { id: 'mini', title: 'Мини-приложение с каталогом', price: ['mini', 'small'], term: '2–3 недели', items: ['Каталог до 10 позиций', 'Карточки с фото и ценой', 'Заявка продавцу в один клик'] },
      ],
      faq: [
        ['Работаете с юрлицами и НДС?', 'Работаем по договору с ИП, закрывающие документы предоставляем. Детали оплаты согласуем до старта.'],
        ['Подключитесь к нашей CRM / 1С?', 'Да. Подключение готовой CRM — {crm} к стоимости проекта. Интеграции с 1С и нестандартными API оцениваем после изучения документации.'],
        ['Можно начать с малого?', 'Да. Запускаем один сценарий, проверяем результат и расширяем по этапам.'],
        ['Кто будет поддерживать сайт?', 'Два месяца исправляем недочёты бесплатно. Дальше можно оформить {support}.'],
      ],
    },
    en: {
      label: 'Small and medium businesses',
      title: 'Websites, bots and CRM for small and medium businesses',
      card: 'A website with a catalogue, CRM, bot and client portal.',
      description: 'Collect enquiries from your website, messaging apps and marketplaces in one place and reduce manual work for your team.',
      benefits: [
        ['Routine work takes up the day', 'Staff copy enquiries into spreadsheets and answer the same questions.'],
        ['Enquiry sources are unclear', 'Without analytics, it is hard to decide where to spend your advertising budget.'],
        ['Your website is out of date', 'It is awkward on mobile, difficult to update and brings in few enquiries.'],
      ],
      packages: [
        { id: 'web', title: 'Company website with CMS', price: ['web', 'small'], term: '3–4 weeks', items: ['Up to ten pages', 'Service catalogue', 'Forms', 'Analytics', 'Content management'] },
        { id: 'shop', title: 'Online shop', price: ['shop', 'small'], term: '4–6 weeks', items: ['Catalogue', 'Basket', 'Payments', 'Order notifications'] },
        { id: 'bot-crm', title: 'Bot + CRM', price: 'bot-crm', term: '2–3 weeks', items: ['Enquiry bot', 'Transfer to amoCRM or Bitrix24', 'Notifications for your team'] },
        { id: 'assistant', title: 'AI assistant for enquiries', price: ['assistant', 'small'], term: '2–4 weeks', items: ['Answers from your knowledge base', 'Enquiry qualification', 'CRM handover'] },
        { id: 'growth', title: 'Growth bundle', price: 'growth', term: 'Agreed in the quote', items: ['Website', 'AI assistant', 'CRM', 'Client portal', 'Volume discount'] },
        { id: 'mini', title: 'Catalogue mini app', price: ['mini', 'small'], term: '2–3 weeks', items: ['Catalogue of up to ten items', 'Product photos and prices', 'One-click enquiry to the seller'] },
      ],
      faq: [
        ['Do you work with companies, and how do you handle VAT?', 'We contract as a sole trader and provide the completion documents. Payment details are agreed before work begins.'],
        ['Can you connect to our CRM or 1C?', 'Yes. An integration with an existing CRM adds {crm} to the project cost. We quote for 1C and custom API integrations after reviewing their documentation.'],
        ['Can we start small?', 'Yes. We launch one workflow, check how it performs and expand in stages.'],
        ['Who will maintain the website?', 'We fix issues for two months at no charge. A {support} is available afterwards.'],
      ],
    },
  },
  {
    route: 'enterprise/',
    icon: 'server',
    starting: ['agents', 'medium'],
    estimateTier: 'medium',
    estimateServices: ['agents', 'private-ai'],
    related: ['geo/', 'support/'],
    ru: {
      label: 'Крупным компаниям',
      title: 'ИИ, интеграции и сервисы для крупных компаний',
      card: 'ИИ на ваших серверах, агенты, интеграции под NDA.',
      description: 'Начинаем с пилота на одном процессе, работаем под NDA и в вашем контуре. Решение о масштабировании — по измеримым результатам пилота.',
      benefits: [
        ['Данные нельзя отдавать наружу', 'Нужен ИИ, который работает на ваших серверах.'],
        ['Системы не связаны', 'Данные между CRM, ERP и учётом переносят вручную.'],
        ['Долгие согласования', 'Нужен подрядчик, который понимает требования к безопасности и документации.'],
      ],
      packages: [
        { id: 'diagnosis', title: 'Диагностика', priceLabel: 'Бесплатно', items: ['Созвон', 'Разбор процесса', 'Оценка эффекта'] },
        { id: 'pilot', title: 'Пилот', price: ['agents', 'medium'], items: ['Один процесс', 'Работа на ваших данных', 'Метрики успеха согласуем заранее'] },
        { id: 'rollout', title: 'Внедрение', priceLabel: 'По смете после пилота', items: ['Интеграции', 'Роли и доступы', 'Обучение команды'] },
        { id: 'support', title: 'Сопровождение', priceLabel: 'Подписка и SLA', items: ['Объём работ и сроки ответа согласуем при внедрении'] },
      ],
      directions: [
        ['ИИ на ваших серверах', '#quiz', 'private-ai'],
        ['Мультиагентные системы', '#quiz', 'agents'],
        ['FinTech', 'fintech/'],
        ['EdTech', 'edtech/'],
        ['Мобильные приложения', '#quiz', 'mobile'],
        ['Заказная разработка', '#quiz', 'custom'],
      ],
      faq: [
        ['Подписываете NDA до передачи данных?', 'Да, до получения закрытых материалов.'],
        ['Можно развернуть в нашем контуре без интернета?', 'Да, подбираем модель под ваше оборудование. Оборудование рассчитываем отдельно.'],
        ['Как формируется бюджет?', 'После диагностики фиксируем объём пилота и смету. Дальнейшие этапы оцениваем по его результатам.'],
        ['Кто отвечает за проект?', 'Илья Ларионов ведёт архитектуру и остаётся единой точкой контакта. Команда подключается по задачам.'],
      ],
    },
    en: {
      label: 'Enterprise',
      title: 'AI, integrations and services for enterprises',
      card: 'On-premises AI, agents and integrations under NDA.',
      description: 'Start with a pilot for one workflow. We work under NDA and within your infrastructure. Measured pilot results inform the decision to scale.',
      benefits: [
        ['Data must stay in-house', 'AI needs to run on servers you control.'],
        ['Systems are disconnected', 'Staff transfer records between CRM, ERP and accounting systems by hand.'],
        ['Approvals take time', 'You need a partner who understands security and documentation requirements.'],
      ],
      packages: [
        { id: 'diagnosis', title: 'Discovery', priceLabel: 'Free', items: ['Call', 'Workflow review', 'Assessment of the potential impact'] },
        { id: 'pilot', title: 'Pilot', price: ['agents', 'medium'], items: ['One workflow', 'Uses your data', 'Success measures agreed up front'] },
        { id: 'rollout', title: 'Rollout', priceLabel: 'Quoted after the pilot', items: ['Integrations', 'Roles and access', 'Team training'] },
        { id: 'support', title: 'Support', priceLabel: 'Subscription and SLA', items: ['Scope and response times agreed during rollout'] },
      ],
      directions: [
        ['On-premises AI', '#quiz', 'private-ai'],
        ['Multi-agent systems', '#quiz', 'agents'],
        ['FinTech', 'fintech/'],
        ['EdTech', 'edtech/'],
        ['Mobile apps', '#quiz', 'mobile'],
        ['Bespoke development', '#quiz', 'custom'],
      ],
      faq: [
        ['Do you sign an NDA before receiving data?', 'Yes, before receiving confidential materials.'],
        ['Can the system run offline on our infrastructure?', 'Yes. We select a model for your equipment. Hardware is priced separately.'],
        ['How do you set the budget?', 'After discovery, we agree on the pilot scope and quote. Later stages are priced in light of the pilot results.'],
        ['Who leads the project?', 'Ilya Larionov leads the architecture and is your point of contact. The team joins according to the work involved.'],
      ],
    },
  },
];

export const topics = [
  {
    route: 'why-website/',
    icon: 'web',
    starting: ['landing', 'small'],
    estimateServices: ['landing', 'automation'],
    related: ['seo/', 'geo/'],
    ru: {
      label: 'Зачем бизнесу сайт',
      title: 'Зачем бизнесу сайт и бот в 2026 году',
      description: 'Соцсети и агрегаторы помогают находить клиентов, но не принадлежат вам. Сайт и бот — каналы, которые вы контролируете сами.',
      benefits: [
        ['Вас находят в поиске, на картах и в ИИ', 'Люди сравнивают варианты до первого звонка.'],
        ['Доверие', 'Цены, примеры работ, отзывы и реквизиты в одном месте.'],
        ['Заявки 24/7', 'Форма и бот принимают обращения, пока вы заняты или спите.'],
        ['Независимость', 'У клиентов остаётся прямой способ связаться с вами при блокировке аккаунта или смене правил площадки.'],
      ],
      steps: ['Собираем структуру и тексты.', 'Подключаем форму или бот и проверяем доставку заявки.', 'Публикуем сайт на вашем домене.'],
      packages: [
        { id: 'landing', title: 'Сайт для заявок', price: ['landing', 'small'], items: ['Страница с услугами и ценами', 'Форма заявки'] },
        { id: 'automation', title: 'Telegram- или MAX-бот', price: ['automation', 'small'], items: ['Один сценарий записи или заявки', 'Уведомление вам в чат'] },
      ],
      detailsTitle: 'Частые сомнения',
      faq: [
        ['У меня есть Instagram или VK. Этого хватит?', 'Соцсети помогают охватить аудиторию. На сайте клиенты могут сравнить услуги и цены и найти вас через поиск.'],
        ['Это дорого?', 'Стартовый сайт стоит {landing}. Рассчитайте, сколько продаж потребуется, в {payback}.'],
        ['У меня нет времени этим заниматься', 'Берём на себя структуру и тексты. От вас — один созвон и материалы.'],
      ],
    },
    en: {
      label: 'Why businesses need a website',
      title: 'Why your business needs a website and a bot in 2026',
      description: 'Social media and directories help customers find you. Your website and bot give you channels you control.',
      benefits: [
        ['Customers can find you through search, maps and AI', 'People compare options before making their first call.'],
        ['Trust', 'Prices, examples, reviews and business details in one place.'],
        ['Enquiries around the clock', 'A form and bot collect enquiries while you are busy or asleep.'],
        ['Independence', 'People can still contact you directly if a platform changes its rules or suspends an account.'],
      ],
      steps: ['Plan the structure and write the copy.', 'Connect your form or bot and test enquiry delivery.', 'Publish the website on your domain.'],
      packages: [
        { id: 'landing', title: 'Enquiry website', price: ['landing', 'small'], items: ['Page with services and prices', 'Enquiry form'] },
        { id: 'automation', title: 'Telegram or MAX bot', price: ['automation', 'small'], items: ['One booking or enquiry workflow', 'Chat notification'] },
      ],
      detailsTitle: 'Common concerns',
      faq: [
        ['I use Instagram or VK. Is that enough?', 'Social media helps reach an audience. A website lets customers compare your services and prices and find you through search.'],
        ['Is it expensive?', 'A starter website costs {landing}. See how many sales would cover the cost with the {payback}.'],
        ['I don’t have time to manage this', 'We handle the structure and copy. We need one call and your materials.'],
      ],
    },
  },
  {
    route: 'seo/',
    icon: 'web',
    starting: ['seo', 'small'],
    estimateServices: ['seo'],
    related: ['why-website/', 'geo/'],
    ru: {
      label: 'SEO',
      title: 'SEO-оптимизация сайта под Яндекс и Google',
      description: 'Настраиваем сайт так, чтобы поисковики его понимали, а клиенты находили по нужным запросам.',
      benefits: [
        ['Понятная структура', 'Поисковые системы могут обходить страницы и определять, какие услуги на них описаны.'],
        ['Локальный поиск', 'Клиенты могут найти актуальные контакты и услуги в своём городе.'],
        ['Измеримые изменения', 'Отслеживаем состояние сайта и видимость страниц через инструменты поисковых систем.'],
      ],
      steps: ['Технический аудит', 'Скорость и мобильная версия', 'Структура и метатеги', 'Семантика под ваши услуги и город', 'Яндекс Бизнес и Google Business Profile', 'Подключение Вебмастера, Search Console и Метрики', 'Отчёт и план на 3 месяца'],
      packages: [
        { id: 'seo-start', title: 'SEO-старт', price: ['seo', 'small'], items: ['Аудит и техническая настройка одного сайта'] },
        { id: 'seo-launch', title: 'SEO-запуск', price: ['seo', 'medium'], items: ['Семантика', 'Структура страниц', 'Тексты для ключевых услуг'] },
        { id: 'seo-monthly', title: 'Ежемесячное продвижение', priceLabel: 'По смете', items: ['Контент', 'Ссылки', 'Отчёты'] },
      ],
      notice: 'Мы не обещаем конкретные позиции — их определяют поисковые системы. Обещаем технически правильный сайт и прозрачный отчёт о работе.',
      faq: [
        ['Когда будет результат?', 'Первые изменения обычно заметны через 2–4 месяца.'],
        ['Нужен ли новый сайт?', 'Не всегда. Начинаем с аудита текущего сайта.'],
        ['Работаете с сайтами на Tilda и WordPress?', 'Да, в пределах возможностей платформы.'],
      ],
    },
    en: {
      label: 'SEO',
      title: 'Website SEO for Yandex and Google',
      description: 'We help search engines understand your site so customers can find it when they search for your services.',
      benefits: [
        ['Clear structure', 'Search engines can crawl your pages and identify which services each page describes.'],
        ['Local search', 'Customers can find up-to-date contact details and services in their area.'],
        ['Measurable changes', 'We track site health and visibility using search engine tools.'],
      ],
      steps: ['Technical audit', 'Speed and mobile experience', 'Site structure and metadata', 'Keyword research for your services and area', 'Yandex Business and Google Business Profile', 'Set-up for Yandex Webmaster, Search Console and Metrica', 'Report and three-month plan'],
      packages: [
        { id: 'seo-start', title: 'SEO starter', price: ['seo', 'small'], items: ['Audit and technical set-up for one website'] },
        { id: 'seo-launch', title: 'SEO launch', price: ['seo', 'medium'], items: ['Keyword research', 'Page structure', 'Copy for core services'] },
        { id: 'seo-monthly', title: 'Monthly SEO', priceLabel: 'By quote', items: ['Content', 'Links', 'Reporting'] },
      ],
      notice: 'Search engines determine rankings, so we cannot promise specific positions. We deliver sound technical set-up and a clear account of the work.',
      faq: [
        ['When will we see results?', 'Early changes typically appear after two to four months.'],
        ['Do we need a new website?', 'We start by auditing your existing site. A rebuild is only needed in some cases.'],
        ['Do you work with Tilda and WordPress?', 'Yes, within the capabilities of each platform.'],
      ],
    },
  },
  {
    route: 'geo/',
    icon: 'ai',
    starting: ['geo', 'small'],
    estimateServices: ['geo'],
    related: ['why-website/', 'seo/'],
    ru: {
      label: 'GEO (ИИ-поиск)',
      title: 'GEO — чтобы ИИ-ассистенты рекомендовали ваш бизнес',
      description: 'Всё больше людей спрашивают ChatGPT, Алису, Perplexity или читают ИИ-обзоры в поиске. GEO (Generative Engine Optimization) помогает сделать ваш бизнес заметнее в таких ответах.',
      benefits: [
        ['Откуда ИИ берёт ответы', 'Ассистенты опираются на сайты, справочники и отзывы.'],
        ['Какие данные помогают', 'Понятные, структурированные и согласованные сведения упрощают поиск информации о вашем бизнесе.'],
        ['Что меняем', 'Обновляем данные на сайте и в каталогах, проверяем ответы ИИ до и после.'],
      ],
      steps: ['Аудит ответов ИИ о вас и конкурентах по 20–30 типовым вопросам', 'Разметка schema.org: организация, услуги, FAQ и цены', 'Файл llms.txt', 'Страницы с ответами на частые вопросы клиентов', 'Единые данные в Яндекс Бизнесе, 2ГИС, картах и каталогах', 'Повторный замер через 1–2 месяца'],
      packages: [
        { id: 'geo-audit', title: 'GEO-аудит', price: ['geo', 'small'], items: ['Аудит видимости бренда в ответах ИИ', 'Базовая разметка'] },
        { id: 'geo-setup', title: 'GEO-настройка', price: ['geo', 'medium'], items: ['Структурированные данные', 'Страницы с ответами', 'Повторный замер'] },
        { id: 'seo-geo', title: 'SEO + GEO', priceLabel: 'Комбо со скидкой', items: ['Технические работы для поиска и видимости в ответах ИИ'], services: ['seo', 'geo'] },
      ],
      notice: 'ИИ-ассистенты формируют ответы самостоятельно, гарантировать упоминание нельзя. Мы повышаем вероятность и показываем замеры до и после.',
      faq: [
        ['Чем GEO отличается от SEO?', 'SEO работает с видимостью в результатах поиска, GEO — с тем, какие сведения о бизнесе появляются в ответах ИИ. Работы можно объединить.'],
        ['Как измеряете изменения?', 'Фиксируем ответы на типовые вопросы при аудите и используем тот же набор при повторном замере.'],
        ['Нужен ли новый сайт?', 'Начинаем с текущего сайта и справочников. Объём изменений определяем после аудита.'],
      ],
    },
    en: {
      label: 'GEO (AI search)',
      title: 'GEO for visibility in AI recommendations',
      description: 'More people ask ChatGPT, Alice and Perplexity or use AI overviews in search. Generative Engine Optimisation (GEO) helps make your business easier to find in those answers.',
      benefits: [
        ['Where answers come from', 'AI assistants draw on websites, directories and reviews.'],
        ['Which information helps', 'Clear, structured and consistent details make information about your business easier to find.'],
        ['What we improve', 'We update your site and listings, then compare AI answers before and after.'],
      ],
      steps: ['Audit answers about your business and competitors across 20–30 common questions', 'Add schema.org markup for your organisation, services, FAQs and prices', 'Create an llms.txt file', 'Publish pages that answer common customer questions', 'Align details across Yandex Business, 2GIS, maps and directories', 'Repeat the assessment after one to two months'],
      packages: [
        { id: 'geo-audit', title: 'GEO audit', price: ['geo', 'small'], items: ['Brand visibility audit in AI answers', 'Baseline markup'] },
        { id: 'geo-setup', title: 'GEO set-up', price: ['geo', 'medium'], items: ['Structured data', 'Answer pages', 'Follow-up assessment'] },
        { id: 'seo-geo', title: 'SEO + GEO', priceLabel: 'Bundle discount', items: ['Technical work on search and visibility in AI answers'], services: ['seo', 'geo'] },
      ],
      notice: 'AI assistants produce their own answers and we cannot guarantee a mention. We improve the chances and report findings before and after the work.',
      faq: [
        ['How does GEO differ from SEO?', 'SEO improves visibility in search results, while GEO focuses on the information that appears in AI answers. We can combine the work.'],
        ['How do you measure change?', 'We record answers to common questions in the audit and use the same questions for the follow-up.'],
        ['Do we need a new site?', 'We start with your existing site and listings. The audit informs the scope of any updates.'],
      ],
    },
  },
  {
    route: 'support/',
    icon: 'support',
    starting: ['support', 'small'],
    estimateServices: ['support'],
    related: ['seo/', 'geo/'],
    ru: {
      label: 'Сопровождение',
      title: 'Сопровождение сайта и ботов после запуска',
      description: 'Два месяца после сдачи исправляем недочёты бесплатно. Дальше — подписка, чтобы сайт оставался рабочим, быстрым и актуальным.',
      benefits: [
        ['Сайт под наблюдением', 'Следим за доступностью и обновлениями.'],
        ['Правки по мере необходимости', 'Обновляем тексты, формы и сценарии в пределах выбранного тарифа.'],
        ['План развития', 'На старших тарифах используем аналитику, чтобы выбрать следующие работы.'],
      ],
      steps: ['Проверяем сайт и ботов и согласуем порядок доступа.', 'Настраиваем мониторинг, обновления и приём задач.', 'Выполняем правки и отчитываемся в рамках тарифа.'],
      packages: [
        { id: 'support-basic', title: 'Базовый', price: ['support', 'small'], items: ['Мониторинг доступности', 'Обновления', 'Мелкие правки до 2 часов'] },
        { id: 'support-standard', title: 'Рабочий', price: ['support', 'medium'], items: ['Правки до 6 часов', 'Ежемесячный отчёт по аналитике', 'Приоритетный ответ'] },
        { id: 'support-growth', title: 'Рост', price: ['support', 'large'], items: ['Развитие функций', 'SEO и GEO', 'A/B-проверки'] },
      ],
      faq: [
        ['Можно взять сопровождение сайта, который делали не вы?', 'Да, после аудита.'],
        ['Что если часы не использованы?', 'Часы не переносятся. Вы можете сменить тариф.'],
        ['Можно ли отказаться?', 'Да, с уведомлением за две недели.'],
      ],
    },
    en: {
      label: 'Support',
      title: 'Website and bot support after launch',
      description: 'We fix issues at no charge for two months after handover. After that, a subscription keeps your site working, fast and up to date.',
      benefits: [
        ['Your site is monitored', 'We track availability and updates.'],
        ['Changes when you need them', 'We update copy, forms and workflows within the scope of your plan.'],
        ['Planned improvements', 'With the higher tiers, we use analytics to prioritise improvements.'],
      ],
      steps: ['Review your website and bots and agree on access.', 'Set up monitoring, updates and a way to request changes.', 'Make agreed changes and report on the work covered by the plan.'],
      packages: [
        { id: 'support-basic', title: 'Basic', price: ['support', 'small'], items: ['Availability monitoring', 'Updates', 'Up to two hours of minor changes'] },
        { id: 'support-standard', title: 'Standard', price: ['support', 'medium'], items: ['Up to six hours of changes', 'Monthly analytics report', 'Priority response'] },
        { id: 'support-growth', title: 'Growth', price: ['support', 'large'], items: ['Feature development', 'SEO and GEO work', 'A/B checks'] },
      ],
      faq: [
        ['Can you maintain a website you did not build?', 'Yes, after an audit.'],
        ['What if we do not use all our hours?', 'Hours do not roll over. You can change plans.'],
        ['Can we cancel?', 'Yes, with two weeks’ notice.'],
      ],
    },
  },
];

topics.push({
  route: 'bundle/',
  icon: 'layers',
  starting: ['landing', 'small'],
  estimateServices: ['landing', 'seo', 'geo', 'automation'],
  estimateTier: 'medium',
  related: ['seo/', 'geo/'],
  ru: { label: bundle.ru.label, title: bundle.ru.title, description: bundle.ru.description, card: bundle.ru.card, faq: bundle.ru.faq, detailsTitle: bundle.ru.faqTitle },
  en: { label: bundle.en.label, title: bundle.en.title, description: bundle.en.description, card: bundle.en.card, faq: bundle.en.faq, detailsTitle: bundle.en.faqTitle },
});

const pick = (lang, ru, en) => lang === 'ru' ? ru : en;

function section(title, body, extraClass = '') {
  return `<section class="section wrap audience-section ${extraClass}"><h2>${esc(title)}</h2>${body}</section>`;
}

function priceMarkup(lang, rubles, suffix = '') {
  return `${pick(lang, 'от', 'from')} <span data-region-price="${rubles}">${formatStartingPrice(rubles, lang)}</span>${suffix}`;
}

function estimateLink(lang, home, services, tier, label) {
  const params = new URLSearchParams({ service: services.join(' '), tier });
  return `<a class="button" href="${esc(home + '?' + params + '#quiz')}" data-estimate-services="${esc(services.join(' '))}" data-estimate-tier="${tier}">${esc(label ?? pick(lang, 'Рассчитать стоимость', 'Estimate the cost'))}</a>`;
}

function telegramLink(lang, ctx, audience, pack) {
  const text = pick(lang, 'Здравствуйте! Хочу обсудить проект', 'Hello! I’d like to discuss a project');
  const url = new URL(ctx.tg);
  url.searchParams.set('text', `${text}. ${audience}${pack ? ' · ' + pack : ''}.`);
  return esc(url.href);
}

function hero(lang, page, ctx, isSegment) {
  const { label, title, description } = page[lang];
  return `<section class="audience-hero"><div class="wrap audience-hero-grid">
    <div class="audience-hero-copy">
    <p class="eyebrow"><i></i>${isSegment ? pick(lang, 'Для кого', 'Who we work with') : pick(lang, 'Рост после запуска', 'Growth after launch')}</p>
    <h1>${esc(title)}</h1>
    <p class="intro">${esc(description)}</p>
    <div class="actions">
      ${estimateLink(lang, ctx.home, page.estimateServices, page.estimateTier ?? 'small')}
      <a class="ghost" href="${telegramLink(lang, ctx, label)}">${pick(lang, 'Написать в Telegram', 'Message us on Telegram')}</a>
    </div>
    </div>
    ${pageArt(lang, page.route)}
  </div></section>`;
}

function renderBenefits(benefits, icons) {
  return `<div class="service-grid audience-benefits">${benefits.map(([title, description], index) =>
    `<article><span class="service-mark" aria-hidden="true">${icons[['spark', 'layers', 'arrow', 'web'][index]]}</span><h3>${esc(title)}</h3><p>${esc(description)}</p></article>`
  ).join('')}</div>`;
}

function renderPackages(lang, page, ctx) {
  const { label, packages } = page[lang];
  const suffix = page.route === 'support/' ? pick(lang, ' / мес.', ' / month') : '';
  const title = page.route === 'enterprise/' ? pick(lang, 'Как начинаем работу', 'How we work')
    : page.route === 'support/' ? pick(lang, 'Тарифы', 'Support plans') : pick(lang, 'Пакеты', 'Packages');
  return section(title, `<div class="service-grid audience-packages">${packages.map(pack => {
    const rubles = packageStartingPrice(pack.price, ctx.pricing);
    const price = rubles === null
      ? `<p class="audience-price">${esc(pack.priceLabel ?? pick(lang, 'По смете', 'On request'))}</p>`
      : `<p class="audience-price" data-region-price-row>${priceMarkup(lang, rubles, suffix)}</p>`;
    const action = pack.services
      ? estimateLink(lang, ctx.home, pack.services, pack.price?.[1] === 'medium' ? 'medium' : 'small', pick(lang, 'Рассчитать комбо', 'Estimate the bundle'))
      : `<a class="btn" href="${telegramLink(lang, ctx, label, pack.title)}">${page.route === 'enterprise/'
        ? pick(lang, 'Обсудить этап', 'Discuss this stage') : pick(lang, 'Обсудить пакет', 'Discuss this package')}</a>`;
    return `<article id="package-${esc(pack.id)}">
      <h3>${esc(pack.title)}</h3>${price}
      <ul class="package-includes">${pack.items.map(item => `<li><span aria-hidden="true">✓</span>${esc(item)}</li>`).join('')}</ul>
      ${pack.term ? `<p class="package-term">${esc(pack.term)}</p>` : ''}
      <div class="package-action">${action}</div>
    </article>`;
  }).join('')}</div><p data-region-note hidden></p>`);
}

export function pageFAQ(lang, page, ctx, html = false) {
  const landing = packageStartingPrice(['landing', 'small'], ctx.pricing);
  const money = rubles => rubles === null ? pick(lang, 'по смете', 'on request')
    : html ? priceMarkup(lang, rubles) : `${pick(lang, 'от', 'from')} ${formatStartingPrice(rubles, lang)}`;
  const link = (href, label) => html ? `<a href="${esc(ctx.home + href)}">${label}</a>` : label;
  const replacements = {
    landing: () => money(landing),
    crm: () => money(crmStartingPrice),
    support: () => link('support/', pick(lang, 'подписку на сопровождение', 'support plan')),
    payback: () => link('self-employed/#payback', pick(lang, 'калькуляторе окупаемости', 'payback calculator')),
  };
  return page[lang].faq.map(([question, answer]) => [
    question,
    (html ? esc(answer) : answer).replace(/\{(landing|crm|support|payback)\}/g, (_, key) => replacements[key]()),
  ]);
}

function renderFAQ(lang, page, ctx) {
  const title = page[lang].detailsTitle ?? pick(lang, 'Частые вопросы', 'Common questions');
  return section(title, pageFAQ(lang, page, ctx, true).map(([question, answer]) =>
    `<details><summary>${esc(question)}</summary><p>${answer}</p></details>`).join(''));
}

function renderRelated(lang, page, ctx) {
  const related = [...segments.filter(segment => segment !== page).slice(0, 2),
    ...page.related.map(route => topics.find(topic => topic.route === route))];
  return section(pick(lang, 'Смотрите также', 'See also'), `<div class="audience-related">${related.map(item => {
    const { label, card, description } = item[lang];
    return `<a href="${ctx.home}${item.route}"><span class="service-mark" aria-hidden="true">${ctx.icons[item.icon]}</span><strong>${esc(label)} <span aria-hidden="true">→</span></strong><span>${esc(card ?? description)}</span></a>`;
  }).join('')}</div>`);
}

function renderCases(lang, route, ctx) {
  const relevant = ctx.work.filter(project => project.segments?.includes(route.slice(0, -1))).slice(0, 2);
  return section(pick(lang, 'Кейсы', 'Case studies'), `<div class="service-grid audience-cases">${relevant.map(project =>
    `<article><small>${esc(project.type)}${project.concept ? ' · ' + pick(lang, 'Демо-данные', 'Demo data') : ''}</small>
      <h3><a href="${ctx.home}work/${project.id}/">${esc(project.name)} <span aria-hidden="true">→</span></a></h3><p>${esc(project.result)}</p>
    </article>`
  ).join('')}</div>`);
}

function renderContact(lang, page, ctx) {
  return section(pick(lang, 'Опишите задачу — Илья ответит в течение дня', 'Tell us what you need and Ilia will reply within a day'),
    `<a class="button" href="${telegramLink(lang, ctx, page[lang].label)}">${pick(lang, 'Написать в Telegram', 'Message us on Telegram')}</a>`, 'audience-contact');
}

function renderPayback(lang, page, ctx) {
  const { packages } = page[lang];
  const options = page.paybackPackages.map(id => packages.find(pack => pack.id === id))
    .filter(pack => packageStartingPrice(pack.price, ctx.pricing) !== null);
  if (!options.length) return '';
  return `<section id="payback" class="section wrap audience-section" data-payback hidden>
    <h2>${pick(lang, 'Сколько стоит не иметь сайта?', 'What does it cost to go without a website?')}</h2>
    <form class="payback-form">
      <div class="payback-fields">
        <label for="payback-check">${pick(lang, 'Средний чек', 'Average order value')} (<span data-payback-currency>RUB</span>)</label>
        <input id="payback-check" type="number" inputmode="decimal" min="0" step="any" value="5000">
        <label for="payback-leads">${pick(lang, 'Новых заявок в месяц', 'New enquiries per month')} <span data-payback-leads>10</span></label>
        <input id="payback-leads" type="range" min="1" max="100" value="10">
        <label for="payback-rate">${pick(lang, 'Доля заявок, которые приводят к покупке', 'Share of enquiries that turn into sales')} <span data-payback-rate>30%</span></label>
        <input id="payback-rate" type="range" min="5" max="80" value="30">
      </div>
      <fieldset>
        <legend>${pick(lang, 'Пакет', 'Package')}</legend>
        ${options.map((pack, index) => `<label><input type="radio" name="payback-package" value="${esc(pack.id)}" ${index === 0 ? 'checked' : ''}> ${esc(pack.title)}</label>`).join('')}
      </fieldset>
      <div class="payback-result" aria-live="polite" aria-atomic="true"><p data-payback-revenue></p><p data-payback-months></p></div>
      <p class="payback-note">${pick(lang, 'Это пример расчёта, а не прогноз. Реальный результат зависит от вашей ниши и рекламы.', 'This is an example calculation. Actual results depend on your industry and advertising.')}</p>
    </form>
  </section>`;
}


function trustStrip(lang) {
  return `<div class="wrap trust-strip" role="list">${shared[lang].trust.map(([title, text]) =>
    `<div role="listitem"><strong>${esc(title)}</strong><span>${esc(text)}</span></div>`).join('')}</div>`;
}

function renderLoss(lang, route) {
  const copy = sell[route]?.[lang];
  if (!copy) return '';
  return `<section class="section wrap audience-section audience-loss">
    <p class="loss-badge">${esc(shared[lang].lossBadge)}</p>
    <h2>${esc(copy.lossTitle)}</h2><p class="loss-lead">${esc(copy.lossLead)}</p>
    <div class="loss-grid">${copy.losses.map(([title, text], index) =>
      `<article><span class="loss-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join('')}</div>
  </section>`;
}

function renderShifts(lang, route) {
  const copy = sell[route]?.[lang];
  if (!copy) return '';
  const t = shared[lang];
  return section(t.shiftsTitle, `<div class="shift-list">${copy.shifts.map(([before, after]) =>
    `<div class="shift"><div class="shift-before"><small>${esc(t.before)}</small><p>${esc(before)}</p></div><span class="shift-arrow" aria-hidden="true">→</span><div class="shift-after"><small>${esc(t.after)}</small><p>${esc(after)}</p></div></div>`).join('')}</div>`, 'audience-shifts');
}

function renderCapacity(lang, page, ctx) {
  const o = ctx.sales?.capacity;
  if (o?.enabled === false) return '';
  const t = { ...shared[lang], capacityTitle: o?.[lang]?.title || shared[lang].capacityTitle, capacityText: o?.[lang]?.text || shared[lang].capacityText };
  return `<aside class="wrap capacity" aria-label="${esc(t.capacityTitle)}"><div class="capacity-pulse" aria-hidden="true"><i></i></div>
    <div><strong>${esc(t.capacityTitle)}</strong><p>${esc(t.capacityText)}</p></div>
    <a class="button" href="${telegramLink(lang, ctx, page[lang].label, t.capacityCta)}">${esc(t.capacityCta)}</a></aside>`;
}

function renderBundleTeaser(lang, ctx) {
  const t = shared[lang];
  return `<aside class="wrap bundle-teaser"><span class="service-mark" aria-hidden="true">${ctx.icons.layers}</span>
    <div><h2>${esc(t.bundleTitle)}</h2><p>${esc(t.bundleText)}</p></div>
    <a class="ghost" href="${ctx.home}bundle/">${esc(t.bundleCta)} <span aria-hidden="true">→</span></a></aside>`;
}

function renderCross(lang, route, ctx) {
  const copy = sell[route]?.[lang];
  if (!copy) return '';
  return section(shared[lang].nextTitle, `<div class="audience-related audience-cross">${copy.cross.map(([to, title, text]) =>
    `<a href="${ctx.home}${to}"><strong>${esc(title)} <span aria-hidden="true">→</span></strong><span>${esc(text)}</span></a>`).join('')}</div>`, 'audience-next');
}

function renderClose(lang, page, ctx) {
  const base = sell[page.route]?.[lang];
  if (!base) return renderContact(lang, page, ctx);
  const o = ctx.sales?.pages?.[page.route]?.[lang];
  const copy = { ...base, closeTitle: o?.closeTitle || base.closeTitle, closeText: o?.closeText || base.closeText };
  return `<section class="section wrap audience-section audience-contact audience-close"><h2>${esc(copy.closeTitle)}</h2><p>${esc(copy.closeText)}</p>
    <div class="actions"><a class="button" href="${telegramLink(lang, ctx, page[lang].label)}">${pick(lang, 'Написать в Telegram', 'Message us on Telegram')}</a>
    ${estimateLink(lang, ctx.home, page.estimateServices, page.estimateTier ?? 'small', pick(lang, 'Рассчитать стоимость', 'Estimate the cost')).replace('class="button"', 'class="ghost"')}</div></section>`;
}

export function renderSegmentPage(lang, route, ctx) {
  const page = segments.find(item => item.route === route);
  const { directions, benefits } = page[lang];
  const payment = pick(lang, 'Оплата частями: 50% при старте и 50% после сдачи. Для проектов от 100 000 ₽ — по этапам.',
    'Pay in instalments: 50% at the start and 50% on handover. Projects from RUB 100,000 are billed in stages.');
  return `<article class="audience-page">
    ${hero(lang, page, ctx, true)}
    ${trustStrip(lang)}
    ${section(pick(lang, 'Узнаёте себя?', 'Sound familiar?'), renderBenefits(benefits, ctx.icons))}
    ${renderLoss(lang, route)}
    ${renderPackages(lang, page, ctx)}
    <aside class="wrap audience-note"><p>${payment}</p></aside>
    ${renderShifts(lang, route)}
    ${page.paybackPackages ? renderPayback(lang, page, ctx) : ''}
    ${renderCapacity(lang, page, ctx)}
    ${directions ? section(pick(lang, 'Направления', 'Capabilities'), `<div class="actions">${directions.map(([label, path, service]) => service
      ? estimateLink(lang, ctx.home, [service], 'medium', label)
      : `<a class="btn" href="${ctx.home}${path}">${esc(label)} <span aria-hidden="true">→</span></a>`).join('')}</div>`) : ''}
    ${renderCases(lang, route, ctx)}
    ${renderBundleTeaser(lang, ctx)}
    ${renderFAQ(lang, page, ctx)}
    ${renderCross(lang, route, ctx)}
    ${renderRelated(lang, page, ctx)}
    ${renderClose(lang, page, ctx)}
  </article>`;
}

export function renderTopicPage(lang, route, ctx) {
  if (route === 'bundle/') return renderBundlePage(lang, ctx);
  const page = topics.find(item => item.route === route);
  const { benefits, steps, notice } = page[lang];
  const why = route === 'why-website/';
  const benefitHeading = route === 'geo/' ? pick(lang, 'Как это работает', 'How it works')
    : pick(lang, 'Что это даёт', 'What it gives you');
  return `<article class="audience-page">
    ${hero(lang, page, ctx, false)}
    ${trustStrip(lang)}
    ${renderLoss(lang, route)}
    ${section(benefitHeading, renderBenefits(benefits, ctx.icons))}
    ${section(pick(lang, 'Что мы делаем', 'What we do'), `<ol class="audience-steps">${steps.map(step => `<li>${esc(step)}</li>`).join('')}</ol>`)}
    ${renderPackages(lang, page, ctx)}
    ${route === 'geo/' ? section(pick(lang, 'Как это сделано на Devlarion', 'How Devlarion applies GEO'),
      `<p>${pick(lang, 'На этом сайте состав услуг, цены и частые вопросы доступны в разметке страниц.', 'This site includes service details, prices and common questions in its structured data.')}</p>
      <a class="link" href="${esc(ctx.llmsUrl)}">llms.txt <span aria-hidden="true">→</span></a>`) : ''}
    ${renderCapacity(lang, page, ctx)}
    ${route === 'bundle/' ? '' : renderBundleTeaser(lang, ctx)}
    ${notice ? `<aside class="wrap audience-note"><p>${esc(notice)}</p></aside>` : ''}
    ${renderFAQ(lang, page, ctx)}
    ${renderCross(lang, route, ctx)}
    ${renderRelated(lang, page, ctx)}
    ${why ? section(pick(lang, 'Что подходит вашему бизнесу?', 'What fits your business?'), ctx.segmentPicker)
        : renderClose(lang, page, ctx)}
  </article>`;
}

function renderBundlePage(lang, ctx) {
  const page = topics.find(item => item.route === 'bundle/');
  const c = bundle[lang];
  const flow = `<ol class="bundle-flow">${c.flow.map(([title, text], index) =>
    `<li style="--i:${index}"><span class="bundle-node">${String(index + 1)}</span><strong>${esc(title)}</strong><span>${esc(text)}</span></li>`).join('')}</ol>`;
  const compare = `<div class="bundle-table" role="table"><div role="row" class="bundle-row bundle-head">${c.compareHead.map(cell => `<span role="columnheader">${esc(cell)}</span>`).join('')}</div>${c.compare.map(row =>
    `<div role="row" class="bundle-row">${row.map((cell, i) => `<span role="${i ? 'cell' : 'rowheader'}"${i ? ` data-label="${esc(c.compareHead[i])}"` : ''}>${esc(cell)}</span>`).join('')}</div>`).join('')}</div>`;
  const plans = `<div class="service-grid audience-packages bundle-plans">${c.plans.map(([title, text, services, tier]) =>
    `<article><h3>${esc(title)}</h3><p>${esc(text)}</p><div class="package-action">${estimateLink(lang, ctx.home, services.split(' '), tier, pick(lang, 'Рассчитать «' + title + '»', 'Estimate “' + title + '”'))}</div></article>`).join('')}</div><p class="audience-note-line">${esc(c.discountNote)}</p>`;
  return `<article class="audience-page">
    ${hero(lang, page, ctx, false)}
    ${trustStrip(lang)}
    ${section(c.whyTitle, `<div class="loss-grid">${c.why.map(([title, text], index) => `<article><span class="loss-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join('')}</div>`, 'audience-loss')}
    ${section(c.flowTitle, flow, 'audience-flow')}
    ${section(c.compareTitle, compare)}
    ${section(c.plansTitle, plans)}
    ${renderCapacity(lang, page, ctx)}
    ${renderFAQ(lang, page, ctx)}
    ${section(shared[lang].nextTitle, `<div class="audience-related audience-cross">${['seo/', 'geo/', 'support/'].map(to => {
      const item = topics.find(topic => topic.route === to); const { label, description } = item[lang];
      return `<a href="${ctx.home}${to}"><strong>${esc(label)} <span aria-hidden="true">→</span></strong><span>${esc(description)}</span></a>`;
    }).join('')}</div>`, 'audience-next')}
    ${section(pick(lang, 'Что подходит вашему бизнесу?', 'What fits your business?'), ctx.segmentPicker)}
  </article>`;
}
