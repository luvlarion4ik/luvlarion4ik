// Магазин Devlarion: услуги + железо NVIDIA (покупка под заказ и аренда).
// Цены железа — чуть выше средних по рынку РФ (ноябрь 2026), потому что включают нашу настройку.
import { esc } from './site.mjs';
import { packageStartingPrice } from './pricing.mjs';
import { parts } from './segments.mjs';

const { priceMarkup, pick } = parts;

// ---------- Услуги ----------
const services = [
  ['sites', ['Сайты', 'Websites'], [
    ['landing', ['Сайт для заявок', 'Enquiry website'], ['landing', 'small'], ['До 5 блоков, форма, заявки в Telegram', 'Up to 5 sections, form, enquiries to Telegram'], 'web'],
    ['web', ['Сайт компании с админкой', 'Company website with CMS'], ['web', 'small'], ['До 10 страниц, управление контентом', 'Up to 10 pages, content management'], 'web'],
    ['shop', ['Интернет-магазин', 'Online shop'], ['shop', 'small'], ['Каталог, корзина, оплата, уведомления', 'Catalogue, basket, payments, alerts'], 'layers'],
    ['design', ['Дизайн и редизайн', 'Design and redesign'], ['design', 'small'], ['Интерфейс ключевого сценария', 'Interface for the core journey'], 'design'],
  ]],
  ['bots', ['Боты и приложения', 'Bots and apps'], [
    ['bot', ['Telegram- или MAX-бот', 'Telegram or MAX bot'], ['automation', 'small'], ['Меню, сценарий записи, уведомления', 'Menu, booking flow, alerts'], 'bot'],
    ['mini', ['Мини-приложение с каталогом', 'Catalogue mini app'], ['mini', 'small'], ['Каталог до 10 позиций, заявка в клик', 'Up to 10 items, one-tap enquiry'], 'mini'],
    ['bot-crm', ['Бот + CRM', 'Bot + CRM'], 'bot-crm', ['Заявки сразу в amoCRM или Битрикс24', 'Enquiries straight into amoCRM or Bitrix24'], 'bot'],
    ['platform', ['Личный кабинет / веб-сервис', 'Portal / web app'], ['platform', 'small'], ['Роли, данные и история операций', 'Roles, records and history'], 'layers'],
  ]],
  ['ai', ['ИИ', 'AI'], [
    ['assistant', ['ИИ-ассистент для заявок', 'AI enquiry assistant'], ['assistant', 'small'], ['Ответы по базе знаний, передача в CRM', 'Knowledge-base answers, CRM hand-off'], 'ai'],
    ['llm-api', ['Настройка локального LLM API', 'Local LLM API set-up'], 30000, ['OpenAI-совместимый API на вашем железе', 'OpenAI-compatible API on your hardware'], 'server'],
    ['rag', ['Корпоративный RAG', 'Corporate RAG'], 100000, ['Поиск по документам с источниками', 'Document search with sources'], 'ai'],
    ['finetune', ['Подбор и дообучение модели', 'Model selection and fine-tuning'], ['fine-tuning', 'small'], ['Модель под задачу, язык и железо', 'A model for your task, language and hardware'], 'spark'],
    ['agents', ['Пилот мультиагентной системы', 'Multi-agent pilot'], ['agents', 'medium'], ['Один процесс, метрики заранее', 'One process, metrics agreed upfront'], 'layers'],
  ]],
  ['search', ['Поиск и ИИ-поиск', 'Search and AI search'], [
    ['seo', ['SEO-старт', 'SEO starter'], ['seo', 'small'], ['Аудит, Вебмастер, метатеги, карты', 'Audit, webmaster tools, metadata, maps'], 'web'],
    ['geo', ['GEO-старт', 'GEO starter'], ['geo', 'small'], ['Видимость в ответах нейросетей', 'Visibility in AI answers'], 'spark'],
  ]],
  ['security', ['Безопасность', 'Security'], [
    ['audit', ['Аудит данных и 152-ФЗ', 'Data and 152-FZ audit'], ['security', 'small'], ['Карта потоков ПДн и план мер', 'Personal-data flow map and plan'], 'support'],
    ['private', ['Выделенный ИИ-контур', 'Dedicated AI perimeter'], null, ['Изолированные GPU, сеть и журнал', 'Isolated GPUs, network and log'], 'server'],
  ]],
  ['care', ['Сопровождение', 'Support'], [
    ['care-site', ['Сопровождение сайта', 'Website support'], ['support', 'small'], ['Правки, мониторинг, обновления', 'Edits, monitoring, updates'], 'support', 'month'],
    ['care-ai', ['Сопровождение ИИ-сервиса', 'AI service support'], 30000, ['Обновления моделей и мониторинг', 'Model updates and monitoring'], 'support', 'month'],
  ]],
];

// ---------- Железо ----------
// market — диапазон цен российских поставщиков (ноябрь 2026), rub — наша цена с настройкой.
export const hardware = [
  { id: 'dgx-spark', mode: 'buy', art: 'spark', rub: 849000, market: [710000, 950000],
    ru: ['NVIDIA DGX Spark', 'Персональный ИИ-суперкомпьютер размером с книгу. Запускает модели до ~200 млрд параметров локально.', ['Grace Blackwell GB10', '128 ГБ единой памяти', 'SSD 4 ТБ', 'До 1 PFLOP FP4']],
    en: ['NVIDIA DGX Spark', 'A personal AI supercomputer the size of a book. Runs models up to ~200B parameters locally.', ['Grace Blackwell GB10', '128 GB unified memory', '4 TB SSD', 'Up to 1 PFLOP FP4']] },
  { id: 'gb10-oem', mode: 'buy', art: 'spark-dark', rub: 699000, market: [660000, 720000],
    ru: ['GB10 от партнёров NVIDIA', 'Тот же чип GB10 в корпусах ASUS, Gigabyte и других производителей — дешевле оригинала.', ['Grace Blackwell GB10', '128 ГБ единой памяти', 'SSD 1–4 ТБ', 'Совместим с DGX OS']],
    en: ['GB10 from NVIDIA partners', 'The same GB10 chip in ASUS, Gigabyte and other cases, cheaper than the original.', ['Grace Blackwell GB10', '128 GB unified memory', '1–4 TB SSD', 'DGX OS compatible']] },
  { id: 'spark-cluster', mode: 'buy', art: 'spark-duo', rub: 1990000, market: [1900000, 1960000],
    ru: ['Кластер из двух DGX Spark', 'Два Spark, связанные 200-гигабитной сетью: модели до ~400 млрд параметров.', ['2× GB10', '256 ГБ памяти суммарно', 'Связка ConnectX-7', 'Настроенный распределённый inference']],
    en: ['Two-unit DGX Spark cluster', 'Two Sparks linked over 200 Gb networking: models up to ~400B parameters.', ['2× GB10', '256 GB memory in total', 'ConnectX-7 link', 'Distributed inference set up']] },
  { id: 'rtx-pro-ws', mode: 'buy', art: 'workstation', rub: 2990000, market: [2500000, 3200000],
    ru: ['Рабочая станция с RTX PRO 6000 Blackwell', 'Самая мощная видеокарта для рабочих станций: 96 ГБ памяти на одной карте.', ['RTX PRO 6000 96 ГБ GDDR7', 'Процессор и ОЗУ под задачу', 'Тихое охлаждение', 'Для RAG, дообучения и генерации']],
    en: ['RTX PRO 6000 Blackwell workstation', 'The most powerful workstation GPU: 96 GB on a single card.', ['RTX PRO 6000 96 GB GDDR7', 'CPU and RAM sized to the task', 'Quiet cooling', 'For RAG, fine-tuning and generation']] },
  { id: 'rtx5090-ws', mode: 'buy', art: 'workstation', rub: 1190000, market: [1030000, 1550000],
    ru: ['ИИ-станция на RTX 5090 32 ГБ', 'Доступный вход в локальный ИИ: модели до ~30 млрд параметров, генерация изображений, эксперименты.', ['GeForce RTX 5090 32 ГБ', 'Ryzen 9 / 64–128 ГБ ОЗУ', 'NVMe 2–4 ТБ', 'Настроенная среда для моделей']],
    en: ['RTX 5090 32 GB AI workstation', 'An affordable start in local AI: models up to ~30B parameters, image generation, experiments.', ['GeForce RTX 5090 32 GB', 'Ryzen 9 / 64–128 GB RAM', '2–4 TB NVMe', 'Model environment set up']] },
  { id: 'rtx-pro-server', mode: 'buy', art: 'rack4', rub: 11900000, market: [10500000, 12500000],
    ru: ['Сервер 4× RTX PRO 6000 Server Edition', 'Стоечный сервер для отдела или всей компании: 384 ГБ видеопамяти.', ['4× RTX PRO 6000 96 ГБ', '2U/4U, стойка 19″', 'Резервные блоки питания', 'Несколько моделей одновременно']],
    en: ['4× RTX PRO 6000 Server Edition', 'A rack server for a department or company: 384 GB of GPU memory.', ['4× RTX PRO 6000 96 GB', '2U/4U, 19″ rack', 'Redundant power', 'Several models at once']] },
  { id: 'hgx-h200', mode: 'buy', art: 'hgx', rub: 36900000, market: [34000000, 72000000],
    ru: ['Сервер HGX 8× H200', 'Флагман для обучения и тяжёлого inference: 1,1 ТБ памяти HBM3e.', ['8× H200 SXM 141 ГБ', 'NVLink между GPU', '2× AMD EPYC или Intel Xeon', 'Сеть 400G по запросу']],
    en: ['HGX 8× H200 server', 'The flagship for training and heavy inference: 1.1 TB of HBM3e.', ['8× H200 SXM 141 GB', 'NVLink between GPUs', '2× AMD EPYC or Intel Xeon', '400G networking on request']] },
  { id: 'dgx-b200', mode: 'buy', art: 'hgx', rub: null, market: null,
    ru: ['NVIDIA DGX B200', 'Система нового поколения Blackwell для ИИ-фабрик. Поставка и цена — только по запросу.', ['8× B200', '1,4 ТБ памяти HBM3e', 'NVLink 5', 'Для крупных компаний и ЦОД']],
    en: ['NVIDIA DGX B200', 'Next-generation Blackwell system for AI factories. Supply and price on request.', ['8× B200', '1.4 TB HBM3e', 'NVLink 5', 'For large companies and data centres']] },
  { id: 'oem-servers', mode: 'buy', art: 'rack4', rub: null, market: null,
    ru: ['Готовые GPU-серверы Dell, Supermicro, Lenovo, HPE, xFusion', 'Подберём платформу под ваш ЦОД, бюджет и требования к поставщику, привезём и настроим.', ['От 2 до 8 GPU', 'NVIDIA H100/H200/B200 или RTX PRO', 'Гарантия производителя или партнёра', 'Под ваш стандарт стойки и питания']],
    en: ['Ready GPU servers from Dell, Supermicro, Lenovo, HPE, xFusion', 'We pick a platform for your data centre, budget and vendor policy, then deliver and set it up.', ['2 to 8 GPUs', 'NVIDIA H100/H200/B200 or RTX PRO', 'Vendor or partner warranty', 'Fits your rack and power standard']] },
  { id: 'amd-mi300x', mode: 'buy', art: 'hgx', rub: null, market: null,
    ru: ['Сервер 8× AMD Instinct MI300X', 'Альтернатива NVIDIA с 192 ГБ памяти на ускоритель — для больших моделей и inference.', ['8× MI300X 192 ГБ', '1,5 ТБ HBM3 суммарно', 'ROCm и vLLM', 'Поставка и цена по запросу']],
    en: ['8× AMD Instinct MI300X server', 'An NVIDIA alternative with 192 GB per accelerator, for large models and inference.', ['8× MI300X 192 GB', '1.5 TB HBM3 in total', 'ROCm and vLLM', 'Supply and price on request']] },
  { id: 'rent-h100', mode: 'rent', art: 'cloud', rub: 690, unit: 'hour', market: [340, 650],
    ru: ['Аренда 1× H100 80 ГБ', 'Выделенный GPU в российском ЦОД, модель развёрнута и отвечает по API.', ['H100 80 ГБ', 'Модель и API настроены', 'Изолированная сеть', 'Помесячно со скидкой']],
    en: ['Rent 1× H100 80 GB', 'A dedicated GPU in a Russian data centre with the model deployed and served by API.', ['H100 80 GB', 'Model and API set up', 'Isolated network', 'Monthly discount']] },
  { id: 'rent-h200', mode: 'rent', art: 'cloud', rub: 790, unit: 'hour', market: [420, 780],
    ru: ['Аренда 1× H200 141 ГБ', 'Больше памяти — больше модель без разбиения на несколько карт.', ['H200 141 ГБ', 'Модель и API настроены', 'Мониторинг нагрузки', 'Помесячно со скидкой']],
    en: ['Rent 1× H200 141 GB', 'More memory, larger models without splitting across cards.', ['H200 141 GB', 'Model and API set up', 'Load monitoring', 'Monthly discount']] },
  { id: 'rent-8h200', mode: 'rent', art: 'cloud8', rub: 5490, unit: 'hour', market: [3200, 5400],
    ru: ['Аренда сервера 8× H200', 'Целый сервер под вашу компанию: обучение, дообучение и высокая нагрузка.', ['8× H200, NVLink', 'Выделенный сервер', 'Резервное копирование в РФ', 'SLA в договоре']],
    en: ['Rent an 8× H200 server', 'A whole server for your company: training, fine-tuning and heavy load.', ['8× H200, NVLink', 'Dedicated server', 'Backups in Russia', 'SLA in the contract']] },
  { id: 'provider-pick', mode: 'rent', art: 'cloud', rub: null, market: null,
    ru: ['Мощности у крупного облака — с нашей настройкой', 'Если удобнее платить провайдеру напрямую, подберём тариф в Selectel, Cloud.ru, Yandex Cloud или другом российском облаке и развернём там модель.', ['Сравнение тарифов под задачу', 'Договор с провайдером — на вас', 'Развёртывание модели и API', 'Сопровождение по желанию']],
    en: ['Capacity from a major cloud, set up by us', 'If you prefer to pay a provider directly, we pick a plan at Selectel, Cloud.ru, Yandex Cloud or another Russian cloud and deploy the model there.', ['Plans compared for your task', 'Your own contract with the provider', 'Model and API deployment', 'Optional support']] },
];

// ---------- SVG-иллюстрации устройств ----------
const fan = (x, y, r) => `<g transform="translate(${x} ${y})"><circle r="${r}" class="hw-fan-ring"/><g class="hw-fan"><path d="M0 ${-r * .8}c${r * .3} ${r * .2} ${r * .3} ${r * .55} 0 ${r * .7}M${r * .8} 0c${-r * .2} ${r * .3} ${-r * .55} ${r * .3} ${-r * .7} 0M0 ${r * .8}c${-r * .3} ${-r * .2} ${-r * .3} ${-r * .55} 0 ${-r * .7}M${-r * .8} 0c${r * .2} ${-r * .3} ${r * .55} ${-r * .3} ${r * .7} 0"/></g><circle r="${r * .18}" class="hw-hub"/></g>`;
const led = (x, y, i = 0) => `<circle cx="${x}" cy="${y}" r="2.6" class="hw-led" style="--d:${i * .37}s"/>`;
const mesh = (x, y, w, h, gold) => {
  let s = '';
  for (let i = 0; i < Math.floor(w / 9); i++) for (let j = 0; j < Math.floor(h / 9); j++) s += `<circle cx="${x + 5 + i * 9 + (j % 2) * 4.5}" cy="${y + 5 + j * 9}" r="2.4" class="${gold ? 'hw-mesh-gold' : 'hw-mesh'}"/>`;
  return s;
};

export function deviceArt(kind) {
  const box = inner => `<svg class="hw-art" viewBox="0 0 240 150" aria-hidden="true">${inner}</svg>`;
  switch (kind) {
    case 'spark': return box(`<g class="hw-float"><rect x="60" y="34" width="120" height="86" rx="10" class="hw-gold"/>${mesh(68, 42, 104, 64, true)}<rect x="60" y="108" width="120" height="12" rx="4" class="hw-gold-edge"/>${led(170, 114)}</g><path d="M40 132h160" class="hw-shadow"/>`);
    case 'spark-dark': return box(`<g class="hw-float"><rect x="62" y="36" width="116" height="82" rx="12" class="hw-body"/><path d="M76 52h88M76 64h88M76 76h88M76 88h60" class="hw-vent"/>${led(164, 106)}${led(152, 106, 1)}</g><path d="M40 132h160" class="hw-shadow"/>`);
    case 'spark-duo': return box(`<g class="hw-float"><rect x="56" y="24" width="128" height="44" rx="8" class="hw-gold"/>${mesh(62, 28, 116, 34, true)}<rect x="56" y="78" width="128" height="44" rx="8" class="hw-gold"/>${mesh(62, 82, 116, 34, true)}</g><path d="M190 46c20 0 20 54 0 54" class="hw-cable"/><circle r="3.5" class="hw-packet"><animateMotion dur="1.6s" repeatCount="indefinite" path="M190 46c20 0 20 54 0 54"/></circle><path d="M36 136h168" class="hw-shadow"/>`);
    case 'workstation': return box(`<g class="hw-float"><rect x="78" y="14" width="84" height="120" rx="8" class="hw-body"/>${fan(120, 44, 18)}${fan(120, 88, 18)}<rect x="88" y="114" width="64" height="10" rx="3" class="hw-gpu"/>${led(150, 24)}</g>`);
    case 'rack4': return box(`<g class="hw-float"><rect x="24" y="44" width="192" height="62" rx="6" class="hw-body"/>${[0, 1, 2, 3].map(i => `<rect x="${34 + i * 38}" y="54" width="30" height="42" rx="3" class="hw-bay"/>${led(49 + i * 38, 88, i)}`).join('')}${fan(196, 75, 12)}</g><path d="M24 120h192" class="hw-shadow"/>`);
    case 'hgx': return box(`<g class="hw-float"><rect x="40" y="14" width="160" height="120" rx="8" class="hw-body"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${50 + (i % 4) * 36}" y="${24 + Math.floor(i / 4) * 40}" width="30" height="32" rx="3" class="hw-bay"/>${led(65 + (i % 4) * 36, 50 + Math.floor(i / 4) * 40, i)}`).join('')}${[0, 1, 2, 3].map(i => fan(66 + i * 36, 116, 11)).join('')}</g>`);
    case 'cloud': return box(`<path d="M70 104a26 26 0 0 1 4-52 34 34 0 0 1 64-8 28 28 0 0 1 32 60z" class="hw-cloud"/><g class="hw-float"><rect x="98" y="58" width="44" height="34" rx="5" class="hw-chip"/><path d="M106 58v-8M120 58v-8M134 58v-8M106 92v8M120 92v8M134 92v8" class="hw-pins"/></g>${[0, 1, 2].map(i => `<circle r="3" class="hw-packet"><animateMotion dur="${1.8 + i * .3}s" begin="${i * .5}s" repeatCount="indefinite" path="M20 130C60 120 90 110 120 92"/></circle>`).join('')}`);
    case 'cloud8': return box(`<path d="M58 110a28 28 0 0 1 4-56 38 38 0 0 1 72-8 30 30 0 0 1 40 64z" class="hw-cloud"/><g class="hw-float">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${78 + (i % 4) * 22}" y="${58 + Math.floor(i / 4) * 22}" width="16" height="16" rx="3" class="hw-chip"/>${led(86 + (i % 4) * 22, 66 + Math.floor(i / 4) * 22, i)}`).join('')}</g>`);
    default: return '';
  }
}

const iconArt = (icons, name) => `<span class="service-mark shop-icon" aria-hidden="true">${icons[name] ?? icons.layers}</span>`;

export function renderShop(lang, ctx) {
  const i = lang === 'ru' ? 0 : 1;
  const priceOf = p => typeof p === 'number' ? p : p ? packageStartingPrice(p, ctx.pricing) : null;
  const unitLabel = u => u === 'hour' ? pick(lang, ' / час', ' / hour') : u === 'month' ? pick(lang, ' / мес.', ' / month') : '';
  const card = ({ id, cat, title, text, rub, unit, art, specs, market, kind }) => {
    const price = rub == null ? `<p class="audience-price">${pick(lang, 'По запросу', 'On request')}</p>`
      : `<p class="audience-price" data-region-price-row>${priceMarkup(lang, rub, unitLabel(unit))}</p>`;
    const marketLine = market ? `<p class="shop-market">${pick(lang, 'Рынок', 'Market')}: ${market[0].toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-GB')}–${market[1].toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-GB')} ₽${unitLabel(unit)}</p>` : '';
    return `<article class="shop-item${kind === 'hw' ? ' shop-hw' : ''}" data-cat="${cat}" data-id="${id}" data-title="${esc(title)}" data-rub="${rub ?? ''}" data-unit="${unit ?? ''}">
      ${art}
      <div class="shop-body"><h3>${esc(title)}</h3><p class="shop-text">${esc(text)}</p>
      ${specs ? `<ul class="shop-specs">${specs.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
      <div class="shop-foot">${price}${marketLine}
      <div class="shop-qty" data-qty hidden><button type="button" data-dec aria-label="${pick(lang, 'Меньше', 'Fewer')}">−</button><output data-count>1</output><button type="button" data-inc aria-label="${pick(lang, 'Больше', 'More')}">+</button></div>
      <button type="button" class="btn shop-add" data-add="${id}"><span class="shop-add-label">${pick(lang, 'В корзину', 'Add to basket')}</span></button></div></div></article>`;
  };
  const serviceCards = services.flatMap(([cat, names, list]) => list.map(([id, title, p, text, icon, unit]) => card({
    id, cat, title: title[i], text: text[i], rub: priceOf(p), unit, art: iconArt(ctx.icons, icon),
  }))).join('');
  const hwCards = hardware.map(h => card({
    id: h.id, cat: 'hw-' + h.mode, kind: 'hw', title: h[lang][0], text: h[lang][1], specs: h[lang][2], rub: h.rub, unit: h.unit, market: h.market, art: `<div class="shop-art">${deviceArt(h.art)}${h.mode === 'rent' ? `<span class="shop-tag">${pick(lang, 'Аренда', 'Rental')}</span>` : `<span class="shop-tag">${pick(lang, 'Под заказ', 'To order')}</span>`}</div>`,
  })).join('');
  const chips = [['all', pick(lang, 'Все', 'All')], ...services.map(([id, names]) => [id, names[i]]), ['hw-buy', pick(lang, 'Железо: купить', 'Hardware: buy')], ['hw-rent', pick(lang, 'Железо: аренда', 'Hardware: rent')]];
  const labels = JSON.stringify({
    empty: pick(lang, 'Корзина пуста. Добавьте услуги или железо из каталога.', 'Your basket is empty. Add services or hardware from the catalogue.'),
    total: pick(lang, 'Итого от', 'Total from'), monthly: pick(lang, 'Ежемесячно от', 'Monthly from'), hourly: pick(lang, 'Аренда, в час от', 'Rental, per hour from'),
    onRequest: pick(lang, 'Позиции по запросу оценим отдельно', 'Items on request are quoted separately'),
    greeting: pick(lang, 'Здравствуйте! Хочу обсудить заказ:', 'Hello! I would like to discuss an order:'),
    remove: pick(lang, 'Убрать', 'Remove'), added: pick(lang, 'В корзине', 'In basket'), from: pick(lang, 'от', 'from'), request: pick(lang, 'по запросу', 'on request'),
    hour: pick(lang, '/ час', '/ hour'), month: pick(lang, '/ мес.', '/ month'), none: pick(lang, 'Ничего не нашлось. Попробуйте другое слово.', 'Nothing found. Try another word.'), lang,
  });
  return `<section class="section wrap audience-section shop" data-shop data-tg="${esc(ctx.tg)}" data-labels="${esc(labels)}">
    <div class="shop-toolbar">
      <label class="shop-search"><span class="sr-only">${pick(lang, 'Поиск по каталогу', 'Search the catalogue')}</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input type="search" data-search placeholder="${pick(lang, 'Найти: бот, H200, RAG…', 'Search: bot, H200, RAG…')}"></label>
      <label class="shop-sort"><span>${pick(lang, 'Сортировка', 'Sort')}</span><select data-sort><option value="default">${pick(lang, 'По разделам', 'By section')}</option><option value="asc">${pick(lang, 'Сначала дешевле', 'Price: low to high')}</option><option value="desc">${pick(lang, 'Сначала дороже', 'Price: high to low')}</option></select></label>
    </div>
    <div class="shop-filters" role="group" aria-label="${pick(lang, 'Категории', 'Categories')}">${chips.map(([id, name], n) => `<button type="button" aria-pressed="${n ? 'false' : 'true'}" data-filter="${id}">${esc(name)}</button>`).join('')}</div>
    <h2 class="shop-group-title" data-group="services">${pick(lang, 'Цифровые услуги', 'Digital services')}</h2>
    <div class="shop-grid" data-grid="services">${serviceCards}</div>
    <h2 class="shop-group-title" data-group="hw">${pick(lang, 'Железо для ИИ: NVIDIA', 'AI hardware: NVIDIA')}</h2>
    <div class="shop-grid shop-grid-hw" data-grid="hw">${hwCards}</div>
    <p class="shop-none" data-none hidden></p>
  </section>
  ${renderWhyPrice(lang)}
  <button type="button" class="shop-fab" data-shop-open aria-controls="shop-cart" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h3l2.4 11h10.2L21 7H7"/><circle cx="10" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/></svg><span>${pick(lang, 'Корзина', 'Basket')}</span><b data-shop-count>0</b></button>
  <div class="shop-scrim" data-shop-scrim hidden></div>
  <aside class="shop-cart" id="shop-cart" aria-label="${pick(lang, 'Корзина', 'Basket')}" hidden>
    <div class="shop-cart-head"><h2>${pick(lang, 'Ваш заказ', 'Your order')}</h2><button type="button" class="shop-close" data-shop-close aria-label="${pick(lang, 'Закрыть', 'Close')}">×</button></div>
    <ul class="shop-list" data-shop-list></ul>
    <div class="shop-total" data-shop-total></div>
    <a class="button shop-send" data-shop-send href="${esc(ctx.tg)}">${pick(lang, 'Отправить заявку в Telegram', 'Send enquiry on Telegram')}</a>
    <button type="button" class="shop-clear" data-shop-clear>${pick(lang, 'Очистить корзину', 'Clear basket')}</button>
    <p class="audience-note-line">${pick(lang, 'Это заявка, а не оплата. Итоговую цену, сроки поставки и условия фиксируем в коммерческом предложении и договоре.', 'This is an enquiry, not a payment. Final price, lead time and terms are fixed in the quote and contract.')}</p>
  </aside>`;
}

function renderWhyPrice(lang) {
  const items = lang === 'ru' ? [
    ['Вы покупаете работающую модель, а не коробку', 'В цену входят подбор конфигурации, установка ОС и драйверов, развёртывание модели (vLLM), API и проверка под вашей нагрузкой.'],
    ['Одна команда отвечает за всё', 'Если модель тормозит или падает, не нужно выяснять, виноваты железо, драйверы или софт. Отвечаем мы.'],
    ['Документы для службы безопасности', 'Даём документы о размещении и описание архитектуры — то, что обычно спрашивают при проверке.'],
    ['Поддержка после запуска', 'Первые два месяца исправления входят в проект, дальше — сопровождение по договору.'],
    ['Честный ориентир', 'Рядом с ценой показываем диапазон у других поставщиков. Наша выше на стоимость настройки — не на «воздух».'],
  ] : [
    ['You buy a working model, not a box', 'The price covers sizing, OS and driver set-up, model deployment (vLLM), an API and a load test.'],
    ['One team owns it all', 'If the model is slow or crashes, you do not have to work out whether hardware, drivers or software are at fault.'],
    ['Documents for your security team', 'Hosting documents and an architecture description, the things usually asked for in a review.'],
    ['Support after launch', 'Two months of fixes are included, then a support contract.'],
    ['An honest reference', 'Next to each price we show what other suppliers charge. Ours is higher by the cost of set-up.'],
  ];
  return `<section class="section wrap audience-section why-price"><p class="loss-badge">${pick(lang, 'Про цены', 'About pricing')}</p>
    <h2>${pick(lang, 'Почему наше железо чуть дороже рынка', 'Why our hardware costs a little more than the market')}</h2>
    <div class="loss-grid">${items.map(([t, d], n) => `<article><span class="loss-index" aria-hidden="true">${String(n + 1).padStart(2, '0')}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join('')}</div>
    <p class="audience-note-line">${pick(lang, 'Рыночные диапазоны — открытые цены российских поставщиков на ноябрь 2026 года. Железо поставляем под заказ через партнёров: цена зависит от курса и конфигурации, итог фиксируем в КП.', 'Market ranges are public prices of Russian suppliers as of November 2026. Hardware is supplied to order through partners; the price depends on exchange rates and configuration and is fixed in the quote.')}</p>
  </section>`;
}
