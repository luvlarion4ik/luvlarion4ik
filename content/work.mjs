export const contacts = {
  github: 'https://github.com/luvlarion4ik',
  telegram: 'https://t.me/LuvLarion4ik',
  threads: 'https://www.threads.com/@luvlarion4ik',
  email: 'larion4ik123@gmail.com',
  channel: null,
};

const orient = {
  id: 'orient-logic',
  name: 'Orient Logic',
  image: 'work/orient.webp',
  mobile: 'work/orient-mobile.webp',
  concept: false,
  status: 'live',
  size: [1440, 900],
  href: 'https://orientlogic.ru/',
  tags: ['Next.js', 'TypeScript', 'Telegram'],
  stack: {
    front: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    integrations: ['Telegram'],
  },
};

const kitchens = {
  id: 'kitchens',
  name: 'Kitchen Showroom',
  image: 'work/kitchens.webp',
  mobile: 'work/kitchens-mobile.webp',
  concept: false,
  status: 'live',
  size: [1440, 900],
  href: 'https://luvlarion4ik.github.io/kuhni/',
  tags: ['MAX', 'FastAPI', 'SQLite'],
  stack: {
    front: ['JavaScript', 'Vite'],
    back: ['Python', 'FastAPI'],
    data: ['SQLite'],
    integrations: ['MAX Bot API'],
    hosting: ['GitHub Pages'],
  },
};

const modular = {
  id: 'modular-houses',
  name: 'Modular House',
  image: 'work/modular-houses.webp',
  mobile: 'work/modular-houses-mobile.webp',
  concept: true,
  status: 'demo',
  size: [1440, 900],
  href: 'https://luvlarion4ik.github.io/modular_houses/',
  stack: {
    front: ['HTML', 'CSS', 'JavaScript'],
    integrations: ['Telegram'],
    hosting: ['GitHub Pages'],
  },
  curators: [],
};

const printed = {
  id: '3d-dom',
  image: 'work/3d-dom.webp',
  mobile: 'work/3d-dom-mobile.webp',
  concept: true,
  status: 'demo',
  size: [1440, 900],
  href: 'https://luvlarion4ik.github.io/3dDom/',
  stack: {
    front: ['HTML', 'CSS', 'JavaScript'],
    integrations: ['EmailJS'],
    hosting: ['GitHub Pages'],
  },
  curators: [],
};

export const cases = {
  ru: [
    {
      ...orient,
      type: 'Международная логистика',
      task: 'Объединить расчёт доставки из Китая в Россию, обработку обращений и работу с заказами.',
      solution: 'Сделали сайт с расчётом доставки, ИИ-ассистента, систему заявок, CRM и личные кабинеты. Форму расчёта адаптировали для телефона и связали с Telegram.',
      result: 'Клиент уточняет условия и отправляет заявку с сайта, менеджер обрабатывает её в CRM, а заказ доступен клиенту в личном кабинете.',
      curators: [{ person: 'ilya', role: 'Руководство проектом и разработка' }],
      flow: ['Сайт и ИИ-ассистент', 'Заявка', 'CRM', 'Личный кабинет'],
      alt: 'Главная страница логистической компании Orient Logic с переходом к расчёту доставки',
    },
    {
      ...kitchens,
      type: 'Мебельный салон «Интерьер» · сайт и MAX-бот',
      task: 'Помочь покупателю увидеть выбранную кухню в своём помещении, оценить бюджет и передать салону готовую заявку.',
      solution: 'Связали каталог с MAX-ботом, который принимает фото помещения, помогает выбрать кухню и готовит визуализацию и предварительный расчёт. Салон управляет сценарием в панели.',
      result: 'Салон получает выбранную кухню, фото, визуализацию и расчёт в одной заявке. Менеджер уточняет комплектацию и итоговую стоимость.',
      curators: [],
      flow: ['Фото помещения', 'Выбор кухни', 'Визуализация', 'Предварительный расчёт', 'Заявка в салоне'],
      alt: 'Первый экран Kitchen Showroom с названием мебельного салона «Интерьер»',
      gallery: {
        image: 'work/kitchens-gallery.webp',
        size: [1440, 900],
        alt: 'Галерея установленных кухонь и блок MAX-бота на сайте мебельного салона «Интерьер»',
      },
    },
    {
      ...modular,
      type: 'Модульные дома',
      task: 'Сделать каталог для компании, которая продаёт и перевозит модульные дома.',
      solution: 'Собрали каталог моделей с планировками, площадью, отделкой и составом комплектации. Подключили сценарий расчёта и приёма заявок через Telegram.',
      result: 'Посетитель сравнивает модели и может запросить расчёт или оставить заявку в Telegram.',
      demoNote: 'У клиента работает тот же сайт с его названием, логотипом и каталогом. На демонстрационной версии представлены условные данные.',
      tags: ['Каталог', 'Telegram'],
      alt: 'Карточка модульного дома Vista 28 / E5 с фотографией, площадью и размерами',
    },
    {
      ...printed,
      name: 'Дома из 3D-принтера',
      type: 'Строительные технологии',
      task: 'Объяснить покупателю, как печатают дом и в каком виде его можно получить.',
      solution: 'Разложили процесс по этапам и показали четыре варианта готовности — от коробки до полной отделки.',
      result: 'Можно посмотреть состав работ по каждому варианту и выбрать, на каком этапе принимать дом.',
      demoNote: 'У клиента работает тот же сайт под своим названием и логотипом. Название, цены и объекты в демонстрационной версии условные.',
      tags: ['3D-печать', 'Каталог комплектаций'],
      alt: 'Демонстрационный сайт о строительстве домов методом 3D-печати',
    },
  ],
  en: [
    {
      ...orient,
      type: 'International freight',
      task: 'Bring shipping quotes from China to Russia, enquiry handling and order tracking into one workflow.',
      solution: 'We built a freight quote site, AI assistant, enquiry system, CRM and client accounts. The mobile-friendly quote form also connects to Telegram.',
      result: 'Clients can clarify terms and send enquiries online. The freight team handles them in the CRM, and clients can track their orders in their accounts.',
      curators: [{ person: 'ilya', role: 'Project lead and development' }],
      flow: ['Website and AI assistant', 'Enquiry', 'CRM', 'Client account'],
      alt: 'Orient Logic freight website with a link to request a shipping quote',
    },
    {
      ...kitchens,
      type: 'Interier showroom · website and MAX bot',
      task: 'Help buyers preview a kitchen in their own room, estimate the cost and send the showroom a complete enquiry.',
      solution: 'We connected the catalogue to a MAX bot that takes a room photo, helps buyers select a kitchen and generates a visualisation and initial estimate. Showroom staff manage the flow in an admin panel.',
      result: 'The showroom receives the selection, photo, visualisation and estimate in one enquiry. Staff confirm the final specification and price.',
      curators: [],
      flow: ['Room photo', 'Kitchen selection', 'Visualisation', 'Initial estimate', 'Showroom enquiry'],
      alt: 'The first screen of the Kitchen Showroom website with the Interier showroom name',
      gallery: {
        image: 'work/kitchens-gallery.webp',
        size: [1440, 900],
        alt: 'Gallery of installed kitchens and the MAX bot section on the Interier showroom site',
      },
    },
    {
      ...modular,
      type: 'Modular housing',
      task: 'Build a catalogue for a business that sells and transports modular homes.',
      solution: 'We built a catalogue covering floor plans, size, finishes and fittings, with an enquiry and quote flow through Telegram.',
      result: 'Visitors can compare models and request a quote or leave an enquiry in Telegram.',
      demoNote: 'The client runs the same site with its own name, logo and catalogue. This demo uses sample data.',
      tags: ['Product catalogue', 'Telegram'],
      alt: 'Modular Houses product page showing the Vista 28 / E5 with dimensions and floor area',
    },
    {
      ...printed,
      name: '3D-printed homes',
      type: 'Construction technology',
      task: 'Show prospective buyers how a house is printed and what they can expect at handover.',
      solution: 'We documented the construction stages and four handover options, from a structural shell to a fully finished home.',
      result: 'Buyers can review the work included at each handover stage and choose the option that suits them.',
      demoNote: 'The client runs the same site under its own name and logo. The demo uses a sample name, prices and properties.',
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
    { name: 'Технологии города', preview: 'city', status: 'B2B / B2G · NDA', summary: 'Интегрируем коммерческий сервис в государственный, чтобы пользователю было проще получить услугу. Подробности проекта защищены соглашением о конфиденциальности.', links: [] },
    { name: 'Larion Keyway', status: 'Бета · подготовка к лицензированию', summary: 'Приложение для macOS с управлением с клавиатуры, созданное на основе открытого Copilot от Magerko. Готовим коммерческий выпуск по лицензии.', links: keyway('Обсудить бету или лицензию', 'Исходный проект · MIT') },
    {
      name: 'Cognivue', preview: 'cognivue', status: 'MVP в разработке',
      summary: 'Инструмент для команд, которые хотят оценить реакцию аудитории на интерфейс или рекламный материал до запуска.',
      details: {
        title: 'Пример оценки макета',
        description: 'Команда загружает макет и задаёт вопрос к нему. В отчёте можно посмотреть, какие элементы привлекли внимание и что стоит проверить перед запуском.',
      },
      links: [],
    },
    {
      name: 'Аксента', preview: 'axenta', status: 'Демо · в разработке',
      summary: 'ИИ-репетитор, который определяет уровень ученика и помогает разбирать задания по конспектам и фотографиям тетрадей.',
      details: {
        title: 'Мини-школа для педагога',
        description: 'В демо педагог подключает учеников и назначает задания. Родители видят прогресс своего ребёнка. Для демонстрации используется учебная группа с условными данными.',
        roles: [
          ['Педагог', 'Назначает задания и отслеживает выполнение'],
          ['Ученик', 'Выполняет задания и видит свой прогресс'],
          ['Родитель', 'Просматривает отчёт по своему ребёнку'],
        ],
        metrics: [
          ['Назначенные и выполненные задания', 'Назначения и статус сдачи', 'Педагог и родитель'],
          ['Прогресс по темам', 'Результаты проверенных работ', 'Педагог, ученик и родитель'],
          ['Последние достижения', 'Освоенная тема или завершённый этап с датой', 'Педагог, ученик и родитель'],
        ],
      },
      links: [{ label: 'Запросить доступ к демо', href: contacts.telegram + '?text=' + encodeURIComponent('Хочу запросить доступ к демо «Аксента».') }],
    },
  ],
  en: [
    { name: 'City Technologies', preview: 'city', status: 'B2B / B2G · NDA', summary: 'We are integrating a commercial service into a public-sector platform to simplify access for users. Project details are covered by a confidentiality agreement.', links: [] },
    { name: 'Larion Keyway', status: 'Beta · preparing for licensing', summary: 'A keyboard-driven macOS app based on Magerko’s open-source Copilot. We are preparing a licensed commercial release.', links: keyway('Discuss beta access or licensing', 'Upstream project · MIT') },
    {
      name: 'Cognivue', preview: 'cognivue', status: 'MVP in development',
      summary: 'A tool for teams exploring how an audience might respond to an interface or advertising creative before launch.',
      details: {
        title: 'Sample design review',
        description: 'A team uploads a design and asks a question about it. The report shows which elements drew attention and what the team should test before launch.',
      },
      links: [],
    },
    {
      name: 'Axenta', preview: 'axenta', status: 'Demo · in development',
      summary: 'An AI tutor that assesses a learner’s level and helps explain assignments using notes and photos of their work.',
      details: {
        title: 'A mini-school for teachers',
        description: 'In the demo, a teacher adds students and assigns work. Parents can see their child’s progress. The example class uses sample data.',
        roles: [
          ['Teacher', 'Assigns work and tracks completion'],
          ['Student', 'Completes work and sees their progress'],
          ['Parent', 'Reviews their child’s report'],
        ],
        metrics: [
          ['Assigned and completed work', 'Assignment and submission status', 'Teacher and parent'],
          ['Progress by topic', 'Results of graded work', 'Teacher, student and parent'],
          ['Recent milestones', 'A completed stage or topic with its date', 'Teacher, student and parent'],
        ],
      },
      links: [{ label: 'Request demo access', href: contacts.telegram + '?text=' + encodeURIComponent('I would like access to the Axenta demo.') }],
    },
  ],
};
