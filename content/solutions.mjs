import { startingPrice } from './pricing.mjs';
import { formatStartingPrice } from './site.mjs';

const companySolutions = [
  {
    id: 'agents', icon: 'ai', service: 'agents', tier: 'medium',
    ru: {
      title: 'Мультиагентные системы',
      task: 'Обработать заявку, проверить документы или отследить показания оборудования по согласованному сценарию.',
      implementation: 'Распределяем роли между агентами, подключаем сайт, мессенджеры, CRM и API. Для торговых сценариев, включая криптовалютные площадки, система отслеживает согласованные паттерны, проверяет сигналы и выполняет действия в пределах заданных прав и лимитов.',
      result: 'Пилот на одном процессе, журнал действий, правила доступа и список операций, которые подтверждает сотрудник.',
      scope: 'Пилот на одном процессе',
    },
    en: {
      title: 'Multi-agent systems',
      task: 'Route enquiries, review documents or monitor equipment readings through a defined workflow.',
      implementation: 'We assign roles to agents and connect websites, messaging, CRM and APIs. For trading workflows, including cryptocurrency platforms, the system monitors agreed patterns, checks signals and acts within defined permissions and limits.',
      result: 'A pilot for one workflow, an activity log, access rules and a list of actions that require human approval.',
      scope: 'One-workflow pilot',
    },
  },
  {
    id: 'private-ai', icon: 'server', service: 'private-ai', tier: 'medium',
    ru: {
      title: 'ИИ на ваших или наших мощностях',
      task: 'Запустить модель с нужной производительностью и согласованными условиями доступа к данным.',
      implementation: 'Разворачиваем систему на ваших серверах, сдаём мощности Devlarion в аренду или поставляем оборудование под ключ. Подбираем конфигурацию, настраиваем доступы и интеграции, согласуем хранение данных, резервные копии и условия поддержки.',
      result: 'Настроенная система, инструкция для команды и смета с отдельными строками за оборудование, внедрение и аренду.',
      action: 'Подобрать конфигурацию',
      scope: 'Развёртывание',
    },
    en: {
      title: 'AI infrastructure and deployment',
      task: 'Run a model with the performance and data access conditions your business requires.',
      implementation: 'We deploy on your servers, rent out Devlarion compute or supply preconfigured hardware. We size the infrastructure, set up access and integrations, and agree on data storage, backups and support.',
      result: 'A configured system, an operating guide, and separate estimates for hardware, deployment and rental.',
      action: 'Estimate a configuration',
      scope: 'Deployment',
    },
  },
  {
    id: 'web', icon: 'web', service: 'web', tier: 'small',
    example: ['Modular House', 'https://luvlarion4ik.github.io/modular_houses/'],
    ru: {
      title: 'Корпоративные сайты',
      task: 'Представить услуги или каталог и принимать заявки с сайта.',
      implementation: 'Проектируем структуру и дизайн, настраиваем админ-панель, формы, аналитику и SEO. По задаче подключаем CRM, мессенджеры, Gateway API, серверлесс-ботов и оплату через эквайринг заказчика.',
      result: 'Адаптивный сайт на вашем домене, доступ к управлению, инструкция и поддержка по договору.',
      scope: 'Сайт в базовой комплектации',
    },
    en: {
      title: 'Corporate websites',
      task: 'Present services or a catalogue and capture enquiries from your website.',
      implementation: 'We design the site and set up content editing, forms, analytics and SEO. We can connect a CRM, messaging platforms, Gateway API, serverless bots and your payment provider.',
      result: 'A responsive site on your domain, admin access, documentation and agreed support.',
      scope: 'Base website',
    },
  },
  {
    id: 'platform', icon: 'layers', service: 'platform', tier: 'small',
    example: ['Orient Logic', '#orient-logic'],
    ru: {
      title: 'Веб-приложения и CRM',
      task: 'Собрать заказы, документы и общение с клиентом в одном кабинете или CRM.',
      implementation: 'Описываем рабочие сценарии, роли и права. Подключаем 1С, маркетплейсы и внешние API. По задаче добавляем оплату, отчёты и админ-панель.',
      result: 'Сервис с согласованными сценариями, доступами и инструкцией для работы с данными.',
      scope: 'Первый сценарий',
    },
    en: {
      title: 'Web applications and CRM',
      task: 'Bring orders, documents and client communication together in a portal or CRM.',
      implementation: 'We map workflows, roles and permissions. We connect 1C, marketplaces and external APIs, with payments, reporting and an admin panel as needed.',
      result: 'A working service, access for each role and documentation for handling records.',
      scope: 'First workflow',
    },
  },
  {
    id: 'mini', icon: 'mini', service: 'mini', tier: 'small',
    ru: {
      title: 'Мини-приложения',
      task: 'Дать клиенту каталог, запись или оформление заказа внутри мессенджера.',
      implementation: 'Подбираем платформу под аудиторию и проверяем требования ко входу, оплате и публикации. Подключаем каталог и уведомления. Возможные платформы: Telegram, MAX, VK.',
      result: 'Опубликованное мини-приложение с выбранным сценарием и доступом к настройкам.',
      scope: 'Один сценарий',
    },
    en: {
      title: 'Mini apps',
      task: 'Let customers browse, book or order inside a messenger.',
      implementation: 'We select a platform and check sign-in, payment and publishing requirements. We connect the catalogue and notifications. Options include Telegram, MAX and VK.',
      result: 'A published mini app with your chosen workflow and access to its settings.',
      scope: 'One workflow',
    },
  },
  {
    id: 'mobile', icon: 'mobile', service: 'mobile', tier: 'medium',
    ru: {
      title: 'Мобильные приложения',
      task: 'Дать сотрудникам или клиентам инструмент для работы с телефона.',
      implementation: 'Подбираем iOS, Android или кроссплатформенную разработку. Работаем с вашим дизайнером или берём интерфейс на себя. Настраиваем уведомления, аналитику и оплату, сопровождаем публикацию.',
      result: 'Сборки для согласованных платформ, передача исходников по договору и помощь с выпуском в App Store или RuStore.',
      scope: 'Первая версия',
    },
    en: {
      title: 'Mobile applications',
      task: 'Give staff or customers a mobile tool for their day-to-day tasks.',
      implementation: 'We choose iOS, Android or a cross-platform approach. We work with your designer or handle the interface, then set up notifications, analytics and payments and help with publishing.',
      result: 'Builds for the agreed platforms, source handover per contract and App Store or RuStore submission support.',
      scope: 'First release',
    },
  },
  {
    id: 'automation', icon: 'bot', service: 'automation', tier: 'small',
    example: ['Kitchen Showroom', 'https://luvlarion4ik.github.io/kuhni/'],
    ru: {
      title: 'Боты, ИИ-консультанты и телефония',
      task: 'Принимать заявки, записывать клиентов или отвечать на типовые вопросы в чатах и по телефону.',
      implementation: 'Готовим сценарий бота для Telegram, MAX или VK, подключаем базу знаний и передачу оператору. Для голосового секретаря подключаем телефонию и CRM, согласуем правила записи разговоров. Для Авито проверяем доступные интеграции.',
      result: 'Бот или голосовой сценарий, уведомления и понятный порядок передачи обращения сотруднику.',
      scope: 'Бот с одним сценарием',
    },
    en: {
      title: 'Bots, AI assistants and telephony',
      task: 'Take enquiries, book appointments or answer common questions by chat or phone.',
      implementation: 'We build a workflow in Telegram, MAX or VK, connect a knowledge base and add a hand-off to staff. For voice assistants, we connect telephony and CRM and agree on call recording. For Avito, we check which integrations are available.',
      result: 'A bot or voice workflow, notifications and a clear process for handing enquiries over to staff.',
      scope: 'Single-workflow bot',
    },
  },
  {
    id: 'security', icon: 'support', service: 'security', tier: 'small',
    ru: {
      title: 'Защита сервисов и данных',
      task: 'Проверить доступы и защитить данные при запуске сайта, кабинета или ИИ-системы.',
      implementation: 'Проверяем настройки и роли. По задаче добавляем двухфакторный вход, защиту форм, шифрование, резервные копии и журнал действий.',
      result: 'Для стартовой проверки небольшого сайта готовим отчёт. Внедрение мер и проверку восстановления согласуем отдельно.',
      scope: 'Проверка небольшого сайта',
    },
    en: {
      title: 'Application and data security',
      task: 'Review access controls and protect data before launching a site, portal or AI system.',
      implementation: 'We review settings and permissions and can add two-factor sign-in, form protection, encryption, backups and activity logs.',
      result: 'A findings report for a small-site review. Implementation and recovery testing are scoped separately.',
      scope: 'Small-site review',
    },
  },
  {
    id: 'design', icon: 'design', service: 'design', tier: 'small',
    ru: {
      title: 'Дизайн, редизайн и разработка под ключ',
      task: 'Обновить сайт или спроектировать новый продукт с единым дизайном.',
      implementation: 'Проводим аудит, собираем прототип и систему компонентов. При редизайне планируем перенос контента, адресов страниц и аналитики. Можно объединить дизайн, разработку и запуск в один проект.',
      result: 'Согласованный дизайн или готовый к запуску сервис, материалы для команды и план поддержки.',
      scope: 'Дизайн одной ключевой страницы',
    },
    en: {
      title: 'Design, redesign and end-to-end development',
      task: 'Update an existing site or design a new product with a consistent interface.',
      implementation: 'We review the current experience, prototype the key journeys and build a component system. Redesigns include planning for content, URLs and analytics. Design, development and launch can be delivered together.',
      result: 'An approved design or a launch-ready service, handover materials and a support plan.',
      scope: 'Design for one key page',
    },
  },
  {
    id: 'fine-tuning', icon: 'spark', service: 'fine-tuning', tier: 'medium',
    audit: true,
    ru: {
      title: 'Дообучение моделей',
      task: 'Адаптировать готовую модель к отраслевым терминам, классификации заявок, полям документа или формату ответа.',
      implementation: 'Согласуем право использования данных, собираем контрольную выборку и сравниваем исходную модель с дообученной. Для часто обновляемых документов проверяем поиск по базе знаний (RAG).',
      result: 'Оценка данных, пилот с отчётом о качестве или внедрение согласованной модели. Разметку, вычисления и поддержку считаем отдельно.',
      action: 'Рассчитать пилот',
      scope: 'Пилот дообучения',
    },
    en: {
      title: 'Model fine-tuning',
      task: 'Adapt an existing model to industry terms, enquiry classification, document fields or a consistent output format.',
      implementation: 'We agree on usage rights, reserve a held-out test set, and compare the base and tuned models. For frequently updated documents, we evaluate retrieval from a knowledge base (RAG).',
      result: 'A data audit, a measured pilot or deployment of the agreed model. Annotation, compute and support are quoted separately.',
      action: 'Estimate a fine-tuning pilot',
      scope: 'Fine-tuning pilot',
    },
  },
];

const primaryOffers = [
  {
    icon: 'ai', services: 'assistant', options: 'crm', tier: 'medium', route: 'ai-assistant/',
    ru: ['ИИ-ассистент для заявок', 'Отвечает на типовые вопросы и передаёт заявки в CRM.'],
    en: ['AI enquiry assistant', 'Answer common questions and send qualified enquiries to your CRM.'],
  },
  {
    icon: 'bot', services: 'mini', tier: 'medium', route: 'telegram-bot/',
    ru: ['Запись, каталог и оплата в мессенджере', 'Создаём ботов и мини-приложения для Telegram и MAX.'],
    en: ['Bookings, catalogues and checkout in chat', 'Bots and mini apps for Telegram and MAX.'],
  },
  {
    icon: 'web', services: 'landing', tier: 'small', route: 'website/',
    ru: ['Сайт под ключ или редизайн', 'Проектируем сайт с формами заявок и аналитикой.'],
    en: ['Website launch or redesign', 'A site with enquiry forms and analytics.'],
  },
];

const bundles = [
  { services: 'landing automation', tier: 'small',
    ru: ['Старт', 'Сайт, бот для заявок и базовая аналитика.'],
    en: ['Start', 'Website, enquiry bot and basic analytics.'] },
  { services: 'web assistant platform', tier: 'medium',
    ru: ['Рост', 'Сайт, ИИ-ассистент, CRM и личный кабинет клиента.'],
    en: ['Growth', 'Website, AI assistant, CRM and customer portal.'] },
  { services: 'design web mobile automation support', tier: 'large',
    ru: ['Под ключ', 'Дизайн, сайт, мобильное приложение, боты и сопровождение.'],
    en: ['End to end', 'Design, website, mobile app, bots and support.'] },
];

export const readySolutions = [
  { id: 'avito', status: 'progress',
    ru: ['Автоматизация Авито', 'Обработка обращений, сбор заявок и передача в CRM или Telegram.'],
    en: ['Avito automation', 'Handle enquiries, collect leads and route them to a CRM or Telegram.'] },
  { id: 'telegram', status: 'progress',
    ru: ['Автоматизация Telegram', 'Бот для заявок, записи и уведомлений.'],
    en: ['Telegram automation', 'A bot for enquiries, bookings and notifications.'] },
  { id: 'assistant', status: 'soon',
    ru: ['ИИ-консультант на сайт', 'Ответы по базе знаний и передача вопроса сотруднику.'],
    en: ['Website AI assistant', 'Answers from your knowledge base with a hand-off to staff.'] },
  { id: 'crm', status: 'soon',
    ru: ['Заявки в CRM', 'Форма на сайте, передача заявки в CRM или таблицу, уведомление.'],
    en: ['Enquiry routing to CRM', 'A site form that writes to a CRM or spreadsheet and sends a notification.'] },
  { id: 'mini-shop', status: 'soon',
    ru: ['Каталог и оплата в мини-приложении', 'Товары, корзина и оплата внутри мессенджера.'],
    en: ['Mini app catalogue and payments', 'Products, a cart and payments inside a messenger.'] },
  { id: 'appointments', status: 'soon',
    ru: ['Запись и напоминания', 'Выбор времени и напоминания для клиентов.'],
    en: ['Bookings and reminders', 'Appointment slots and reminders for your customers.'] },
  { id: 'voice', status: 'soon',
    ru: ['ИИ-секретарь для звонков', 'Приём звонков, запись клиента и создание заявки в CRM.'],
    en: ['AI phone receptionist', 'Answer calls, book appointments and create CRM enquiries.'] },
  { id: 'axenta', status: 'progress',
    ru: ['Мини-школа для педагога', 'Демо Аксенты с заданиями, учебной группой и отчётами.'],
    en: ['Mini-school for teachers', 'The Axenta demo with assignments, a study group and progress reports.'] },
  { id: 'estimate', status: 'soon',
    ru: ['Квиз-калькулятор для сайта', 'Предварительная оценка услуг и передача выбранных параметров в заявку.'],
    en: ['Website estimator', 'Estimate services and send the selected options with an enquiry.'] },
  { id: 'price-monitor', status: 'soon',
    ru: ['Мониторинг цен и конкурентов', 'Сводки по ценам из согласованных источников.'],
    en: ['Price and competitor monitoring', 'Price summaries from agreed sources.'] },
  { id: 'broadcasts', status: 'soon',
    ru: ['Рассылки в мессенджерах', 'Сегменты подписчиков и цепочки сообщений по согласию.'],
    en: ['Messenger newsletters', 'Subscriber segments and opt-in message sequences.'] },
  { id: 'sales-dashboard', status: 'soon',
    ru: ['Дашборд заявок и продаж', 'Источники заявок, этапы и суммы в одном отчёте.'],
    en: ['Enquiries and sales dashboard', 'Enquiry sources, stages and revenue in one report.'] },
];

const pick = (lang, ru, en) => lang === 'ru' ? ru : en;
const markup = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

function estimateLink(label, services, tier, options, className = 'link') {
  return `<a class="${className}" href="#quiz" data-estimate-services="${services}" data-estimate-tier="${tier}"${options ? ` data-estimate-options="${options}"` : ''}>${label}</a>`;
}

function offerCard(offer, lang, icons, titleLevel) {
  const [title, description] = offer[lang];
  return `<article>
    ${offer.icon ? `<span class="service-mark" aria-hidden="true">${icons[offer.icon] || ''}</span>` : ''}
    <${titleLevel}>${title}</${titleLevel}>
    <p>${description}</p>
    <div class="offer-actions">
      ${estimateLink(pick(lang, 'Рассчитать', 'Estimate'), offer.services, offer.tier, offer.options)}
      ${offer.route ? `<a class="link" href="${offer.route}">${pick(lang, 'Подробнее', 'Learn more')}</a>` : ''}
    </div>
  </article>`;
}

function readyStatusBadge(solution, status, lang) {
  const labels = {
    ready: pick(lang, 'Готово', 'Ready'),
    progress: pick(lang, 'В работе', 'In development'),
    soon: pick(lang, 'Скоро', 'Planned'),
  };
  const value = Object.hasOwn(labels, status) ? status : solution.status;
  return { value, html: `<small class="solution-status" data-status="${value}">${labels[value]}</small>` };
}

export function renderOffers(lang, icons, statusOverrides = {}) {
  const popular = pick(lang, 'С чего чаще всего начинают', 'Where most projects begin');
  const ready = pick(lang, 'Готовые модули: быстрее и дешевле', 'Ready-made modules: faster and cheaper');
  const preview = readySolutions.slice(0, 2).map(solution => {
    const [title, description] = solution[lang];
    const status = readyStatusBadge(solution, statusOverrides[solution.id], lang);
    return `<article>
      ${status.html}
      <h3><a href="solutions/#ready-${solution.id}">${title}</a></h3>
      <p>${description}</p>
    </article>`;
  }).join('');
  return `<section class="section wrap featured-offers" data-featured-offers aria-label="${pick(lang, 'Услуги и решения Devlarion', 'Devlarion services and solutions')}">
    <nav class="offer-tabs" aria-label="${pick(lang, 'Услуги и готовые решения', 'Services and ready-made solutions')}">
      <a id="offer-tab-popular" href="#popular-projects">${popular}</a>
      <a id="offer-tab-ready" href="#ready-solutions">${ready}</a>
    </nav>
    <div class="offer-panel" id="popular-projects">
      <h2 class="offer-panel-heading">${popular}</h2>
      <div class="service-grid">${primaryOffers.map(offer => offerCard(offer, lang, icons, 'h3')).join('')}</div>
      <h3 class="offer-bundle-title">${pick(lang, 'Проект из нескольких услуг сразу', 'Several services in one project')}</h3>
      <p>${pick(lang, 'Соберите несколько услуг в одном проекте. Калькулятор учтёт скидку за объём.', 'Combine services in one project. The estimator applies a bundle discount.')}</p>
      <div class="service-grid offer-bundles">${bundles.map(offer => offerCard(offer, lang, icons, 'h4')).join('')}</div>
    </div>
    <div class="offer-panel" id="ready-solutions">
      <h2 class="offer-panel-heading">${ready}</h2>
      <div class="ready-solutions-grid ready-solutions-preview">${preview}</div>
      <a class="button ready-catalog-link" href="solutions/">${pick(lang, 'Открыть каталог из 12 решений', 'Browse all 12 solutions')}</a>
    </div>
  </section>`;
}

function startingPriceLine(lang, rubles, scope) {
  if (rubles == null) return '';
  const prefix = pick(lang, 'от', 'from');
  return `<p class="solution-scope" data-region-price-row>${scope ? scope + ' · ' : ''}${prefix} <span data-region-price="${rubles}">${formatStartingPrice(rubles, lang)}</span></p>`;
}

function renderIndustrySolutions(lang, icons) {
  const tiles = ['fintech/', 'edtech/'].map(route => {
    const { icon, [lang]: { label, description } } = offerPages[route];
    return `<article>
      <span class="service-mark" aria-hidden="true">${icons[icon] || ''}</span>
      <h5><a class="link" href="${route}">${label}<span aria-hidden="true">${icons.diagonal || ''}</span></a></h5>
      <p>${description}</p>
    </article>`;
  }).join('');
  return `<section class="industry-solutions" aria-labelledby="industry-solutions-title">
    <h4 id="industry-solutions-title">${pick(lang, 'Отраслевые решения', 'Industry solutions')}</h4>
    <div class="service-grid industry-grid">${tiles}</div>
  </section>`;
}

export function renderCompanySolutions(lang, icons, pricingOverrides = {}) {
  const tablist = companySolutions.map(solution => `<button type="button" id="solution-tab-${solution.id}" data-solution="${solution.id}" role="tab" aria-selected="false" aria-controls="solution-panel-${solution.id}" tabindex="-1">
    <span aria-hidden="true">${icons[solution.icon] || ''}</span>${solution[lang].title}
  </button>`).join('');

  const panels = companySolutions.map(solution => {
    const { title, task, implementation, result, action, scope } = solution[lang];
    const price = startingPrice(solution.service, solution.tier, pricingOverrides);
    const auditPrice = solution.audit ? startingPrice(solution.service, 'small', pricingOverrides) : null;
    return `<details id="solution-${solution.id}" data-company-panel="${solution.id}" open>
      <summary><span aria-hidden="true">${icons[solution.icon] || ''}</span>${title}</summary>
      <div class="solution-content" id="solution-panel-${solution.id}">
        <h4 class="solution-desktop-title" hidden>${title}</h4>
        <dl>
          <dt>${pick(lang, 'Задача', 'Use case')}</dt><dd>${task}</dd>
          <dt>${pick(lang, 'Работы', 'Implementation')}</dt><dd>${implementation}</dd>
          <dt>${pick(lang, 'На выходе', 'Deliverables')}</dt><dd>${result}</dd>
        </dl>
        ${startingPriceLine(lang, price, scope)}
        <div class="solution-actions">
          ${estimateLink(action || pick(lang, 'Посчитать проект', 'Estimate this project'), solution.service, solution.tier, null, 'button')}
          ${solution.example ? `<a class="link" href="${solution.example[1]}">${solution.example[0]}</a>` : ''}
        </div>
        ${solution.audit ? `<div class="solution-audit">
          ${startingPriceLine(lang, auditPrice, pick(lang, 'Аудит данных', 'Data audit'))}
          ${estimateLink(pick(lang, 'Рассчитать аудит данных', 'Estimate a data audit'), solution.service, 'small')}
        </div>` : ''}
      </div>
    </details>`;
  }).join('');

  return `${renderIndustrySolutions(lang, icons)}
  <div class="company-solutions" data-company-solutions>
    <div class="solution-tablist" role="tablist" aria-label="${pick(lang, 'Направления для компаний', 'Company solutions')}" aria-orientation="vertical" hidden>${tablist}</div>
    <div class="solution-panels">${panels}</div>
  </div><a class="link ready-catalog-link" href="#ready-solutions">${pick(lang, 'Открыть каталог готовых решений', 'Browse the solutions catalogue')}</a>`;
}

export function renderReadySolutions(lang, telegramUrl, statusOverrides = {}, home) {
  const heading = home ? "h1" : "h2";
  const cards = readySolutions.map(solution => {
    const [title, description] = solution[lang];
    const { value: status, html: statusBadge } = readyStatusBadge(solution, statusOverrides[solution.id], lang);
    const telegram = new URL(telegramUrl);
    const comment = status === 'ready'
      ? pick(lang, 'Хочу обсудить запуск решения', 'I’d like to discuss launching')
      : pick(lang, 'Хочу узнать о запуске решения', 'Keep me updated about');
    telegram.searchParams.set('text', `${comment} «${title}» [sol_${solution.id.replaceAll('-', '_')}]`);
    return `<article id="ready-${solution.id}">
      ${statusBadge}
      <h3>${title}</h3>
      <p>${description}</p>
      <div class="offer-actions">
        <a class="link" href="${markup(telegram)}" data-goal="telegram">${status === 'ready' ? pick(lang, 'Обсудить запуск', 'Discuss launch') : pick(lang, 'Узнать о запуске', 'Ask about launch')}</a>
        ${solution.id === 'estimate' ? `<a class="link" href="${home ?? ''}#quiz">${pick(lang, 'Посмотреть пример', 'See example')}</a>` : ''}
      </div>
    </article>`;
  }).join('');
  return `<section class="section wrap ready-solutions" id="ready-solutions" aria-labelledby="ready-solutions-title">
    <${heading} id="ready-solutions-title">${pick(lang, 'Готовые решения', 'Solutions catalogue')}</${heading}>
    <div class="ready-solutions-grid">${cards}</div>
  </section>`;
}

export const offerPages = {
  'fintech/': {
    icon: 'server', service: 'custom', tier: 'medium',
    ru: {
      label: 'FinTech',
      title: 'Разработка FinTech-решений для компаний',
      description: 'Виртуальные карты через API эмитента, платёжные кабинеты и программное обеспечение для биржевых и обменных платформ.',
      features: [
        ['Виртуальные карты и платежи', 'Интегрируем API вашего банка или эмитента. Разрабатываем кабинет держателя карты с запросом на выпуск, управлением картами и историей операций. Подключаем платежи через выбранного провайдера.'],
        ['Балансы и сверка', 'Отображаем балансы и статусы платежей по данным провайдеров, принимаем обновления через вебхуки и готовим сверку операций по выпискам.'],
        ['ПО для биржевых и обменных платформ', 'Разрабатываем интерфейсы котировок и заявок, подключаем поставщиков ликвидности, операторов исполнения и хранения активов. По требованиям проекта интегрируем проверку клиентов и контроль операций на стороне согласованных операторов.'],
      ],
      process: 'Начинаем с требований, распределения ролей и проверки API партнёров. В тестовой среде проверяем основной сценарий, статусы и сверку. По результатам пилота согласуем объём работ и условия запуска.',
      faq: [
        ['Кто выпускает карты и проводит операции?', 'Карты выпускает банк или эмитент. Платежи, исполнение заявок и хранение активов выполняют подключённые операторы в рамках своих полномочий. Devlarion разрабатывает интерфейсы и интеграции.'],
        ['Что нужно для подготовки сметы?', 'Опишите сценарий, рынок запуска и роль партнёров. Если провайдеры уже выбраны, укажите доступные API, тестовые среды и требования к журналу операций.'],
      ],
    },
    en: {
      label: 'FinTech',
      title: 'FinTech software development',
      description: 'Virtual cards through an issuer’s API, payment dashboards and software for trading and exchange platforms.',
      features: [
        ['Virtual cards and payments', 'We integrate with your bank’s or issuer’s API and build cardholder portals with issuance requests, card controls and activity history. We connect payments through your chosen provider.'],
        ['Balances and reconciliation', 'We display balances and payment statuses from provider records, handle updates through webhooks and reconcile transactions against statements.'],
        ['Trading and exchange software', 'We build interfaces for quotes and orders and connect liquidity, execution and custody providers. Where the project requires it, we integrate identity checks and transaction monitoring with the relevant operators.'],
      ],
      process: 'We start with requirements, responsibilities and a review of partner APIs. We test the core workflow, status updates and reconciliation in a sandbox. After the pilot, we agree on scope and launch conditions.',
      faq: [
        ['Who issues cards and handles operations?', 'The bank or issuer issues cards. Payment, execution and custody operators perform their respective functions. Devlarion develops the interfaces and integrations.'],
        ['What do you need to prepare a quote?', 'Describe the workflow, launch market and partner roles. If you have selected providers, share the available APIs, test environments and requirements for transaction records.'],
      ],
    },
  },
  'edtech/': {
    icon: 'layers', service: 'custom', tier: 'medium',
    ru: {
      label: 'EduTech',
      title: 'Разработка EduTech-решений для школ и онлайн-курсов',
      description: 'Системы управления обучением, кабинеты педагогов, учеников и родителей, задания, оценки, отчёты и оплата курсов.',
      features: [
        ['Платформа обучения', 'Разрабатываем LMS с курсами, группами и расписанием. Педагоги назначают и проверяют задания, ученики сдают работы и смотрят обратную связь.'],
        ['Роли, оценки и отчёты', 'Настраиваем доступы педагогов, учеников, родителей и администраторов. Добавляем журнал оценок, отчёты о прогрессе и уведомления.'],
        ['Оплата и интеграции', 'Подключаем платёжного провайдера заказчика, настраиваем доступ к курсам и связываем платформу с существующими сервисами. Для совместимых учебных инструментов используем LTI 1.3 там, где это подходит проекту.'],
      ],
      process: 'Согласуем учебный сценарий, роли, требования к доступам и интеграции. Проводим пилот с одной группой, проверяем задания, обратную связь и отчёты. Перед запуском готовим инструкции и план сопровождения.',
      faq: [
        ['Можно подключить существующую LMS?', 'Проверим API и поддержку LTI 1.3. Вместе выберем, какие задания, оценки или данные о группах должны передаваться между системами.'],
        ['Кто видит оценки и отчёты?', 'Доступ определяется ролью. Например, ученик видит свой прогресс, педагог видит данные своей группы, а родитель получает отчёт по своему ребёнку, если это предусмотрено проектом.'],
      ],
    },
    en: {
      label: 'EduTech',
      title: 'EduTech software for schools and online courses',
      description: 'Learning management systems, portals for teachers, learners and parents, assignments, grades, reports and course payments.',
      features: [
        ['Learning management platform', 'We build an LMS with courses, groups and schedules. Teachers assign and mark work, while learners submit it and view feedback.'],
        ['Roles, grades and reports', 'We set up access for teachers, learners, parents and administrators, with a gradebook, progress reports and notifications.'],
        ['Payments and integrations', 'We connect your payment provider, set up course access and integrate with existing systems. Where the project calls for it, we connect compatible learning tools through LTI 1.3.'],
      ],
      process: 'We agree on the learning workflow, roles, access requirements and integrations. We pilot with one group and check assignments, feedback and reports. We prepare handover instructions and a support plan for launch.',
      faq: [
        ['Can you connect to our existing LMS?', 'We review API and LTI 1.3 support, then agree on which assignments, grades or group records should move between systems.'],
        ['Who can see grades and reports?', 'Access follows each user’s role. A learner sees their own progress, a teacher sees their group, and a parent can receive a report on their child where the project includes that feature.'],
      ],
    },
  },
  'ai-assistant/': {
    service: 'assistant', tier: 'medium', option: 'crm', example: ['Orient Logic', '#orient-logic'],
    ru: {
      title: 'ИИ-ассистент для сайта и заявок',
      description: 'Ассистент отвечает по вашей базе знаний, уточняет запрос и передаёт заявку с контекстом в CRM.',
      process: 'Подключаем сайт или мессенджер, готовим ответы на распространённые вопросы и проверяем на примерах, когда диалог должен перейти к сотруднику.',
      faq: [
        ['Какие данные нужны для запуска?', 'Описание услуг, действующие ответы на частые вопросы и правила передачи заявки менеджеру.'],
        ['Можно подключить нашу CRM?', 'Да, если ваша CRM поддерживает нужный обмен данными. До работ согласуем поля заявки, доступы и обработку повторных обращений.'],
      ],
    },
    en: {
      title: 'AI assistant for website enquiries',
      description: 'An assistant answers from your knowledge base, clarifies requests and sends enquiries with context to your CRM.',
      process: 'We connect a website or messenger, prepare answers to common questions and test when the assistant should hand a conversation over to a team member.',
      faq: [
        ['What information is needed to get started?', 'A list of services, existing FAQ answers and rules for routing enquiries to staff.'],
        ['Can you connect our CRM?', 'Yes, when your CRM supports the required exchange. We agree on enquiry fields, access and handling of duplicate requests before work begins.'],
      ],
    },
  },
  'telegram-bot/': {
    service: 'automation', tier: 'small', example: ['Kitchen Showroom', 'https://luvlarion4ik.github.io/kuhni/'],
    ru: {
      title: 'Боты для Telegram и MAX',
      description: 'Бот помогает принять заявку, забронировать время, показать каталог или оформить заказ в мессенджере.',
      process: 'Начинаем с одного сценария, проверяем сообщения и шаги, настраиваем уведомление менеджеру. Для каталога и оплаты можно добавить мини-приложение.',
      faq: [
        ['На каких платформах можно запуститься?', 'Выбираем Telegram, MAX или другую согласованную платформу с учётом нужных функций и требований к публикации.'],
        ['Что входит в стартовый пакет?', 'Одна платформа, меню, один сценарий и уведомление менеджеру. Каталог, оплата и подключение CRM оцениваются по составу работ.'],
      ],
    },
    en: {
      title: 'Telegram and MAX bots',
      description: 'A bot can capture enquiries, take bookings, show a catalogue or accept orders in a messenger.',
      process: 'We start with one workflow, test the messages and steps, then set up notifications for staff. A mini app can add catalogue browsing and checkout.',
      faq: [
        ['Which platforms can I launch on?', 'We choose Telegram, MAX or another suitable platform based on the functions you need and publishing requirements.'],
        ['What is included in the starter package?', 'One platform, a menu, one workflow and a staff notification. Catalogue, payments and CRM integration are quoted by scope.'],
      ],
    },
  },
  'website/': {
    service: 'landing', tier: 'small', example: ['Orient Logic', '#orient-logic'],
    ru: {
      title: 'Разработка и редизайн сайтов',
      description: 'Запускаем сайты под ключ и обновляем существующие сайты с формами заявок, аналитикой и управлением контентом.',
      process: 'Выбираем структуру, готовим прототип и согласуем дизайн. Настраиваем формы, подключаем домен и передаём инструкцию. При редизайне планируем перенос контента и адресов страниц.',
      faq: [
        ['Что входит в стартовую цену?', 'Одна адаптивная страница до пяти блоков, одна форма заявки и передача обращения в один канал.'],
        ['Можно ли подключить каталог, CRM или оплату?', 'Да. Состав страниц, интеграции и доступы уточняем на разборе задачи и оцениваем отдельно.'],
      ],
    },
    en: {
      title: 'Website development and redesign',
      description: 'Launch or update a website with enquiry forms, analytics and content editing.',
      process: 'We agree on the site structure, prototype key pages and design the interface. We set up forms, connect your domain and provide a handover guide. Redesigns include planning for existing content and URLs.',
      faq: [
        ['What is included at the starting price?', 'One responsive page with up to five sections, an enquiry form and routing to one channel.'],
        ['Can you add a catalogue, CRM or payments?', 'Yes. We review the required pages, integrations and access and quote that work separately.'],
      ],
    },
  },
};

export function renderOfferPage(lang, route, home, pricingOverrides = {}) {
  const { service, tier, option, example } = offerPages[route];
  const { title, description, features, process, faq } = offerPages[route][lang];
  const price = startingPrice(service, tier, pricingOverrides);
  const estimate = new URL(home);
  estimate.searchParams.set('service', service);
  estimate.searchParams.set('tier', tier);
  if (option) estimate.searchParams.set('options', option);
  if (features) estimate.searchParams.set('utm_campaign', route.slice(0, -1));
  estimate.hash = 'quiz';
  const contactLabel = service === 'custom'
    ? pick(lang, 'Запросить индивидуальную смету', 'Request a tailored quote')
    : pick(lang, 'Рассчитать проект', 'Estimate a project');
  return `<div class="wrap sub offer-page">
    <a class="link" href="${home}#${features ? 'companies' : 'services'}">${features ? pick(lang, 'Решения для компаний', 'Company solutions') : pick(lang, 'Все услуги', 'All services')}</a>
    <h1>${title}</h1>
    <p class="intro">${description}</p>
    ${startingPriceLine(lang, price)}
    ${price == null ? '' : '<p data-region-note hidden></p>'}
    <div class="actions">
      <a class="button" href="${markup(estimate)}">${contactLabel}</a>
      ${example ? `<a class="link" href="${markup(new URL(example[1], home))}">${example[0]}</a>` : ''}
      ${service === 'landing' ? `<a class="link" href="${markup(home)}?service=design&amp;tier=medium#quiz">${pick(lang, 'Рассчитать редизайн', 'Estimate a redesign')}</a>` : ''}
    </div>
    ${features ? `<h2>${pick(lang, 'Что разрабатываем', 'What we build')}</h2>
      <dl>${features.map(([name, detail]) => `<dt>${name}</dt><dd>${detail}</dd>`).join('')}</dl>` : ''}
    <h2>${pick(lang, 'Как проходит работа', 'How we work')}</h2>
    <p>${process}</p>
    <h2>${pick(lang, 'Частые вопросы', 'Frequently asked questions')}</h2>
    <dl>${faq.map(([question, answer]) => `<dt>${question}</dt><dd>${answer}</dd>`).join('')}</dl>
  </div>`;
}
