import { esc, renderCaseDetails } from './site.mjs';
import { renderAuraCover, renderAuraMedia } from './aurawatch-media.mjs';
import { renderAuraOrb } from './aurawatch-orb.mjs';

export const auraCover = 'aurawatch/media/cover.jpg';

export const auraCopy = {
  ru: {
    eyebrow: 'Собственный продукт Devlarion · iOS и watchOS',
    subtitle: 'ИИ-ассистент для Apple Watch и iPhone',
    intro: 'Задайте вопрос с запястья, получите подсказку по ходу встречи и откройте её итоги на iPhone.',
    status: 'Готовим закрытую бету. Съёмка в режиме Demo.',
    card: 'Голосовые ответы на Apple Watch, подсказки во время разговора и итоги встреч на iPhone. Готовим закрытую бету.',
    description: 'Как Devlarion разрабатывает AuraWatch для Apple Watch и iPhone. Экраны и запись сеанса в режиме Demo, дизайн орба и подготовка к закрытой бете.',
    imageAlt: 'AuraWatch в режиме Demo на iPhone и Apple Watch',
    seeApp: 'Смотреть приложение',
    brief: 'Задача и решение',
    taskTitle: 'Задача',
    task: 'Во время встречи за телефоном легко потерять нить разговора. Задача — дать человеку короткий ответ на запястье и сохранить подробности, к которым можно вернуться после встречи.',
    solutionTitle: 'Решение',
    solution: 'Мы разрабатываем два нативных приложения с общим сервером. На часах «Тихий суфлёр» выводит короткие подсказки. На iPhone можно перечитать итоги встречи, продолжить чат и добавить материалы в базу знаний.',
    flow: ['Вопрос на часах', 'Ответ по частям', 'Подсказки во время встречи', 'Итоги на iPhone'],
    history: 'Как развивается проект',
    milestones: [
      ['20 ноября 2026', 'Первый разговор с запястья', 'Связали часы и iPhone с сервером FastAPI. В первой рабочей версии уже можно было задать вопрос голосом, открыть чат и запустить суфлёр.'],
      ['20 ноября 2026', 'Подтверждение перед действием', 'Добавили карточки на часах. Пользователь видит, что предлагает ассистент, и может подтвердить действие или отменить его. Перед записью встречи приложение запрашивает согласие.'],
      ['20 ноября 2026', 'Контекст для других ассистентов', 'Подготовили MCP-коннектор для ChatGPT и Claude. Чтение данных и внесение изменений требуют отдельных разрешений.'],
      ['22 ноября 2026', 'Подготовка закрытой беты', 'Готовим приложения к закрытому тестированию. На iPhone уже работают запись и отправка изображений в чат. В отдельной сборке пробуем модели, которые запускаются на самом устройстве.'],
    ],
    betaStage: 'Текущий этап',
    next: 'Закрытая бета AuraWatch',
    invitation: 'Заявки собирает Илья, основатель Devlarion. Кнопка откроет Telegram с готовым текстом заявки.',
  },
  en: {
    eyebrow: 'A Devlarion product · iOS and watchOS',
    subtitle: 'AI assistant for Apple Watch and iPhone',
    intro: 'Ask a question from your wrist, get a prompt during a meeting and review the summary on your iPhone.',
    status: 'Preparing for private beta. Captured in Demo mode.',
    card: 'Voice answers on Apple Watch, prompts during conversations and meeting summaries on iPhone. We’re preparing for private beta.',
    description: 'How Devlarion is building AuraWatch for Apple Watch and iPhone. Explore native screens and a session recorded in Demo mode, the orb design and preparations for private beta.',
    imageAlt: 'AuraWatch running in Demo mode on iPhone and Apple Watch',
    seeApp: 'See the app',
    brief: 'The challenge and solution',
    taskTitle: 'The challenge',
    task: 'Reaching for a phone in the middle of a meeting can break the flow of conversation. The challenge is to put a short answer on the wrist and keep the details available after the meeting.',
    solutionTitle: 'The solution',
    solution: 'We’re building two native apps with a shared backend. Silent Prompter shows short prompts on the watch. On iPhone, you can review meeting summaries, continue a chat and add material to your knowledge base.',
    flow: ['Ask from the watch', 'Read the streamed reply', 'Get prompts during a meeting', 'Review the summary on iPhone'],
    history: 'How AuraWatch is taking shape',
    milestones: [
      ['20 November 2026', 'The first conversation on the wrist', 'We connected both apps to a FastAPI backend. The first working build could take a voice question, open a chat and run Silent Prompter.'],
      ['20 November 2026', 'A chance to confirm each action', 'We added cards on the watch so people could see a proposed action and confirm or cancel it. The app also asks for consent before recording a meeting.'],
      ['20 November 2026', 'Context for other assistants', 'We built an MCP connector for ChatGPT and Claude. Reading data and making changes each require a separate permission.'],
      ['22 November 2026', 'Preparing for private beta', 'We’re preparing both apps for private testing. The iPhone build already supports recording and image attachments in chat. In a separate build, we’re trying models that run on the device.'],
    ],
    betaStage: 'Current stage',
    next: 'AuraWatch private beta',
    invitation: 'Ilia, Devlarion’s founder, collects the applications. The button opens Telegram with your request ready to send.',
  },
};

const versions = ['v0.9', 'v1.0-rc', 'v1.1-rc'];
const stack = {
  apps: ['Swift', 'SwiftUI', 'WatchConnectivity', 'WidgetKit', 'AVFoundation'],
  back: ['Python', 'FastAPI', 'Server-Sent Events', 'Docker Compose'],
  data: ['PostgreSQL', 'pgvector', 'Redis'],
  integrations: ['Telegram Business', 'MCP', 'OAuth', 'RevenueCat'],
};

export function renderAuraCase(lang, { asset, beta, contact, share }) {
  const t = auraCopy[lang];
  return `<article class="wrap sub case-detail aura-case">
    <div class="aura-lead">
      <div class="aura-lead-copy">
        <small>${esc(t.eyebrow)}</small>
        <h1>AuraWatch</h1>
        <p class="aura-subtitle">${esc(t.subtitle)}</p>
        <p class="intro">${esc(t.intro)}</p>
        <p class="aura-status">${esc(t.status)}</p>
        <div class="actions"><a class="button" href="#screens">${esc(t.seeApp)} <span aria-hidden="true">↓</span></a>${beta}</div>
      </div>
      ${renderAuraCover(lang, asset)}
    </div>
    <section class="aura-brief" aria-labelledby="brief-title">
      <h2 id="brief-title">${esc(t.brief)}</h2>
      <dl><div><dt>${esc(t.taskTitle)}</dt><dd>${esc(t.task)}</dd></div>
          <div><dt>${esc(t.solutionTitle)}</dt><dd>${esc(t.solution)}</dd></div></dl>
      ${renderCaseDetails(lang, { flow: t.flow })}
    </section>
    ${renderAuraMedia(lang, asset)}
    ${renderAuraOrb(lang, asset)}
    <section id="development" class="aura-history" aria-labelledby="history-title">
      <h2 id="history-title">${esc(t.history)}</h2>
      <ol>${t.milestones.map(([date, title, text], i) => `<li>
        <div class="aura-milestone-date"><time datetime="2026-11-${i === 3 ? '22' : '20'}">${esc(date)}</time><span>${esc(versions[i] ?? t.betaStage)}</span></div>
        <div><h3>${esc(title)}</h3><p>${esc(text)}</p></div>
      </li>`).join('')}</ol>
      ${renderCaseDetails(lang, { stack })}
    </section>
    <section class="aura-next" aria-labelledby="beta-title">
      <h2 id="beta-title">${esc(t.next)}</h2>
      <p>${esc(t.invitation)}</p>
      <div class="actions">${beta}${contact}${share}</div>
    </section>
  </article>`;
}
