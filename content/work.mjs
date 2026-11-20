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
  mobile: 'work/orient-mobile.webp',
  concept: false,
  size: [1440, 900],
  href: 'https://orientlogic.ru/',
  tags: ['Next.js', 'TypeScript', 'Telegram'],
};

const kitchens = {
  image: 'work/kitchens.webp',
  mobile: 'work/kitchens-mobile.webp',
  concept: false,
  size: [1440, 900],
  href: 'https://luvlarion4ik.github.io/kuhni/',
  tags: ['MAX', 'FastAPI', 'SQLite'],
};

const modular = {
  name: 'Modular Houses',
  image: 'work/modular-houses.webp',
  mobile: 'work/modular-houses-mobile.webp',
  concept: true,
  size: [1440, 900],
  href: 'https://luvlarion4ik.github.io/modular_houses/',
};

const printed = {
  image: 'work/3d-dom.webp',
  mobile: 'work/3d-dom-mobile.webp',
  concept: true,
  size: [1440, 900],
  href: 'https://luvlarion4ik.github.io/3dDom/',
};

export const cases = {
  ru: [
    {
      ...orient,
      type: 'Международная логистика',
      task: 'Дать импортёру понятный способ запросить расчёт доставки из Китая в Россию.',
      solution: 'Показали четыре способа доставки: авто, море, железная дорога и авиа. Адаптировали форму расчёта для телефона и связали её с Telegram.',
      result: 'Импортёр отправляет запрос с сайта, а менеджер получает данные для расчёта в рабочем чате.',
      alt: 'Главная страница логистической компании Orient Logic с переходом к расчёту доставки',
    },
    {
      ...kitchens,
      name: 'Мебельный салон «Интерьер»',
      type: 'Розница · сайт и мини-приложение MAX',
      task: 'Помочь посетителю выбрать кухню и передать дизайнеру пожелания до первого звонка.',
      solution: 'Соединили каталог выполненных работ с анкетой в MAX. Покупатель выбирает планировку и материалы, а салон редактирует вопросы в своей панели.',
      result: 'У дизайнера в одной заявке собраны параметры кухни и контакт покупателя. Разговор можно начать с проекта.',
      alt: 'Галерея установленных кухонь мебельного салона «Интерьер»',
    },
    {
      ...modular,
      type: 'Модульные дома · демо',
      task: 'Помочь покупателю подобрать модульный дом под свой участок.',
      solution: 'Собрали каталог из трёх моделей. В карточках показали планировку, площадь, отделку и базовую комплектацию.',
      result: 'Посетитель может сравнить варианты и перейти в Telegram с подготовленным текстом запроса.',
      tags: ['Каталог', 'Telegram'],
      alt: 'Карточка модульного дома Vista 28 / E5 с фотографией, площадью и размерами',
    },
    {
      ...printed,
      name: 'Дома из 3D-принтера',
      type: 'Строительные технологии · демо',
      task: 'Объяснить покупателю, как печатают дом и в каком виде его можно получить.',
      solution: 'Разложили процесс по этапам и показали четыре варианта готовности — от коробки до полной отделки.',
      result: 'Можно посмотреть состав работ по каждому варианту и выбрать, на каком этапе принимать дом.',
      tags: ['3D-печать', 'Каталог комплектаций'],
      alt: 'Демонстрационный сайт о строительстве домов методом 3D-печати',
    },
  ],
  en: [
    {
      ...orient,
      type: 'International freight',
      task: 'Give importers a clear way to request a shipping quote from China to Russia.',
      solution: 'The site covers four freight options: road, sea, rail and air. We designed the quote form for mobile and connected it to Telegram.',
      result: 'An importer submits a request online. The freight team receives the shipment details in its working chat.',
      alt: 'Orient Logic freight website with a link to request a shipping quote',
    },
    {
      ...kitchens,
      name: 'Interier kitchen showroom',
      type: 'Retail · website and MAX mini app',
      task: 'Help buyers choose a kitchen and share their requirements before the first call.',
      solution: 'We linked a gallery of installations to a questionnaire in MAX. Buyers choose layouts and materials, and showroom staff edit questions in an admin panel.',
      result: 'The designer receives kitchen specifications and buyer contact details in a single enquiry, ready for a design conversation.',
      alt: 'Interier showroom gallery of completed kitchen installations',
    },
    {
      ...modular,
      type: 'Modular housing · demo',
      task: 'Help a buyer choose a modular home for their plot.',
      solution: 'We built a three-model catalogue covering floor plans, size, finishes and standard fittings.',
      result: 'A visitor can compare the options and open Telegram with an enquiry already drafted.',
      tags: ['Product catalogue', 'Telegram'],
      alt: 'Modular Houses product page showing the Vista 28 / E5 with dimensions and floor area',
    },
    {
      ...printed,
      name: '3D-printed homes',
      type: 'Construction technology · demo',
      task: 'Show prospective buyers how a house is printed and what they can expect at handover.',
      solution: 'We documented the construction stages and four handover options, from a structural shell to a fully finished home.',
      result: 'Buyers can review the work included at each handover stage and choose the option that suits them.',
      tags: ['3D printing', 'Specifications'],
      alt: 'Demonstration website explaining 3D-printed housing',
    },
  ],
};

const keyway = (text, upstream) => [
  { label: text, href: contacts.telegram },
  { label: upstream, href: 'https://github.com/Magerko/copilot' },
];

export const products = {
  ru: [
    { name: 'Технологии города', cover: 'city.webp', status: 'B2B / B2G · NDA', summary: 'Интегрируем коммерческий сервис в государственный, чтобы пользователю было проще получить услугу. Подробности проекта защищены соглашением о конфиденциальности.', links: [] },
    { name: 'Larion Keyway', status: 'Бета · подготовка к лицензированию', summary: 'Приложение для macOS с управлением с клавиатуры, созданное на основе открытого Copilot от Magerko. Готовим коммерческий выпуск по лицензии.', links: keyway('Обсудить бету или лицензию', 'Исходный проект · MIT') },
    { name: 'Cognivue', cover: 'cognivue.webp', status: 'Прототип', summary: 'Инструмент для команд, которые хотят оценить реакцию аудитории на интерфейс или рекламный материал до запуска.', links: [] },
    { name: 'Аксента', cover: 'axenta.webp', status: 'Прототип', summary: 'ИИ-репетитор, который определяет уровень ученика и помогает разбирать задания по конспектам и фотографиям тетрадей.', links: [] },
  ],
  en: [
    { name: 'City Technologies', cover: 'city.webp', status: 'B2B / B2G · NDA', summary: 'We are integrating a commercial service into a public-sector platform to simplify access for users. Project details are covered by a confidentiality agreement.', links: [] },
    { name: 'Larion Keyway', status: 'Beta · preparing for licensing', summary: 'A keyboard-driven macOS app based on Magerko’s open-source Copilot. We are preparing a licensed commercial release.', links: keyway('Discuss beta access or licensing', 'Upstream project · MIT') },
    { name: 'Cognivue', cover: 'cognivue.webp', status: 'Prototype', summary: 'A tool for teams exploring how an audience might respond to an interface or advertising creative before launch.', links: [] },
    { name: 'Axenta', cover: 'axenta.webp', status: 'Prototype', summary: 'An AI tutor that assesses a learner’s level and helps explain assignments using notes and photos of their work.', links: [] },
  ],
};
