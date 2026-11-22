// Enterprise: корпоративный ИИ в российском контуре, железо, отраслевые страницы и магазин услуг.
// Правила: не обещаем «сертификат соответствия 152-ФЗ», смоделированные кейсы помечаем,
// цены железа — по запросу (поставка под заказ через партнёров).
import { esc } from './site.mjs';
import { packageStartingPrice } from './pricing.mjs';
import { parts } from './segments.mjs';
import { pageArt } from './page-art.mjs';
import { renderShop, hardware, deviceArt } from './shop.mjs';

const { hero, trustStrip, renderCapacity, renderFAQ, section, priceMarkup, estimateLink, telegramLink, pick } = parts;

// ---------- Штрафы по ст. 13.11 КоАП (ред. 420-ФЗ, действуют с 30.05.2025) ----------
const fines = {
  ru: {
    title: 'Сколько стоит одна утечка',
    lead: 'Штрафы по статье 13.11 КоАП для компаний с 30 мая 2025 года. Это суммы за одно нарушение, без учёта исков клиентов, проверок и потери репутации.',
    rows: [
      ['Утечка данных 1–10 тыс. человек', '3–5 млн ₽'],
      ['Утечка данных 10–100 тыс. человек', '5–10 млн ₽'],
      ['Утечка данных более 100 тыс. человек', '10–15 млн ₽'],
      ['Утечка специальных категорий (например, данные о здоровье)', 'до 15 млн ₽'],
      ['Утечка биометрических данных', 'до 20 млн ₽'],
      ['Не уведомили Роскомнадзор об утечке', '1–3 млн ₽'],
      ['Повторная утечка', '1–3% выручки, от 20 до 500 млн ₽'],
    ],
    head: ['Нарушение', 'Штраф для компании'],
    note: 'Источник: ст. 13.11 КоАП РФ в редакции Федерального закона № 420-ФЗ. Это справочная информация, а не юридическая консультация: точная квалификация зависит от обстоятельств.',
    compare: 'Закрытый ИИ-контур стоит меньше одного такого штрафа и не требует отправлять данные клиентов внешним сервисам.',
  },
  en: {
    title: 'What a single leak costs',
    lead: 'Fines under Article 13.11 of the Russian Code of Administrative Offences for companies since 30 May 2025. These are amounts per violation, before customer claims, inspections and reputational damage.',
    rows: [
      ['Leak of data on 1,000–10,000 people', 'RUB 3–5 million'],
      ['Leak of data on 10,000–100,000 people', 'RUB 5–10 million'],
      ['Leak of data on more than 100,000 people', 'RUB 10–15 million'],
      ['Leak of special categories (e.g. health data)', 'up to RUB 15 million'],
      ['Leak of biometric data', 'up to RUB 20 million'],
      ['Failure to notify Roskomnadzor of a leak', 'RUB 1–3 million'],
      ['Repeat leak', '1–3% of revenue, RUB 20–500 million'],
    ],
    head: ['Violation', 'Fine for a company'],
    note: 'Source: Article 13.11 of the Russian Code of Administrative Offences as amended by Federal Law No. 420-FZ. For reference only, not legal advice.',
    compare: 'A private AI perimeter costs less than one such fine and does not require sending customer data to external services.',
  },
};

function renderFines(lang) {
  const f = fines[lang];
  return `<section class="section wrap audience-section audience-loss fines">
    <p class="loss-badge">${pick(lang, 'Риск', 'Risk')}</p>
    <h2>${esc(f.title)}</h2><p class="loss-lead">${esc(f.lead)}</p>
    <div class="bundle-table fines-table" role="table"><div role="row" class="bundle-row bundle-head">${f.head.map(c => `<span role="columnheader">${esc(c)}</span>`).join('')}</div>
    ${f.rows.map(([a, b]) => `<div role="row" class="bundle-row"><span role="rowheader">${esc(a)}</span><span role="cell" data-label="${esc(f.head[1])}">${esc(b)}</span></div>`).join('')}</div>
    <p class="fines-compare">${esc(f.compare)}</p>
    <p class="audience-note-line">${esc(f.note)}</p>
  </section>`;
}

// ---------- Карточки ----------
function cards(lang, ctx, items, opts = {}) {
  return `<div class="service-grid audience-packages${opts.cls ? ' ' + opts.cls : ''}">${items.map(item => {
    const rubles = item.rub ?? (item.price ? packageStartingPrice(item.price, ctx.pricing) : null);
    const price = rubles == null
      ? `<p class="audience-price">${esc(item.priceLabel ?? pick(lang, 'По запросу', 'On request'))}</p>`
      : `<p class="audience-price" data-region-price-row>${priceMarkup(lang, rubles, item.suffix ?? '')}</p>`;
    return `<article>${item.badge ? `<small class="pack-badge">${esc(item.badge)}</small>` : ''}<h3>${esc(item.title)}</h3>${item.text ? `<p>${esc(item.text)}</p>` : ''}${price}
      ${item.items ? `<ul class="package-includes">${item.items.map(i => `<li><span aria-hidden="true">✓</span>${esc(i)}</li>`).join('')}</ul>` : ''}
      <div class="package-action"><a class="btn" href="${telegramLink(lang, ctx, opts.label ?? 'Devlarion', item.title)}">${pick(lang, 'Обсудить', 'Discuss')}</a></div></article>`;
  }).join('')}</div>`;
}

function grid(items, icons, ctx) {
  return `<div class="loss-grid">${items.map(([title, text], i) => `<article><span class="loss-index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join('')}</div>`;
}

function steps(items) {
  return `<ol class="bundle-flow">${items.map(([t, d], i) => `<li style="--i:${i}"><span class="bundle-node">${i + 1}</span><strong>${esc(t)}</strong><span>${esc(d)}</span></li>`).join('')}</ol>`;
}

function links(lang, ctx, routes) {
  return `<div class="audience-related audience-cross">${routes.map(route => {
    const page = enterprisePages.find(p => p.route === route);
    const label = page ? page[lang].label : route;
    const text = page ? page[lang].card : '';
    return `<a href="${ctx.home}${route}"><strong>${esc(label)} <span aria-hidden="true">→</span></strong><span>${esc(text)}</span></a>`;
  }).join('')}</div>`;
}

function close(lang, page, ctx, title, text) {
  return `<section class="section wrap audience-section audience-contact audience-close"><h2>${esc(title)}</h2><p>${esc(text)}</p>
    <div class="actions"><a class="button" href="${telegramLink(lang, ctx, page[lang].label)}">${pick(lang, 'Написать в Telegram', 'Message us on Telegram')}</a>
    <a class="ghost" href="${ctx.home}shop/">${pick(lang, 'Открыть магазин услуг', 'Open the service shop')}</a></div></section>`;
}

const industries = ['industries/legal/', 'industries/clinics/', 'industries/finance/', 'industries/operations/', 'industries/contact-centers/'];

// ---------- Данные страниц ----------
const page = (route, icon, estimateServices, ru, en, extra = {}) => ({ route, icon, starting: null, estimateServices, estimateTier: 'medium', related: [], ru, en, ...extra });

const industry = (slug, ru, en) => page('industries/' + slug + '/', 'ai', ['private-ai', 'assistant'],
  { eyebrow: 'Отрасли · Корпоративный ИИ', ...ru }, { eyebrow: 'Industries · Private AI', ...en }, { industry: true });

export const enterprisePages = [
  page('private-ai/', 'server', ['private-ai', 'assistant'], {
    eyebrow: 'Корпоративный ИИ в российском контуре',
    label: 'Корпоративный ИИ',
    card: 'LLM, RAG, распознавание документов и речи на серверах в России.',
    title: 'Корпоративный ИИ. Данные под вашим контролем',
    description: 'Запускайте языковые модели, распознавание речи и обработку документов в российских дата-центрах: изолированная инфраструктура, контролируемые потоки данных и проверяемая история обработки.',
    tags: ['Размещение в РФ', 'Private inference', 'Аудит обработки', 'OpenAI-совместимый API'],
    whyTitle: 'Почему не внешний ИИ-сервис',
    why: [
      ['Данные клиентов уходят за контур', 'Запрос во внешний ИИ-сервис — это передача текста, документов и персональных данных третьей стороне, часто за рубеж.'],
      ['Нет доказательств, где шла обработка', 'Служба безопасности спрашивает не «где сервер», а «чем подтвердить». Обычно ответить нечем.'],
      ['Одна утечка дороже проекта', 'Штрафы за утечки персональных данных выросли в разы, повторная — уже процент от выручки.'],
      ['Модель обучается на ваших данных', 'В публичных сервисах сложно гарантировать, что запросы не попадут в обучение чужих моделей.'],
    ],
    tiersTitle: 'Три формата',
    tiers: [
      { title: 'Local AI API', badge: 'Старт', text: 'Общая GPU-инфраструктура в РФ с изоляцией клиентов и OpenAI-совместимым API. Подключение к вашей CRM или сайту.', rub: 30000, items: ['Локальные модели (например, Qwen)', 'API-ключи и лимиты', 'Базовое подтверждение размещения', 'Оплата за запросы'] },
      { title: 'Private AI Cloud', badge: 'Популярный', text: 'Выделенная инфраструктура для одной компании: свои GPU, сеть, хранилище и ключи.', rub: 100000, items: ['Корпоративный RAG по вашим документам', 'Изолированные GPU и сеть', 'Мониторинг внутри контура', 'Интеграции и сопровождение'] },
      { title: 'Verified Enterprise AI', badge: 'Максимум', text: 'Выделенный контур с журналом каждого запроса, документами по ИБ и независимой проверкой.', priceLabel: 'Индивидуальная смета', items: ['Подписанный журнал обработки', 'Пакет документов для службы ИБ', 'Независимый аудит', 'SLA в договоре'] },
    ],
    proofTitle: 'Как подтверждаем, что обработка в России',
    proof: [
      ['Размещение', 'Договор с российским ЦОД, площадка, идентификаторы оборудования. Документы того типа, что перечислены в разъяснениях Роскомнадзора о подтверждении локализации.'],
      ['Технический контроль', 'Запрет внешних LLM API, ограничение исходящего трафика, базы, мониторинг и резервные копии внутри контура.'],
      ['Журнал запросов', 'Для каждого запроса — ID, время, модель и вычислительный узел. Записи защищены от незаметного изменения, отчёт можно выгрузить.'],
    ],
    evidence: { title: 'Пример записи об обработке запроса', rows: [['Request ID', 'req_8a72f1c'], ['Модель', 'Qwen 32B, локальный inference'], ['Регион', 'Российская Федерация'], ['Узел', 'ru-cluster-01 / gpu-04'], ['Внешние LLM API', 'Не используются в конфигурации'], ['Статус', 'Демонстрационные данные']], note: 'Макет. Это не сертификат Роскомнадзора или ФСТЭК и не заключение о полном соответствии законодательству. Подтверждает только факты обработки в согласованной инфраструктуре.' },
    servicesTitle: 'Что ещё делаем',
    services: [
      { title: 'Настройка API и интеграция', rub: 30000, items: ['Подключение к CRM, сайту, МИС', 'Ключи и роли доступа'] },
      { title: 'Корпоративный RAG', rub: 100000, items: ['Поиск по документам компании', 'Ответы со ссылками на источник'] },
      { title: 'Подбор и дообучение модели', price: ['fine-tuning', 'small'], items: ['Выбор модели под задачу и железо', 'Дообучение на ваших данных'] },
      { title: 'Распознавание документов и речи', priceLabel: 'По смете', items: ['OCR договоров и заявлений', 'Расшифровка звонков'] },
      { title: 'Аудит данных и 152-ФЗ', price: ['security', 'small'], items: ['Карта потоков персональных данных', 'План мер защиты'] },
      { title: 'Сопровождение ИИ-сервиса', rub: 30000, suffix: ' / мес.', items: ['Обновления моделей', 'Мониторинг и поддержка'] },
    ],
    legal: 'Сам по себе российский сервер не делает обработку законной: основания обработки, согласия и меры защиты остаются на стороне оператора. Мы обеспечиваем инфраструктуру и доказательную базу, а юридическую часть помогаем выстроить с профильными специалистами.',
    closeTitle: 'Начнём с бесплатной диагностики',
    closeText: 'Разберём, какие данные и процессы вы хотите отдать ИИ, и предложим формат: от API до выделенного контура.',
    faq: [
      ['Это сертификат соответствия 152-ФЗ?', 'Нет. Мы подтверждаем факты: где размещена инфраструктура и как обрабатывались запросы. Соответствие процессов компании закону оценивается отдельно.'],
      ['Можно ли развернуть у нас, без интернета?', 'Да. Подбираем модель под ваше оборудование и разворачиваем в вашем контуре. Оборудование рассчитываем отдельно.'],
      ['Какие модели используете?', 'Открытые модели, которые можно запускать локально, например семейство Qwen. Выбор зависит от задачи, языка и железа.'],
    ],
  }, {
    eyebrow: 'Private AI inside Russia',
    label: 'Private AI',
    card: 'LLMs, RAG, document and speech recognition on servers in Russia.',
    title: 'Corporate AI. Your data stays under your control',
    description: 'Run language models, speech recognition and document processing in Russian data centres, with isolated infrastructure, controlled data flows and a verifiable processing history.',
    tags: ['Hosted in Russia', 'Private inference', 'Processing audit', 'OpenAI-compatible API'],
    whyTitle: 'Why not an external AI service',
    why: [
      ['Customer data leaves your perimeter', 'A request to an external AI service passes text, documents and personal data to a third party, often abroad.'],
      ['No proof of where processing happened', 'Security teams ask not “where is the server” but “how can you prove it”. Usually there is no answer.'],
      ['One leak costs more than the project', 'Fines for personal-data leaks have grown sharply; a repeat leak is a share of revenue.'],
      ['Models may learn from your data', 'Public services make it hard to guarantee that requests never feed someone else’s model.'],
    ],
    tiersTitle: 'Three formats',
    tiers: [
      { title: 'Local AI API', badge: 'Start', text: 'Shared GPU infrastructure in Russia with client isolation and an OpenAI-compatible API.', rub: 30000, items: ['Local models (e.g. Qwen)', 'API keys and limits', 'Basic hosting evidence', 'Pay per request'] },
      { title: 'Private AI Cloud', badge: 'Popular', text: 'Dedicated infrastructure for one company: its own GPUs, network, storage and keys.', rub: 100000, items: ['Corporate RAG on your documents', 'Isolated GPUs and network', 'Monitoring inside the perimeter', 'Integrations and support'] },
      { title: 'Verified Enterprise AI', badge: 'Maximum', text: 'A dedicated perimeter with a log of every request, security documentation and independent review.', priceLabel: 'Custom quote', items: ['Signed processing log', 'Security documentation pack', 'Independent audit', 'SLA in the contract'] },
    ],
    proofTitle: 'How we evidence processing in Russia',
    proof: [
      ['Hosting', 'A contract with a Russian data centre, site details and hardware identifiers — the kind of documents listed in Roskomnadzor’s guidance on proving localisation.'],
      ['Technical controls', 'No external LLM APIs, restricted outbound traffic, databases, monitoring and backups inside the perimeter.'],
      ['Request log', 'For each request: ID, time, model and compute node. Records are tamper-evident and can be exported.'],
    ],
    evidence: { title: 'Sample processing record', rows: [['Request ID', 'req_8a72f1c'], ['Model', 'Qwen 32B, local inference'], ['Region', 'Russian Federation'], ['Node', 'ru-cluster-01 / gpu-04'], ['External LLM APIs', 'Not used in this configuration'], ['Status', 'Demo data']], note: 'Mock-up. Not a Roskomnadzor or FSTEC certificate and not a statement of full legal compliance. It only evidences processing within the agreed infrastructure.' },
    servicesTitle: 'What else we do',
    services: [
      { title: 'API set-up and integration', rub: 30000, items: ['Connect CRM, website or clinical systems', 'Keys and access roles'] },
      { title: 'Corporate RAG', rub: 100000, items: ['Search across company documents', 'Answers with source links'] },
      { title: 'Model selection and fine-tuning', price: ['fine-tuning', 'small'], items: ['Model chosen for the task and hardware', 'Fine-tuning on your data'] },
      { title: 'Document and speech recognition', priceLabel: 'Quoted', items: ['OCR for contracts and claims', 'Call transcription'] },
      { title: 'Data and 152-FZ audit', price: ['security', 'small'], items: ['Personal-data flow map', 'Protection plan'] },
      { title: 'AI service support', rub: 30000, suffix: ' / month', items: ['Model updates', 'Monitoring and support'] },
    ],
    legal: 'A Russian server alone does not make processing lawful: legal grounds, consent and protection measures remain the operator’s responsibility. We provide the infrastructure and the evidence, and help build the legal side with specialists.',
    closeTitle: 'Start with a free discovery call',
    closeText: 'We will look at which data and processes you want AI to handle and propose a format, from an API to a dedicated perimeter.',
    faq: [
      ['Is this a 152-FZ compliance certificate?', 'No. We evidence facts: where the infrastructure is and how requests were processed. Whether your processes comply with the law is assessed separately.'],
      ['Can you deploy on our premises without internet?', 'Yes. We size the model for your hardware and deploy it in your environment. Hardware is quoted separately.'],
      ['Which models do you use?', 'Open models that run locally, such as the Qwen family. The choice depends on the task, language and hardware.'],
    ],
  }),

  page('hardware/', 'server', ['private-ai'], {
    eyebrow: 'Железо для ИИ',
    label: 'GPU-серверы и DGX',
    card: 'Покупка или аренда GPU-серверов с нашей настройкой под вашу модель.',
    title: 'GPU-серверы и DGX: купить или арендовать — уже настроенными',
    description: 'Подбираем и поставляем серверы под заказ через партнёров или размещаем мощности в российском ЦОД в аренду. Вы получаете не коробку, а работающую нейросеть.',
    optionsTitle: 'Два варианта',
    options: [
      { title: 'Покупка', badge: 'В собственность', text: 'Сервер ставится на ваш баланс и в вашу серверную или ЦОД. Подходит, если данные нельзя выносить даже к подрядчику.', priceLabel: 'Цена и срок по запросу', items: ['Подбор конфигурации под модель', 'Поставка под заказ через партнёров', 'Монтаж и запуск', 'Документы для подтверждения размещения'] },
      { title: 'Аренда', badge: 'Без закупки', text: 'Мощности стоят в российском ЦОД партнёра, вы платите помесячно. Можно начать с пилота без капитальных затрат.', priceLabel: 'Помесячно, по запросу', items: ['Выделенные GPU под вашу компанию', 'Изолированная сеть и хранилище', 'Масштабирование по мере роста', 'Договор аренды с площадкой в РФ'] },
    ],
    includedTitle: 'Что входит в нашу настройку',
    included: [
      ['Подбор модели и железа', 'Считаем, какая модель решит задачу и сколько видеопамяти ей нужно, чтобы не переплачивать за лишние GPU.'],
      ['Размещение нейросети', 'Разворачиваем inference-сервер, API, очереди и мониторинг. Модель отвечает вашим системам с первого дня.'],
      ['Дообучение', 'Адаптируем модель под ваши документы, термины и стиль ответов.'],
      ['Сопровождение', 'Обновляем модели, следим за нагрузкой и безопасностью, реагируем по SLA.'],
    ],
    lineup: [
      ['DGX-класс', 'Флагманские системы на 8 GPU для обучения и тяжёлого inference.'],
      ['GPU-сервер 4–8 карт', 'Рабочая лошадка для корпоративного RAG и нескольких моделей.'],
      ['Рабочая станция 1–2 GPU', 'Пилот, отдел или локальная модель для одного процесса.'],
    ],
    lineupTitle: 'Классы оборудования',
    lineupNote: 'Конкретные модели, сроки поставки и цены зависят от доступности у партнёров. Называем их после подбора конфигурации.',
    closeTitle: 'Посчитаем, сколько железа вам действительно нужно',
    closeText: 'Опишите задачу и объём данных. Предложим конфигурацию, вариант покупки или аренды и смету на настройку.',
    faq: [
      ['Что выгоднее: купить или арендовать?', 'Аренда — чтобы быстро начать и проверить спрос. Покупка — когда нагрузка стабильная и данные нельзя выносить за ваш периметр.'],
      ['Вы сами производите серверы?', 'Нет. Поставляем под заказ через партнёров и отвечаем за подбор, настройку и запуск.'],
      ['Можно ли использовать уже купленное железо?', 'Да. Проверим конфигурацию и развернём на ней модель.'],
    ],
  }, {
    eyebrow: 'Hardware for AI',
    label: 'GPU servers and DGX',
    card: 'Buy or rent GPU servers, set up for your model.',
    title: 'GPU servers and DGX: buy or rent, ready to run',
    description: 'We specify and supply servers to order through partners, or host capacity in a Russian data centre for rent. You get a working model, not just a box.',
    optionsTitle: 'Two options',
    options: [
      { title: 'Purchase', badge: 'Owned', text: 'The server goes on your balance sheet and into your server room or data centre.', priceLabel: 'Price and lead time on request', items: ['Configuration sized to the model', 'Supply to order through partners', 'Installation and launch', 'Documents evidencing location'] },
      { title: 'Rental', badge: 'No purchase', text: 'Capacity sits in a partner’s Russian data centre and you pay monthly.', priceLabel: 'Monthly, on request', items: ['Dedicated GPUs for your company', 'Isolated network and storage', 'Scale as you grow', 'Rental contract with a Russian site'] },
    ],
    includedTitle: 'What our set-up includes',
    included: [
      ['Model and hardware sizing', 'We work out which model solves the task and how much GPU memory it needs.'],
      ['Model hosting', 'Inference server, API, queues and monitoring.'],
      ['Fine-tuning', 'We adapt the model to your documents, terms and tone.'],
      ['Support', 'Model updates, load and security monitoring, SLA response.'],
    ],
    lineup: [
      ['DGX class', 'Flagship 8-GPU systems for training and heavy inference.'],
      ['4–8 GPU server', 'The workhorse for corporate RAG and several models.'],
      ['1–2 GPU workstation', 'A pilot, a department or one local model.'],
    ],
    lineupTitle: 'Hardware classes',
    lineupNote: 'Exact models, lead times and prices depend on partner availability. We name them after sizing.',
    closeTitle: 'Let’s work out how much hardware you really need',
    closeText: 'Describe the task and data volume. We will propose a configuration, purchase or rental, and a set-up quote.',
    faq: [
      ['Is it better to buy or rent?', 'Rent to start fast and test demand. Buy when load is steady and data cannot leave your perimeter.'],
      ['Do you manufacture servers?', 'No. We supply to order through partners and handle sizing, set-up and launch.'],
      ['Can you use hardware we already own?', 'Yes. We check the configuration and deploy the model on it.'],
    ],
  }),

  industry('legal', {
    label: 'Юридические компании', card: 'Анализ договоров и судебных документов без передачи данных наружу.',
    title: 'ИИ для юридических компаний без риска для тайны клиента',
    description: 'Анализ договоров, поиск по архиву и черновики правок — в изолированном контуре, где документы одного клиента не видны другим.',
    risks: [['Адвокатская и коммерческая тайна', 'Договоры клиентов нельзя загружать в публичные ИИ-сервисы без риска раскрытия.'], ['Смешение данных клиентов', 'Документы разных доверителей должны быть изолированы друг от друга.'], ['Ответственность за ошибку', 'Итоговое решение и формулировки всегда утверждает юрист, а не модель.']],
    uses: [['Анализ договоров', 'Поиск рисков и противоречий между редакциями.'], ['Поиск по архиву', 'Нужные положения в тысячах документов за секунды.'], ['Черновики правок', 'По внутренним шаблонам фирмы.'], ['Сводки по делу', 'Краткое содержание судебных материалов.']],
    case: { title: 'Корпоративный ИИ для юридической фирмы', client: 'Юридическая фирма, корпоративное право', task: 'Ускорить анализ конфиденциальных договоров.', solution: 'Изолированный RAG-сервис: загрузка договоров, поиск противоречий, выдержки из шаблонов, черновики правок. Данные клиентов разделены, доступ по корпоративным учётным записям, запросы не используются для обучения чужих моделей.', results: ['Первичный анализ типового договора быстрее примерно на 40%', 'Быстрый поиск положений в архиве', 'Доступ по проектам и клиентам', 'Подтверждаемая история обращений к документам'] },
    faq: [['Увидит ли модель документы других клиентов?', 'Нет. Пространства клиентов изолированы, доступ настраивается по проектам.'], ['Кто отвечает за юридический вывод?', 'Юрист. Модель готовит черновик и находит места, требующие внимания.']],
  }, {
    label: 'Law firms', card: 'Contract and litigation analysis without data leaving your perimeter.',
    title: 'AI for law firms without risking client confidentiality',
    description: 'Contract analysis, archive search and draft edits in an isolated environment where one client’s documents are never visible to another.',
    risks: [['Privilege and trade secrets', 'Client contracts cannot go into public AI services without disclosure risk.'], ['Mixing client data', 'Different clients’ documents must stay isolated.'], ['Liability for errors', 'A lawyer always approves the final decision and wording.']],
    uses: [['Contract analysis', 'Risks and contradictions between versions.'], ['Archive search', 'The right clause across thousands of documents.'], ['Draft edits', 'Based on the firm’s own templates.'], ['Case summaries', 'Short summaries of court materials.']],
    case: { title: 'Private AI for a law firm', client: 'Corporate law firm', task: 'Speed up analysis of confidential contracts.', solution: 'An isolated RAG service for uploading contracts, spotting contradictions, quoting templates and drafting edits. Client data is separated, access uses corporate accounts and requests never train other models.', results: ['First-pass review of a standard contract about 40% faster', 'Fast clause search across the archive', 'Access by project and client', 'Verifiable document access history'] },
    faq: [['Can the model see other clients’ documents?', 'No. Client spaces are isolated and access is set per project.'], ['Who owns the legal conclusion?', 'The lawyer. The model drafts and flags what needs attention.']],
  }),

  industry('clinics', {
    label: 'Клиники и медицина', card: 'Медкарты, документы и ассистенты врачей в закрытом контуре.',
    title: 'ИИ для клиник: врачебная тайна остаётся внутри',
    description: 'Черновики медицинских записей, поиск по документам и ассистент администраторов — без отправки данных пациентов внешним сервисам.',
    risks: [['Специальная категория данных', 'Данные о здоровье — специальная категория по ст. 10 закона № 152-ФЗ, штраф за их утечку до 15 млн ₽.'], ['Врачебная тайна', 'Медицинская информация защищена ст. 13 закона № 323-ФЗ.'], ['Решение принимает врач', 'ИИ готовит черновик, врач проверяет и утверждает документ.']],
    uses: [['Черновики записей приёма', 'Структурирование жалоб, анамнеза и результатов исследований.'], ['Поиск по МИС', 'Внутренний ассистент по базе знаний клиники.'], ['Контроль качества звонков', 'Расшифровка разговоров администраторов.'], ['Обезличенные отчёты', 'Управленческая аналитика без персональных данных.']],
    case: { title: 'Закрытая ИИ-инфраструктура для сети клиник', client: 'Сеть частных медицинских центров, 7 филиалов', task: 'Автоматизировать работу с документацией, сохранив контроль над данными пациентов.', solution: 'Выделенный LLM-кластер в российском ЦОД, интеграция с МИС через защищённый API. Врачи получают черновики записей приёма, администраторы — RAG-ассистента по базе знаний. Внешние LLM API не используются.', results: ['Подготовка черновика документа с 8 до 4 минут', 'Единое управление доступами', 'Выгрузка технических отчётов о запросах', 'Медданные не уходят внешним поставщикам моделей'] },
    faq: [['ИИ ставит диагнозы?', 'Нет. Он помогает с документацией и поиском, решения принимает врач.'], ['Нужно ли согласие пациентов?', 'Основания обработки определяет клиника как оператор. Мы помогаем выстроить процесс вместе с юристами.']],
  }, {
    label: 'Clinics and healthcare', card: 'Medical records, documents and clinician assistants in a closed perimeter.',
    title: 'AI for clinics: medical confidentiality stays inside',
    description: 'Draft clinical notes, document search and a front-desk assistant, without sending patient data to external services.',
    risks: [['Special-category data', 'Health data is a special category under Article 10 of Law 152-FZ; a leak can cost up to RUB 15 million.'], ['Medical confidentiality', 'Medical information is protected by Article 13 of Law 323-FZ.'], ['The clinician decides', 'AI drafts, the clinician reviews and approves.']],
    uses: [['Draft visit notes', 'Structuring complaints, history and test results.'], ['Clinical system search', 'An internal assistant over the clinic’s knowledge base.'], ['Call quality control', 'Transcribing front-desk conversations.'], ['Anonymised reports', 'Management analytics without personal data.']],
    case: { title: 'Private AI infrastructure for a clinic network', client: 'Private medical network, 7 branches', task: 'Automate documentation while keeping control of patient data.', solution: 'A dedicated LLM cluster in a Russian data centre integrated with the clinical system via a secure API. Clinicians get draft notes, staff get a RAG assistant. No external LLM APIs.', results: ['Draft document time down from 8 to 4 minutes', 'Single access management', 'Exportable request reports', 'Medical data never goes to external model providers'] },
    faq: [['Does the AI diagnose?', 'No. It helps with documentation and search; the clinician decides.'], ['Is patient consent needed?', 'The clinic, as operator, sets the legal grounds. We help design the process with lawyers.']],
  }),

  industry('finance', {
    label: 'Банки, финтех, страхование', card: 'Документы клиентов, заявления и поддержка без внешних ИИ-провайдеров.',
    title: 'ИИ для банков, финтеха и страховых компаний',
    description: 'Обработка заявлений, проверка документов и ассистент поддержки в выделенном контуре с журналом каждого запроса для службы безопасности.',
    risks: [['Банковская и страховая тайна', 'Данные клиентов нельзя передавать внешним ИИ-сервисам без серьёзных рисков.'], ['Требования регулятора и ИБ', 'Служба безопасности проверяет договор, архитектуру и потоки данных, а не обещания.'], ['Решения о выплатах — за человеком', 'Модель готовит карточку, уполномоченный сотрудник принимает решение.']],
    uses: [['Обработка заявлений', 'OCR, извлечение реквизитов, проверка комплектности.'], ['Ассистент поддержки', 'Черновики ответов по утверждённой базе знаний.'], ['Внутренний поиск', 'Регламенты и инструкции для сотрудников.'], ['Журнал для ИБ', 'ID, модель, узел и время каждого запроса.']],
    case: { title: 'Private AI для страховой компании', client: 'Региональная страховая компания', task: 'Ускорить обработку заявлений и страховых документов.', solution: 'Локальная система обработки документов на OCR, LLM и базе знаний: распознаёт документы, извлекает реквизиты, проверяет комплектность и готовит карточку обращения. Решения принимает сотрудник. Изолированный контур и журнал обработки.', results: ['Первичная подготовка страхового дела быстрее примерно на 35%', 'Автоматический поиск недостающих документов', 'Без зарубежных облачных LLM', 'Отчёты для внутреннего аудита ИБ'] },
    faq: [['Подходит ли это под требования ЦБ?', 'Требования к финансовым организациям оцениваются отдельным проектом с вашей службой ИБ. Мы даём инфраструктуру и документы для такой оценки.'], ['Можно начать с поддержки клиентов?', 'Да, это частый первый пилот: быстрый результат при понятных рисках.']],
  }, {
    label: 'Banking, fintech, insurance', card: 'Client documents, claims and support without external AI providers.',
    title: 'AI for banks, fintech and insurers',
    description: 'Claims processing, document checks and a support assistant in a dedicated perimeter with a per-request log for your security team.',
    risks: [['Banking and insurance secrecy', 'Client data cannot go to external AI services without serious risk.'], ['Regulator and security requirements', 'Security teams check contracts, architecture and data flows, not promises.'], ['Payout decisions stay human', 'The model prepares the file, an authorised employee decides.']],
    uses: [['Claims processing', 'OCR, field extraction, completeness checks.'], ['Support assistant', 'Draft replies from an approved knowledge base.'], ['Internal search', 'Policies and procedures for staff.'], ['Security log', 'ID, model, node and time for each request.']],
    case: { title: 'Private AI for an insurer', client: 'Regional insurance company', task: 'Speed up processing of claims and documents.', solution: 'Local OCR + LLM + knowledge base: recognises documents, extracts fields, checks completeness and prepares a case file. Staff make decisions. Isolated perimeter with a processing log.', results: ['Initial case preparation about 35% faster', 'Missing documents flagged automatically', 'No foreign cloud LLMs', 'Reports for internal security audit'] },
    faq: [['Does this meet Central Bank requirements?', 'Requirements for financial organisations are assessed as a separate project with your security team. We provide the infrastructure and documents for it.'], ['Can we start with customer support?', 'Yes, it is a common first pilot with fast results and clear risks.']],
  }),

  industry('operations', {
    label: 'Производство, ритейл, логистика', card: 'Документооборот, закупки и поддержка клиентов с ИИ внутри компании.',
    title: 'ИИ для производства, ритейла и логистики',
    description: 'Обработка накладных и заявок, поиск по регламентам и ассистент поддержки — с данными клиентов и поставщиков внутри вашего контура.',
    risks: [['Коммерческие данные', 'Цены поставщиков, объёмы и маршруты — то, что конкуренты хотели бы знать.'], ['Персональные данные клиентов', 'История заказов и контакты покупателей подпадают под 152-ФЗ.'], ['Ручная рутина', 'Сотрудники тратят часы на перенос данных между системами.']],
    uses: [['Документы и накладные', 'Распознавание и перенос в учётную систему.'], ['Закупки', 'Сравнение предложений поставщиков.'], ['Поддержка клиентов', 'Ответы о статусе заказа и доставки.'], ['База знаний', 'Регламенты и инструкции для смен и складов.']],
    case: { title: 'Ассистент для логистической компании', client: 'Логистическая компания (по мотивам нашего проекта Orient Logic)', task: 'Убрать ручной перенос заявок и ответы на однотипные вопросы клиентов.', solution: 'Ассистент принимает заявки, уточняет условия, передаёт их в CRM и отвечает клиентам о статусе. Данные остаются во внутренней инфраструктуре.', results: ['Заявки сразу в CRM', 'Ответы клиентам без ожидания менеджера', 'Личный кабинет клиента', 'Меньше ручной работы у менеджеров'] },
    faq: [['Интегрируетесь с 1С?', 'Да, после изучения документации и доступов. Готовые CRM подключаем быстрее.'], ['С чего начать?', 'С одного процесса, где больше всего ручной работы. Это и будет пилот.']],
  }, {
    label: 'Manufacturing, retail, logistics', card: 'Documents, procurement and customer support with AI inside the company.',
    title: 'AI for manufacturing, retail and logistics',
    description: 'Invoice and order processing, policy search and a support assistant, with customer and supplier data kept inside your perimeter.',
    risks: [['Commercial data', 'Supplier prices, volumes and routes are what competitors want.'], ['Customer personal data', 'Order history and contacts fall under 152-FZ.'], ['Manual routine', 'Staff spend hours moving data between systems.']],
    uses: [['Documents and invoices', 'Recognition and transfer to accounting.'], ['Procurement', 'Comparing supplier offers.'], ['Customer support', 'Order and delivery status answers.'], ['Knowledge base', 'Procedures for shifts and warehouses.']],
    case: { title: 'An assistant for a logistics company', client: 'Logistics company (based on our Orient Logic project)', task: 'Remove manual order entry and repetitive customer questions.', solution: 'The assistant takes orders, clarifies terms, passes them to the CRM and answers status questions. Data stays inside.', results: ['Orders go straight to the CRM', 'Customers get answers without waiting', 'Customer portal', 'Less manual work for managers'] },
    faq: [['Do you integrate with 1C?', 'Yes, after reviewing documentation and access. Off-the-shelf CRMs are faster.'], ['Where to start?', 'With the one process that has the most manual work. That becomes the pilot.']],
  }),

  industry('contact-centers', {
    label: 'Контакт-центры', card: 'Расшифровка звонков, контроль качества и ИИ-операторы локально.',
    title: 'ИИ для контакт-центров: звонки не уходят наружу',
    description: 'Локальная расшифровка разговоров, контроль качества и заполнение CRM — записи и тексты обрабатываются в согласованном российском контуре.',
    risks: [['Голос и персональные данные', 'Записи звонков содержат ФИО, телефоны, адреса и иногда платёжные данные.'], ['Объём ручного контроля', 'Прослушать вручную можно лишь малую часть звонков.'], ['Заполнение CRM', 'Операторы тратят время после звонка на карточку клиента.']],
    uses: [['Расшифровка звонков', 'Сразу после завершения разговора.'], ['Контроль качества', 'Проверка скриптов и стандартов по всем звонкам.'], ['Черновик карточки CRM', 'Тема, суть и следующий шаг.'], ['Аналитика обращений', 'Причины звонков без прослушивания вручную.']],
    case: { title: 'Локальное распознавание звонков', client: 'Контакт-центр на 120 операторов', task: 'Транскрибация, контроль качества и аналитика обращений.', solution: 'Запись поступает в защищённое хранилище, превращается в текст, модель готовит краткое содержание, тему и черновик карточки CRM. Руководители видят сводную аналитику.', results: ['Расшифровка каждого звонка', 'Меньше ручной работы с CRM', 'Автоматическая классификация обращений', 'Отчёты по качеству обслуживания'] },
    faq: [['Работает с русской речью?', 'Да, используем модели распознавания, которые хорошо работают с русским языком и запускаются локально.'], ['Можно ли подключить ИИ-оператора?', 'Да, начиная с простых сценариев и с передачей сложных вопросов человеку.']],
  }, {
    label: 'Contact centres', card: 'Call transcription, quality control and AI agents run locally.',
    title: 'AI for contact centres: calls stay inside',
    description: 'Local transcription, quality control and CRM filling, with recordings and text processed in an agreed Russian perimeter.',
    risks: [['Voice and personal data', 'Recordings contain names, phones, addresses and sometimes payment details.'], ['Manual QA volume', 'Only a fraction of calls can be reviewed by hand.'], ['CRM entry', 'Agents spend time after each call on the client record.']],
    uses: [['Call transcription', 'Right after the call ends.'], ['Quality control', 'Script and standard checks on every call.'], ['CRM draft', 'Topic, summary and next step.'], ['Contact analytics', 'Call reasons without manual listening.']],
    case: { title: 'Local call recognition', client: 'Contact centre with 120 agents', task: 'Transcription, quality control and analytics.', solution: 'Recordings go to secure storage, become text, and the model prepares a summary, topic and CRM draft. Managers get aggregate analytics.', results: ['Every call transcribed', 'Less manual CRM work', 'Automatic call classification', 'Service quality reports'] },
    faq: [['Does it work with Russian speech?', 'Yes, we use recognition models that handle Russian well and run locally.'], ['Can we add an AI agent?', 'Yes, starting with simple scenarios and handing complex ones to people.']],
  }),

  page('compute/', 'server', ['private-ai'], {
    eyebrow: 'Вычисления для бизнеса',
    label: 'Купить или арендовать мощности',
    card: 'Пять причин владеть вычислениями и пять — арендовать у честного провайдера.',
    title: 'Свои вычислительные мощности или честная аренда',
    description: 'Листайте вниз: от компактного DGX Spark до целого парка. Что выгоднее, когда данные нельзя отдавать, а нагрузка растёт.',
    story: [
      ['01', 'Начинается с одного устройства', 'DGX Spark размером с книгу запускает модели до ~200 млрд параметров. Для пилота и небольшого отдела этого хватает.', ['Свой ИИ без облака', 'Работает от обычной розетки', 'Окупается быстрее аренды при ежедневной нагрузке'], 'spark'],
      ['02', 'Потом — сервер под отдел', 'Стоечный сервер с несколькими GPU держит десятки пользователей и несколько моделей одновременно.', ['До 384 ГБ видеопамяти', 'Резервное питание и мониторинг', 'Данные остаются в вашем контуре'], 'server'],
      ['03', 'Затем — стойка для компании', 'Платформа уровня DGX: единая система, где обучение и inference не конкурируют за ресурсы.', ['NVLink между картами', 'Планировщик задач', 'Своя инфраструктура под NDA'], 'rack'],
      ['04', 'А иногда лучше не покупать', 'Если нагрузка скачет или нужен быстрый старт, арендуйте у честного провайдера: платите за факт, договор и размещение в РФ, настройка наша.', ['Без капитальных затрат', 'Масштабирование по месяцам', 'Размещение и документы в России'], 'park'],
    ],
    compareTitle: 'Купить или арендовать',
    compare: [['Стартовые затраты', 'Высокие', 'Низкие'], ['Если нагрузка стабильная', 'Дешевле через 1–2 года', 'Дороже со временем'], ['Если нагрузка скачет', 'Часть мощности простаивает', 'Платите за факт'], ['Данные', 'Полностью у вас', 'В ЦОД партнёра в РФ по договору'], ['Скорость старта', 'Поставка под заказ', 'Дни'], ['Обновление железа', 'На вас', 'На провайдере']],
    compareHead: ['', 'Своё железо', 'Аренда'],
    fairTitle: 'Что такое честный провайдер',
    fair: [['Прозрачный договор', 'Цена, объём, SLA и ответственность записаны, без скрытых платежей.'], ['Размещение в РФ с документами', 'Договор с площадкой и описание контура: то, что спрашивает служба безопасности.'], ['Вы можете уйти', 'Данные и конфигурации выгружаются, привязки нет.'], ['Настройка не продаётся отдельно как загадка', 'Что включено в цену, указано заранее.']],
    closeTitle: 'Посчитаем под вашу нагрузку',
    closeText: 'Расскажите, какие модели и сколько пользователей. Сравним покупку и аренду в цифрах и предложим вариант.',
    faq: [['С чего начать?', 'С пилота на одном процессе: арендованная мощность или один Spark. Решение о покупке — после результатов.'], ['Можно ли потом выкупить арендованное?', 'Это обсуждается индивидуально, зависит от провайдера и конфигурации.']],
  }, {
    eyebrow: 'Compute for business',
    label: 'Buy or rent capacity',
    card: 'Five reasons to own compute and five to rent from a fair provider.',
    title: 'Your own compute or fair rental',
    description: 'Scroll down: from a compact DGX Spark to a whole fleet. What pays off when data cannot leave and load grows.',
    story: [
      ['01', 'It starts with one device', 'A book-sized DGX Spark runs models up to ~200B parameters. Enough for a pilot or a small team.', ['Your own AI without the cloud', 'Runs from a normal socket', 'Pays back faster than rental at daily load'], 'spark'],
      ['02', 'Then a server for the department', 'A rack server with several GPUs serves dozens of users and several models at once.', ['Up to 384 GB of GPU memory', 'Redundant power and monitoring', 'Data stays in your perimeter'], 'server'],
      ['03', 'Then a rack for the company', 'A DGX-class platform: one system where training and inference do not fight over resources.', ['NVLink between cards', 'Job scheduler', 'Your own infrastructure under NDA'], 'rack'],
      ['04', 'And sometimes it is better not to buy', 'If load swings or you need a fast start, rent from a fair provider: pay for what you use, with a contract and hosting in Russia. The set-up is ours.', ['No capital outlay', 'Scale month by month', 'Hosting and documents in Russia'], 'park'],
    ],
    compareTitle: 'Buy or rent',
    compare: [['Upfront cost', 'High', 'Low'], ['Steady load', 'Cheaper after 1–2 years', 'More expensive over time'], ['Spiky load', 'Some capacity sits idle', 'Pay for use'], ['Data', 'Entirely yours', 'In a partner data centre in Russia, by contract'], ['Speed to start', 'Supplied to order', 'Days'], ['Hardware refresh', 'On you', 'On the provider']],
    compareHead: ['', 'Own hardware', 'Rental'],
    fairTitle: 'What a fair provider is',
    fair: [['A transparent contract', 'Price, scope, SLA and liability in writing, no hidden fees.'], ['Hosting in Russia with documents', 'A site contract and a perimeter description, the things security teams ask for.'], ['You can leave', 'Data and configurations can be exported; no lock-in.'], ['Set-up is not a mystery add-on', 'What is included in the price is stated upfront.']],
    closeTitle: 'Let’s size it for your load',
    closeText: 'Tell us which models and how many users. We will compare buying and renting in numbers and propose an option.',
    faq: [['Where to start?', 'A pilot on one process: rented capacity or a single Spark. Decide on buying after the results.'], ['Can rented capacity be bought out later?', 'That is agreed individually and depends on the provider and configuration.']],
  }),

  page('import/', 'layers', ['custom'], {
    eyebrow: 'Техника под заказ',
    label: 'Техника под заказ',
    card: 'Привозим любую рабочую технику под заказ, в том числе из Китая.',
    title: 'Любая рабочая техника под заказ, в том числе из Китая',
    description: 'Серверы, рабочие станции, сетевое и торговое оборудование, станки и комплектующие. Подбираем поставщика, проверяем, везём, оформляем и запускаем.',
    catsTitle: 'Что привозим',
    cats: [
      ['Серверы и GPU', 'DGX, HGX, GPU-серверы, станции на RTX, СХД и сетевые карты.'],
      ['Сеть и ЦОД', 'Коммутаторы, маршрутизаторы, межсетевые экраны, ИБП, стойки.'],
      ['Рабочие станции и ноутбуки', 'Для проектирования, монтажа видео, разработки и офиса.'],
      ['Торговое и офисное оборудование', 'Кассы, терминалы, принтеры, дисплеи, камеры и терминалы доступа.'],
      ['Промышленное оборудование', 'Станки, контроллеры, датчики, 3D-принтеры и ЧПУ.'],
      ['Комплектующие и запчасти', 'Платы, блоки питания, накопители, модули памяти.'],
    ],
    stepsTitle: 'Как это работает',
    steps: [
      ['Заявка', 'Вы описываете, что нужно: модель или задачу, количество, срок.'],
      ['Подбор и КП', 'Находим поставщиков, сравниваем и присылаем коммерческое предложение с ценой и сроком.'],
      ['Договор', 'Фиксируем состав, цену, этапы оплаты и ответственность.'],
      ['Закупка и проверка', 'Заказываем, проверяем комплектность и работоспособность перед отправкой.'],
      ['Доставка и оформление', 'Везём из Китая или другой страны, оформляем ввоз через партнёров-таможенных брокеров.'],
      ['Запуск', 'Устанавливаем и настраиваем: для серверов и ИИ — вместе с моделью.'],
    ],
    whyTitle: 'Что вы получаете',
    why: [
      ['Одна точка ответственности', 'Не нужно искать поставщика, логиста и брокера отдельно: за цепочку отвечаем мы.'],
      ['Работающая техника', 'Проверяем перед отправкой и после получения, а не просто пересылаем коробку.'],
      ['Документы для бухгалтерии', 'Договор, счёт, закрывающие документы. Подробности по оплате и ввозу согласуем до заказа.'],
      ['Настройка и сопровождение', 'Для серверов и ИИ — установка, модели, мониторинг. Для остального — запуск и инструкции.'],
    ],
    notice: 'Сроки и стоимость зависят от поставщика, страны отправки, курса и таможенного оформления, поэтому цену называем в коммерческом предложении. Ввоз выполняем в рамках законодательства РФ и ограничений на конкретные товары: что ввозить нельзя или требует разрешений, скажем сразу.',
    closeTitle: 'Напишите, что нужно привезти',
    closeText: 'Модель или задача, количество и желаемый срок. Ответим в течение дня и предложим вариант.',
    faq: [['Привозите только из Китая?', 'Нет. Китай — частый вариант, но подбираем страну и поставщика под задачу и сроки.'], ['Можно ли заказать одну единицу?', 'Да, но стоимость логистики на одну единицу выше. Мы подскажем, как объединить заказ.'], ['Кто отвечает за гарантию?', 'Гарантийные условия фиксируем в договоре: часть случаев ведём мы с поставщиком, часть — по условиям производителя.'], ['Сколько это занимает?', 'От нескольких недель, зависит от товара и страны. Точный срок — в коммерческом предложении.']],
  }, {
    eyebrow: 'Equipment to order',
    label: 'Equipment to order',
    card: 'We bring in any working equipment to order, including from China.',
    title: 'Any working equipment to order, including from China',
    description: 'Servers, workstations, network and retail equipment, machine tools and components. We find the supplier, check, ship, clear and commission.',
    catsTitle: 'What we bring in',
    cats: [
      ['Servers and GPUs', 'DGX, HGX, GPU servers, RTX workstations, storage and network cards.'],
      ['Network and data centre', 'Switches, routers, firewalls, UPS units, racks.'],
      ['Workstations and laptops', 'For design, video editing, development and the office.'],
      ['Retail and office equipment', 'Tills, terminals, printers, displays, cameras and access terminals.'],
      ['Industrial equipment', 'Machine tools, controllers, sensors, 3D printers and CNC.'],
      ['Components and spares', 'Boards, power supplies, drives, memory modules.'],
    ],
    stepsTitle: 'How it works',
    steps: [
      ['Enquiry', 'Tell us what you need: model or task, quantity, deadline.'],
      ['Sourcing and quote', 'We find suppliers, compare and send a quote with price and lead time.'],
      ['Contract', 'We fix scope, price, payment stages and liability.'],
      ['Purchase and check', 'We order and check completeness and operation before shipping.'],
      ['Delivery and clearance', 'We ship from China or elsewhere and clear import through partner customs brokers.'],
      ['Commissioning', 'We install and set up; for servers and AI, together with the model.'],
    ],
    whyTitle: 'What you get',
    why: [
      ['One point of responsibility', 'No need to find a supplier, forwarder and broker separately: we own the chain.'],
      ['Equipment that works', 'We check before shipping and after arrival, not just forward a box.'],
      ['Documents for accounting', 'Contract, invoice and closing documents. Payment and import details are agreed before ordering.'],
      ['Set-up and support', 'For servers and AI: installation, models and monitoring. For the rest: commissioning and guides.'],
    ],
    notice: 'Lead times and cost depend on the supplier, country of origin, exchange rates and customs clearance, so we state the price in a quote. Import is carried out within Russian law and restrictions on specific goods; we say upfront what cannot be imported or needs permits.',
    closeTitle: 'Tell us what you need brought in',
    closeText: 'Model or task, quantity and desired date. We reply within a day with an option.',
    faq: [['Only from China?', 'No. China is common, but we choose the country and supplier for the task and deadline.'], ['Can I order a single unit?', 'Yes, but logistics per unit costs more. We will suggest how to combine orders.'], ['Who handles warranty?', 'Warranty terms are fixed in the contract: we handle some cases with the supplier, others follow the manufacturer’s terms.'], ['How long does it take?', 'From a few weeks, depending on the goods and country. The exact date is in the quote.']],
  }),

  page('shop/', 'layers', ['landing', 'automation'], {
    eyebrow: 'Магазин цифровых услуг',
    label: 'Магазин услуг',
    card: 'Соберите проект из готовых услуг и отправьте заявку в один клик.',
    title: 'Магазин цифровых услуг Devlarion',
    description: 'Выберите услуги, добавьте их в корзину и отправьте заявку в Telegram. Цены указаны «от» — точную смету фиксируем в договоре до старта.',
    faq: [['Как оплатить?', 'После заявки уточним детали и пришлём договор и счёт. Онлайн-оплаты на сайте нет.'], ['Корзина — это окончательный заказ?', 'Нет, это заявка. Можно менять состав до подписания договора.']],
  }, {
    eyebrow: 'Digital service shop',
    label: 'Service shop',
    card: 'Build a project from ready services and send it in one click.',
    title: 'Devlarion digital service shop',
    description: 'Pick services, add them to the basket and send the enquiry on Telegram. Prices are “from”; the final quote is fixed in the contract before work starts.',
    faq: [['How do I pay?', 'After the enquiry we confirm details and send a contract and invoice. There is no online payment on the site.'], ['Is the basket a final order?', 'No, it is an enquiry. You can change it before signing.']],
  }),
];

// ---------- Рендеры ----------
export function renderEnterprisePage(lang, route, ctx) {
  const p = enterprisePages.find(x => x.route === route);
  const c = p[lang];
  const label = c.label;
  const tags = c.tags ? `<div class="wrap tag-strip">${c.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : '';
  let body = '';
  if (route === 'private-ai/') {
    body = `${tags}${trustStrip(lang)}
      ${section(c.whyTitle, grid(c.why), 'audience-loss')}
      ${renderFines(lang)}
      ${section(c.tiersTitle, cards(lang, ctx, c.tiers, { label, cls: 'tiers' }))}
      ${section(c.proofTitle, steps(c.proof), 'audience-flow')}
      <section class="section wrap audience-section evidence"><h2>${esc(c.evidence.title)}</h2><div class="evidence-card"><div class="evidence-top"><span class="evidence-dot" aria-hidden="true"></span><strong>RU Processing Report</strong><small>DEMO</small></div><dl>${c.evidence.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div><p class="audience-note-line">${esc(c.evidence.note)}</p></section>
      ${section(c.servicesTitle, cards(lang, ctx, c.services, { label }))}
      <aside class="wrap audience-note"><p>${esc(c.legal)}</p></aside>
      ${section(pick(lang, 'Для каких отраслей', 'Industries'), links(lang, ctx, industries))}
      ${renderCapacity(lang, p, ctx)}
      ${renderFAQ(lang, p, ctx)}
      ${section(pick(lang, 'Что логично сделать дальше', 'What to do next'), links(lang, ctx, ['hardware/', 'shop/', 'enterprise/']), 'audience-next')}
      ${close(lang, p, ctx, c.closeTitle, c.closeText)}`;
  } else if (route === 'hardware/') {
    body = `${trustStrip(lang)}
      ${section(c.optionsTitle, cards(lang, ctx, c.options, { label, cls: 'two-up' }))}
      ${section(c.includedTitle, grid(c.included), 'audience-loss')}
      ${section(pick(lang, 'Как это выглядит', 'What it looks like'), `<div class="photo-grid"><figure><img src="${ctx.asset}photos/nvidia-dgx-spark-desk.jpg" alt="${pick(lang, 'NVIDIA DGX Spark на рабочем столе рядом с ноутбуком', 'NVIDIA DGX Spark on a desk next to a laptop')}" width="1600" height="900" loading="lazy"><figcaption>${pick(lang, 'DGX Spark на рабочем столе. Фото: NVIDIA', 'DGX Spark on a desk. Photo: NVIDIA')}</figcaption></figure><figure><img src="${ctx.asset}photos/nvidia-gb200-nvl72.jpg" alt="${pick(lang, 'Стойки NVIDIA GB200 NVL72', 'NVIDIA GB200 NVL72 racks')}" width="1600" height="900" loading="lazy"><figcaption>${pick(lang, 'Стойка уровня GB200 NVL72. Фото: NVIDIA', 'A GB200 NVL72-class rack. Photo: NVIDIA')}</figcaption></figure><figure><img src="${ctx.asset}photos/frame-4-park.jpg" alt="${pick(lang, 'Ряды серверных стоек в тёмном зале', 'Rows of server racks in a dark hall')}" width="1672" height="941" loading="lazy"><figcaption>${pick(lang, 'Парк серверных стоек. Визуализация', 'A fleet of server racks. Visualisation')}</figcaption></figure></div><p class="audience-note-line">${pick(lang, 'Фото NVIDIA — из официального пресс-центра компании. Кадры с пометкой «Визуализация» созданы нами, у студии нет собственного парка: оборудование поставляется под заказ.', 'NVIDIA photos are from the company’s official newsroom. Images marked “Visualisation” are made by us; the studio has no fleet of its own, hardware is supplied to order.')}</p>`)}
      ${section(pick(lang, 'Модели в каталоге', 'Models in the catalogue'), `<div class="hw-lineup">${hardware.map(h => `<a class="hw-pick" href="${ctx.home}shop/#${h.id}">${deviceArt(h.art)}<strong>${esc(h[lang][0])}</strong><span>${h.rub == null ? pick(lang, 'По запросу', 'On request') : priceMarkup(lang, h.rub, h.unit === 'hour' ? pick(lang, ' / час', ' / hour') : '')}</span></a>`).join('')}</div><p class="audience-note-line">${esc(c.lineupNote)}</p>`)}
      ${renderCapacity(lang, p, ctx)}
      ${renderFAQ(lang, p, ctx)}
      ${section(pick(lang, 'Что логично сделать дальше', 'What to do next'), links(lang, ctx, ['import/', 'compute/', 'shop/']), 'audience-next')}
      ${close(lang, p, ctx, c.closeTitle, c.closeText)}`;
  } else if (route === 'compute/') {
    const ph = n => `${ctx.asset}photos/${n}`;
    const frames = ['frame-1-spark', 'frame-2-server', 'frame-3-rack', 'frame-4-park'];
    body = `${trustStrip(lang)}
      <section class="story" data-story aria-label="${esc(c.title)}">
        <div class="story-stage"><div class="story-frames">${frames.map((f, i) => `<picture class="story-frame" data-frame="${i}"><source srcset="${ph(f + '-960.jpg')} 960w, ${ph(f + '.jpg')} 1672w" sizes="(max-width:860px) 100vw, 55vw"><img src="${ph(f + '.jpg')}" alt="${esc(c.story[i][1])}" width="1672" height="941" loading="${i ? 'lazy' : 'eager'}"></picture>`).join('')}</div>
          <div class="story-bar" aria-hidden="true"><i></i></div><span class="story-tag">${pick(lang, 'Визуализация', 'Visualisation')}</span><div class="story-count" aria-hidden="true"><b data-story-n>01</b> / 04</div></div>
        <div class="story-steps">${c.story.map(([n, t, d, pts], i) => `<article class="story-step" data-step="${i}"><span class="story-n">${n}</span><h2>${esc(t)}</h2><p>${esc(d)}</p><ul class="package-includes">${pts.map(x => `<li><span aria-hidden="true">✓</span>${esc(x)}</li>`).join('')}</ul></article>`).join('')}</div>
      </section>
      ${section(c.compareTitle, `<div class="bundle-table" role="table"><div role="row" class="bundle-row bundle-head">${c.compareHead.map(x => `<span role="columnheader">${esc(x)}</span>`).join('')}</div>${c.compare.map(r => `<div role="row" class="bundle-row">${r.map((x, i) => `<span role="${i ? 'cell' : 'rowheader'}"${i ? ` data-label="${esc(c.compareHead[i])}"` : ''}>${esc(x)}</span>`).join('')}</div>`).join('')}</div>`)}
      ${section(c.fairTitle, grid(c.fair), 'audience-loss')}
      ${section(pick(lang, 'Модели и аренда в каталоге', 'Models and rental in the catalogue'), links(lang, ctx, ['hardware/', 'shop/', 'private-ai/']), 'audience-next')}
      ${renderCapacity(lang, p, ctx)}
      ${renderFAQ(lang, p, ctx)}
      ${close(lang, p, ctx, c.closeTitle, c.closeText)}`;
  } else if (route === 'import/') {
    body = `${trustStrip(lang)}
      ${section(c.catsTitle, `<div class="loss-grid cat-grid">${c.cats.map(([t, d], i) => `<article><span class="loss-index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join('')}</div>`, 'audience-loss')}
      ${section(c.stepsTitle, steps(c.steps), 'audience-flow')}
      ${section(c.whyTitle, grid(c.why), 'audience-loss')}
      <aside class="wrap audience-note"><p>${esc(c.notice)}</p></aside>
      ${renderCapacity(lang, p, ctx)}
      ${renderFAQ(lang, p, ctx)}
      ${section(pick(lang, 'Что логично сделать дальше', 'What to do next'), links(lang, ctx, ['hardware/', 'shop/', 'enterprise/']), 'audience-next')}
      ${close(lang, p, ctx, c.closeTitle, c.closeText)}`;
  } else if (route === 'shop/') {
    body = `${trustStrip(lang)}${renderShop(lang, ctx)}${renderFAQ(lang, p, ctx)}
      ${section(pick(lang, 'Не нашли нужное?', 'Can’t find it?'), links(lang, ctx, ['private-ai/', 'hardware/']), 'audience-next')}`;
  } else if (p.industry) {
    const k = c.case;
    body = `${trustStrip(lang)}
      ${section(pick(lang, 'Риски отрасли', 'Industry risks'), grid(c.risks), 'audience-loss')}
      ${renderFines(lang)}
      ${section(pick(lang, 'Что можно доверить ИИ', 'What AI can take on'), `<div class="service-grid audience-benefits">${c.uses.map(([t, d]) => `<article><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join('')}</div>`)}
      <section class="section wrap audience-section case-sim"><p class="loss-badge">${pick(lang, 'Смоделированный кейс', 'Simulated case')}</p><h2>${esc(k.title)}</h2>
        <div class="case-sim-grid"><div><small>${pick(lang, 'Клиент', 'Client')}</small><p>${esc(k.client)}</p><small>${pick(lang, 'Задача', 'Task')}</small><p>${esc(k.task)}</p><small>${pick(lang, 'Решение', 'Solution')}</small><p>${esc(k.solution)}</p></div>
        <div class="case-sim-results"><small>${pick(lang, 'Иллюстративные результаты', 'Illustrative results')}</small><ul class="package-includes">${k.results.map(r => `<li><span aria-hidden="true">✓</span>${esc(r)}</li>`).join('')}</ul></div></div>
        <p class="audience-note-line">${pick(lang, 'Компания и показатели вымышлены и показывают возможный проект, а не результаты конкретного внедрения.', 'The company and figures are fictional and show a possible project, not results of a specific deployment.')}</p></section>
      ${section(pick(lang, 'Форматы', 'Formats'), cards(lang, ctx, enterprisePages[0][lang].tiers, { label, cls: 'tiers' }))}
      ${renderCapacity(lang, p, ctx)}
      ${renderFAQ(lang, p, ctx)}
      ${section(pick(lang, 'Другие отрасли', 'Other industries'), links(lang, ctx, industries.filter(r => r !== route).slice(0, 3)), 'audience-next')}
      ${close(lang, p, ctx, pick(lang, 'Обсудим пилот для вашей компании', 'Let’s discuss a pilot for your company'), pick(lang, 'Начинаем с бесплатной диагностики одного процесса. Решение о пилоте принимаете после.', 'We start with a free discovery of one process. You decide on a pilot afterwards.'))}`;
  }
  return `<article class="audience-page enterprise-page">${hero(lang, p, ctx, false)}${body}</article>`;
}

export { pageArt };
