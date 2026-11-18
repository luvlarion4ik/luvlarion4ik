export const identity = {
  name: "Ilia Larionov",
  nameRu: "Илья Ларионов",
  brand: "DevLarion",
  github: "https://github.com/luvlarion4ik",
  telegram: "https://t.me/LuvLarion4ik",
  portfolio: "https://luvlarion4ik.github.io/luvlarion4ik/",
  orientSite: "https://orientlogic.ru/",
  copilotUpstream: "https://github.com/Magerko/copilot",
  stack: ["TypeScript", "Next.js", "Python", "FastAPI", "SwiftUI", "Serverless", "AI integrations"]
};

export const work = {
  "orient-logic": { href: identity.orientSite, image: { file: "orient-logic.jpg", width: 1280, height: 675 } },
  "reshis-avia": { image: { file: "reshis-avia.jpg", width: 1004, height: 581 } }
};

export const copy = {
  en: {
    title: "Ilia Larionov — AI / Full-Stack Developer",
    description: "Ilia Larionov’s portfolio: web apps, Telegram bots, AI projects and achievements",
    role: "Independent full-stack developer and founder of DevLarion",
    currentTitle: "Currently building",
    current: [["wrist-ai", "Wrist AI", "AI assistant for Apple Watch"], ["city-technologies", "City Technologies", "City services platform for YNAO"]],
    caseLabel: "Read the case study",
    theme: { label: "Color theme", copper: "Copper", midnight: "Midnight", sage: "Sage" },
    intro: "I build web products, apps and bots. I use AI to automate routine work on client projects and in my own products.",
    nav: ["Selected work", "Studio & products", "Milestones"],
    language: "Русский",
    contact: "Message me on Telegram",
    iconCredit: "Send icon · 21st.dev",
    contactTitle: "Get in touch",
    contactCopy: "Message me on Telegram to discuss a project or working together.",
    projectLink: "Open live site",
    projects: [
      {
        id: "orient-logic",
        title: "Orient Logic",
        imageAlt: "Orient Logic homepage with the freight quote and contact links",
        type: "Main project · Commercial partnership",
        lead: "Website and inquiry flow for a freight company operating between China and Russia.",
        detail: "I took the site from requirements to implementation, built the responsive Next.js frontend and connected inquiries to Telegram.",
        tags: ["Next.js", "TypeScript", "Tailwind CSS", "Telegram"]
      },
      {
        id: "reshis-avia",
        title: "Reshis Avia",
        imageCaption: "Demo calculation using synthetic data",
        imageAlt: "Demand forecast chart and expected sales in the airline pricing demo",
        type: "Competition project · Technology track",
        lead: "An airline pricing tool that uses a demand forecast to estimate sales and compare fares.",
        detail: "I analyzed demand in Python notebooks and built a FastAPI app that shows demand quantiles, aircraft capacity and expected sales at different prices.",
        tags: ["Python", "Machine learning", "FastAPI", "Chart.js"]
      }
    ],
    studioTitle: "DevLarion studio",
    studio: "I lead projects from requirements and prototypes to development and launch. The studio builds websites, web apps, CRMs, bots for Telegram, MAX, VK and WhatsApp, Mini Apps and AI integrations.",
    labTitle: "In development",
    lab: [
      {
        id: "wrist-ai",
        name: "Wrist AI",
        status: "Preparing for an App Store release",
        summary: "My AI assistant for Apple Watch. Ask a question and read the answer on the watch.",
        story: [
          ["Why I started it", "I kept reaching for my iPhone when I wanted a quick AI answer while wearing my Apple Watch. I hadn’t found an assistant I liked using directly on the watch, so I started building one around a simple flow: ask, read the answer, get back to what you were doing."],
          ["What I built", "The SwiftUI watch app has a question field for typing or dictation, a choice of response modes, and recently asked questions. I also built an iPhone companion with Apple sign-in and a larger screen for chat."],
          ["How it works", "The watch sends the question and the selected mode to a FastAPI backend. I built the server-side routing so short questions can use a quick mode and harder questions can use a reasoning mode. The project includes tests for authentication and model routing."],
          ["What comes next", "I’m preparing the commercial release. I plan to verify the watch and iPhone flow on devices, run a TestFlight beta, and submit Wrist AI to the App Store for review."]
        ]
      },
      {
        id: "city-technologies",
        name: "City Technologies",
        status: "B2G / B2C · In development",
        summary: "A city services platform for the Yamalo-Nenets Autonomous Okrug (YNAO), with a resident-facing MAX Mini App and workspaces for operators and providers.",
        story: [
          ["For residents", "The resident-facing app brings the service catalog, request submission and status history together. Delivery scenarios also have a courier bot."],
          ["For operators and service providers", "The service app has a request queue, separate roles for operators and partners, assignment by service type and area, and a view for tracking progress. The B2G side is designed around coordinating requests and the organizations that fulfill them."],
          ["Status", "The development version includes the interfaces and request workflows. Maps and payments are currently simulated."]
        ]
      },
      {
        id: "larion-keyway",
        name: "Larion Keyway",
        status: "Beta testing",
        summary: "My macOS adaptation of Magerko’s open-source Copilot. I added a macOS platform layer, keyboard-first controls and tests for the new workflows.",
        link: ["Upstream project by Magerko · MIT", identity.copilotUpstream]
      },
      {
        id: "cognivue",
        name: "Cognivue",
        status: "MVP in development",
        summary: "A platform for evaluating how an audience may respond to websites, interfaces, advertising and video before launch."
      },
      {
        id: "axenta",
        name: "Axenta",
        status: "Telegram demo in development",
        summary: "A personalized AI tutor for students, with a level assessment and support for notes and photos of notebooks."
      }
    ],
    milestones: [
      ["DANO 2026–27 finalist", "Qualified through the second selection round and preparing for the individual and team rounds of the National Data Analysis Olympiad.", "https://dano.hse.ru/"],
      ["Artek IT program selection prizewinner", "Reached the final selection stage in the Central University and T-Bank competition, prepared a business case and presented my own project.", "https://cu.ru/events/bachelor-artek"],
      ["Central University education grant", "Received an education grant through competitive selection.", "https://apply.cu.ru/"],
      ["All-Russian School Olympiad in Mathematics", "Advanced to the regional stage."]
    ],
    challengeTitle: "Other competition projects",
    challenges: [
      ["Mirror of Probabilities · T-Bank and Central University", "Worked through the service infrastructure, product metrics, risks and options for scaling."]
    ],
    stackTitle: "Core stack",
    portfolioLabel: "Portfolio site",
    skip: "Skip to main content",
    profile: "GitHub profile",
    share: { action: "Share profile", copied: "Profile link copied", manual: "Copy this profile link" }
  },
  ru: {
    title: "Илья Ларионов — AI / Full-Stack Developer",
    description: "Портфолио Ильи Ларионова: веб-приложения, Telegram-боты, AI-проекты и достижения",
    role: "Независимый full-stack разработчик и основатель DevLarion",
    currentTitle: "Сейчас в работе",
    current: [["wrist-ai", "Wrist AI", "AI-помощник для Apple Watch"], ["city-technologies", "Технологии города", "Платформа городских услуг для ЯНАО"]],
    caseLabel: "Подробнее о проекте",
    theme: { label: "Цветовая тема", copper: "Медь", midnight: "Тёмно-синяя", sage: "Шалфей" },
    intro: "Разрабатываю веб-продукты, приложения и ботов. В студии веду коммерческие проекты, а в собственных продуктах проверяю, где ИИ упрощает повседневные задачи.",
    nav: ["Избранные работы", "Студия и продукты", "Достижения"],
    language: "English",
    contact: "Написать в Telegram",
    iconCredit: "Иконка отправки · 21st.dev",
    contactTitle: "Связаться со мной",
    contactCopy: "Напиши мне в Telegram — обсудим проект или сотрудничество.",
    projectLink: "Открыть сайт",
    projects: [
      {
        id: "orient-logic",
        title: "Orient Logic",
        imageAlt: "Главная страница Orient Logic со ссылками на расчёт поставки и связь",
        type: "Основной проект · Коммерческое партнёрство",
        lead: "Сайт и приём заявок для компании, которая возит грузы из Китая в Россию.",
        detail: "Вёл проект от сбора требований до реализации, собрал адаптивный фронтенд на Next.js и подключил отправку заявок в Telegram.",
        tags: ["Next.js", "TypeScript", "Tailwind CSS", "Telegram"]
      },
      {
        id: "reshis-avia",
        title: "«Решись Авиа»",
        imageCaption: "Пример расчёта на синтетических данных",
        imageAlt: "График прогноза спроса и ожидаемые продажи в демо расчёта цены",
        type: "Конкурсный проект · Направление «Технологии»",
        lead: "Инструмент для ценообразования авиабилетов с прогнозом спроса и оценкой продаж при разных тарифах.",
        detail: "Проанализировал спрос в Python-ноутбуках и собрал приложение на FastAPI, которое показывает квантили спроса, вместимость самолёта и ожидаемые продажи при разных ценах.",
        tags: ["Python", "Машинное обучение", "FastAPI", "Chart.js"]
      }
    ],
    studioTitle: "Студия DevLarion",
    studio: "Веду проекты от постановки задачи и прототипирования до разработки и запуска. Студия создаёт сайты, веб-приложения, CRM, ботов для Telegram, MAX, VK и WhatsApp, Mini Apps и интеграции с ИИ.",
    labTitle: "В разработке",
    lab: [
      {
        id: "wrist-ai",
        name: "Wrist AI",
        status: "Подготовка к выпуску в App Store",
        summary: "Мой AI-помощник для Apple Watch. Можно задать вопрос и прочитать ответ прямо на часах.",
        story: [
          ["Почему я начал разработку", "Я ношу Apple Watch, но за быстрым ответом от ИИ всё равно приходилось тянуться за iPhone. Я не нашёл ассистента, которым мне было бы удобно пользоваться на часах, и решил сделать свой. Хотелось, чтобы на ходу можно было задать вопрос, прочитать ответ и вернуться к делу."],
          ["Что я сделал", "Собрал watchOS-приложение на SwiftUI. В нём можно набрать или надиктовать вопрос, выбрать режим ответа и открыть недавние запросы. Сделал приложение-компаньон для iPhone со входом через Apple и чатом для задач, где удобнее экран побольше."],
          ["Как устроен сервис", "Часы передают вопрос и выбранный режим на сервер FastAPI. Я вынес выбор модели на сервер: короткий вопрос можно отправить в быстрый режим, а сложную задачу — в режим рассуждения. В проекте есть тесты авторизации и маршрутизации запросов."],
          ["План выпуска", "Готовлю приложение к коммерческому запуску. Дальше хочу проверить связку часов и iPhone на устройствах, провести бета-тестирование через TestFlight и отправить Wrist AI на проверку для публикации в App Store."]
        ]
      },
      {
        id: "city-technologies",
        name: "Технологии города",
        status: "B2G / B2C · В разработке",
        summary: "Платформа городских услуг для ЯНАО с мини-приложением MAX для жителей и рабочими кабинетами для операторов и исполнителей.",
        story: [
          ["Для жителей", "В клиентском мини-приложении есть каталог услуг, подача заявки и история её статусов. Для сценариев доставки предусмотрен отдельный бот курьера."],
          ["Для операторов и поставщиков услуг", "В рабочем мини-приложении есть очередь заявок, отдельные роли оператора и партнёра, назначение исполнителей по типу услуги и зоне и отслеживание выполнения. B2G-часть рассчитана на координацию заявок и организаций, которые их выполняют."],
          ["Текущий статус", "В разработке уже есть интерфейсы и сценарии работы с заявками. Карта и оплата пока работают в режиме симуляции."]
        ]
      },
      {
        id: "larion-keyway",
        name: "Larion Keyway",
        status: "Бета-тестирование",
        summary: "Моя адаптация открытого Copilot от Magerko для macOS. Добавил платформенный слой, управление с клавиатуры и тесты новых сценариев.",
        link: ["Оригинал Magerko · MIT", identity.copilotUpstream]
      },
      {
        id: "cognivue",
        name: "Cognivue",
        status: "MVP в разработке",
        summary: "Платформа для предварительной оценки реакции аудитории на сайты, интерфейсы, рекламу и видео."
      },
      {
        id: "axenta",
        name: "Аксента",
        status: "Telegram-демо в разработке",
        summary: "Персонализированный AI-репетитор с диагностикой уровня и работой с конспектами и фотографиями тетрадей."
      }
    ],
    milestones: [
      ["Финалист ДАНО 2026/27", "Прошёл второй отборочный этап Национальной олимпиады по анализу данных. Готовлюсь к индивидуальному и командному турам заключительного этапа.", "https://dano.hse.ru/"],
      ["Призёр отбора на ИТ-смену в «Артеке»", "Прошёл финальный этап конкурса Центрального университета и Т-Банка, подготовил бизнес-кейс и представил собственный проект.", "https://cu.ru/events/bachelor-artek"],
      ["Образовательный грант Центрального университета", "Получил грант по результатам конкурсного отбора.", "https://apply.cu.ru/"],
      ["Всероссийская олимпиада школьников по математике", "Вышел в региональный этап."]
    ],
    challengeTitle: "Другие конкурсные проекты",
    challenges: [
      ["«Зеркало вероятностей» · Т-Банк и ЦУ", "Проработал инфраструктуру сервиса, продуктовые метрики, риски и варианты масштабирования."]
    ],
    stackTitle: "Основной стек",
    portfolioLabel: "Сайт-портфолио",
    skip: "К основному содержимому",
    profile: "Профиль GitHub",
    share: { action: "Поделиться профилем", copied: "Ссылка на профиль скопирована", manual: "Скопируйте ссылку на профиль" }
  }
};
