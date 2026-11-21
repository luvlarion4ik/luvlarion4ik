export const identity = {
  brand: "Devlarion",
  founder: {ru: "Илья Ларионов", en: "Ilia Larionov"},
  github: "https://github.com/luvlarion4ik",
  telegram: "https://t.me/LuvLarion4ik",
  threads: "https://www.threads.com/@luvlarion4ik",
  portfolio: "https://luvlarion4ik.github.io/luvlarion4ik/"
};
export function siteBase(value = process.env.DEVLARION_SITE_URL ?? identity.portfolio) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('DEVLARION_SITE_URL must be an HTTP(S) site URL without credentials, query or fragment.');
  }
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url.href;
}

export const copy = {
 ru: {
  nav:["Услуги","Кейсы","Команда","Контакты"], cta:"Обсудить проект", cases:"Смотреть кейсы", eyebrow:"Студия разработки Devlarion",
  title:"Сайты, боты и ИИ-сервисы", intro:"Помогаю бизнесу принимать заявки и сокращать ручную работу. Разрабатываю сайты с каталогом, ботов для записи и сервисы, которые связывают данные компании.",
  services:"Направления работы", fees:"Стоимость и сроки", estimate:"Рассчитать проект", work:"Избранные кейсы", process:"От задачи до запуска", bureau:"Команда",
  bio:"Я ваш контакт от первого сообщения до сдачи. На созвоне разбираю, как устроена работа сейчас, предлагаю решение и показываю результат по этапам. Условия NDA согласуем до передачи закрытых материалов.",
  steps:[["Разбор задачи","Вы описываете процесс и ожидаемый результат. Мы готовим вопросы и варианты реализации к первому созвону."],["Проектирование","На первом созвоне обсуждаем варианты. На втором уточняем детали и согласуем итоговый объём."],["Договор","Фиксируем результат, сроки, этапы и порядок приёмки. Порядок оплаты согласуем в договоре."],["Разработка и сдача","Показываем результат по этапам или целиком, как договорились. Учитываем обратную связь, подписываем закрывающие документы и получаем остаток оплаты."],["Сопровождение","Два месяца после сдачи исправляем обнаруженные недочёты без доплаты. Дополнительные задачи оцениваем отдельно."]],products:"Продукты Devlarion", about:"Основатель Devlarion", faq:"Частые вопросы", ask:"Какую задачу решаем?", close:"Напишите, какой процесс хотите изменить, кто им пользуется и как сейчас выглядит результат. Сообщение получит Илья.",
  faqs:[["Как узнать стоимость небольшого проекта?","В разделе услуг указаны стартовые цены и состав каждого пакета. Если нужны интеграции или несколько сценариев, на созвоне уточним объём и возможную скидку. После встречи пришлём итоговую стоимость."],["Можно ли организовать встречу?","Начнём с видеозвонка. Если нужна личная встреча, напишите город и что хотите обсудить — согласуем формат заранее."],["Можно работать в нашем контуре?","Да. Для развёртывания моделей заранее разбираем доступные мощности, требования к данным и ограничения доступа."],["Как оформляется NDA?","Обсудим режим конфиденциальности до передачи закрытых материалов и закрепим условия в документах."],["Сколько правок входит и кому передаётся код?","Объём правок, передачу исходников и права на результат согласуем в договоре до начала разработки."],["Что после двух месяцев поддержки?","Дальнейшие доработки оцениваем отдельно. Для регулярных задач можно согласовать подписку на сопровождение."]]
 },
 en: {
  nav:["Services","Work","Team","Contact"], cta:"Discuss a project", cases:"View our work", eyebrow:"Devlarion development studio",
  title:"Websites, bots and AI services", intro:"I help businesses take enquiries and cut manual work. I build catalogue websites, booking bots and tools that connect the systems your team uses.",
  services:"Our capabilities", fees:"Pricing and timelines", estimate:"Estimate a project", work:"Selected work", process:"From brief to launch", bureau:"Team",
  bio:"I’m your point of contact from the first message to handover. On our call I ask how the work gets done today, propose a solution and show progress as it takes shape. We can agree on an NDA before sharing confidential material.",
  steps:[["Scope the project","Tell us about the current process and the outcome you need. We prepare questions and options before our first call."],["Project design","We discuss alternatives together, refine the proposal and agree on the scope in a second meeting."],["Agreement","We document the deliverables, timeline and acceptance criteria. The agreement sets out the payment schedule."],["Delivery","We deliver in stages or in full, address feedback and sign the acceptance documents before final payment."],["Support","We fix issues in the delivered scope for two months at no extra charge. Additional work is estimated separately."]],products:"Devlarion products",about:"Founder of Devlarion",faq:"Common questions",ask:"What are you working on?",close:"Tell us which workflow you want to change, who uses it and what happens today. Your message goes directly to Ilia.",
  faqs:[["How do I price a small project?","The services section lists starting prices and what each package covers. For integrations or multiple workflows, we’ll discuss scope and any applicable discount on a call, then send a final quote."],["Can we arrange a meeting?","We can start with a video call. For an in-person meeting, send your city and the topics you’d like to cover so we can agree on the format in advance."],["Can you deploy on our infrastructure?","Yes. We review your compute capacity, data requirements and access restrictions before selecting the deployment architecture."],["Can we work under NDA?","We agree on confidentiality terms before you share restricted materials."],["How do revisions and source ownership work?","The agreement sets out the revision scope, source delivery and rights before development begins."],["What happens after two months?","Further work is quoted separately. A support subscription is available for ongoing needs."]]
 }
};

export const homeCopy = {
  ru: {
    title: 'Сайты, боты и ИИ-сервисы, которые приносят заявки',
    intro: 'Помогаю бизнесу принимать заявки и сокращать ручную работу. Выберите, кто вы, — покажем подходящие решения и цены.',
    audience: 'Для кого',
    segmentAction: 'Смотреть решения',
    visited: 'Вы смотрели',
    why: 'Почему это важно для вашего бизнеса',
    whyFacts: [
      ['Клиенты ищут до того, как звонят', 'Прежде чем написать, человек открывает поисковик, карты или спрашивает ИИ. Если вас там нет, он выбирает того, кто есть.'],
      ['Заявки не теряются', 'Сайт и бот принимают обращения ночью и в выходные и сразу передают их вам в Telegram или CRM.'],
      ['Меньше ручной работы', 'Ответы на частые вопросы, запись и расчёт стоимости происходят без менеджера.'],
    ],
    whyLink: 'Подробнее — зачем бизнесу сайт',
    growth: 'Рост после запуска',
    growthLinks: [['SEO', 'Видимость в Яндексе и Google.'], ['GEO', 'Присутствие в ответах ИИ.'], ['Сопровождение', 'Правки, мониторинг и развитие.']],
    allCases: 'Все кейсы',
    moreProducts: 'Ещё продукты',
    studio: 'Devlarion разрабатывает сайты, ботов, мобильные приложения и ИИ-сервисы. Ведём проект от анализа задачи до запуска и поддержки. Состав работ, смету и этапы согласуем до старта.',
    quote: 'Не знаете, что выбрать? Рассчитайте проект за 1 минуту',
  },
  en: {
    title: 'Websites, bots and AI services that bring in enquiries',
    intro: 'I help businesses take enquiries and cut manual work. Choose the option that fits your business to see solutions and prices.',
    audience: 'Who we work with',
    segmentAction: 'Explore solutions',
    visited: 'You viewed this',
    why: 'Why it matters for your business',
    whyFacts: [
      ['Customers look before they call', 'People check search engines and maps or ask AI before getting in touch. If they cannot find you, they may choose a business they can find.'],
      ['Enquiries reach you', 'A website and bot take enquiries at night and at weekends and send them straight to Telegram or your CRM.'],
      ['Less manual work', 'Customers can get answers, make bookings and request an estimate without waiting for your team.'],
    ],
    whyLink: 'Read more about why businesses need a website',
    growth: 'Growth after launch',
    growthLinks: [['SEO', 'Visibility in Google and Yandex.'], ['GEO', 'Visibility in AI answers.'], ['Support', 'Updates, monitoring and improvements.']],
    allCases: 'All case studies',
    moreProducts: 'More products',
    studio: 'Devlarion builds websites, bots, mobile apps and AI services. We take projects from discovery through to launch and support. We agree on the scope, budget and milestones before work starts.',
    quote: 'Unsure where to start? Estimate your project in one minute',
  },
};
