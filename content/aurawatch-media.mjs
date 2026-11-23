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
  const videoTitle = ru ? "Сеанс суфлёра на часах" : "A prompter session on the watch";
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
    <figure id="session-video" class="aura-film">
      <div class="aura-film-stage"><video width="416" height="496" controls playsinline preload="metadata" poster="${media}watch-demo-poster.png" aria-labelledby="aura-film-title" aria-describedby="aura-film-description">
        <source src="${media}watch-demo.mp4" type="video/mp4"><source src="${media}watch-demo.webm" type="video/webm">
        <a href="${media}watch-demo.mp4">${ru ? "Открыть запись (MP4)" : "Open recording (MP4)"}</a>
      </video></div>
      <figcaption><small>Apple Watch · ${ru ? "20 с" : "20 s"}</small><h3 id="aura-film-title">${videoTitle}</h3>
      <p id="aura-film-description">${ru ? "Вводим «Нагрузка», читаем подсказку о Kafka и открываем итоги разговора. Снято в приложении для watchOS в режиме Demo. Паузы сокращены." : "We enter “Нагрузка” (load), read a prompt about Kafka and open the conversation summary. Recorded in the native watchOS app in Demo mode, with pauses shortened."}</p></figcaption>
    </figure>
  </section>`;
}
