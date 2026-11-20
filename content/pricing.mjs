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
  const ru = lang === 'ru';
  const t = (r, e) => ru ? r : e;
  const select = (name, label, options) => `<label><span>${label}</span><select required name="${name}"><option disabled selected value="">${t('Выберите вариант', 'Choose an option')}</option>${options}</select></label>`;
  const options = labels => labels.map((label, index) => `<option value="${index}">${label}</option>`).join('');
  const types = services.map(({id, rub, days, [lang]: [title]}) => `<option value="${id}" data-price="${rub || 0}" data-days="${days?.join(',') || ''}">${title}</option>`).join('');
  const budgets = [300000, 600000, 1500000].map(n => money(n, lang));
  const budgetLabels = [t('Открыт к оценке', 'Open to an estimate'), t('До ', 'Under ') + budgets[0], budgets[0] + ' – ' + budgets[1], budgets[1] + ' – ' + budgets[2], t('Больше ', 'Above ') + budgets[2]];
  const safeTelegram = telegramURL.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  return `<form class="estimate-form" data-estimate data-lang="${lang}" data-usd-rate="${usdRate}" data-telegram="${safeTelegram}" hidden>
    <div class="estimate-fields">
      ${select('service', t('Что нужно разработать?', 'What do you need?'), types)}
      ${select('scope', t('Какой объём работ?', 'How large is the scope?'), options([t('Один сценарий', 'One workflow'), t('Несколько сценариев и интеграций', 'Multiple workflows and integrations'), t('Несколько подразделений и систем', 'Multiple teams and systems')]))}
      ${select('timeline', t('Когда нужен запуск?', 'When do you want to launch?'), options([t('Гибкий срок', 'Flexible'), t('В течение месяца', 'Within a month'), t('В течение квартала', 'Within a quarter')]))}
      ${select('budget', t('Какой бюджет рассматриваете?', 'What is your budget?'), options(budgetLabels))}
    </div>
    <button class="btn primary" type="submit">${t('Рассчитать проект', 'Calculate estimate')}</button>
    <div class="estimate-result" data-result hidden><p tabindex="-1" data-summary></p><p data-guidance></p><a class="btn primary" href="${safeTelegram}" data-brief>${t('Обсудить расчёт в Telegram', 'Discuss the estimate on Telegram')}</a> <button class="btn" type="button" data-copy>${t('Скопировать бриф', 'Copy brief')}</button><p role="status" data-copy-status></p></div>
  </form><noscript><a href="${safeTelegram}">${t('Запросить оценку в Telegram', 'Request an estimate on Telegram')}</a></noscript>`;
}
