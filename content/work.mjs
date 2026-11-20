export const contacts = {
  github: 'https://github.com/luvlarion4ik',
  telegram: 'https://t.me/LuvLarion4ik',
  threads: 'https://www.threads.com/@luvlarion4ik',
  email: 'larion4ik123@gmail.com',
  channel: null,
};

const orient = {
  name: 'Orient Logic',
  image: 'work/orient.webp',
  href: 'https://orientlogic.ru/',
  tags: ['Next.js', 'TypeScript', 'Telegram'],
};

const kitchens = {
  image: 'work/kitchens.webp',
  href: 'https://luvlarion4ik.github.io/kuhni/',
  tags: ['MAX', 'FastAPI', 'SQLite'],
};

export const cases = {
  ru: [
    {
      ...orient,
      type: 'Международная логистика',
      task: 'Дать импортёру понятный способ запросить расчёт доставки из Китая в Россию.',
      solution: 'Собрали сайт с маршрутами и условиями перевозки, адаптировали форму для телефона и связали её с Telegram.',
      result: 'Импортёр отправляет запрос с сайта, а менеджер получает данные для расчёта в рабочем чате.',
      alt: 'Главная страница логистической компании Orient Logic с переходом к расчёту доставки',
    },
    {
      ...kitchens,
      name: 'Мебельный салон «Интерьер»',
      type: 'Розница · проект с компактным бюджетом',
      task: 'Помочь посетителю выбрать кухню и передать дизайнеру пожелания до первого звонка.',
      solution: 'Соединили каталог выполненных работ с анкетой в MAX. Покупатель выбирает планировку и материалы, а салон редактирует вопросы в своей панели.',
      result: 'У дизайнера в одной заявке собраны параметры кухни и контакт покупателя. Разговор можно начать с проекта.',
      alt: 'Сайт мебельного салона «Интерьер» с переходом к подбору кухни в MAX',
    },
  ],
  en: [
    {
      ...orient,
      type: 'International freight',
      task: 'Give importers a clear way to request a shipping quote from China to Russia.',
      solution: 'We built a site explaining routes and shipping terms, designed the form for mobile and connected it to Telegram.',
      result: 'An importer submits a request online. The freight team receives the shipment details in its working chat.',
      alt: 'Orient Logic freight website with a link to request a shipping quote',
    },
    {
      ...kitchens,
      name: 'Interier kitchen showroom',
      type: 'Retail · limited-budget project',
      task: 'Help buyers choose a kitchen and share their requirements before the first call.',
      solution: 'We linked a gallery of installations to a questionnaire in MAX. Buyers choose layouts and materials, and showroom staff edit questions in an admin panel.',
      result: 'The designer receives kitchen specifications and buyer contact details in a single enquiry, ready for a design conversation.',
      alt: 'Interier showroom website with a link to start choosing a kitchen in MAX',
    },
  ],
};

const keyway = (text, upstream) => [
  { label: text, href: contacts.telegram },
  { label: upstream, href: 'https://github.com/Magerko/copilot' },
];

export const products = {
  ru: [
    { name: 'Технологии города', status: 'B2B / B2G · NDA', summary: 'Интегрируем коммерческий сервис в государственный, чтобы пользователю было проще получить услугу. Подробности проекта защищены соглашением о конфиденциальности.', links: [] },
    { name: 'Larion Keyway', status: 'Бета · подготовка к лицензированию', summary: 'Приложение для macOS с управлением с клавиатуры, созданное на основе открытого Copilot от Magerko. Готовим коммерческий выпуск по лицензии.', links: keyway('Обсудить бету или лицензию', 'Исходный проект · MIT') },
    { name: 'Cognivue', status: 'Прототип', summary: 'Инструмент для команд, которые хотят оценить реакцию аудитории на интерфейс или рекламный материал до запуска.', links: [] },
    { name: 'Аксента', status: 'Прототип', summary: 'ИИ-репетитор, который определяет уровень ученика и помогает разбирать задания по конспектам и фотографиям тетрадей.', links: [] },
  ],
  en: [
    { name: 'City Technologies', status: 'B2B / B2G · NDA', summary: 'We are integrating a commercial service into a public-sector platform to simplify access for users. Project details are covered by a confidentiality agreement.', links: [] },
    { name: 'Larion Keyway', status: 'Beta · preparing for licensing', summary: 'A keyboard-driven macOS app based on Magerko’s open-source Copilot. We are preparing a licensed commercial release.', links: keyway('Discuss beta access or licensing', 'Upstream project · MIT') },
    { name: 'Cognivue', status: 'Prototype', summary: 'A tool for teams exploring how an audience might respond to an interface or advertising creative before launch.', links: [] },
    { name: 'Axenta', status: 'Prototype', summary: 'An AI tutor that assesses a learner’s level and helps explain assignments using notes and photos of their work.', links: [] },
  ],
};
