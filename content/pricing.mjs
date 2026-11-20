const services = [
  {
    id: 'agents',
    ru: ['Мультиагентные системы', 'Начинаем с одного процесса. На пилоте проверяем, как агент работает с вашими данными, затем связываем роли и подключаем системы.'],
    en: ['Multi-agent systems', 'Start with one workflow. Test an agent on your data, then connect specialist agents and business systems.']
  },
  {
    id: 'private-ai',
    ru: ['ИИ на ваших серверах', 'Подбираем модель под нагрузку, разворачиваем её в вашем контуре и настраиваем доступ команды. Оборудование рассчитываем отдельно.'],
    en: ['On-premise AI', 'We size the model for your workload, deploy it on your infrastructure and configure team access. Hardware is priced separately.']
  },
  {
    id: 'web',
    ru: ['Корпоративные сайты', 'Сайт с понятной структурой услуг, формами заявок и системой управления контентом.'],
    en: ['Corporate websites', 'A clear service catalogue, enquiry forms and a content management system for your team.']
  },
  {
    id: 'platform',
    ru: ['Веб-сервисы', 'Личный кабинет или внутренний сервис для одного процесса с ролями, данными и историей операций.'],
    en: ['Web applications', 'A client portal or an internal tool for one workflow, with permissions, records and an activity history.']
  },
  {
    id: 'mini',
    ru: ['Мини-приложения', 'Каталог, запись или оформление заказа в Telegram, VK, MAX либо в браузере как PWA.'],
    en: ['Mini apps', 'A catalogue, booking flow or checkout inside Telegram, VK, MAX or a browser-based PWA.']
  },
  {
    id: 'mobile',
    ru: ['Мобильные приложения', 'Приложение для сотрудников или клиентов. Платформу и функции первого релиза выбираем вместе.'],
    en: ['Mobile applications', 'An app for staff or customers. We agree on the platform and features for the first release.']
  },
  {
    id: 'automation',
    ru: ['Боты и автоматизация', 'Бот собирает данные, передаёт их в рабочую систему и сообщает сотруднику, когда требуется решение.'],
    en: ['Bots and automation', 'Collect information, pass it to a business system and alert a team member when a decision is needed.']
  },
  {
    id: 'design',
    ru: ['Дизайн и брендинг', 'Проектируем интерфейс ключевого сценария или собираем базовую айдентику для запуска продукта.'],
    en: ['Design and identity', 'Interface design for a core user journey or a visual identity for a product launch.']
  },
  {
    id: 'custom',
    ru: ['Заказная разработка', 'Обсудим требования отрасли, интеграции и ограничения под NDA. Подготовим варианты решения и смету.'],
    en: ['Bespoke development', 'We review industry requirements, integrations and constraints under NDA, then propose a solution and a budget.']
  }
];

// The listed price covers a single workflow with the standard contract and no external integrations.
const packages = [
  {
    id: 'web', rub: 30000,
    ru: ['Сайт для заявок', 'Одна страница об услуге с формой заявки. Обращения приходят на вашу почту.'],
    en: ['Enquiry website', 'One service page with an enquiry form. Customer requests arrive in your inbox.']
  },
  {
    id: 'automation', rub: 20000,
    ru: ['Telegram-бот для записи', 'Один сценарий записи. Бот спрашивает услугу и контакты клиента, затем отправляет заявку в ваш чат.'],
    en: ['Telegram booking bot', 'One booking flow. The bot asks for a service and contact details, then sends the request to your chat.']
  },
  {
    id: 'mini', rub: 45000,
    ru: ['Мини-приложение с каталогом', 'Каталог до десяти позиций в Telegram. Покупатель выбирает товар и оставляет заявку продавцу.'],
    en: ['Catalogue mini app', 'A Telegram catalogue with up to ten items. Shoppers select a product and send an enquiry to the seller.']
  }
];

export function starterPackages(lang) {
  return packages.map(({ id, rub, [lang]: [title, description] }) => {
    const price = lang === 'ru' ? 'от ' + rub.toLocaleString('ru-RU') + ' ₽'
      : 'from RUB ' + rub.toLocaleString('en-US');
    return { id, title, description, price };
  });
}

export function serviceCards(lang) {
  return services.map(({ id, [lang]: [title, description] }) => ({ id, title, description }));
}

export function renderQuiz(lang, telegramURL) {
  const t = (ru, en) => lang === 'ru' ? ru : en;
  const types = [
    ['web', 'Сайт', 'Website'], ['automation', 'Бот', 'Bot'],
    ['mini', 'Мини-приложение', 'Mini app'], ['platform', 'Веб-сервис', 'Web application'],
    ['mobile', 'Мобильное приложение', 'Mobile app'], ['agents', 'ИИ-ассистент', 'AI assistant'],
    ['private-ai', 'ИИ на своих серверах', 'On-premise AI'], ['design', 'Дизайн и брендинг', 'Design and identity'],
    ['support', 'Сопровождение', 'Support'], ['custom', 'Хочу обсудить задачу', 'Help me choose']
  ];
  const questions = [
    ['client', t('Для кого проект?', 'Who is the project for?'), [
      ['individual', 'Личный проект', 'A personal project'], ['independent', 'Самозанятый или ИП', 'A freelancer or sole proprietor'],
      ['small', 'Малый бизнес — стартовый пакет', 'A small business seeking a starter package'],
      ['company', 'Компания любого размера — индивидуальный проект', 'A company of any size seeking a tailored project'], ['public', 'Госсектор', 'A public organisation']]],
    ['service', t('Что нужно разработать?', 'What do you need?'), types],
    ['scope', t('Какой объём работы?', 'How much work is involved?'), [
      ['one', 'Один сценарий', 'One workflow'], ['several', 'Несколько сценариев', 'Several workflows'],
      ['departments', 'Несколько отделов', 'Multiple departments']]],
    ['integrations', t('С чем нужно связать проект?', 'What needs to connect?'), [
      ['none', 'Интеграции не нужны', 'No integrations'], ['single', 'Оплата или CRM', 'Payments or a CRM'],
      ['systems', '1С или несколько систем', '1C or several systems']]],
    ['documents', t('Какие документы понадобятся?', 'Which requirements apply?'), [
      ['standard', 'Договор и акт', 'Contract and acceptance record'],
      ['spec', 'Техническое задание и NDA', 'Technical specification and NDA'],
      ['compliance', 'ЭДО, безопасность, персональные данные', 'E-signing, security and personal data requirements']]],
    ['support', t('Что нужно после запуска?', 'What do you need after launch?'), [
      ['none', 'Достаточно исправления дефектов', 'Fixes to the delivered work'],
      ['request', 'Доработки по запросу', 'Changes on request'], ['sla', 'Гарантированное время реакции', 'Guaranteed response time']]],
    ['timeline', t('Когда нужен запуск?', 'When do you want to launch?'), [
      ['flexible', 'Срок гибкий', 'Flexible'], ['month', 'В течение месяца', 'Within a month'],
      ['quarter', 'В течение квартала', 'Within a quarter']]]
  ];
  const starters = starterPackages(lang);
  const steps = questions.map(([name, title, options], index) => {
    const cards = options.map(([value, ru, en]) => {
      const starter = name === 'service' && starters.find(item => item.id === value);
      const data = starter ? `data-price="${starter.price}" data-package="${starter.title}" data-scope="${starter.description}"` : '';
      return `<label class="quiz-option"><input required type="radio" name="${name}" value="${value}" ${data}><span>${t(ru, en)}</span></label>`;
    }).join('');
    return `<fieldset data-step ${index ? 'hidden disabled' : ''}><legend tabindex="-1" aria-describedby="quiz-progress">${title}</legend><div class="quiz-options">${cards}</div></fieldset>`;
  }).join('');
  const tg = telegramURL.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  return `<form class="estimate-form ym-hide-content" data-estimate data-lang="${lang}" data-telegram="${tg}" hidden>
    <div data-questions>
      <p class="quiz-count" id="quiz-progress"></p>
      <progress data-progress aria-labelledby="quiz-progress" max="${questions.length}" value="1"></progress>
      ${steps}
      <div class="quiz-actions"><button class="btn" type="button" data-back hidden>${t('Назад', 'Back')}</button><button class="btn primary" type="submit" data-next>${t('Дальше', 'Continue')}</button></div>
    </div>
    <div class="estimate-result" data-result hidden>
      <h3 tabindex="-1" data-summary></h3><p data-track></p>
      <p class="quiz-guidance" data-guidance></p><div class="quiz-actions"><a class="btn primary" href="${tg}" data-brief></a>
      <button class="btn" type="button" data-copy>${t('Скопировать бриф', 'Copy brief')}</button>
      <button class="quiz-edit" type="button" data-edit>${t('Изменить ответы', 'Edit answers')}</button></div>
      <p role="status" data-copy-status></p>
    </div>
  </form><noscript><a href="${tg}">${t('Запросить оценку в Telegram', 'Request an estimate on Telegram')}</a></noscript>`;
}
