// Магазин Devlarion: услуги + железо NVIDIA и Apple, хранение и сеть (покупка под заказ и аренда).
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
  ['order', ['Техника под заказ', 'Equipment to order'], [
    ['import-any', ['Любая рабочая техника под заказ, в том числе из Китая', 'Any working equipment to order, including from China'], null, ['Серверы, станции, сеть, торговое и промышленное оборудование: подбор, проверка, доставка, ввоз, запуск', 'Servers, workstations, network, retail and industrial equipment: sourcing, checking, delivery, import, commissioning'], 'layers'],
  ]],
  ['care', ['Сопровождение', 'Support'], [
    ['care-site', ['Сопровождение сайта', 'Website support'], ['support', 'small'], ['Правки, мониторинг, обновления', 'Edits, monitoring, updates'], 'support', 'month'],
    ['care-ai', ['Сопровождение ИИ-сервиса', 'AI service support'], 30000, ['Обновления моделей и мониторинг', 'Model updates and monitoring'], 'support', 'month'],
  ]],
];

// ---------- Железо ----------
// market — диапазон цен российских поставщиков (ноябрь 2026), rub — наша цена с настройкой.
export const hardware = [
  { id: 'dgx-spark', mode: 'buy', art: 'spark', rub: 939000, market: [710000, 950000],
    more: { ru: [['Для кого', 'Разработчик, аналитик или небольшой отдел, которому нужен свой ИИ без облака.'], ['Какие модели потянет', 'Llama, Qwen, DeepSeek до ~200 млрд параметров в формате FP4; дообучение моделей до ~70 млрд.'], ['Размер и питание', '150 × 150 × 50,5 мм, 1,2 кг, до 240 Вт — работает от обычной розетки.'], ['Что делаем мы', 'Поставка, настройка DGX OS, развёртывание модели и API, подключение к вашим системам, гарантия на нашу работу.']], en: [['Who it is for', 'A developer, analyst or small team that wants its own AI without the cloud.'], ['Models it runs', 'Llama, Qwen, DeepSeek up to ~200B parameters in FP4; fine-tuning up to ~70B.'], ['Size and power', '150 × 150 × 50.5 mm, 1.2 kg, up to 240 W from a normal socket.'], ['What we do', 'Supply, DGX OS set-up, model and API deployment, integration, warranty on our work.']] },
    ru: ['NVIDIA DGX Spark', 'Персональный ИИ-суперкомпьютер размером с книгу. Запускает модели до ~200 млрд параметров локально.', ['Grace Blackwell GB10', '128 ГБ единой памяти', 'SSD 4 ТБ', 'До 1 PFLOP FP4']],
    en: ['NVIDIA DGX Spark', 'A personal AI supercomputer the size of a book. Runs models up to ~200B parameters locally.', ['Grace Blackwell GB10', '128 GB unified memory', '4 TB SSD', 'Up to 1 PFLOP FP4']] },
  { id: 'gb10-oem', mode: 'buy', art: 'spark-dark', rub: 715000, market: [660000, 720000],
    ru: ['GB10 от партнёров NVIDIA', 'Тот же чип GB10 в корпусах ASUS, Gigabyte и других производителей — дешевле оригинала.', ['Grace Blackwell GB10', '128 ГБ единой памяти', 'SSD 1–4 ТБ', 'Совместим с DGX OS']],
    en: ['GB10 from NVIDIA partners', 'The same GB10 chip in ASUS, Gigabyte and other cases, cheaper than the original.', ['Grace Blackwell GB10', '128 GB unified memory', '1–4 TB SSD', 'DGX OS compatible']] },
  { id: 'spark-cluster', mode: 'buy', art: 'spark-duo', rub: 1955000, market: [1900000, 1960000],
    more: { ru: [['Для кого', 'Отдел, которому мало одного Spark: большие модели или несколько пользователей.'], ['Какие модели потянет', 'До ~405 млрд параметров в FP4 при распределённом inference.'], ['Связка', 'Два устройства соединяются напрямую через ConnectX-7 (200 Гбит/с).'], ['Что делаем мы', 'Сборка кластера, распределённый inference, балансировка, мониторинг.']], en: [['Who it is for', 'A team that outgrows one Spark: large models or several users.'], ['Models it runs', 'Up to ~405B parameters in FP4 with distributed inference.'], ['Link', 'The two units connect directly over ConnectX-7 (200 Gb/s).'], ['What we do', 'Cluster assembly, distributed inference, load balancing, monitoring.']] },
    ru: ['Кластер из двух DGX Spark', 'Два Spark, связанные 200-гигабитной сетью: модели до ~400 млрд параметров.', ['2× GB10', '256 ГБ памяти суммарно', 'Связка ConnectX-7', 'Настроенный распределённый inference']],
    en: ['Two-unit DGX Spark cluster', 'Two Sparks linked over 200 Gb networking: models up to ~400B parameters.', ['2× GB10', '256 GB memory in total', 'ConnectX-7 link', 'Distributed inference set up']] },
  // Apple. Линейка на 22.11.2026: Mac mini на M6 и M5 Pro (анонс 25.08.2026, продажи с 22.09.2026),
  // M4 и M4 Pro сняты с производства 25.08.2026, но M4 ещё продаётся из остатков — по просьбе владельца добавлен как бюджетный вариант.
  // Отдельного Mac mini на «простом» M5 нет.
  // configs[].market — минимум и максимум открытых цен за эту конфигурацию у российских продавцов, rub — наша цена.
  { id: 'mac-mini', mode: 'buy', art: 'spark-dark',
    sources: { date: '2026-11-22', urls: [
      'https://re-store.ru/kompyutery-noutbuki/apple/mac-mini/ — M6 16/256 129 990 ₽, 16/512 154 990 ₽, 24/512 179 990 ₽; M5 Pro 24/512 249 990 ₽',
      'https://www.dns-shop.ru/product/52672b21a61896f9/mini-pk-apple-mac-mini-m5-pro-mhqn4/ — M5 Pro 24/512 245 999 ₽',
      'https://hi-tech.mail.ru/news/154244-raskryty-rossijskie-ceny-novyh-mac-vplot-do-875-tys-rublej/ — DNS/«СДЭК Шоппинг» на старте: M6 141 999 / 170 999 / 199 999 ₽, M5 Pro 24/512 271 999 ₽',
      'https://applegod.ru/shop/nastolnyy-kompyuter-apple-mac-mini-m6-12-yader-tsp-12-yader-gp-16-gb-256-gb-ssd-serebristyy-mhqk4/ — M6 16/256 77 890 ₽',
      'https://store-apple.msk.ru/mac/mac-mini/mac-mini-m6/ — M6 24/512 158 779 ₽',
      'https://apple-store.net.ru/mac/apple-mac-mini/mac-mini-m5-pro/ — M5 Pro 24/512 158 552 ₽, 48/512 254 507–255 739 ₽, 64 ГБ/1 ТБ 340 413–391 551 ₽',
      'https://store-apple.msk.ru/mac/mac-mini/mac-mini-m5-pro/ — M5 Pro 48/512 255 616 ₽, 64 ГБ/1 ТБ 340 249 ₽',
      'https://i-ray.ru/mac_mini — M5 Pro 48/512 254 999 ₽',
      'M4 (поиск 22.11.2026): https://re-store.ru/catalog/MU9D3/ — 16/256 99 990 ₽; https://www.icases.ru/catalog/kompyutery_noutbuki/macmini/sistemnyy_blok_apple_mac_mini_m4_16_256_mu9d3/ — 63 990 ₽; https://applegod.ru/shop/nastolnyy-kompyuter-apple-mac-mini-m4-10c-cpu-10c-gpu-16gb-256gb-ssd-serebristyy-mu9d3/ — 72 590 ₽',
      'M4: https://apple-market.ru/mac/mac-mini/ — 16/512 77 090 ₽; https://i-ray.ru/mac-mini-m4-2024-16-512-gb — 79 999 ₽; https://lab-store40.ru/catalog/mac-mini-m4/mac-mini-m4-16-512-silver-2024/ — 92 990 ₽; https://mac-mini.ru/modeli/mac-mini-m4/m4-24-512/ — 24/512 от 84 990 ₽; https://labburo.ru/catalog/mac-mini/mac-mini-m4/apple-mac-mini-m4-24-512gb/ — 109 990 ₽; lab-store40 — 137 990 ₽',
      'https://www.apple.com/newsroom/2026/09/the-new-mac-mini-and-mac-studio-are-available-today/ — справочно: M6 от $899, M5 Pro от $1 699',
    ] },
    chips: {
      M4: { ru: 'M4: 10 ядер CPU, 10 ядер GPU, до 32 ГБ памяти, 120 ГБ/с. Прошлое поколение из остатков — самый доступный вход: модели до ~8–14 млрд параметров в 4 бит.', en: 'M4: 10-core CPU, 10-core GPU, up to 32 GB, 120 GB/s. Previous generation from remaining stock, the cheapest entry: models up to ~8–14B parameters in 4-bit.' },
      M6: { ru: 'M6: 12 ядер CPU, 12 ядер GPU, до 32 ГБ памяти, 170 ГБ/с. Модели до ~14 млрд параметров в 4 бит.', en: 'M6: 12-core CPU, 12-core GPU, up to 32 GB, 170 GB/s. Models up to ~14B parameters in 4-bit.' },
      'M5 Pro': { ru: 'M5 Pro: до 18 ядер CPU и 20 ядер GPU, до 64 ГБ памяти, 307 ГБ/с, Thunderbolt 5. С 64 ГБ — модели до ~70 млрд в 4 бит.', en: 'M5 Pro: up to 18-core CPU and 20-core GPU, up to 64 GB, 307 GB/s, Thunderbolt 5. With 64 GB: models up to ~70B in 4-bit.' },
    },
    configs: [
      { k: 'm4-16-256', chip: 'M4', ru: '16 ГБ · SSD 256 ГБ', en: '16 GB · 256 GB SSD', rub: 89900, market: [63990, 99990] },
      { k: 'm4-16-512', chip: 'M4', ru: '16 ГБ · SSD 512 ГБ', en: '16 GB · 512 GB SSD', rub: 99900, market: [77090, 92990] },
      { k: 'm4-24-512', chip: 'M4', ru: '24 ГБ · SSD 512 ГБ', en: '24 GB · 512 GB SSD', rub: 124900, market: [84990, 137990] },
      { k: 'm4-24-1t', chip: 'M4', ru: '24 ГБ · SSD 1 ТБ', en: '24 GB · 1 TB SSD', rub: null, market: null },
      { k: 'm4-32-2t', chip: 'M4', ru: '32 ГБ · SSD 2 ТБ', en: '32 GB · 2 TB SSD', rub: null, market: null },
      { k: 'm6-16-256', chip: 'M6', ru: '16 ГБ · SSD 256 ГБ', en: '16 GB · 256 GB SSD', rub: 134900, market: [77890, 141999] },
      { k: 'm6-16-512', chip: 'M6', ru: '16 ГБ · SSD 512 ГБ', en: '16 GB · 512 GB SSD', rub: 164900, market: [154990, 170999] },
      { k: 'm6-24-512', chip: 'M6', ru: '24 ГБ · SSD 512 ГБ', en: '24 GB · 512 GB SSD', rub: 189900, market: [158779, 199999] },
      { k: 'm6-24-1t', chip: 'M6', ru: '24 ГБ · SSD 1 ТБ', en: '24 GB · 1 TB SSD', rub: null, market: null },
      { k: 'm6-32-2t', chip: 'M6', ru: '32 ГБ · SSD 2 ТБ', en: '32 GB · 2 TB SSD', rub: null, market: null },
      { k: 'm5p-24-512', chip: 'M5 Pro', ru: '24 ГБ · SSD 512 ГБ', en: '24 GB · 512 GB SSD', rub: 244900, market: [158552, 249990] },
      { k: 'm5p-48-512', chip: 'M5 Pro', ru: '48 ГБ · SSD 512 ГБ', en: '48 GB · 512 GB SSD', rub: 259900, market: [254507, 255739] },
      { k: 'm5p-64-1t', chip: 'M5 Pro', ru: '64 ГБ · SSD 1 ТБ · 18/20 ядер', en: '64 GB · 1 TB SSD · 18/20 cores', rub: 384900, market: [340249, 391551] },
      { k: 'm5p-48-1t', chip: 'M5 Pro', ru: '48 ГБ · SSD 1 ТБ', en: '48 GB · 1 TB SSD', rub: null, market: null },
      { k: 'm5p-64-2t', chip: 'M5 Pro', ru: '64 ГБ · SSD 2 ТБ', en: '64 GB · 2 TB SSD', rub: null, market: null },
    ],
    more: { ru: [['Для кого', 'Небольшой офис или отдел: ИИ-помощник по документам, расшифровка встреч, поиск по базе знаний — без облака и без серверной.'], ['Какую версию брать', 'M4 — самый доступный вход для одного сотрудника. M6 — для одного-двух сотрудников и моделей до ~14 млрд параметров. M5 Pro с 48–64 ГБ — для команды и моделей уровня 30–70 млрд в 4 бит.'], ['Связка', 'Несколько Mac mini на M5 Pro объединяются через Thunderbolt 5 в кластер; соберём его с 10-гигабитным коммутатором.'], ['Что делаем мы', 'Поставка, настройка macOS, Ollama/LM Studio/MLX, развёртывание модели и OpenAI-совместимого API, подключение к вашим системам, гарантия на нашу работу.']], en: [['Who it is for', 'A small office or team: a document assistant, meeting transcription, knowledge-base search, with no cloud and no server room.'], ['Which version', 'M4 is the cheapest entry for one person. M6 for one or two people and models up to ~14B. M5 Pro with 48–64 GB for a team and 30–70B models in 4-bit.'], ['Linking', 'Several M5 Pro Mac minis can be clustered over Thunderbolt 5; we set it up with a 10 Gb switch.'], ['What we do', 'Supply, macOS set-up, Ollama/LM Studio/MLX, model and OpenAI-compatible API deployment, integration, warranty on our work.']] },
    ru: ['Apple Mac mini', 'Компактный и тихий компьютер для локальных ИИ-моделей: помощник по документам и базе знаний прямо в офисе.', ['Чип M4, M6 или M5 Pro', 'Единая память 16–64 ГБ', 'Ethernet 2,5 Гбит/с, Wi‑Fi 7', 'Модель и API настроены']],
    en: ['Apple Mac mini', 'A compact, quiet computer for local AI models: a document and knowledge-base assistant right in the office.', ['M4, M6 or M5 Pro chip', '16–64 GB unified memory', '2.5 Gb Ethernet, Wi‑Fi 7', 'Model and API set up']] },
  { id: 'mac-studio', mode: 'buy', art: 'spark-dark',
    sources: { date: '2026-11-22', urls: [
      'https://re-store.ru/kompyutery-noutbuki/apple/mac-studio/ — M5 Max 36/512 399 990 ₽, M5 Ultra 96 ГБ/1 ТБ 899 990 ₽',
      'https://hi-tech.mail.ru/news/154244-raskryty-rossijskie-ceny-novyh-mac-vplot-do-875-tys-rublej/ — DNS/«СДЭК Шоппинг» на старте: M5 Max 36/512 388 999 ₽, M5 Ultra 96 ГБ/1 ТБ 874 999 ₽',
      'https://apple-store.net.ru/mac/mac-studio/mac-studio-m5-max/ — M5 Max 36/512 261 963 ₽',
      'https://rifastore.ru/categories/mac-studio-m5-max — M5 Max 128 ГБ/1 ТБ 667 000 ₽',
      'https://t-bazar.ru/catalog/mac-apple/apple-mac-studio/mac-studio-m5-max-128gb-1tb-18cpu-40gpu/ — 693 600 ₽; https://www.obstore.ru/catalog/mac-studio/ — 700 000 ₽',
      'https://my-apple-store.ru/macbook/mac-studio-m5-max-2026/ — M5 Max 128 ГБ/1 ТБ 730 000 ₽',
      'https://my-apple-store.ru/macbook/mac-studio-m5-ultra-2026/ — M5 Ultra 96 ГБ/1 ТБ 853 000 ₽; https://apple-market.ru/mac/mac-studio/ — 879 890 ₽',
      'https://www.apple.com/newsroom/2026/08/apple-introduces-new-mac-studio-with-m5-max-and-m5-ultra/ — справочно: M5 Max от $2 499, M5 Ultra от $5 499, до 512 ГБ памяти',
    ] },
    chips: {
      'M5 Max': { ru: 'M5 Max: 18 ядер CPU, до 40 ядер GPU, до 128 ГБ памяти, до 614 ГБ/с. Со 128 ГБ — модели до ~120 млрд параметров в 4 бит.', en: 'M5 Max: 18-core CPU, up to 40-core GPU, up to 128 GB, up to 614 GB/s. With 128 GB: models up to ~120B parameters in 4-bit.' },
      'M5 Ultra': { ru: 'M5 Ultra: до 36 ядер CPU и 80 ядер GPU, 1,2 ТБ/с. Версии с 256–512 ГБ памяти — по запросу.', en: 'M5 Ultra: up to 36-core CPU and 80-core GPU, 1.2 TB/s. 256–512 GB versions on request.' },
    },
    configs: [
      { k: 'max-36-512', chip: 'M5 Max', ru: '36 ГБ · SSD 512 ГБ · 32 ядра GPU', en: '36 GB · 512 GB SSD · 32-core GPU', rub: 389900, market: [261963, 399990] },
      { k: 'max-128-1t', chip: 'M5 Max', ru: '128 ГБ · SSD 1 ТБ · 40 ядер GPU', en: '128 GB · 1 TB SSD · 40-core GPU', rub: 724900, market: [667000, 730000] },
      { k: 'ultra-96-1t', chip: 'M5 Ultra', ru: '96 ГБ · SSD 1 ТБ · 30/64 ядра', en: '96 GB · 1 TB SSD · 30/64 cores', rub: 894900, market: [853000, 899990] },
    ],
    more: { ru: [['Для кого', 'Отдел, которому мало Mac mini: модели на десятки миллиардов параметров, несколько пользователей, генерация изображений.'], ['Какие модели потянет', 'M5 Max со 128 ГБ — модели до ~120 млрд параметров в 4 бит; M5 Ultra — крупнее и быстрее, особенно на длинном контексте.'], ['Связка', 'Несколько Mac Studio объединяются в кластер через Thunderbolt 5 с RDMA — так делают для самых больших открытых моделей.'], ['Что делаем мы', 'Поставка, настройка, развёртывание модели и API, подключение к RAG и вашим системам, мониторинг, гарантия на нашу работу.']], en: [['Who it is for', 'A team that outgrows a Mac mini: tens-of-billions-parameter models, several users, image generation.'], ['Models it runs', 'M5 Max with 128 GB: models up to ~120B in 4-bit; M5 Ultra: bigger and faster, especially with long context.'], ['Linking', 'Several Mac Studios can be clustered over Thunderbolt 5 with RDMA for the largest open models.'], ['What we do', 'Supply, set-up, model and API deployment, RAG and system integration, monitoring, warranty on our work.']] },
    ru: ['Apple Mac Studio', 'Настольная станция с большой единой памятью: крупные открытые модели локально, тихо и без серверной.', ['Чип M5 Max или M5 Ultra', 'Единая память 36–128 ГБ и больше', 'Thunderbolt 5, Wi‑Fi 7', 'Модель и API настроены']],
    en: ['Apple Mac Studio', 'A desktop station with large unified memory: big open models locally, quietly and without a server room.', ['M5 Max or M5 Ultra chip', '36–128 GB unified memory and more', 'Thunderbolt 5, Wi‑Fi 7', 'Model and API set up']] },
  { id: 'rtx-pro-ws', mode: 'buy', art: 'workstation', rub: 3150000, market: [2500000, 3200000],
    more: { ru: [['Для кого', 'Компания, которой нужна быстрая модель для RAG, генерации и дообучения у себя в офисе.'], ['Какие модели потянет', 'До ~70 млрд параметров в 8 бит на одной карте с 96 ГБ; быстрая генерация изображений и видео.'], ['Охлаждение и шум', 'Подбираем корпус и охлаждение под офис, а не под серверную.'], ['Что делаем мы', 'Сборка, тест под нагрузкой, драйверы, vLLM, API, гарантия на сборку и работу.']], en: [['Who it is for', 'A company that needs a fast model for RAG, generation and fine-tuning on site.'], ['Models it runs', 'Up to ~70B parameters in 8-bit on one 96 GB card; fast image and video generation.'], ['Cooling and noise', 'Case and cooling chosen for an office, not a server room.'], ['What we do', 'Build, load test, drivers, vLLM, API, warranty on the build and our work.']] },
    ru: ['Рабочая станция с RTX PRO 6000 Blackwell', 'Самая мощная видеокарта для рабочих станций: 96 ГБ памяти на одной карте.', ['RTX PRO 6000 96 ГБ GDDR7', 'Процессор и ОЗУ под задачу', 'Тихое охлаждение', 'Для RAG, дообучения и генерации']],
    en: ['RTX PRO 6000 Blackwell workstation', 'The most powerful workstation GPU: 96 GB on a single card.', ['RTX PRO 6000 96 GB GDDR7', 'CPU and RAM sized to the task', 'Quiet cooling', 'For RAG, fine-tuning and generation']] },
  { id: 'rtx5090-ws', mode: 'buy', art: 'workstation', rub: 1490000, market: [1030000, 1550000],
    ru: ['ИИ-станция на RTX 5090 32 ГБ', 'Доступный вход в локальный ИИ: модели до ~30 млрд параметров, генерация изображений, эксперименты.', ['GeForce RTX 5090 32 ГБ', 'Ryzen 9 / 64–128 ГБ ОЗУ', 'NVMe 2–4 ТБ', 'Настроенная среда для моделей']],
    en: ['RTX 5090 32 GB AI workstation', 'An affordable start in local AI: models up to ~30B parameters, image generation, experiments.', ['GeForce RTX 5090 32 GB', 'Ryzen 9 / 64–128 GB RAM', '2–4 TB NVMe', 'Model environment set up']] },
  { id: 'rtx-pro-server', mode: 'buy', art: 'rack4', rub: 12300000, market: [10500000, 12500000],
    more: { ru: [['Для кого', 'Отдел или компания: несколько моделей и десятки пользователей одновременно.'], ['Какие модели потянет', 'Модели до ~200 млрд параметров или несколько моделей поменьше параллельно.'], ['Размещение', 'Ваша серверная или ЦОД партнёра в России; резервное питание.'], ['Что делаем мы', 'Подбор платформы, поставка, монтаж в стойку, настройка, мониторинг, SLA.']], en: [['Who it is for', 'A department or company: several models and dozens of users at once.'], ['Models it runs', 'Models up to ~200B parameters or several smaller ones in parallel.'], ['Hosting', 'Your server room or a partner data centre in Russia; redundant power.'], ['What we do', 'Platform choice, supply, rack mounting, set-up, monitoring, SLA.']] },
    ru: ['Сервер 4× RTX PRO 6000 Server Edition', 'Стоечный сервер для отдела или всей компании: 384 ГБ видеопамяти.', ['4× RTX PRO 6000 96 ГБ', '2U/4U, стойка 19″', 'Резервные блоки питания', 'Несколько моделей одновременно']],
    en: ['4× RTX PRO 6000 Server Edition', 'A rack server for a department or company: 384 GB of GPU memory.', ['4× RTX PRO 6000 96 GB', '2U/4U, 19″ rack', 'Redundant power', 'Several models at once']] },
  { id: 'hgx-h200', mode: 'buy', art: 'hgx', rub: 68900000, market: [34000000, 72000000],
    more: { ru: [['Для кого', 'Крупная компания: обучение своих моделей и высокая нагрузка на inference.'], ['Какие модели потянет', 'Обучение и дообучение крупных моделей; inference моделей на сотни миллиардов параметров.'], ['Требования', 'Стойка, питание порядка 10 кВт и охлаждение ЦОД — проверим площадку заранее.'], ['Что делаем мы', 'Подбор вендора, поставка, монтаж, сеть, планировщик задач, сопровождение по SLA.']], en: [['Who it is for', 'A large company: training its own models and heavy inference load.'], ['Models it runs', 'Training and fine-tuning large models; inference for models with hundreds of billions of parameters.'], ['Requirements', 'A rack, around 10 kW of power and data-centre cooling — we check the site first.'], ['What we do', 'Vendor choice, supply, mounting, networking, job scheduler, SLA support.']] },
    ru: ['Сервер HGX 8× H200', 'Флагман для обучения и тяжёлого inference: 1,1 ТБ памяти HBM3e.', ['8× H200 SXM 141 ГБ', 'NVLink между GPU', '2× AMD EPYC или Intel Xeon', 'Сеть 400G по запросу']],
    en: ['HGX 8× H200 server', 'The flagship for training and heavy inference: 1.1 TB of HBM3e.', ['8× H200 SXM 141 GB', 'NVLink between GPUs', '2× AMD EPYC or Intel Xeon', '400G networking on request']] },
  { id: 'dgx-b200', mode: 'buy', art: 'hgx', rub: null, market: null,
    ru: ['NVIDIA DGX B200', 'Система нового поколения Blackwell для ИИ-фабрик. Поставка и цена — только по запросу.', ['8× B200', '1,4 ТБ памяти HBM3e', 'NVLink 5', 'Для крупных компаний и ЦОД']],
    en: ['NVIDIA DGX B200', 'Next-generation Blackwell system for AI factories. Supply and price on request.', ['8× B200', '1.4 TB HBM3e', 'NVLink 5', 'For large companies and data centres']] },
  { id: 'park-s', mode: 'buy', art: 'spark-duo', rub: 3890000, market: null,
    more: { ru: [['Состав', '4× DGX Spark, коммутатор 200 Гбит/с, стеллаж, ИБП.'], ['Для кого', 'Отдел до 30–50 человек: несколько моделей до ~200 млрд параметров одновременно.'], ['Что делаем мы', 'Сборка, сеть, распределение моделей по узлам, единый API, мониторинг.']], en: [['Contents', '4× DGX Spark, a 200 Gb/s switch, shelf, UPS.'], ['Who it is for', 'A team of up to 30–50 people: several models up to ~200B parameters at once.'], ['What we do', 'Assembly, networking, model placement, one API, monitoring.']] },
    ru: ['DGX-парк S: 4× DGX Spark', 'Компактный парк под столом или в кабинете: свой ИИ для отдела без серверной.', ['4× GB10, 512 ГБ памяти', 'Коммутатор и ИБП', 'Единый API', 'Монтаж и настройка']],
    en: ['DGX fleet S: 4× DGX Spark', 'A compact fleet under a desk or in an office: AI for a team without a server room.', ['4× GB10, 512 GB memory', 'Switch and UPS', 'One API', 'Installation and set-up']] },
  { id: 'park-m', mode: 'buy', art: 'hgx', rub: 139900000, market: null,
    more: { ru: [['Состав', '2× HGX 8× H200 в одной стойке, сеть 400G, СХД, ИБП.'], ['Для кого', 'Компания, которая обучает свои модели и обслуживает сотни пользователей.'], ['Что делаем мы', 'Проект площадки, поставка, монтаж, сеть, планировщик задач, SLA.']], en: [['Contents', '2× HGX 8× H200 in one rack, 400G network, storage, UPS.'], ['Who it is for', 'A company training its own models and serving hundreds of users.'], ['What we do', 'Site design, supply, mounting, networking, scheduler, SLA.']] },
    ru: ['DGX-парк M: 2× HGX H200', 'Стойка с двумя 8-GPU серверами: 16 GPU и 2,2 ТБ памяти HBM3e.', ['16× H200', 'Сеть 400G', 'СХД под датасеты', 'Сопровождение по SLA']],
    en: ['DGX fleet M: 2× HGX H200', 'A rack with two 8-GPU servers: 16 GPUs and 2.2 TB of HBM3e.', ['16× H200', '400G networking', 'Storage for datasets', 'SLA support']] },
  { id: 'park-l', mode: 'buy', art: 'hgx', rub: null, market: null,
    more: { ru: [['Состав', 'От трёх стоек DGX-класса, сеть, охлаждение и питание под проект.'], ['Для кого', 'Крупная компания или ЦОД, которому нужна собственная ИИ-фабрика.'], ['Что делаем мы', 'Проект, поставки, монтаж, ввод в эксплуатацию, сопровождение.']], en: [['Contents', 'Three or more DGX-class racks, networking, cooling and power per project.'], ['Who it is for', 'A large company or data centre that needs its own AI factory.'], ['What we do', 'Design, supply, mounting, commissioning, support.']] },
    ru: ['DGX-парк L: от трёх стоек', 'Собственная ИИ-фабрика под ключ. Состав и цена — после обследования площадки.', ['От 24 GPU', 'Проект охлаждения и питания', 'Сеть InfiniBand или 400G', 'Ввод в эксплуатацию']],
    en: ['DGX fleet L: three racks and up', 'Your own turnkey AI factory. Scope and price after a site survey.', ['24+ GPUs', 'Cooling and power design', 'InfiniBand or 400G', 'Commissioning']] },
  { id: 'oem-servers', mode: 'buy', art: 'rack4', rub: null, market: null,
    ru: ['Готовые GPU-серверы Dell, Supermicro, Lenovo, HPE, xFusion', 'Подберём платформу под ваш ЦОД, бюджет и требования к поставщику, привезём и настроим.', ['От 2 до 8 GPU', 'NVIDIA H100/H200/B200 или RTX PRO', 'Гарантия производителя или партнёра', 'Под ваш стандарт стойки и питания']],
    en: ['Ready GPU servers from Dell, Supermicro, Lenovo, HPE, xFusion', 'We pick a platform for your data centre, budget and vendor policy, then deliver and set it up.', ['2 to 8 GPUs', 'NVIDIA H100/H200/B200 or RTX PRO', 'Vendor or partner warranty', 'Fits your rack and power standard']] },
  { id: 'amd-mi300x', mode: 'buy', art: 'hgx', rub: null, market: null,
    ru: ['Сервер 8× AMD Instinct MI300X', 'Альтернатива NVIDIA с 192 ГБ памяти на ускоритель — для больших моделей и inference.', ['8× MI300X 192 ГБ', '1,5 ТБ HBM3 суммарно', 'ROCm и vLLM', 'Поставка и цена по запросу']],
    en: ['8× AMD Instinct MI300X server', 'An NVIDIA alternative with 192 GB per accelerator, for large models and inference.', ['8× MI300X 192 GB', '1.5 TB HBM3 in total', 'ROCm and vLLM', 'Supply and price on request']] },
  // Инфраструктура рядом с ИИ-железом: хранилище и сеть. Цены собраны 22.11.2026.
  // MacBook — «под запрос»: цену не показываем, только конфигурацию. Линейка на 23.11.2026:
  // Air — M5, 13,6" и 15,3" (newsroom 03.03.2026, SSD от 512 ГБ до 4 ТБ);
  // Pro — 14" на M6 (Liquid Retina XDR), 14"/16" на M5 Pro и M5 Max (Liquid Retina XDR или PROLED XDR с Touch, newsroom 28.10.2026).
  { id: 'macbook-air', mode: 'buy', art: 'spark-dark', rub: null, market: null,
    sources: { date: '2026-11-23', urls: ['https://www.apple.com/newsroom/2026/03/apple-introduces-the-new-macbook-air-with-m5/'] },
    opts: {
      groups: [
        ['chip', ['Чип', 'Chip'], [['M5', 'M5', 'M5']]],
        ['size', ['Диагональ', 'Screen'], [['13', '13,6″', '13.6″'], ['15', '15,3″', '15.3″']]],
        ['mem', ['Память', 'Memory'], [['16', '16 ГБ', '16 GB'], ['24', '24 ГБ', '24 GB'], ['32', '32 ГБ', '32 GB']]],
        ['ssd', ['SSD', 'SSD'], [['512', '512 ГБ', '512 GB'], ['1t', '1 ТБ', '1 TB'], ['2t', '2 ТБ', '2 TB'], ['4t', '4 ТБ', '4 TB']]],
      ],
      allow: {},
      notes: { M5: { ru: 'M5: 10 ядер CPU, до 10 ядер GPU с нейроускорителями, 153 ГБ/с. Без вентилятора — полная тишина.', en: 'M5: 10-core CPU, up to 10-core GPU with Neural Accelerators, 153 GB/s. Fanless and silent.' } },
    },
    more: { ru: [['Для кого', 'Руководитель, менеджер, юрист, аналитик: документы, переписка и ИИ-помощник в дороге.'], ['Как выбрать', '13,6″ — лёгкий и компактный, 15,3″ — больше места для таблиц. 24–32 ГБ памяти — если нужны локальные ИИ-модели.'], ['Что делаем мы', 'Поставка, настройка под вашу компанию: учётные записи, шифрование диска, VPN, офисные программы, локальный ИИ-помощник.']], en: [['Who it is for', 'Executives, managers, lawyers, analysts: documents, mail and an AI assistant on the go.'], ['How to choose', '13.6″ is light and compact, 15.3″ gives more room for spreadsheets. 24–32 GB if you want local AI models.'], ['What we do', 'Supply and company set-up: accounts, disk encryption, VPN, office apps, a local AI assistant.']] },
    ru: ['Apple MacBook Air', 'Лёгкий и бесшумный ноутбук для работы и ИИ-помощника. Соберём конфигурацию и назовём цену под запрос.', ['Чип M5', 'Экран 13,6″ или 15,3″', 'Память 16–32 ГБ', 'SSD до 4 ТБ']],
    en: ['Apple MacBook Air', 'A light, silent laptop for work and an AI assistant. We put the configuration together and quote on request.', ['M5 chip', '13.6″ or 15.3″ screen', '16–32 GB memory', 'Up to 4 TB SSD']] },
  { id: 'macbook-pro', mode: 'buy', art: 'spark-dark', rub: null, market: null,
    sources: { date: '2026-11-23', urls: ['https://www.apple.com/newsroom/2026/10/apple-unveils-groundbreaking-macbook-pro-with-proled-xdr-display/', 'https://support.apple.com/en-us/126319'] },
    opts: {
      groups: [
        ['chip', ['Чип', 'Chip'], [['M6', 'M6', 'M6'], ['M5 Pro', 'M5 Pro', 'M5 Pro'], ['M5 Max', 'M5 Max', 'M5 Max']]],
        ['size', ['Диагональ', 'Screen'], [['14', '14,2″', '14.2″'], ['16', '16,2″', '16.2″']]],
        ['screen', ['Экран', 'Display'], [['xdr', 'Liquid Retina XDR', 'Liquid Retina XDR'], ['proled', 'PROLED XDR, сенсорный', 'PROLED XDR, touch']]],
        ['mem', ['Память', 'Memory'], [['16', '16 ГБ', '16 GB'], ['24', '24 ГБ', '24 GB'], ['32', '32 ГБ', '32 GB'], ['36', '36 ГБ', '36 GB'], ['48', '48 ГБ', '48 GB'], ['64', '64 ГБ', '64 GB'], ['128', '128 ГБ', '128 GB']]],
        ['ssd', ['SSD', 'SSD'], [['512', '512 ГБ', '512 GB'], ['1t', '1 ТБ', '1 TB'], ['2t', '2 ТБ', '2 TB'], ['4t', '4 ТБ', '4 TB'], ['8t', '8 ТБ', '8 TB']]],
      ],
      allow: {
        M6: { size: ['14'], screen: ['xdr'], mem: ['16', '24', '32'], ssd: ['512', '1t', '2t', '4t'] },
        'M5 Pro': { mem: ['24', '48', '64'], ssd: ['512', '1t', '2t', '4t', '8t'] },
        'M5 Max': { mem: ['36', '48', '64', '128'], ssd: ['1t', '2t', '4t', '8t'] },
      },
      notes: {
        M6: { ru: 'M6: только 14″ с Liquid Retina XDR. Для офисной работы, разработки и моделей до ~14 млрд параметров.', en: 'M6: 14″ with Liquid Retina XDR only. For office work, development and models up to ~14B parameters.' },
        'M5 Pro': { ru: 'M5 Pro: до 64 ГБ памяти, Thunderbolt 5, до трёх внешних мониторов. Модели уровня 30–70 млрд в 4 бит.', en: 'M5 Pro: up to 64 GB, Thunderbolt 5, up to three external displays. 30–70B models in 4-bit.' },
        'M5 Max': { ru: 'M5 Max: до 128 ГБ памяти и до четырёх мониторов. Локальные модели до ~120 млрд параметров прямо на ноутбуке.', en: 'M5 Max: up to 128 GB and four displays. Local models up to ~120B parameters right on the laptop.' },
      },
    },
    more: { ru: [['Для кого', 'Разработчики, дизайнеры, аналитики данных и те, кто запускает ИИ-модели локально.'], ['Экран', 'Liquid Retina XDR — проверенный mini-LED. PROLED XDR (с октября 2026) — тандемный OLED с поддержкой касаний, только с M5 Pro и M5 Max.'], ['Что делаем мы', 'Поставка, настройка под компанию, MLX/Ollama и локальная модель с API, подключение к вашим системам.']], en: [['Who it is for', 'Developers, designers, data analysts and anyone running AI models locally.'], ['Display', 'Liquid Retina XDR is the proven mini-LED. PROLED XDR (since October 2026) is tandem OLED with Touch, M5 Pro and M5 Max only.'], ['What we do', 'Supply, company set-up, MLX/Ollama and a local model with an API, integration with your systems.']] },
    ru: ['Apple MacBook Pro', 'Ноутбук для разработки, дизайна и локальных ИИ-моделей. Соберём конфигурацию и назовём цену под запрос.', ['Чип M6, M5 Pro или M5 Max', 'Экран 14,2″ или 16,2″', 'Память до 128 ГБ', 'SSD до 8 ТБ']],
    en: ['Apple MacBook Pro', 'A laptop for development, design and local AI models. We put the configuration together and quote on request.', ['M6, M5 Pro or M5 Max chip', '14.2″ or 16.2″ screen', 'Up to 128 GB memory', 'Up to 8 TB SSD']] },
  { id: 'nas-ds925', mode: 'buy', art: 'rack4', rub: 87900, market: [79799, 88410],
    sources: { date: '2026-11-22', urls: [
      'https://www.dns-shop.ru/product/1d7423547737d9cb/setevoe-hranilise-nas-synology-diskstation-ds925/ — 79 799 ₽',
      'https://www.kns.ru/product/setevoe-hranilische-synology-ds925plus/ — 86 389 ₽',
      'https://synology.moscow/product/synology-ds925/ — 88 410 ₽',
      'https://www.synology.com/en-global/products/DS925+ — характеристики',
    ] },
    more: { ru: [['Для кого', 'Компания, которой нужно хранить документы, базу знаний для RAG и резервные копии рядом с локальной моделью.'], ['Что внутри', 'AMD Ryzen V1500B, 4 ГБ ECC (до 32 ГБ), 4 отсека 3,5″/2,5″ и 2 слота M.2 NVMe; до 9 дисков с модулем расширения.'], ['Диски', 'Цена — без дисков. Подберём диски под объём и RAID, посчитаем отдельно в КП.'], ['Что делаем мы', 'Установка, RAID, права доступа, резервное копирование Mac и серверов, подключение к RAG-поиску.']], en: [['Who it is for', 'A company that needs to keep documents, a RAG knowledge base and backups next to its local model.'], ['Inside', 'AMD Ryzen V1500B, 4 GB ECC (up to 32 GB), 4 × 3.5″/2.5″ bays and 2 × M.2 NVMe; up to 9 drives with an expansion unit.'], ['Drives', 'Price excludes drives. We size drives and RAID and quote them separately.'], ['What we do', 'Installation, RAID, access rights, backups of Macs and servers, RAG search integration.']] },
    ru: ['Сетевое хранилище Synology DS925+', 'Хранилище на 4 диска для документов, базы знаний и резервных копий — данные остаются в офисе.', ['4 отсека + 2× M.2 NVMe', '2× Ethernet 2,5 Гбит/с', 'Гарантия производителя 3 года', 'Без дисков']],
    en: ['Synology DS925+ network storage', 'A 4-bay storage unit for documents, the knowledge base and backups; the data stays in the office.', ['4 bays + 2× M.2 NVMe', '2× 2.5 Gb Ethernet', '3-year vendor warranty', 'Drives not included']] },
  { id: 'switch-crs312', mode: 'buy', art: 'rack4', rub: 99900, market: [70101, 107900],
    sources: { date: '2026-11-22', urls: [
      'https://www.mikc.ru/katalog/kommutatory/mikrotik-crs312-4c-8xg/ — 70 101–82 472 ₽',
      'https://www.xcom-shop.ru/mikrotik_crs312-4c8xg-rm_732405.html — 71 991 ₽',
      'https://shop.nag.ru/catalog/00001.kommutatory/40213.fiksirovannye-kommutatory/34828.crs312-4c8xg-rm — 88 107 ₽',
      'https://mikrotik.ru/katalog/katalog/hardware/switches/crs312-4c-8xg-rm — 99 850 ₽',
      'https://wifimag.ru/cat/mikrotik/marshrutizatory/mikrotik_cloud_router_switch_crs312_4c_8xg_rm/ — 107 900 ₽',
      'https://mikrotik.com/product/crs312_4c_8xg_rm — характеристики',
    ] },
    more: { ru: [['Для кого', 'Офис, где ИИ-станции, хранилище и рабочие места должны обмениваться данными быстрее гигабита.'], ['Порты', '8× 10 Гбит/с RJ45 и 4 комбо-порта RJ45/SFP+, два блока питания, монтаж в стойку 19″ (1U).'], ['Что делаем мы', 'Схема сети, VLAN для ИИ-контура, подключение Mac, DGX Spark и хранилища, документация для службы безопасности.']], en: [['Who it is for', 'An office where AI machines, storage and workstations must exchange data faster than gigabit.'], ['Ports', '8× 10 Gb RJ45 and 4 RJ45/SFP+ combo ports, dual power supplies, 19″ rack mount (1U).'], ['What we do', 'Network design, a VLAN for the AI perimeter, connecting Macs, DGX Spark and storage, documents for your security team.']] },
    ru: ['Коммутатор 10 Гбит/с MikroTik CRS312', 'Быстрая сеть для ИИ-контура: связывает Mac, DGX Spark, хранилище и рабочие места.', ['12 портов 10 Гбит/с', '4 комбо-порта SFP+', 'Два блока питания', 'Стойка 19″, 1U']],
    en: ['MikroTik CRS312 10 Gb switch', 'Fast networking for the AI perimeter: links Macs, DGX Spark, storage and workstations.', ['12× 10 Gb ports', '4 SFP+ combo ports', 'Dual power supplies', '19″ rack, 1U']] },
  { id: 'rent-h100', mode: 'rent', art: 'cloud', rub: 640, unit: 'hour', market: [340, 650],
    ru: ['Аренда 1× H100 80 ГБ', 'Выделенный GPU в российском ЦОД, модель развёрнута и отвечает по API.', ['H100 80 ГБ', 'Модель и API настроены', 'Изолированная сеть', 'Помесячно со скидкой']],
    en: ['Rent 1× H100 80 GB', 'A dedicated GPU in a Russian data centre with the model deployed and served by API.', ['H100 80 GB', 'Model and API set up', 'Isolated network', 'Monthly discount']] },
  { id: 'rent-h200', mode: 'rent', art: 'cloud', rub: 770, unit: 'hour', market: [420, 780],
    ru: ['Аренда 1× H200 141 ГБ', 'Больше памяти — больше модель без разбиения на несколько карт.', ['H200 141 ГБ', 'Модель и API настроены', 'Мониторинг нагрузки', 'Помесячно со скидкой']],
    en: ['Rent 1× H200 141 GB', 'More memory, larger models without splitting across cards.', ['H200 141 GB', 'Model and API set up', 'Load monitoring', 'Monthly discount']] },
  { id: 'rent-8h200', mode: 'rent', art: 'cloud8', rub: 5350, unit: 'hour', market: [3200, 5400],
    ru: ['Аренда сервера 8× H200', 'Целый сервер под вашу компанию: обучение, дообучение и высокая нагрузка.', ['8× H200, NVLink', 'Выделенный сервер', 'Резервное копирование в РФ', 'SLA в договоре']],
    en: ['Rent an 8× H200 server', 'A whole server for your company: training, fine-tuning and heavy load.', ['8× H200, NVLink', 'Dedicated server', 'Backups in Russia', 'SLA in the contract']] },
  { id: 'month-h100', mode: 'rent', art: 'cloud', rub: 449000, unit: 'month', market: [244800, 468000],
    ru: ['Аренда 1× H100 на месяц', 'Мощность в российском ЦОД партнёра по договору с нами. Дешевле почасовой при постоянной нагрузке.', ['H100 80 ГБ', 'Модель и API настроены', 'Помесячный договор', 'Мониторинг и поддержка']],
    en: ['Rent 1× H100 for a month', 'Capacity in a partner’s Russian data centre under a contract with us. Cheaper than hourly at steady load.', ['H100 80 GB', 'Model and API set up', 'Monthly contract', 'Monitoring and support']] },
  { id: 'month-h200', mode: 'rent', art: 'cloud', rub: 539000, unit: 'month', market: [302400, 561600],
    ru: ['Аренда 1× H200 на месяц', 'Больше памяти для крупных моделей, помесячно и с нашей настройкой.', ['H200 141 ГБ', 'Модель и API настроены', 'Помесячный договор', 'Мониторинг и поддержка']],
    en: ['Rent 1× H200 for a month', 'More memory for larger models, monthly and set up by us.', ['H200 141 GB', 'Model and API set up', 'Monthly contract', 'Monitoring and support']] },
  { id: 'month-8h200', mode: 'rent', art: 'cloud8', rub: 3749000, unit: 'month', market: [2300000, 3900000],
    ru: ['Аренда сервера 8× H200 на месяц', 'Выделенный сервер под вашу компанию на месяц и дольше.', ['8× H200, NVLink', 'Выделенный сервер', 'Резервные копии в РФ', 'SLA в договоре']],
    en: ['Rent an 8× H200 server for a month', 'A dedicated server for your company for a month or longer.', ['8× H200, NVLink', 'Dedicated server', 'Backups in Russia', 'SLA in the contract']] },
  { id: 'provider-pick', mode: 'rent', art: 'cloud', rub: null, market: null,
    ru: ['Мощности у крупного облака — с нашей настройкой', 'Если удобнее платить провайдеру напрямую, подберём тариф в Selectel, Cloud.ru, Yandex Cloud или другом российском облаке и развернём там модель.', ['Сравнение тарифов под задачу', 'Договор с провайдером — на вас', 'Развёртывание модели и API', 'Сопровождение по желанию']],
    en: ['Capacity from a major cloud, set up by us', 'If you prefer to pay a provider directly, we pick a plan at Selectel, Cloud.ru, Yandex Cloud or another Russian cloud and deploy the model there.', ['Plans compared for your task', 'Your own contract with the provider', 'Model and API deployment', 'Optional support']] },
];
// У позиций с конфигурациями цена «от» — самая дешёвая конфигурация (её показывают каталог и страница hardware/).
for (const h of hardware) if (h.configs) h.rub = Math.min(...h.configs.map(c => c.rub));

// ---------- SVG-иллюстрации устройств ----------
const fan = (x, y, r) => `<g transform="translate(${x} ${y})"><circle r="${r}" class="hw-fan-ring"/><g class="hw-fan"><path d="M0 ${-r * .8}c${r * .3} ${r * .2} ${r * .3} ${r * .55} 0 ${r * .7}M${r * .8} 0c${-r * .2} ${r * .3} ${-r * .55} ${r * .3} ${-r * .7} 0M0 ${r * .8}c${-r * .3} ${-r * .2} ${-r * .3} ${-r * .55} 0 ${-r * .7}M${-r * .8} 0c${r * .2} ${-r * .3} ${r * .55} ${-r * .3} ${r * .7} 0"/></g><circle r="${r * .18}" class="hw-hub"/></g>`;
const led = (x, y, i = 0) => `<circle cx="${x}" cy="${y}" r="2.6" class="hw-led" style="--d:${i * .37}s"/>`;
const mesh = (x, y, w, h, gold) => {
  let s = '';
  for (let i = 0; i < Math.floor(w / 9); i++) for (let j = 0; j < Math.floor(h / 9); j++) s += `<circle cx="${x + 5 + i * 9 + (j % 2) * 4.5}" cy="${y + 5 + j * 9}" r="2.4" class="${gold ? 'hw-mesh-gold' : 'hw-mesh'}"/>`;
  return s;
};

const MODEL3D = { 'park-s': 'spark', 'park-m': 'rack', 'park-l': 'rack', 'dgx-spark': 'spark', 'gb10-oem': 'spark', 'spark-cluster': 'spark', 'rtx5090-ws': 'workstation', 'rtx-pro-ws': 'workstation', 'rtx-pro-server': 'gpu-server', 'hgx-h200': 'hgx', 'dgx-b200': 'hgx', 'amd-mi300x': 'hgx', 'oem-servers': 'gpu-server' };
const G = n => 'gallery/' + n + '.jpg';
const GALLERY = {
  'dgx-spark': [G('spark-1'), G('spark-2'), G('spark-3'), 'nvidia-dgx-spark-desk.jpg'],
  'gb10-oem': [G('gb10-1'), G('gb10-2'), G('gb10-3'), 'partners/asus-ascent-gx10.jpg'],
  'spark-cluster': ['pages/cluster-2spark.jpg', G('spark-1'), G('spark-2')],
  'park-s': ['pages/park-s.jpg', G('park-s-2'), G('spark-3')],
  'park-m': ['pages/park-m.jpg', G('park-m-2'), G('hgx-2')],
  'park-l': ['pages/park-l.jpg', G('rack-1'), G('rack-2'), 'nvidia-gb200-nvl72.jpg'],
  'rtx5090-ws': [G('ws-1'), G('ws-2')], 'rtx-pro-ws': [G('ws-1'), G('ws-2')],
  'rtx-pro-server': [G('srv4-1'), G('srv4-2')],
  'hgx-h200': [G('hgx-1'), G('hgx-2'), 'frame-2-server.jpg'], 'dgx-b200': [G('rack-1'), G('hgx-2'), 'nvidia-gb200-nvl72.jpg'], 'amd-mi300x': [G('hgx-1'), G('hgx-2')], 'oem-servers': [G('srv4-1'), G('srv4-2'), G('hgx-1')],
  'rent-h100': ['pages/rent-gpu.jpg', G('rack-2')], 'rent-h200': ['pages/rent-gpu.jpg', G('rack-2')], 'rent-8h200': ['pages/rent-server.jpg', G('hgx-2')],
  'mac-mini': ['pages/mac-mini-cover.jpg', G('mac-mini-4'), G('mac-mini-5'), G('mac-mini-1'), G('mac-mini-2'), G('mac-mini-3')],
  'macbook-air': ['pages/macbook-air-cover.jpg', G('macbook-air-gen'), G('macbook-air-1'), G('macbook-air-2'), G('macbook-air-3')],
  'macbook-pro': ['pages/macbook-pro-cover.jpg', G('macbook-pro-gen'), G('macbook-pro-1'), G('macbook-pro-2'), G('macbook-pro-3')],
  'mac-studio': ['pages/mac-studio-cover.jpg', G('mac-studio-gen'), G('mac-studio-4'), G('mac-studio-1'), G('mac-studio-2'), G('mac-studio-3')],
  'nas-ds925': ['pages/ds925-cover.jpg', G('ds925-4'), G('crs312-gen'), G('ds925-1'), G('ds925-2'), G('ds925-3')],
  'switch-crs312': ['pages/crs312-cover.jpg', G('crs312-gen'), G('mac-mini-4'), G('crs312-1')],
  'month-h100': ['pages/rent-gpu.jpg', G('rack-2')], 'month-h200': ['pages/rent-gpu.jpg', G('rack-2')], 'month-8h200': ['pages/rent-server.jpg', G('hgx-2')], 'provider-pick': ['pages/rent-cloud.jpg', G('rack-2')],
};
// Подписи к официальным фото производителей. Источники — docs/assets/photos/gallery/sources.json.
const CREDIT = { 'nvidia-dgx-spark-desk.jpg': 'NVIDIA', 'nvidia-gb200-nvl72.jpg': 'NVIDIA', 'partners/asus-ascent-gx10.jpg': 'ASUS',
  ...Object.fromEntries(['mac-mini-1', 'mac-mini-2', 'mac-mini-3', 'mac-studio-1', 'mac-studio-2', 'mac-studio-3'].map(n => [G(n), 'Apple'])),
  ...Object.fromEntries(['macbook-air-1', 'macbook-air-2', 'macbook-air-3', 'macbook-pro-1', 'macbook-pro-2', 'macbook-pro-3'].map(n => [G(n), 'Apple'])),
  ...Object.fromEntries(['ds925-1', 'ds925-2', 'ds925-3'].map(n => [G(n), 'Synology'])), [G('crs312-1')]: 'MikroTik',
  'pages/mac-mini.jpg': 'Apple', 'pages/mac-studio.jpg': 'Apple', 'pages/ds925.jpg': 'Synology', 'pages/crs312.jpg': 'MikroTik' };
export const PHOTO = { 'dgx-spark': 'cut-spark.png', 'gb10-oem': 'gallery/gb10-1.jpg', 'spark-cluster': 'pages/cluster-2spark.jpg', 'park-s': 'pages/park-s.jpg', 'park-m': 'pages/park-m.jpg', 'park-l': 'pages/park-l.jpg', 'rtx5090-ws': 'cut-workstation.png', 'rtx-pro-ws': 'cut-workstation.png', 'rtx-pro-server': 'cut-hgx.png', 'hgx-h200': 'cut-hgx.png', 'dgx-b200': 'cut-rack.png', 'oem-servers': 'cut-hgx.png', 'amd-mi300x': 'cut-hgx.png', 'rent-h100': 'pages/rent-gpu.jpg', 'rent-h200': 'pages/rent-gpu.jpg', 'rent-8h200': 'pages/rent-server.jpg', 'month-h100': 'pages/rent-gpu.jpg', 'month-h200': 'pages/rent-gpu.jpg', 'month-8h200': 'pages/rent-server.jpg', 'provider-pick': 'pages/rent-cloud.jpg', 'mac-mini': 'pages/mac-mini-cover.jpg', 'macbook-air': 'pages/macbook-air-cover.jpg', 'macbook-pro': 'pages/macbook-pro-cover.jpg', 'mac-studio': 'pages/mac-studio-cover.jpg', 'nas-ds925': 'pages/ds925-cover.jpg', 'switch-crs312': 'pages/crs312-cover.jpg' };

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
  const num = n => n.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-GB');
  const marketText = (m, unit) => `${pick(lang, 'Рынок', 'Market')}: ${num(m[0])}–${num(m[1])} ₽${unitLabel(unit)}`;
  // Переключатель чипа и конфигурации: цена, рынок и название в корзине меняются в shop.js.
  const configPicker = (title, configs, chips) => {
    const names = [...new Set(configs.map(c => c.chip))];
    return `<div class="shop-config"><p class="shop-config-label">${pick(lang, 'Чип', 'Chip')}</p>
      <div class="shop-seg" role="group" aria-label="${pick(lang, 'Чип', 'Chip')}">${names.map((n, j) => `<button type="button" data-chip="${esc(n)}" aria-pressed="${j ? 'false' : 'true'}">${esc(n)}</button>`).join('')}</div>
      <p class="shop-config-label">${pick(lang, 'Память и SSD', 'Memory and SSD')}</p>
      <div class="shop-seg" role="group" aria-label="${pick(lang, 'Память и SSD', 'Memory and SSD')}">${configs.map((c, j) => `<button type="button" data-pick-cfg="${c.k}" aria-pressed="${j ? 'false' : 'true'}"${c.chip === configs[0].chip ? '' : ' hidden'}>${esc(c[lang])}</button>`).join('')}</div>
      ${chips ? `<p class="shop-chip-note" data-chip-note>${esc(chips[configs[0].chip][lang])}</p>` : ''}</div>`;
  };
  const card = ({ id, cat, title, text, rub, unit, art, specs, market, kind, more, model, gallery, configs, chips, opts, vendor }) => {
    const cfgTitle = c => `${title} ${c.chip} · ${c[lang]}`;
    if (configs) ({ rub, market } = configs[0]);
    const cfgData = configs ? esc(JSON.stringify(configs.map(c => ({ k: c.k, chip: c.chip, title: cfgTitle(c), rub: c.rub, market: c.market ? marketText(c.market, unit) : '' })))) : '';
    const chipData = chips ? esc(JSON.stringify(Object.fromEntries(Object.entries(chips).map(([n, v]) => [n, v[lang]])))) : '';
    const price = rub == null ? `<p class="audience-price">${pick(lang, 'По запросу', 'On request')}</p>`
      : `<p class="audience-price" data-region-price-row>${priceMarkup(lang, rub, unitLabel(unit))}</p>`;
    const marketLine = market ? `<p class="shop-market">${marketText(market, unit)}</p>` : '';
    const L = lang === 'ru' ? 1 : 2;
    const optDef = opts ? { base: title, groups: opts.groups.map(([gid, , vals]) => ({ id: gid, values: vals.map(v => ({ v: v[0], label: v[L] })) })), allow: opts.allow, notes: Object.fromEntries(Object.entries(opts.notes || {}).map(([k, v]) => [k, v[lang]])) } : null;
    const optSel = opts ? opts.groups.map(([, , vals]) => vals[0][0]).join('|') : '';
    const optPicker = opts ? `<div class="shop-config">${opts.groups.map(([gid, names, vals], gi) => `<p class="shop-config-label">${esc(names[lang === 'ru' ? 0 : 1])}</p>
      <div class="shop-seg" role="group" aria-label="${esc(names[lang === 'ru' ? 0 : 1])}">${vals.map((v, j) => `<button type="button" data-opt="${gi}" data-val="${esc(v[0])}" aria-pressed="${j ? 'false' : 'true'}">${esc(v[L])}</button>`).join('')}</div>`).join('')}
      ${opts.notes ? `<p class="shop-chip-note" data-chip-note>${esc(Object.values(opts.notes)[0][lang])}</p>` : ''}</div>` : '';
    const gal = gallery ? esc(JSON.stringify(gallery.map(f => [ctx.asset + 'photos/' + f, CREDIT[f] || '']))) : '';
    return `<article class="shop-item${kind === 'hw' ? ' shop-hw' : ' shop-row'}" data-cat="${cat}" data-id="${id}" data-title="${esc(configs ? cfgTitle(configs[0]) : title)}" data-rub="${rub ?? ''}" data-unit="${unit ?? ''}"${gal ? ` data-gallery="${gal}"` : ''}${configs ? ` data-cfg="${configs[0].k}" data-configs="${cfgData}"` : ''}${opts ? ` data-cfg="${esc(optSel)}" data-opts="${esc(JSON.stringify(optDef))}"` : ''}${chips ? ` data-chips="${chipData}"` : ''}>
      ${art}
      <div class="shop-body">${vendor ? `<p class="shop-vendor">${esc(vendor)}</p>` : ''}<h3>${gallery ? `<button type="button" class="shop-open" data-open-product>${esc(title)}</button>` : esc(title)}</h3>${model ? `<button type="button" class="shop-3d" data-open3d="${model}" data-title="${esc(title)}">${pick(lang, 'Покрутить в 3D', 'Rotate in 3D')}</button>` : ''}<p class="shop-text">${esc(text)}</p>
      ${specs ? `<ul class="shop-specs">${specs.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
      ${configs ? configPicker(title, configs, chips) : ''}${optPicker}
      ${more ? `<details class="shop-more"><summary>${pick(lang, 'Подробнее', 'Details')}</summary><dl>${more.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></details>` : ''}
      <div class="shop-foot">${price}${marketLine}
      <div class="shop-qty" data-qty hidden><button type="button" data-dec aria-label="${pick(lang, 'Меньше', 'Fewer')}">−</button><output data-count>1</output><button type="button" data-inc aria-label="${pick(lang, 'Больше', 'More')}">+</button></div>
      <button type="button" class="btn shop-add" data-add="${id}"><span class="shop-add-label">${pick(lang, 'В корзину', 'Add to basket')}</span></button></div></div></article>`;
  };
  const serviceCards = services.map(([cat, names, list]) => list.map(([id, title, p, text, icon, unit]) => card({
    id, cat: 'svc', title: title[i], text: text[i], rub: priceOf(p), unit, art: '',
  })).join(''));
  const FAM = { apple: ['mac-mini', 'macbook-air', 'macbook-pro', 'mac-studio'], nvidia: ['dgx-spark', 'gb10-oem', 'spark-cluster', 'park-s', 'park-m', 'park-l', 'hgx-h200', 'dgx-b200'], servers: ['rtx-pro-ws', 'rtx5090-ws', 'rtx-pro-server', 'oem-servers', 'amd-mi300x'], net: ['nas-ds925', 'switch-crs312'] };
  const famOf = h => h.mode === 'rent' ? 'rent' : Object.keys(FAM).find(f => FAM[f].includes(h.id)) || 'servers';
  const VENDOR = { apple: 'Apple', nvidia: 'NVIDIA', 'nas-ds925': 'Synology', 'switch-crs312': 'MikroTik', 'amd-mi300x': 'AMD', 'oem-servers': 'Dell · Supermicro · Lenovo · HPE' };
  const byFam = f => hardware.filter(h => famOf(h) === f).sort((a, b) => (FAM[f]?.indexOf(a.id) ?? 0) - (FAM[f]?.indexOf(b.id) ?? 0));
  const hwCard = h => card({
    id: h.id, cat: 'hw-' + famOf(h), vendor: VENDOR[h.id] || (famOf(h) === 'rent' ? pick(lang, 'Аренда GPU', 'GPU rental') : VENDOR[famOf(h)] || 'NVIDIA'), kind: 'hw', title: h[lang][0], text: h[lang][1], specs: h[lang][2], rub: h.rub, unit: h.unit, market: h.market, configs: h.configs, chips: h.chips, opts: h.opts, more: h.more?.[lang], model: MODEL3D[h.id], gallery: GALLERY[h.id], art: `<div class="shop-art${PHOTO[h.id] ? ' shop-art-photo' : ''}">${PHOTO[h.id] ? `<img src="${ctx.asset}photos/${PHOTO[h.id]}" alt="${esc(h[lang][0])}" width="1200" height="900" loading="lazy"${PHOTO[h.id].endsWith('.png') ? '' : ' class="is-full"'}>${CREDIT[PHOTO[h.id]] ? `<span class="shop-credit">${pick(lang, 'Фото: ', 'Photo: ')}${CREDIT[PHOTO[h.id]]}</span>` : ''}` : deviceArt(h.art)}${h.mode === 'rent' ? `<span class="shop-tag">${pick(lang, 'Аренда', 'Rental')}</span>` : `<span class="shop-tag">${pick(lang, 'Под заказ', 'To order')}</span>`}</div>`,
  });
  const HW_GROUPS = [['apple', pick(lang, 'Apple для офиса и локального ИИ', 'Apple for the office and local AI'), pick(lang, 'Mac mini, MacBook и Mac Studio: настроим под компанию и развернём локальную модель.', 'Mac mini, MacBook and Mac Studio, set up for your company with a local model.')],
    ['nvidia', pick(lang, 'NVIDIA DGX и GB10', 'NVIDIA DGX and GB10'), pick(lang, 'Персональные ИИ-суперкомпьютеры и готовые парки под ключ.', 'Personal AI supercomputers and turnkey fleets.')],
    ['servers', pick(lang, 'Серверы и рабочие станции', 'Servers and workstations'), pick(lang, 'GPU-серверы и станции для обучения и inference.', 'GPU servers and workstations for training and inference.')],
    ['net', pick(lang, 'Хранение и сеть', 'Storage and networking'), pick(lang, 'Хранилище данных и 10-гигабитная сеть для ИИ-контура.', 'Data storage and 10 Gb networking for the AI stack.')],
    ['rent', pick(lang, 'Аренда GPU', 'GPU rental'), pick(lang, 'Почасовая и помесячная аренда у партнёров в РФ.', 'Hourly and monthly rental from partners in Russia.')]];
  const hwGroups = HW_GROUPS.map(([f, title, lead]) => `<div class="shop-group" data-group="hw-${f}"><div class="shop-group-head"><h3>${esc(title)}</h3><p>${esc(lead)}</p></div>
      <div class="shop-grid shop-grid-hw" data-grid="hw-${f}">${byFam(f).map(hwCard).join('')}</div></div>`).join('');
  const svcGroups = services.map(([cat, names], n) => `<div class="shop-group" data-group="svc-${cat}"><div class="shop-group-head"><h3>${esc(names[i])}</h3></div>
      <div class="shop-list-rows" data-grid="svc-${cat}">${serviceCards[n]}</div></div>`).join('');
  const chips = [['all', pick(lang, 'Весь каталог', 'Everything')], ['hw-apple', 'Apple'], ['hw-nvidia', 'NVIDIA'], ['hw-servers', pick(lang, 'Серверы', 'Servers')], ['hw-net', pick(lang, 'Хранение и сеть', 'Storage & network')], ['hw-rent', pick(lang, 'Аренда GPU', 'GPU rental')], ['svc', pick(lang, 'Услуги', 'Services')]];
  const labels = JSON.stringify({
    empty: pick(lang, 'Добавьте оборудование или услуги из каталога.', 'Add hardware or services from the catalogue.'),
    total: pick(lang, 'Итого от', 'Total from'), monthly: pick(lang, 'Ежемесячно от', 'Monthly from'), hourly: pick(lang, 'Аренда, в час от', 'Rental, per hour from'),
    onRequest: pick(lang, 'Позиции по запросу оценим отдельно', 'Items on request are quoted separately'),
    greeting: pick(lang, 'Здравствуйте! Прошу рассчитать стоимость:', 'Hello! Could you quote the following:'),
    remove: pick(lang, 'Убрать', 'Remove'), saved: pick(lang, 'Заявка отправлена из кабинета.', 'Enquiry sent from your account.'), login: pick(lang, 'Войдите в кабинет, чтобы отправить заявку.', 'Sign in to send an enquiry.'), open: pick(lang, 'Открыть кабинет', 'Open account'), added: pick(lang, 'В корзине', 'In basket'), from: pick(lang, 'от', 'from'), request: pick(lang, 'по запросу', 'on request'),
    hour: pick(lang, '/ час', '/ hour'), month: pick(lang, '/ мес.', '/ month'), none: pick(lang, 'Ничего не нашлось. Попробуйте другое слово.', 'Nothing found. Try another word.'), lang,
  });
  return `<section class="section wrap audience-section shop" data-shop data-tg="${esc(ctx.tg)}" data-labels="${esc(labels)}">
    <div class="shop-toolbar">
      <div class="shop-filters" role="group" aria-label="${pick(lang, 'Разделы каталога', 'Catalogue sections')}">${chips.map(([id, name], n) => `<button type="button" aria-pressed="${n ? 'false' : 'true'}" data-filter="${id}">${esc(name)}</button>`).join('')}</div>
      <div class="shop-tools">
        <label class="shop-search"><span class="sr-only">${pick(lang, 'Поиск по каталогу', 'Search the catalogue')}</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input type="search" data-search placeholder="${pick(lang, 'Поиск: Mac mini, H200, бот…', 'Search: Mac mini, H200, bot…')}"></label>
        <label class="shop-sort"><span class="sr-only">${pick(lang, 'Сортировка', 'Sort')}</span><select data-sort><option value="default">${pick(lang, 'По разделам', 'By section')}</option><option value="asc">${pick(lang, 'Сначала дешевле', 'Price: low to high')}</option><option value="desc">${pick(lang, 'Сначала дороже', 'Price: high to low')}</option></select></label>
      </div>
    </div>
    <section class="shop-section" data-section="hw"><div class="shop-section-head"><h2>${pick(lang, 'Оборудование', 'Hardware')}</h2><p class="audience-note-line">${pick(lang, 'Цены ориентировочные. Подтвердим стоимость и сроки поставки для выбранной конфигурации.', 'Prices are indicative. We’ll confirm the price and lead time for your chosen configuration.')}</p></div>${hwGroups}</section>
    <section class="shop-section" data-section="svc"><div class="shop-section-head"><h2>${pick(lang, 'Разработка и сопровождение', 'Development and support')}</h2></div>${svcGroups}</section>
    <p class="shop-none" data-none hidden></p>
  </section>
  ${renderWhyPrice(lang)}
  <button type="button" class="shop-fab" data-shop-open aria-controls="shop-cart" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h3l2.4 11h10.2L21 7H7"/><circle cx="10" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/></svg><span>${pick(lang, 'Корзина', 'Basket')}</span><b data-shop-count>0</b></button>
  <div class="shop-scrim" data-shop-scrim hidden></div>
  <aside class="shop-cart" id="shop-cart" aria-label="${pick(lang, 'Корзина', 'Basket')}" hidden>
    <div class="shop-cart-head"><h2>${pick(lang, 'Подборка для заявки', 'Items for your enquiry')}</h2><button type="button" class="shop-close" data-shop-close aria-label="${pick(lang, 'Закрыть', 'Close')}">×</button></div>
    <ul class="shop-list" data-shop-list></ul>
    <div class="shop-total" data-shop-total></div>
    <a class="button shop-send" data-shop-send href="${esc(ctx.tg)}">${pick(lang, 'Открыть черновик в Telegram', 'Open draft in Telegram')}</a>
    <button type="button" class="shop-save" data-shop-save>${pick(lang, 'Отправить заявку из кабинета', 'Send from your account')}</button>
    <p class="shop-save-status" data-shop-status role="status"></p>
    <button type="button" class="shop-clear" data-shop-clear>${pick(lang, 'Очистить корзину', 'Clear basket')}</button>
    <p class="audience-note-line">${pick(lang, 'Стоимость, сроки и условия подтвердим в предложении.', 'We’ll confirm the price, lead time and terms in your quote.')}</p>
  </aside>`;
}

function renderWhyPrice(lang) {
  const items = lang === 'ru' ? [
    ['Подбор и поставка', 'Подбираем конфигурацию под ваши модели и нагрузку, согласуем сроки поставки.'],
    ['Настройка и проверка', 'Устанавливаем ОС и драйверы, разворачиваем модель и API, проверяем работу системы под нагрузкой.'],
    ['Гарантия и документы', 'Ведём гарантийные обращения к поставщику и передаём описание архитектуры для службы безопасности.'],
  ] : [
    ['Sizing and supply', 'We choose a configuration for your models and workload and agree on delivery.'],
    ['Set-up and testing', 'We install the OS and drivers, deploy the model and API, and test the system under load.'],
    ['Warranty and documentation', 'We handle supplier warranty claims and provide an architecture description for your security team.'],
  ];
  return `<section class="section wrap audience-section why-price">
    <h2>${pick(lang, 'Как поставляем оборудование', 'How we supply hardware')}</h2>
    <div class="loss-grid">${items.map(([t, d]) => `<article><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join('')}</div>
    <p class="audience-note-line">${pick(lang, 'Рыночные диапазоны взяты из открытых цен российских поставщиков на ноябрь 2026 года.', 'Market ranges are from prices published by Russian suppliers in November 2026.')}</p>
  </section>`;
}
