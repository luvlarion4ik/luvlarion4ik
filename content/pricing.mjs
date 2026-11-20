// Studio estimates, in RUB. Benchmarks reviewed 20 November 2026:
// https://b2b-1lab.ru/services/ai-agents (agent pilots and on-premise implementation)
// https://delaem-dvigaem.ru/ceny/ (web, mobile and automation)
// https://aestor.ru/ceny/ (mini apps) and https://artprovisual.ru/branding/ (identity)
// USD figures use the Bank of Russia rate for 20 November 2026, rounded for planning.
const usdRate = 81.929;

const services = [
  {
    id: 'agents', rub: 350000, days: [21, 42],
    ru: ['Мультиагентные системы', 'Начинаем с одного процесса. На пилоте проверяем, как агент работает с вашими данными, затем связываем роли и подключаем системы.', 'Пилот от'],
    en: ['Multi-agent systems', 'Start with one workflow. Test an agent on your data, then connect specialist agents and business systems.', 'Pilot from']
  },
  {
    id: 'private-ai', rub: 400000, days: [21, 42],
    ru: ['ИИ на ваших серверах', 'Подбираем модель под нагрузку, разворачиваем её в вашем контуре и настраиваем доступ команды. Оборудование рассчитываем отдельно.'],
    en: ['On-premise AI', 'We size the model for your workload, deploy it on your infrastructure and configure team access. Hardware is priced separately.']
  },
  {
    id: 'web', rub: 300000, days: [14, 21],
    ru: ['Корпоративные сайты', 'Сайт с понятной структурой услуг, формами заявок и системой управления контентом.'],
    en: ['Corporate websites', 'A clear service catalogue, enquiry forms and a content management system for your team.']
  },
  {
    id: 'platform', rub: 400000, days: [14, 28],
    ru: ['Веб-сервисы', 'Личный кабинет или внутренний сервис для одного процесса с ролями, данными и историей операций.'],
    en: ['Web applications', 'A client portal or an internal tool for one workflow, with permissions, records and an activity history.']
  },
  {
    id: 'mini', rub: 250000, days: [14, 21],
    ru: ['Мини-приложения', 'Каталог, запись или оформление заказа в Telegram, VK, MAX либо в браузере как PWA.'],
    en: ['Mini apps', 'A catalogue, booking flow or checkout inside Telegram, VK, MAX or a browser-based PWA.']
  },
  {
    id: 'mobile', rub: 600000,
    ru: ['Мобильные приложения', 'Приложение для сотрудников или клиентов. Базовая оценка включает первый релиз для одной платформы.'],
    en: ['Mobile applications', 'An app for staff or customers. The starting budget covers a first release on one platform.']
  },
  {
    id: 'automation', rub: 180000, days: [7, 14],
    ru: ['Боты и автоматизация', 'Бот собирает данные, передаёт их в рабочую систему и сообщает сотруднику, когда требуется решение.'],
    en: ['Bots and automation', 'Collect information, pass it to a business system and alert a team member when a decision is needed.']
  },
  {
    id: 'design', rub: 150000, days: [7, 14],
    ru: ['Дизайн и брендинг', 'Проектируем интерфейс ключевого сценария или собираем базовую айдентику для запуска продукта.'],
    en: ['Design and identity', 'Interface design for a core user journey or a visual identity for a product launch.']
  },
  {
    id: 'custom',
    ru: ['Заказная разработка', 'Обсудим требования отрасли, интеграции и ограничения под NDA. Подготовим варианты решения и смету.'],
    en: ['Bespoke development', 'We review industry requirements, integrations and constraints under NDA, then propose a solution and a budget.']
  },
  {
    id: 'support',
    ru: ['Запуск и сопровождение', 'Два месяца исправляем дефекты сданного проекта за свой счёт. Дальше согласуем доработки отдельно или предложим подписку.'],
    en: ['Launch and support', 'We cover fixes to delivered work for two months. Further development is scoped individually or through a support plan.']
  }
];

function money(rubles, lang) {
  if (lang === 'ru') return rubles.toLocaleString('ru-RU') + ' ₽';
  return '$' + (Math.round(rubles / usdRate / 100) * 100).toLocaleString('en-US');
}

export function serviceCards(lang) {
  const ru = lang === 'ru';
  return services.map(service => {
    const [title, description, prefix = ru ? 'От' : 'From'] = service[lang];
    let price = ru ? 'По смете' : 'On request';
    let term = ru ? 'Индивидуальный срок' : 'Custom timeline';
    if (service.rub) price = prefix + ' ' + money(service.rub, lang);
    if (service.days) {
      const forms = {one: 'день', few: 'дня', many: 'дней'};
      const unit = ru ? forms[new Intl.PluralRules('ru').select(service.days[1])] : 'days';
      term = service.days.join('–') + ' ' + unit;
    }
    if (service.id === 'support') {
      price = ru ? 'Включено в проект' : 'Included with delivery';
      term = ru ? '2 месяца' : '2 months';
    }
    return { id: service.id, title, description, price, term };
  });
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
      ['individual', 'Для себя', 'Myself'], ['independent', 'Самозанятый или ИП', 'An independent business'],
      ['small', 'Компания до 100 человек', 'A company with fewer than 100 staff'],
      ['company', 'Компания от 100 человек', 'A company with 100 or more staff'], ['public', 'Госсектор', 'A public organisation']]],
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
  const steps = questions.map(([name, title, options], index) => {
    const cards = options.map(([value, ru, en]) => {
      const service = name === 'service' && services.find(item => item.id === value);
      const data = service?.rub ? `data-price="${service.rub}" data-days="${service.days?.join(',') || ''}"` : '';
      return `<label class="quiz-option"><input required type="radio" name="${name}" value="${value}" ${data}><span>${t(ru, en)}</span></label>`;
    }).join('');
    return `<fieldset data-step ${index ? 'hidden disabled' : ''}><legend tabindex="-1" aria-describedby="quiz-progress">${title}</legend><div class="quiz-options">${cards}</div></fieldset>`;
  }).join('');
  const tg = telegramURL.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  return `<form class="estimate-form ym-hide-content" data-estimate data-lang="${lang}" data-usd-rate="${usdRate}" data-telegram="${tg}" hidden>
    <div data-questions>
      <p class="quiz-count" id="quiz-progress"></p>
      <progress data-progress aria-labelledby="quiz-progress" max="${questions.length}" value="1"></progress>
      ${steps}
      <div class="quiz-actions"><button class="btn" type="button" data-back hidden>${t('Назад', 'Back')}</button><button class="btn primary" type="submit" data-next>${t('Дальше', 'Continue')}</button></div>
    </div>
    <div class="estimate-result" data-result hidden>
      <h3 tabindex="-1" data-summary></h3><p data-track></p><dl class="quiz-costs" data-costs></dl>
      <p class="quiz-guidance" data-guidance></p><div class="quiz-actions"><a class="btn primary" href="${tg}" data-brief></a>
      <button class="btn" type="button" data-copy>${t('Скопировать бриф', 'Copy brief')}</button>
      <button class="quiz-edit" type="button" data-edit>${t('Изменить ответы', 'Edit answers')}</button></div>
      <p role="status" data-copy-status></p>
    </div>
  </form><noscript><a href="${tg}">${t('Запросить оценку в Telegram', 'Request an estimate on Telegram')}</a></noscript>`;
}
