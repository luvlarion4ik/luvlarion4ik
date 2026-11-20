import site from './site.json' with { type: 'json' };
import { identity } from './profile.mjs';

export { site };
export const esc = value => String(value)
  .replaceAll('&', '&amp;').replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export const projectTeam = [
  {
    id: 'ilya',
    name: identity.founder,
    role: { ru: 'Основатель · архитектор и разработчик', en: 'Founder · architect and developer' },
    stack: ['Next.js', 'TypeScript', 'FastAPI', 'SwiftUI', 'Telegram', 'MAX'],
    photo: site.founderPhoto,
  },
  ...site.team.filter(person => person.consent),
];

const localized = (lang, ru, en) => lang === 'ru' ? ru : en;

export function formatStartingPrice(rubles, lang) {
  const ru = lang === 'ru';
  const currency = ru ? 'RUB' : 'USD';
  const amount = ru ? rubles : rubles / site.exchange.USD;
  const price = new Intl.NumberFormat(ru ? 'ru-RU' : 'en-US', {
    currency, style: 'currency', maximumFractionDigits: 0,
  }).format(amount);
  return ru ? price : '≈ ' + price;
}

export function regionControl(lang, asset) {
  const ru = lang === 'ru';
  const t = (rus, eng) => ru ? rus : eng;
  const { date, BYN, KZT, USD, EUR } = site.exchange;
  const quick = [
    ['RUB', t('Российский рубль', 'Russian ruble')],
    ['USD', t('Доллар США', 'US dollar')],
    ['EUR', t('Евро', 'Euro')],
    ['BYN', t('Белорусский рубль', 'Belarusian ruble')],
    ['KZT', t('Казахстанский тенге', 'Kazakhstani tenge')],
  ];
  const initial = t('RUB', 'USD');
  return `<div class="region-control" data-region-control data-rates-url="${asset}exchange-rates.json"
    data-rate-date="${esc(date)}" data-byn-rate="${1 / BYN}" data-kzt-rate="${100 / KZT}"
    data-usd-rate="${1 / USD}" data-eur-rate="${1 / EUR}" hidden>
    <details>
      <summary aria-label="${t('Выбрать валюту', 'Choose a currency')}"><span data-region-label>${initial}</span></summary>
      <div class="region-panel">
        <fieldset class="currency-quick">
          <legend>${t('Валюта цен', 'Display currency')}</legend>
          ${quick.map(([code, name]) => `<label title="${name}"><input type="radio" name="region" value="${code}" ${initial === code ? 'checked' : ''}><span>${code}</span></label>`).join('')}
        </fieldset>
        <div class="currency-list" data-currency-picker hidden>
          <label for="currency-search">${t('Все валюты', 'All currencies')}</label>
          <input type="search" id="currency-search" data-currency-search placeholder="${t('Код или название', 'Code or name')}" autocomplete="off">
          <select data-currency-list aria-label="${t('Доступные валюты', 'Available currencies')}" size="5"></select>
          <p data-currency-empty role="status" hidden>${t('Валюты не найдены.', 'No matching currencies.')}</p>
        </div>
        <p data-currency-status role="status"></p>
        <p>${t('Валюту счёта согласуем в договоре.', 'We agree on the billing currency in the contract.')}</p>
      </div>
    </details>
  </div>`;
}

function technologyList(values) {
  return `<ul class="tech-list">${values.map(value => `<li>${esc(value)}</li>`).join('')}</ul>`;
}

export function renderTeam(lang, { bio, work, home, asset, link }) {
  const l = (ru, en) => localized(lang, ru, en);
  const [founder, ...partners] = projectTeam;
  const renderPerson = person => {
    const projects = work.filter(project => project.curators?.some(({ person: id }) => id === person.id));
    const photo = person.photo
      ? `<img class="team-photo" width="400" height="500" loading="lazy" src="${asset}${esc(person.photo)}" alt="${esc(person.name[lang])}">`
      : '';
    const text = person === founder ? bio : person.bio?.[lang];
    return `<article id="team-${esc(person.id)}" class="team-person${photo ? ' with-photo' : ''}">
      ${photo}<div>
        <h3>${esc(person.name[lang])}</h3>
        <p class="team-role">${esc(person.role[lang])}</p>
        ${text ? `<p>${esc(text)}</p>` : ''}
        ${person.stack?.length ? technologyList(person.stack) : ''}
        ${projects.length ? `<details class="team-projects"><summary>${l('Проекты', 'Projects')}</summary><ul>${projects.map(project => `<li><a class="underlined" href="${home}#${esc(project.id)}">${esc(project.name)}</a></li>`).join('')}</ul></details>` : ''}
        ${person === founder ? link(l('Написать Илье', 'Contact Ilia'), identity.telegram, 'button', 'telegram') : ''}
      </div>
    </article>`;
  };

  return `<div class="founder-grid">
    ${renderPerson(founder)}
    <aside class="discovery">
      <h3>${l('На первом созвоне', 'On the first call')}</h3>
      <ol>
        <li>${l('Разбираем текущий процесс и требования к результату.', 'We review the current workflow and intended outcomes.')}</li>
        <li>${l('Выбираем функции и интеграции для первой версии.', 'We select the features and integrations for the first release.')}</li>
        <li>${l('Согласуем, кто ведёт проект, и готовим смету и этапы.', 'We agree who leads the work and prepare an estimate and milestones.')}</li>
      </ol>
    </aside>
  </div>${partners.length ? `<div class="team-grid">${partners.map(renderPerson).join('')}</div>` : ''}`;
}

export function renderAchievements(lang, work) {
  const l = (ru, en) => localized(lang, ru, en);
  const projectTitles = {
    'orient-logic': l('Сайт с ассистентом, приёмом заявок, CRM и кабинетом', 'Website with an assistant, intake, CRM and customer access'),
    kitchens: l('Каталог кухни и сценарий визуализации по фото в MAX', 'Kitchen catalogue and photo visualisation workflow in MAX'),
  };
  const entries = [
    ...work.filter(project => projectTitles[project.id]).map(project => [project.name, projectTitles[project.id], '#' + project.id, l('Кейс', 'Case study')]),
    ...site.achievements.map(entry => [entry[lang].title, entry[lang].result, entry.proof, l('Подтверждение', 'Evidence')]),
  ];
  return `<div class="results-table"><table>
    <thead><tr><th scope="col">${l('Проект или достижение', 'Project or achievement')}</th><th scope="col">${l('Результат', 'Outcome')}</th><th scope="col">${l('Источник', 'Source')}</th></tr></thead>
    <tbody>${entries.map(([title, result, href, label]) => `<tr><th scope="row">${esc(title)}</th><td>${esc(result)}</td><td><a class="underlined" href="${esc(href)}">${label}</a></td></tr>`).join('')}</tbody>
  </table></div>`;
}

export function renderCaseFilter(lang, work) {
  const assigned = projectTeam.filter(person => work.some(project => project.curators?.some(({ person: id }) => id === person.id)));
  if (assigned.length < 2) return '';
  return `<fieldset class="case-filter" data-case-filter hidden>
    <legend>${localized(lang, 'Проекты по человеку', 'Projects by contributor')}</legend>
    <label><input type="radio" name="curator" value="" checked>${localized(lang, 'Все', 'All')}</label>
    ${assigned.map(person => `<label><input type="radio" name="curator" value="${esc(person.id)}">${esc(person.name[lang])}</label>`).join('')}
  </fieldset>`;
}

export function renderCaseDetails(lang, project) {
  const l = (ru, en) => localized(lang, ru, en);
  const labels = {
    front: l('Фронтенд', 'Frontend'), back: l('Сервер', 'Backend'), data: l('Данные', 'Data'),
    ai: l('Модели ИИ', 'AI models'), integrations: l('Интеграции', 'Integrations'), hosting: l('Размещение', 'Hosting'),
  };
  const stack = Object.entries(project.stack ?? {}).filter(([key, values]) => labels[key] && values.length);
  const flow = project.flow?.length
    ? `<ol class="case-flow" aria-label="${l('Сценарий работы', 'Workflow')}">${project.flow.map(step => `<li>${esc(step)}</li>`).join('')}</ol>`
    : '';
  return `${flow}${stack.length ? `<details class="case-tech"><summary>${l('Технологии', 'Technology')}</summary>
    <dl>${stack.map(([key, values]) => `<div><dt>${labels[key]}</dt><dd>${technologyList(values)}</dd></div>`).join('')}</dl>
  </details>` : ''}`;
}

export function renderCurators(lang, project) {
  return (project.curators ?? []).map(curator => {
    const person = projectTeam.find(member => member.id === curator.person);
    return person ? `<a class="case-curator underlined" href="#team-${esc(person.id)}">${esc(person.name[lang])} · ${esc(curator.role)}</a>` : '';
  }).join('');
}

export function renderProductDetails(lang, details) {
  if (!details) return '';
  const l = (ru, en) => localized(lang, ru, en);
  return `<details class="product-details"><summary>${esc(details.title)}</summary>
    <p>${esc(details.description)}</p>
    ${details.roles?.length ? `<dl>${details.roles.map(([role, task]) => `<div><dt>${esc(role)}</dt><dd>${esc(task)}</dd></div>`).join('')}</dl>` : ''}
    ${details.metrics?.length ? `<div class="results-table"><table>
      <thead><tr><th scope="col">${l('Показатель', 'Metric')}</th><th scope="col">${l('Источник', 'Source')}</th><th scope="col">${l('Доступ', 'Access')}</th></tr></thead>
      <tbody>${details.metrics.map(([metric, source, access]) => `<tr><th scope="row">${esc(metric)}</th><td>${esc(source)}</td><td>${esc(access)}</td></tr>`).join('')}</tbody>
    </table></div>` : ''}
  </details>`;
}

export function renderReferral(lang, telegram) {
  const { percent, cap, days } = site.referral;
  const l = (ru, en) => localized(lang, ru, en);
  const question = l('У меня действующий проект. Хочу получить код для рекомендации.', 'I have an active project and would like a referral code.');
  return `<div class="referral" id="referral"><div>
    <h3>${l('Скидка за рекомендацию', 'Referral discount')}</h3>
    <p>${l(
      `Рекомендуйте Devlarion во время работы над вашим проектом. После оплаты первого этапа новым заказчиком вы оба получаете скидку ${percent}% на ближайший неоплаченный этап или сопровождение.`,
      `Refer a new customer during an active project. After they pay for their first milestone, you both get ${percent}% off the next unpaid milestone or support work.`
    )}</p>
    <details><summary>${l('Условия скидки', 'Discount terms')}</summary><p>${l(
      `Код указывается в первой заявке. Скидка действует ${days} дней с подтверждения, один раз на нового заказчика. Суммарная скидка на работы — до ${cap}%. Оборудование, аренда, лицензии и сторонние услуги оплачиваются по смете.`,
      `Include the code in the first enquiry. The discount lasts ${days} days after confirmation and applies once per new customer. Combined discounts on work are capped at ${cap}%. Equipment, rental, licences and third-party fees are quoted separately.`
    )}</p></details>
    </div><a class="ghost" href="${telegram}?text=${encodeURIComponent(question)}" data-goal="telegram">${l('Запросить код', 'Request a code')}</a>
  </div>`;
}

export function renderLegal(lang) {
  const { name, inn, ogrnip } = site.legal;
  return [localized(lang, 'ИП', 'Sole proprietor') + ' ' + (name || identity.founder[lang]),
    inn && `${localized(lang, 'ИНН', 'Tax ID')} ${inn}`,
    ogrnip && `${localized(lang, 'ОГРНИП', 'Registration no.')} ${ogrnip}`].filter(Boolean).map(esc).join(' · ');
}
