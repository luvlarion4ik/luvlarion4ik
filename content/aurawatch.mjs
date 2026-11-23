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
    description: 'Как Devlarion разрабатывает AuraWatch для Apple Watch и iPhone с сентября 2026 года. Нативные экраны, работа суфлёра в режиме Demo и подготовка к закрытой бете.',
    imageAlt: 'AuraWatch в режиме Demo на iPhone и Apple Watch',
    seeApp: 'Смотреть приложение',
    brief: 'Задача и решение',
    taskTitle: 'Задача',
    task: 'Во время встречи за телефоном легко потерять нить разговора. Задача — дать человеку короткий ответ на запястье и сохранить подробности, к которым можно вернуться после встречи.',
    solutionTitle: 'Решение',
    solution: 'Мы разрабатываем два нативных приложения с общим сервером. На часах «Тихий суфлёр» выводит короткие подсказки. На iPhone можно перечитать итоги встречи, продолжить чат и добавить материалы в базу знаний.',
    flow: ['Вопрос на часах', 'Ответ по частям', 'Подсказки во время встречи', 'Итоги на iPhone'],
    history: 'Как развивается проект',
    historyIntro: 'Работаем над AuraWatch с сентября 2026 года. Даты ранних этапов приблизительные.',
    milestones: [
      ['2026-09', 'Двадцатые числа сентября', 'Первый разговор с запястья', 'Начали с одного вопроса. Его можно было задать голосом и прочитать ответ прямо на часах.'],
      ['2026-10', 'Октябрь', 'Диалог продолжается на iPhone', 'Короткий ответ удобно прочитать на запястье. Для длинных ответов и уточнений связали чат на часах с iPhone, где разговор можно открыть снова.'],
      ['2026-11', 'Первая половина ноября', 'Подсказка во время встречи', 'Собрали сценарий «Тихого суфлёра». Во время разговора на часах появляется короткая подсказка, а после встречи можно вернуться к её итогам.'],
      ['2026-11-20', '20 ноября', 'Пользователь решает, что разрешить', 'На часах появились карточки для подтверждения или отмены действий. Для подключения ChatGPT и Claude через MCP разделили разрешения на чтение и изменение данных.', 'v1.0-rc · v1.1-rc'],
      ['2026-11-22', 'С 22 ноября', 'Готовим закрытую бету', 'На iPhone уже работают запись встреч и отправка изображений в чат. Проверяем вход и первые шаги в приложении. В отдельной сборке пробуем модели, которые работают на самом устройстве.', 'Текущий этап'],
    ],
    next: 'Закрытая бета AuraWatch',
    invitation: 'Заявки собирает Илья, основатель Devlarion. Кнопка откроет Telegram с готовым текстом заявки.',
  },
  en: {
    eyebrow: 'A Devlarion product · iOS and watchOS',
    subtitle: 'AI assistant for Apple Watch and iPhone',
    intro: 'Ask a question from your wrist, get a prompt during a meeting and review the summary on your iPhone.',
    status: 'Preparing for private beta. Captured in Demo mode.',
    card: 'Voice answers on Apple Watch, prompts during conversations and meeting summaries on iPhone. We’re preparing for private beta.',
    description: 'Devlarion has been building AuraWatch for Apple Watch and iPhone since September 2026. Explore the native screens, a Demo prompter session and preparations for private beta.',
    imageAlt: 'AuraWatch running in Demo mode on iPhone and Apple Watch',
    seeApp: 'See the app',
    brief: 'The challenge and solution',
    taskTitle: 'The challenge',
    task: 'Reaching for a phone in the middle of a meeting can break the flow of conversation. The challenge is to put a short answer on the wrist and keep the details available after the meeting.',
    solutionTitle: 'The solution',
    solution: 'We’re building two native apps with a shared backend. Silent Prompter shows short prompts on the watch. On iPhone, you can review meeting summaries, continue a chat and add material to your knowledge base.',
    flow: ['Ask from the watch', 'Read the streamed reply', 'Get prompts during a meeting', 'Review the summary on iPhone'],
    history: 'How AuraWatch is taking shape',
    historyIntro: 'We started building AuraWatch in September 2026. Dates for the early stages are approximate.',
    milestones: [
      ['2026-09', 'Late September', 'The first conversation on the wrist', 'We started with a single question. You could ask it out loud and read the reply right on the watch.'],
      ['2026-10', 'October', 'The conversation continues on iPhone', 'A short answer fits on the wrist. For longer replies and follow-up questions, we connected the watch chat to the iPhone app so you could pick up the conversation later.'],
      ['2026-11', 'First half of November', 'A prompt during a meeting', 'We built Silent Prompter around a conversation. A short prompt appears on the watch while people are talking, and the meeting summary is there to revisit afterwards.'],
      ['2026-11-20', '20 November', 'The user decides what to allow', 'We added watch cards for confirming or cancelling actions. The MCP connector for ChatGPT and Claude asks for separate permissions to read and change data.', 'v1.0-rc · v1.1-rc'],
      ['2026-11-22', 'From 22 November', 'Preparing for private beta', 'The iPhone app now supports meeting recordings and images in chat. We’re testing sign-in and onboarding, and trying on-device models in a separate build.', 'Current stage'],
    ],
    next: 'AuraWatch private beta',
    invitation: 'Ilia, Devlarion’s founder, collects the applications. The button opens Telegram with your request ready to send.',
  },
};

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
      <p>${esc(t.historyIntro)}</p>
      <ol>${t.milestones.map(([isoDate, date, title, text, stage]) => `<li>
        <div class="aura-milestone-date"><time datetime="${isoDate}">${esc(date)}</time>${stage ? `<span>${esc(stage)}</span>` : ''}</div>
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
