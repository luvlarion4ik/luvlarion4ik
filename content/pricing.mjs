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


// Rates are in integer rubles. A null tier requires a quote after scoping.
export const estimator = {
  landing: { small: 25000, medium: [60000, 120000], large: [120000, 250000] },
  web: { small: 55000, medium: [100000, 250000], large: [250000, 700000] },
  shop: { small: 90000, medium: [150000, 330000], large: [350000, 1300000] },
  automation: { small: 20000, medium: [110000, 300000], large: [330000, 850000] },
  assistant: { small: 55000, medium: [120000, 450000], large: [450000, 1800000] },
  mini: { small: 55000, medium: [130000, 400000], large: [450000, 1200000] },
  platform: { small: 100000, medium: [250000, 800000], large: [900000, 3500000] },
  mobile: { small: null, medium: [450000, 1400000], large: [1500000, 5500000] },
  agents: { small: null, medium: [220000, 750000], large: [800000, 3000000] },
  'private-ai': { small: null, medium: [250000, 650000], large: [650000, 1800000] },
  'fine-tuning': { small: 45000, medium: [180000, 450000], large: [850000, 1500000] },
  design: { small: 25000, medium: [60000, 150000], large: [150000, 400000] },
  security: { small: 25000, medium: [60000, 200000], large: [200000, 600000] },
  seo: { small: 15000, medium: [35000, 90000], large: [90000, 250000] },
  geo: { small: 20000, medium: [45000, 120000], large: [120000, 300000] },
  support: { small: 8000, medium: [15000, 50000], large: [50000, 150000] },
  custom: { small: null, medium: null, large: null }
};

for (const tiers of Object.values(estimator)) {
  for (const rate of Object.values(tiers)) if (Array.isArray(rate)) Object.freeze(rate);
  Object.freeze(tiers);
}
Object.freeze(estimator);

const projects = [
  ['small', ['Малый', 'Один сценарий или стартовый пакет'], ['Small', 'One workflow or a starter package']],
  ['medium', ['Средний', 'Несколько сценариев и интеграции'], ['Mid-sized', 'Several workflows and integrations']],
  ['large', ['Крупный', 'Несколько команд, повышенная нагрузка или особые требования к доступу'], ['Large', 'Multiple teams, high load or specific access requirements']]
];

const modules = [
  ['landing', 'Лендинг или сайт-визитка', 'Landing page or brochure site', ['Одна адаптивная страница до пяти блоков, одна форма и один канал для заявок.', 'One responsive page with up to five sections, one form and one enquiry channel.']],
  ['web', 'Сайт компании с админкой', 'Company website with CMS', ['Страницы компании, формы и управление содержимым.', 'Company pages, forms and content management.']],
  ['shop', 'Интернет-магазин', 'Online store'],
  ['automation', 'Telegram- или MAX-бот', 'Telegram or MAX bot', ['Одна платформа, меню, один сценарий и уведомление менеджеру.', 'One platform, a menu, one workflow and manager alerts.']],
  ['assistant', 'ИИ-ассистент', 'AI assistant', ['Одна база знаний и один канал.', 'One knowledge base and one channel.']],
  ['mini', 'Мини-приложение', 'Mini app', ['Каталог до десяти позиций со сбором заявки.', 'Catalogue of up to ten items with enquiry capture.']],
  ['platform', 'Веб-приложение, личный кабинет или CRM', 'Web app, client portal or custom CRM'],
  ['mobile', 'Мобильное приложение', 'Mobile app'],
  ['agents', 'Мультиагентная система', 'Multi-agent system'],
  ['private-ai', 'Развёртывание ИИ', 'AI deployment'],
  ['fine-tuning', 'Дообучение модели', 'Model fine-tuning', ['Аудит данных и оценка пилота.', 'Data audit and pilot assessment.'], ['Пилот одной готовой модели на подготовленных примерах с проверкой качества.', 'Pilot of one existing model on prepared examples, with evaluation.'], ['Дообучение с интеграцией в рабочую систему.', 'Fine-tuning with production integration.']],
  ['design', 'Дизайн и редизайн', 'Design and redesign', ['Дизайн одной ключевой страницы.', 'Design for one key page.']],
  ['security', 'Аудит и меры защиты', 'Security audit and controls', ['Проверка небольшого сайта и отчёт.', 'A review of a small website and a written report.']],
  ['seo', 'SEO-оптимизация', 'SEO', ['Аудит и техническая настройка одного сайта.', 'Audit and technical set-up for one website.']],
  ['geo', 'GEO — видимость в ИИ-поиске', 'GEO — AI search visibility', ['Аудит видимости бренда в ответах ИИ и базовая разметка.', 'Brand visibility audit in AI answers and baseline markup.']],
  ['support', 'Поддержка / месяц', 'Support / month'],
  ['custom', 'Другая задача', 'Another project']
];

export const crmStartingPrice = 35000;
const digital = ['landing', 'web', 'shop', 'automation', 'assistant', 'mini', 'platform', 'mobile', 'agents', 'private-ai'];
const options = [
  ['crm', 'Интеграция с готовой CRM', 'Integration with an existing CRM', [crmStartingPrice, 75000], ['landing', 'web', 'shop', 'automation', 'assistant', 'mini', 'mobile', 'agents']],
  ['payment', 'Подключение оплаты', 'Payment processing', null, ['landing', 'web', 'shop', 'automation', 'mini', 'platform', 'mobile']],
  ['api', '1С или нестандартный API', '1C or a custom API', null, digital],
  ['priority', 'Срочный запуск', 'Priority delivery', null, null],
  ['languages', 'Дополнительные языки', 'Additional languages', null, digital],
  ['data', 'Подготовка данных', 'Data preparation', null, ['assistant', 'agents', 'private-ai', 'fine-tuning']],
  ['design', 'Расширенный дизайн', 'Extended design', null, ['landing', 'web', 'shop', 'automation', 'mini', 'platform', 'mobile']],
  ['requirements', 'Особые требования к документации или доступу', 'Special documentation or access requirements', null, null]
];

const packages = [
  {
    id: 'web', estimateId: 'landing',
    ru: ['Сайт для заявок', 'Одна адаптивная страница до пяти блоков, форма и передача заявки на почту или в один чат.'],
    en: ['Enquiry website', 'One responsive page with up to five sections, an enquiry form and delivery to one inbox or chat.']
  },
  {
    id: 'automation', estimateId: 'automation',
    ru: ['Telegram-бот или MAX-бот', 'Меню, один сценарий записи или заявки и уведомление в чат менеджера.'],
    en: ['Telegram or MAX bot', 'A menu, one booking or enquiry workflow and a notification in the manager’s chat.']
  },
  {
    id: 'mini', estimateId: 'mini',
    ru: ['Мини-приложение с каталогом', 'Каталог до десяти позиций в Telegram. Покупатель выбирает товар и оставляет заявку продавцу.'],
    en: ['Catalogue mini app', 'A Telegram catalogue with up to ten items. Shoppers select a product and send an enquiry to the seller.']
  }
];

const isRubles = amount => Number.isSafeInteger(amount) && amount > 0
  && amount <= Math.floor(Number.MAX_SAFE_INTEGER / 1000);

function serviceRate(id, tier, overrides) {
  if (!Object.hasOwn(estimator, id) || !Object.hasOwn(estimator[id], tier)) return null;
  const value = Object.hasOwn(overrides, id) ? overrides[id]?.[tier] : undefined;
  if (value === null && !packages.some(item => item.estimateId === id && tier === 'small')) return null;
  const valid = tier === 'small' ? isRubles(value)
    : Array.isArray(value) && value.length === 2 && value.every(isRubles) && value[0] <= value[1];
  return valid ? value : estimator[id][tier];
}

export function startingPrice(id, tier = 'small', overrides = {}) {
  const rate = serviceRate(id, tier, overrides);
  return Array.isArray(rate) ? rate[0] : rate;
}

export function packageStartingPrice(price, overrides = {}) {
  if (!price) return null;
  if (price === 'growth') return 120000;
  if (price === 'bot-crm') {
    const bot = startingPrice('automation', 'small', overrides);
    return bot === null ? null : bot + crmStartingPrice;
  }
  return startingPrice(price[0], price[1], overrides);
}

export function starterPackages(lang, overrides = {}) {
  return packages.map(({ id, estimateId, [lang]: [title, description] }) => {
    const rub = startingPrice(estimateId, 'small', overrides);
    const price = lang === 'ru' ? 'от ' + rub.toLocaleString('ru-RU') + ' ₽'
      : 'from RUB ' + rub.toLocaleString('en-US');
    return { id, estimateId, rub, title, description, price };
  });
}

export function serviceCards(lang) {
  return services.map(({ id, [lang]: [title, description] }) => ({ id, title, description }));
}

export function renderQuiz(lang, telegramURL, overrides = {}, portal = {}) {
  const t = (ru, en) => lang === 'ru' ? ru : en;
  const tierCards = projects.map(([id, ru, en], index) => {
    const [label, scope] = t(ru, en);
    return `<label class="quiz-option"><input required type="radio" name="tier" value="${id}" ${index === 0 ? 'checked' : ''}><span><strong>${label}</strong><small>${scope}</small></span></label>`;
  }).join('');
  const typeCards = modules.map(([id, ru, en, smallScope = [], mediumScope = [], largeScope = []]) => {
    const label = t(ru, en);
    const scopes = projects.map(([tier], index) => {
      const scope = [smallScope, mediumScope, largeScope][index];
      return scope.length ? `data-scope-${tier}="${t(...scope)}"` : '';
    }).join(' ');
    const rates = projects.map(([tier]) => {
      const rate = serviceRate(id, tier, overrides);
      return rate === null ? '' : `data-price-${tier}="${[rate].flat().join(',')}"`;
    }).join(' ');
    return `<label class="quiz-option"><input type="checkbox" name="service" value="${id}" ${rates} ${scopes}><span>${label}</span></label>`;
  }).join('');
  const optionCards = options.map(([id, ru, en, rate, eligible]) => {
    const prices = rate ? projects.map(([tier]) => `data-price-${tier}="${tier === 'small' ? rate[0] : rate.join(',')}"`).join(' ') : '';
    const applies = eligible ? `data-eligible="${eligible.join(' ')}"` : '';
    return `<label class="quiz-option"><input type="checkbox" name="option" value="${id}" ${prices} ${applies}><span>${t(ru, en)}</span></label>`;
  }).join('');
  const tg = telegramURL.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

  return `<form class="estimate-form ym-hide-content" data-estimate data-lang="${lang}" data-telegram="${tg}" ${portal.status === 'open' && portal.url ? `data-portal-url="${portal.url}"` : ''} hidden>
    <div data-questions>
      <p class="quiz-count" id="quiz-progress"></p>
      <progress data-progress aria-labelledby="quiz-progress" max="3" value="1"></progress>
      <fieldset data-step><legend tabindex="-1" aria-describedby="quiz-progress">${t('Масштаб проекта', 'Project size')}</legend><div class="quiz-options">${tierCards}</div></fieldset>
      <fieldset data-step hidden disabled><legend tabindex="-1" aria-describedby="quiz-progress">${t('Что нужно сделать?', 'What do you need?')}</legend>
        <div class="quiz-options">${typeCards}</div>
        <p role="status" data-selection-needed hidden>${t('Выберите хотя бы одну услугу.', 'Choose at least one service.')}</p>
      </fieldset>
      <fieldset data-step hidden disabled><legend tabindex="-1" aria-describedby="quiz-progress">${t('Дополнительные параметры', 'Additional requirements')}</legend>
        <div class="quiz-options">${optionCards}</div>
        <div class="quiz-inputs">
          <label>${t('Желаемый срок', 'Target delivery')}<select name="timeline">
            <option value="">${t('Гибкий', 'Flexible')}</option><option value="month">${t('В течение месяца', 'Within a month')}</option><option value="quarter">${t('В течение квартала', 'Within a quarter')}</option>
          </select></label>
          <label>${t('Реферальный код', 'Referral code')}<input type="text" name="referral" maxlength="40" autocomplete="off" spellcheck="false"></label>
        </div>
      </fieldset>
      <div class="quiz-actions"><button class="btn" type="button" data-back hidden>${t('Назад', 'Back')}</button><button class="btn primary" type="submit" data-next>${t('Дальше', 'Continue')}</button></div>
    </div>
    <div class="estimate-result" data-result hidden>
      <h3 tabindex="-1" data-summary></h3>
      <p class="quiz-guidance" data-currency-note hidden></p>
      <dl class="quiz-breakdown" data-breakdown></dl>
      <p class="quiz-guidance" data-guidance></p>
      <div class="quiz-actions"><a class="btn primary" href="${tg}" data-brief>${t('Отправить расчёт в Telegram', 'Send estimate on Telegram')}</a>
        <a class="btn" href="${portal.url || '#'}" data-portal hidden>${t('Продолжить в кабинете', 'Continue in the portal')}</a>
        <button class="btn" type="button" data-copy>${t('Скопировать расчёт', 'Copy estimate')}</button>
        <button class="btn" type="button" data-share>${t('Поделиться', 'Share')}</button>
        <button class="quiz-edit" type="button" data-edit>${t('Изменить ответы', 'Edit answers')}</button>
      </div>
      <p role="status" data-copy-status></p>
    </div>
  </form><noscript><a href="${tg}">${t('Запросить оценку в Telegram', 'Request an estimate on Telegram')}</a></noscript>`;
}
