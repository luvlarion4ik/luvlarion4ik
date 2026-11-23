const screens = [
  {
    file: "watch-home",
    ru: ["Вопрос с запястья", "Касание орба запускает голосовой вопрос. Рядом — суфлёр и быстрая заметка.", "Точечный орб и кнопки суфлёра и заметки на Apple Watch"],
    en: ["Ask from your wrist", "Tap the orb to ask a question. The prompter and quick note sit just below it.", "Dot-matrix orb above the prompter and note buttons on Apple Watch"]
  },
  {
    file: "iphone-chat",
    ru: ["Продолжить диалог", "На iPhone можно перечитать ответ о маршруте и задать следующий вопрос.", "Чат на iPhone с вопросом о встрече и ответом о времени в пути"],
    en: ["Continue the conversation", "On iPhone, read the route advice again and ask a follow-up question.", "iPhone chat showing a question about a meeting and an answer about travel time"]
  },
  {
    file: "watch-chat",
    ru: ["Ответ на часах", "Время в пути и подсказка, когда выехать, помещаются на экране часов.", "Ответ AuraWatch с расчётом времени до встречи на Apple Watch"],
    en: ["Read the answer on your watch", "The travel time and a suggested departure time fit on the watch face.", "AuraWatch reply on Apple Watch with the time needed to reach a meeting"]
  },
  {
    file: "watch-consent",
    ru: ["Перед записью", "Суфлёр объясняет, как обрабатывается звук, и напоминает получить согласие участников.", "Условия записи разговора и кнопка подтверждения на часах"],
    en: ["Before recording", "The prompter explains how it handles audio and asks you to obtain the participants’ consent.", "Recording information and a confirmation button on Apple Watch"]
  },
  {
    file: "watch-copilot",
    ru: ["Тихий суфлёр", "Во время сеанса можно продиктовать фразу для подсказки или остановить запись.", "Сеанс суфлёра с кнопками диктовки и остановки на Apple Watch"],
    en: ["Silent Prompter", "During a session, dictate a phrase for a prompt or tap to stop recording.", "An Apple Watch prompter session with dictation and stop controls"]
  },
  {
    file: "iphone-knowledge",
    ru: ["Свои материалы", "Загрузите документ или добавьте заметку. Ассистент сможет учитывать их в ответах.", "База знаний на iPhone со списком документов и кнопками загрузки и заметки"],
    en: ["Bring your own materials", "Upload a document or add a note so the assistant can draw on it in future replies.", "iPhone knowledge base with a list of documents and buttons to upload or add a note"]
  },
  {
    file: "iphone-telegram",
    ru: ["Подключение Telegram", "На одном экране видны состояние подключения чатов и черновики ответов.", "Настройки Telegram на iPhone со статусом подключения и черновиком"],
    en: ["Connect Telegram", "Check whether your chats are connected and see the drafts waiting for review.", "Telegram settings on iPhone showing connection status and a draft reply"]
  },
  {
    file: "iphone-orb",
    ru: ["Характер орба", "На iPhone можно сравнить движения точек и выбрать, как будет выглядеть орб на часах.", "Экран оформления на iPhone с выбранным классическим орбом и переключателем состояний"],
    en: ["Choose the orb’s character", "Compare motion styles on iPhone and choose how the orb will look on your watch.", "iPhone appearance settings with the Classic orb selected and controls for its states"]
  }
];

export function renderAuraCover(lang, asset) {
  const ru = lang === "ru";
  const media = asset + "aurawatch/media/";
  return `<figure class="aura-cover">
    <div class="aura-cover-stage">
      <div class="aura-cover-phone"><img src="${media}iphone-knowledge.png" width="720" height="1565" alt="${ru ? "База знаний AuraWatch на iPhone" : "The AuraWatch knowledge base on iPhone"}"></div>
      <div class="aura-cover-watch"><div class="aura-cover-case"><img src="${media}watch-home.png" width="416" height="496" alt="${ru ? "Главный экран Apple Watch с орбом «Матрица»" : "Apple Watch home screen with the Matrix orb"}"></div></div>
    </div>
    <figcaption>${ru ? "Нативные экраны iOS и watchOS · режим Demo" : "Native iOS and watchOS screens · Demo mode"}</figcaption>
  </figure>`;
}

export function renderAuraMedia(lang, asset) {
  const ru = lang === "ru";
  const media = asset + "aurawatch/media/";
  const cards = screens.map(screen => {
    const watch = screen.file.startsWith("watch-");
    const [title, caption, alt] = screen[lang];
    const url = media + screen.file + ".png";
    return `<li><figure class="aura-screen">
      <a class="aura-screen-stage" href="${url}" aria-label="${ru ? "Открыть в полном размере" : "Open full-size image"} — ${alt}">
        <img src="${url}" width="${watch ? 416 : 720}" height="${watch ? 496 : 1565}" class="${watch ? "aura-screen-watch" : "aura-screen-phone"}" loading="lazy" alt="${alt}">
      </a>
      <figcaption><small>${watch ? "Apple Watch" : "iPhone"}</small><strong>${title}</strong><p>${caption}</p></figcaption>
    </figure></li>`;
  }).join("");
  const sessionFrames = [
    ["input", ru ? "Фраза" : "Input",
      ru ? "Вводим на часах слово «Нагрузка»." : "We enter “Нагрузка” (load) on the watch.",
      ru ? "Слово «Нагрузка» над клавиатурой Apple Watch" : "The Russian word for load above the Apple Watch keyboard"],
    ["hint", ru ? "Подсказка" : "Prompt",
      ru ? "Суфлёр напоминает цифру для ответа — 40 тысяч событий в секунду в Kafka." : "The prompter brings up a figure for the answer — 40,000 Kafka events per second.",
      ru ? "Первая подсказка на часах с текстом «Kafka, 40k событий/с»" : "The first watch prompt showing Kafka and 40k events per second"],
    ["summary", ru ? "Итоги встречи" : "Meeting summary",
      ru ? "После разговора открываем резюме собеседования и список подсказок." : "After the conversation, we open the interview summary and review the prompts.",
      ru ? "Итоги собеседования с резюме и счётчиком из девяти подсказок" : "Interview summary with notes and a count of nine prompts"],
  ];
  return `<section id="screens" class="aura-media" aria-labelledby="screens-title">
    <h2 id="screens-title">${ru ? "Приложение в работе" : "The app in action"}</h2>
    <div class="aura-gallery-head">
      <p>${ru ? "Снимки из симуляторов Apple Watch и iPhone в режиме Demo." : "Apple Watch and iPhone simulator screens captured in Demo mode."}</p>
      <div class="aura-gallery-controls" hidden>
        <output class="aura-screen-range" aria-label="${ru ? "Экраны в галерее" : "Screens in view"}"></output>
        <button class="ghost" type="button" data-step="-1" aria-controls="aura-screens"><span aria-hidden="true">←</span> ${ru ? "Назад" : "Previous"}</button>
        <button class="ghost" type="button" data-step="1" aria-controls="aura-screens">${ru ? "Далее" : "Next"} <span aria-hidden="true">→</span></button>
      </div>
    </div>
    <ul id="aura-screens" class="aura-screens" tabindex="0" aria-label="${ru ? "Скриншоты AuraWatch" : "AuraWatch screenshots"}">${cards}</ul>
  </section>
  <section id="session-video" class="aura-session" aria-labelledby="session">
    <h2 id="session">${ru ? "Сеанс суфлёра на часах" : "A prompter session on the watch"}</h2>
    <p>${ru ? "На примере собеседования в режиме Demo." : "From a sample interview in Demo mode."}</p>
    <ol class="aura-session-frames">${sessionFrames.map(([file, title, caption, alt]) => {
      const url = media + "session-" + file + ".png";
      return `<li><figure>
        <a href="${url}" aria-label="${ru ? "Открыть в полном размере" : "Open full-size image"} — ${alt}"><img src="${url}" width="416" height="496" alt="${alt}" loading="lazy"></a>
        <figcaption><h3>${title}</h3><p>${caption}</p></figcaption>
      </figure></li>`;
    }).join("")}</ol>
  </section>`;
}
