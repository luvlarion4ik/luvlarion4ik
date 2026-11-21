import { esc } from './site.mjs';

// Страница «Личный кабинет». Кабинет — отдельное приложение, поэтому до его запуска страница
// честно называется предпросмотром, а вход включается одной строкой в content/site.json:
// "portal": { "status": "open", "url": "https://cabinet.devlarion.ru/" }.

export function portalState(portal = {}) {
  const open = portal.status === 'open' && Boolean(portal.url);
  return { open, url: open ? portal.url : '' };
}

export function portalLoginLink(lang, portal, tg, classes = 'button') {
  const ru = lang === 'ru';
  const { open, url } = portalState(portal);
  if (open) return `<a class="${classes}" href="${esc(url)}" data-goal="portal_login">${ru ? 'Войти в кабинет' : 'Sign in to the portal'}</a>`;
  const text = encodeURIComponent(ru ? 'Хочу получить доступ к личному кабинету Devlarion.' : 'I’d like access to the Devlarion client portal.');
  return `<a class="${classes}" href="${esc(tg + (tg.includes('?') ? '&' : '?') + 'text=' + text)}" data-goal="portal_waitlist">${ru ? 'Запросить доступ' : 'Request access'}</a>`;
}

// Небольшие анимированные иллюстрации для пустых состояний и первого экрана.
const art = {
  repo: `<svg class="pt-art" viewBox="0 0 180 120" aria-hidden="true">
    <path class="draw" pathLength="1" d="M40 14V106"/>
    <path class="draw d2" pathLength="1" d="M40 38C40 58 94 46 94 68V80C94 98 40 86 40 96"/>
    <circle class="node" style="--i:0" cx="40" cy="14" r="7"/><circle class="node" style="--i:1" cx="40" cy="38" r="7"/>
    <circle class="node" style="--i:2" cx="94" cy="68" r="7"/><circle class="node" style="--i:3" cx="40" cy="96" r="7"/>
    <rect class="tag" style="--i:1" x="108" y="30" width="52" height="11" rx="5.5"/><rect class="tag" style="--i:2" x="108" y="62" width="40" height="11" rx="5.5"/><rect class="tag" style="--i:3" x="62" y="92" width="60" height="11" rx="5.5"/>
    <circle class="pulse" cx="40" cy="14" r="4"/></svg>`,
  docs: `<svg class="pt-art" viewBox="0 0 180 120" aria-hidden="true">
    <g class="doc doc--a"><path class="draw" pathLength="1" d="M26 18h50l14 14v70H26Z"/><path class="draw d2" pathLength="1" d="M76 18v14h14"/>
      <path class="line" d="M38 50h38M38 62h46M38 74h30"/></g>
    <g class="doc doc--b"><path class="draw d2" pathLength="1" d="M82 28h50l14 14v70H82Z"/><path class="draw d3" pathLength="1" d="M132 28v14h14"/>
      <path class="line" d="M94 60h38M94 72h46"/>
      <circle class="stamp" cx="124" cy="94" r="12"/><path class="tick" pathLength="1" d="M118 94l4.5 4.5L131 89"/></g></svg>`,
  chat: `<svg class="pt-art" viewBox="0 0 180 120" aria-hidden="true">
    <rect class="bubble" style="--i:0" x="20" y="16" width="86" height="28" rx="12"/><path class="line" d="M32 30h50"/>
    <rect class="bubble bubble--me" style="--i:1" x="70" y="52" width="90" height="28" rx="12"/><path class="line line--me" d="M82 66h58"/>
    <rect class="bubble" style="--i:2" x="20" y="88" width="62" height="24" rx="12"/>
    <circle class="dot" style="--i:0" cx="38" cy="100" r="3"/><circle class="dot" style="--i:1" cx="51" cy="100" r="3"/><circle class="dot" style="--i:2" cx="64" cy="100" r="3"/></svg>`,
  orbit: `<svg class="pt-orbits" viewBox="0 0 400 400" aria-hidden="true">
    <circle class="ring ring--1" cx="200" cy="200" r="86"/><circle class="ring ring--2" cx="200" cy="200" r="132"/><circle class="ring ring--3" cx="200" cy="200" r="178"/>
    <g class="spin spin--1"><circle class="sat" cx="286" cy="200" r="6"/></g>
    <g class="spin spin--2"><circle class="sat sat--hollow" cx="200" cy="68" r="7"/></g>
    <g class="spin spin--3"><circle class="sat" cx="22" cy="200" r="5"/><circle class="sat sat--hollow" cx="378" cy="200" r="4"/></g></svg>`,
};

export function renderPortalPage(lang, { home, tg, icons, portal, referral }) {
  const ru = lang === 'ru';
  const l = (a, b) => ru ? a : b;
  const { open } = portalState(portal);
  const cap = referral?.cap ?? 15;

  const tabs = [
    ['project', l('Мой проект', 'My project'), 'spark'],
    ['versions', l('Версии', 'Versions'), 'layers'],
    ['support', l('Поддержка', 'Support'), 'support'],
    ['billing', l('Счета', 'Invoices'), 'server'],
    ['offers', l('Предложения', 'Offers'), 'design'],
    ['settings', l('Настройки', 'Settings'), 'ai'],
  ];

  // Все направления, в которых работает студия. Из карточки можно сразу запросить расчёт.
  const directions = [
    ['sites', 'web', l('Сайты, приложения, боты и CRM', 'Websites, apps, bots and CRM'),
      l('Сайты и кабинеты, мобильные и мини-приложения, боты и ИИ-ассистенты, CRM и интеграции с вашими сервисами.', 'Websites and portals, mobile and mini apps, bots and AI assistants, CRM and integrations with your services.'), home + '#small-business'],
    ['fintech', 'layers', 'FinTech',
      l('Виртуальные карты через API эмитента, платёжные кабинеты, интеграции платформ и системы обмена.', 'Virtual cards via issuer APIs, payment dashboards, platform integrations and exchange systems.'), home + 'fintech/'],
    ['edtech', 'spark', 'EduTech',
      l('Школы, курсы и учебные платформы: кабинеты педагогов, учеников и родителей, задания, отчёты и оплата.', 'Schools, courses and learning platforms: dashboards for teachers, students and parents, assignments, reports and payments.'), home + 'edtech/'],
    ['models', 'ai', l('Подбор и дообучение ИИ-моделей', 'AI model selection and fine-tuning'),
      l('Выбираем модель под задачу, готовим данные, дообучаем и внедряем в ваш процесс.', 'We select a model for the task, prepare the data, fine-tune and deploy it into your workflow.'), home + '#companies'],
    ['gpu', 'server', l('Аренда GPU и кластеров', 'GPU and cluster rental'),
      l('Вычислительные мощности для обучения и запуска моделей: аренда или собственный контур.', 'Compute for training and running models: rented or in your own environment.'), home + '#companies'],
    ['hardware', 'mini', l('Поставка серверов и оборудования', 'Servers and hardware supply'),
      l('Подбираем, поставляем и настраиваем серверы и оборудование под ваши ИИ-задачи.', 'We select, supply and configure servers and hardware for your AI workloads.'), home + '#companies'],
  ];

  const stages = [l('Разбор', 'Scoping'), l('Проектирование', 'Design'), l('Разработка', 'Build'), l('Приёмка', 'Review'), l('Сопровождение', 'Support')];
  const stageList = stages.map((name, i) => `<li class="${i < 2 ? 'done' : i === 2 ? 'now' : ''}" ${i === 2 ? 'aria-current="step"' : ''}><i></i><span>${name}</span></li>`).join('');
  const requestSteps = [
    l('Заявка получена', 'Request received'), l('Менеджер уточняет детали', 'A manager clarifies details'),
    l('Предложение и договор', 'Proposal and contract'), l('Проект утверждён', 'Project approved'),
  ];

  const channels = [l('Ответы', 'Replies'), l('Согласования', 'Approvals'), l('Документы', 'Documents'), l('Акции', 'Offers')];
  const channelRows = channels.map((name, i) => `<tr><th scope="row">${name}</th>
      <td><label class="pt-switch"><input type="checkbox" ${i < 3 ? 'checked' : ''} aria-label="${name}: ${l('почта', 'email')}"><span></span></label></td>
      <td><label class="pt-switch"><input type="checkbox" ${i < 2 ? 'checked' : ''} aria-label="${name}: Telegram"><span></span></label></td></tr>`).join('');

  const themes = [['auto', l('Авто', 'Auto')], ['copper', l('Медь', 'Copper')], ['midnight', l('Тёмная', 'Midnight')], ['sage', l('Шалфей', 'Sage')]];
  const alternate = ru ? home.replace(/ru\/$/, '') + 'cabinet/' : home + 'ru/cabinet/';
  const thumb = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 11v9H4v-9h3Zm0 0 4-7c1.7 0 2.5 1.2 2.2 3L12.8 10H19a2 2 0 0 1 2 2.4l-1.2 6A2 2 0 0 1 17.9 20H7"/></svg>';
  const thumbDown = thumb.replace('aria-hidden="true"', 'aria-hidden="true" style="transform:scaleY(-1)"');

  const mock = `<div class="pt-mode" role="group" aria-label="${l('Состояние демо', 'Demo state')}">
      <span>${l('Показать как', 'Preview as')}</span>
      <button type="button" aria-pressed="true" data-pt-mode="new">${l('Новый клиент', 'New client')}</button>
      <button type="button" aria-pressed="false" data-pt-mode="active">${l('Проект в работе', 'Project in progress')}</button>
    </div>
  <div class="pt-app" data-pt-app data-state="new" role="group" aria-label="${l('Демонстрация личного кабинета', 'Client portal demo')}">
    <div class="pt-splash" data-pt-splash aria-hidden="true"><devlarion-logo variant="full" height="38"></devlarion-logo><p>${l('Здравствуйте, Анна', 'Welcome, Anna')}</p><i></i></div>
    <div class="pt-topbar">
      <div class="pt-brand"><devlarion-logo variant="mark" height="22" aria-hidden="true"></devlarion-logo><strong>${l('Кабинет', 'Portal')}</strong></div>
      <span class="pt-project-switch"><span data-only="new">${l('Проекта пока нет', 'No project yet')}</span><span data-only="active">${l('Сайт и ИИ-ассистент для заявок', 'Website and enquiry assistant')}</span> <i aria-hidden="true">▾</i></span>
      <span class="pt-demo-badge">${l('Демо-данные', 'Demo data')}</span>
      <span class="pt-avatar" aria-hidden="true">${l('АК', 'AK')}</span>
    </div>
    <div class="pt-body">
      <div class="pt-rail" role="tablist" aria-orientation="vertical" aria-label="${l('Разделы кабинета', 'Portal sections')}">
        ${tabs.map(([id, name, icon], i) => `<button type="button" role="tab" id="pt-tab-${id}" aria-controls="pt-panel-${id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-pt-tab="${id}">${icons[icon]}<span>${name}</span>${id === 'support' ? '<b class="pt-badge" data-pt-unread data-only="active">1</b>' : ''}</button>`).join('')}
      </div>
      <div class="pt-main">

        <section class="pt-panel" role="tabpanel" id="pt-panel-project" aria-labelledby="pt-tab-project">
          <div data-only="new">
            <header><h3>${l('Ваш проект', 'Your project')}</h3><p>${l('Проекта пока нет. Опишите задачу, менеджер уточнит детали и подготовит предложение. Когда мы всё согласуем вместе, проект появится здесь.', 'There is no project yet. Describe your task and a manager will clarify the details and prepare a proposal. Once we agree everything together, your project appears here.')}</p></header>
            <form class="pt-request" data-pt-request novalidate>
              <div class="pt-fields">
                <label>${l('Направление', 'Area')}<select name="direction" data-pt-direction>
                  ${directions.map(([id,, name]) => `<option value="${id}">${name}</option>`).join('')}<option value="other">${l('Другое или не знаю', 'Other or not sure')}</option></select></label>
                <label>${l('Желаемый срок', 'Target date')}<select name="timeline"><option value="">${l('Гибкий', 'Flexible')}</option><option value="${l('В течение месяца', 'Within a month')}">${l('В течение месяца', 'Within a month')}</option><option value="${l('В течение квартала', 'Within a quarter')}">${l('В течение квартала', 'Within a quarter')}</option></select></label>
                <label class="pt-fields-wide">${l('Опишите задачу', 'Describe the task')}<textarea name="task" rows="4" maxlength="1200" data-pt-task placeholder="${l('Что нужно сделать, для кого и зачем. Если есть примеры или ссылки, добавьте их.', 'What needs to be done, for whom and why. Add examples or links if you have them.')}"></textarea></label>
                <label>${l('Как с вами связаться', 'How to reach you')}<input name="contact" maxlength="120" autocomplete="email" data-pt-contact placeholder="${l('E-mail или Telegram', 'Email or Telegram')}"></label>
              </div>
              <p class="pt-hint pt-hint--error" role="alert" data-pt-request-error hidden>${l('Опишите задачу хотя бы в двух предложениях и укажите, как с вами связаться.', 'Describe the task in a couple of sentences and add a way to reach you.')}</p>
              <div class="pt-actions"><button class="pt-btn pt-btn--primary" type="submit">${l('Отправить заявку', 'Send request')}</button><span class="pt-hint">${l('Менеджер ответит в рабочие часы.', 'A manager replies during working hours.')}</span></div>
            </form>
            <article class="pt-card pt-sent" data-pt-sent hidden>
              <div class="pt-sent-head"><span class="pt-check-art" aria-hidden="true"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" pathLength="1"/><path d="M14 25l7 7 13-15" pathLength="1"/></svg></span>
                <div><small>${l('Заявка', 'Request')} <b data-pt-id></b></small><strong>${l('Заявка отправлена', 'Request sent')}</strong></div></div>
              <ol class="pt-timeline">${requestSteps.map((step, i) => `<li class="${i === 0 ? 'done' : i === 1 ? 'now' : ''}"><i></i><span>${step}</span></li>`).join('')}</ol>
              <p>${l('Студия вручную проверит заявку, уточнит задачу и приложит предложение. Договор и проект подключаются к вашему кабинету после согласования.', 'The studio reviews the request by hand, clarifies the task and attaches a proposal. The contract and project are linked to your portal once everything is agreed.')}</p>
              <p class="pt-hint">${l('В предпросмотре заявка никуда не уходит. Чтобы передать её студии сейчас, отправьте текст в Telegram.', 'In this preview the request is not transmitted. To pass it to the studio now, send the text on Telegram.')}</p>
              <div class="pt-actions"><a class="pt-btn pt-btn--primary" data-pt-telegram data-base="${esc(tg)}" href="${esc(tg)}" target="_blank" rel="noopener">${l('Отправить в Telegram', 'Send on Telegram')}</a><button type="button" class="pt-btn" data-pt-go="support">${l('Открыть чат', 'Open chat')}</button><button type="button" class="pt-btn" data-pt-edit-request>${l('Изменить заявку', 'Edit request')}</button></div>
            </article>
            <article class="pt-card pt-hint-card"><div class="pt-empty-mark"><devlarion-logo variant="mark" height="46" view aria-hidden="true"></devlarion-logo><span class="ring"></span><span class="ring r2"></span></div>
              <div><strong>${l('Как проект появляется здесь', 'How a project appears here')}</strong><p>${l('Менеджер вручную подключает проект к вашему аккаунту после согласования и договора. Вы сразу увидите этапы, версии, счета и куратора.', 'A manager links the project to your account by hand after the proposal and contract are agreed. You will then see stages, versions, invoices and your account lead.')}</p></div></article>
          </div>

          <div data-only="active">
            <header><h3>${l('Сайт и ИИ-ассистент для заявок', 'Website and enquiry assistant')}</h3><p>${l('Этап «Разработка» · следующий срок 28 ноября', 'Stage “Build” · next deadline 28 November')}</p></header>
            <ol class="pt-stages" aria-label="${l('Этапы проекта', 'Project stages')}">${stageList}</ol>
            <div class="pt-grid">
              <article class="pt-card pt-card--action">
                <small>${l('Ждём вашего решения', 'Waiting for your decision')}</small>
                <strong data-pt-action-title>${l('Согласовать версию 2', 'Approve version 2')}</strong>
                <p data-pt-action-text>${l('Главная страница и форма заявки. После согласования запускаем подключение ассистента.', 'Home page and enquiry form. Once approved, we start connecting the assistant.')}</p>
                <button type="button" class="pt-btn pt-btn--primary" data-pt-go="versions">${l('Открыть версию', 'Open version')}</button>
              </article>
              <article class="pt-card">
                <small>${l('Куратор', 'Account lead')}</small>
                <div class="pt-person"><span class="pt-avatar" aria-hidden="true">${l('ИЛ', 'IL')}</span><div><strong>${l('Илья Ларионов', 'Ilya Larionov')}</strong><span>${l('Отвечает в рабочие часы', 'Replies during working hours')}</span></div></div>
                <button type="button" class="pt-btn" data-pt-go="support">${l('Написать куратору', 'Message your lead')}</button>
              </article>
              <article class="pt-card pt-card--wide">
                <small>${l('История обновлений', 'Activity')}</small>
                <ul class="pt-log" data-pt-log>
                  <li><time>12.11</time>${l('Версия 1 принята', 'Version 1 approved')}</li>
                  <li><time>14.11</time>${l('Выставлен счёт №2026-014', 'Invoice 2026-014 issued')}</li>
                  <li><time>19.11</time>${l('Загружена версия 2 на согласование', 'Version 2 uploaded for approval')}</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section class="pt-panel" role="tabpanel" id="pt-panel-versions" aria-labelledby="pt-tab-versions" hidden>
          <header><h3>${l('Материалы и версии', 'Materials and versions')}</h3><p>${l('Каждое решение остаётся в истории: версия, автор и время.', 'Every decision stays on record: version, author and time.')}</p></header>
          <div class="pt-empty" data-only="new">${art.repo}
            <h4>${l('Здесь пока ничего нет', 'Nothing here yet')}</h4>
            <p>${l('На данный момент версий нет. После начала работы каждая версия остаётся здесь, а к ней прикрепляется ссылка на репозиторий на GitHub. Вы видите, что изменилось, и принимаете версию или просите правки.', 'There are no versions yet. Once work begins, every version stays here with a link to the GitHub repository. You see what changed and either approve the version or ask for changes.')}</p></div>
          <div data-only="active">
            <article class="pt-card pt-version">
              <div class="pt-version-head"><div><small>${l('Версия 2', 'Version 2')}</small><strong>${l('Главная страница и форма заявки', 'Home page and enquiry form')}</strong></div><span class="pt-chip pt-chip--wait" data-pt-version-state>${l('На согласовании', 'Awaiting approval')}</span></div>
              <div class="pt-preview" aria-hidden="true"><i></i><i></i><i></i></div>
              <p class="pt-repo">${icons.github}<span>github.com/devlarion-demo/enquiry-site</span><code>v2 · 7c1e4fa</code></p>
              <div class="pt-actions" data-pt-version-actions>
                <button type="button" class="pt-btn pt-btn--primary" data-pt-approve>${l('Принять', 'Approve')}</button>
                <button type="button" class="pt-btn" data-pt-revise>${l('Запросить правки', 'Request changes')}</button>
              </div>
              <form class="pt-revise" data-pt-revise-form novalidate hidden>
                <label>${l('Что нужно изменить', 'What should change')}<textarea rows="3" data-pt-comment placeholder="${l('Например: увеличить кнопку заявки и заменить фото', 'For example: make the enquiry button larger and replace the photo')}"></textarea></label>
                <p class="pt-hint pt-hint--error" role="alert" data-pt-error hidden>${l('Опишите правки: так студия ответит точнее.', 'Describe the changes so the team can respond precisely.')}</p>
                <div class="pt-actions"><button class="pt-btn pt-btn--primary" type="submit">${l('Отправить правки', 'Send changes')}</button><button class="pt-btn" type="button" data-pt-cancel>${l('Отмена', 'Cancel')}</button></div>
              </form>
              <p class="pt-hint" data-pt-version-note role="status" aria-live="polite"></p>
            </article>
            <article class="pt-card"><small>${l('Версия 1', 'Version 1')}</small><div class="pt-version-head"><strong>${l('Структура и первый экран', 'Structure and first screen')}</strong><span class="pt-chip pt-chip--done">${l('Принято 12.11', 'Approved 12 Nov')}</span></div>
              <p class="pt-repo">${icons.github}<span>github.com/devlarion-demo/enquiry-site</span><code>v1 · a31f9c0</code></p></article>
            <button type="button" class="pt-reset" data-pt-reset>${l('Сбросить демо', 'Reset demo')}</button>
          </div>
        </section>

        <section class="pt-panel" role="tabpanel" id="pt-panel-support" aria-labelledby="pt-tab-support" hidden>
          <header><h3>${l('Поддержка', 'Support')}</h3><p>${l('Напишите нам: вопрос по проекту, предложение или обратная связь. Ответ придёт сюда и на почту.', 'Write to us: a question about the project, a suggestion or feedback. The reply arrives here and by email.')}</p></header>
          <div class="pt-grid pt-grid--support">
            <article class="pt-card pt-chat">
              <small>${l('Чат со студией', 'Chat with the studio')}</small>
              <div class="pt-messages" data-pt-messages aria-live="polite">
                <p class="pt-msg pt-msg--them" data-only="new">${l('Здравствуйте! Если вы только присматриваетесь, задайте вопрос здесь: подскажем, с чего начать.', 'Hello! If you are just exploring, ask your question here and we will suggest where to start.')}</p>
                <p class="pt-msg pt-msg--them" data-only="active">${l('Версия 2 готова. Если что-то нужно уточнить, пишите сюда.', 'Version 2 is ready. If anything needs clarifying, write here.')}</p>
              </div>
              <form class="pt-compose" data-pt-compose novalidate><label><span class="pt-sr">${l('Сообщение', 'Message')}</span><input type="text" maxlength="300" placeholder="${l('Ваше сообщение', 'Your message')}"></label><button class="pt-btn pt-btn--primary" type="submit">${l('Отправить', 'Send')}</button></form>
            </article>
            <article class="pt-card pt-feedback">
              <small>${l('Обратная связь', 'Feedback')}</small>
              <div class="pt-empty pt-empty--small">${art.chat}</div>
              <strong>${l('Помогла ли поддержка?', 'Did support help?')}</strong>
              <div class="pt-rate" role="group" aria-label="${l('Оценка поддержки', 'Rate support')}">
                <button type="button" class="pt-btn" data-pt-rate="up" aria-pressed="false">${thumb}<span>${l('Да', 'Yes')}</span></button>
                <button type="button" class="pt-btn" data-pt-rate="down" aria-pressed="false">${thumbDown}<span>${l('Не совсем', 'Not quite')}</span></button>
              </div>
              <p class="pt-hint" data-pt-rate-note role="status">${l('Оценки видят владелец и менеджеры студии в веб-панели.', 'Ratings are seen by the studio owner and managers in the web panel.')}</p>
            </article>
          </div>
        </section>

        <section class="pt-panel" role="tabpanel" id="pt-panel-billing" aria-labelledby="pt-tab-billing" hidden>
          <header><h3>${l('Договоры и счета', 'Contracts and invoices')}</h3><p>${l('К каждому договору прикрепляется счёт, чтобы всё было в одном месте.', 'Every contract comes with its invoice so everything stays in one place.')}</p></header>
          <div class="pt-empty" data-only="new">${art.docs}
            <h4>${l('Здесь пока ничего нет', 'Nothing here yet')}</h4>
            <p>${l('После подписания договора здесь будут выставлены счета. К каждому договору прикрепляется счёт, а оплаты и остаток видны в одном месте.', 'Once the contract is signed, invoices are issued here. Each contract has its invoice attached, and payments and the balance are visible in one place.')}</p></div>
          <div data-only="active">
            <div class="pt-table-wrap"><table class="pt-table">
              <thead><tr><th>${l('Договор', 'Contract')}</th><th>${l('Счёт', 'Invoice')}</th><th>${l('Сумма', 'Amount')}</th><th>${l('Статус', 'Status')}</th></tr></thead>
              <tbody>
                <tr><td>№Д-2026-07 · PDF</td><td>№2026-014 · PDF</td><td>40 000 ₽</td><td><span class="pt-chip pt-chip--done">${l('Оплачен', 'Paid')}</span></td></tr>
                <tr><td>${l('Допсоглашение', 'Addendum')} №1 · PDF</td><td>№2026-021 · PDF</td><td>35 000 ₽</td><td><span class="pt-chip pt-chip--wait">${l('Оплачен частично', 'Partly paid')}</span></td></tr>
              </tbody></table></div>
            <article class="pt-card"><small>${l('История оплат по счёту №2026-021', 'Payments on invoice 2026-021')}</small>
              <ul class="pt-log"><li><time>19.11</time>${l('Платёж 15 000 ₽', 'Payment 15,000 ₽')}</li></ul>
              <p class="pt-balance">${l('Остаток по счёту', 'Balance due')}: <strong>20 000 ₽</strong></p></article>
          </div>
        </section>

        <section class="pt-panel" role="tabpanel" id="pt-panel-offers" aria-labelledby="pt-tab-offers" hidden>
          <header><h3>${l('Чем занимается студия', 'What the studio does')}</h3><p>${l('Весь объём работ в одном месте. Выберите направление, чтобы запросить расчёт.', 'The full scope of work in one place. Pick an area to request an estimate.')}</p></header>
          <div class="pt-directions">${directions.map(([id, icon, name, text, href]) => `<article class="pt-direction">
            <span class="pt-direction-icon">${icons[icon]}</span><h4>${name}</h4><p>${text}</p>
            <div class="pt-actions"><button type="button" class="pt-btn pt-btn--primary" data-pt-request-for="${id}">${l('Запросить расчёт', 'Request an estimate')}</button><a class="pt-link" href="${href}">${l('Подробнее', 'Details')}</a></div></article>`).join('')}</div>
          <article class="pt-card pt-calc" data-pt-calc data-cap="${cap}" data-base="100000" data-locale="${ru ? 'ru-RU' : 'en-US'}">
            <small>${l('Скидки: пример для работ на 100 000 ₽', 'Discounts: example for 100,000 ₽ of work')}</small>
            <p>${l(`Скидки складываются, но не больше общего предела ${cap}% на работы.`, `Discounts stack, up to an overall cap of ${cap}% on the work.`)}</p>
            <fieldset><legend class="pt-sr">${l('Скидки', 'Discounts')}</legend>
              <label class="pt-check"><input type="checkbox" value="8" checked><span>${l('Комплект услуг', 'Service bundle')} <b>8%</b></span></label>
              <label class="pt-check"><input type="checkbox" value="4" checked><span>${l('Промокод', 'Promo code')} <b>4%</b></span></label>
              <label class="pt-check"><input type="checkbox" value="5" checked><span>${l('Рекомендация клиента', 'Client referral')} <b>5%</b></span></label>
            </fieldset>
            <dl class="pt-sums"><div><dt>${l('Сумма скидок', 'Combined')}</dt><dd data-pt-sum>17%</dd></div><div><dt>${l('Применено с учётом предела', 'Applied after the cap')}</dt><dd data-pt-applied>15%</dd></div><div><dt>${l('Экономия', 'You save')}</dt><dd data-pt-saving>15 000 ₽</dd></div><div class="pt-total"><dt>${l('Итого', 'Total')}</dt><dd data-pt-total>85 000 ₽</dd></div></dl>
            <p class="pt-hint">${l('Ставки в примере условные. Рекомендательная скидка действует после оплаты первого этапа приглашённым клиентом.', 'Rates here are illustrative. A referral discount applies once the referred client has paid for their first stage.')}</p>
          </article>
        </section>

        <section class="pt-panel" role="tabpanel" id="pt-panel-settings" aria-labelledby="pt-tab-settings" hidden>
          <header><h3>${l('Настройки', 'Settings')}</h3><p>${l('Профиль, язык и тема, уведомления, безопасность и доступы.', 'Profile, language and theme, notifications, security and access.')}</p></header>
          <div class="pt-grid">
            <article class="pt-card"><small>${l('Профиль', 'Profile')}</small>
              <form class="pt-profile" data-pt-profile novalidate>
                <label>${l('Имя', 'Name')}<input name="name" value="${l('Анна Ковалёва', 'Anna Kovaleva')}" autocomplete="name"></label>
                <label>${l('Компания', 'Company')}<input name="company" value="${l('ООО «Пример»', 'Example LLC')}" autocomplete="organization"></label>
                <label>E-mail<input name="email" type="email" value="anna@example.com" autocomplete="email"></label>
                <label>Telegram<input name="telegram" value="@anna_example"></label>
                <label>${l('GitHub для доступа к репозиторию', 'GitHub account for repository access')}<input name="github" placeholder="username"></label>
                <div class="pt-actions"><button class="pt-btn pt-btn--primary" type="submit">${l('Сохранить', 'Save')}</button><span class="pt-hint" role="status" data-pt-profile-note></span></div>
              </form></article>
            <article class="pt-card"><small>${l('Язык и тема', 'Language and theme')}</small>
              <div class="pt-lang"><a class="pt-btn ${ru ? 'pt-btn--primary' : ''}" href="${ru ? '#' : alternate}" ${ru ? 'aria-current="true"' : ''} lang="ru">Русский</a><a class="pt-btn ${ru ? '' : 'pt-btn--primary'}" href="${ru ? alternate : '#'}" ${ru ? '' : 'aria-current="true"'} lang="en">English</a></div>
              <div class="pt-themes" role="group" aria-label="${l('Цветовая тема', 'Colour theme')}">${themes.map(([id, name]) => `<button type="button" data-pt-theme="${id}" aria-pressed="false"><i class="sw sw--${id}"></i>${name}</button>`).join('')}</div>
              <small>${l('Уведомления', 'Notifications')}</small>
              <table class="pt-table pt-table--compact"><thead><tr><th></th><th>${l('Почта', 'Email')}</th><th>Telegram</th></tr></thead><tbody>${channelRows}</tbody></table>
              <p class="pt-hint">${l('Письма подтверждения и восстановления доступа приходят всегда.', 'Confirmation and account-recovery emails are always sent.')}</p></article>
            <article class="pt-card"><small>${l('Безопасность', 'Security')}</small>
              <ul class="pt-sessions" data-pt-sessions>
                <li><div><strong>${l('Этот браузер', 'This browser')}</strong><span>${l('Краснодар · сейчас', 'Krasnodar · now')}</span></div><span class="pt-chip pt-chip--done">${l('Текущий', 'Current')}</span></li>
                <li><div><strong>iPhone</strong><span>${l('Краснодар · вчера', 'Krasnodar · yesterday')}</span></div><button type="button" class="pt-btn" data-pt-end-session>${l('Завершить', 'End')}</button></li>
              </ul>
              <div class="pt-actions"><button type="button" class="pt-btn" data-pt-note="password">${l('Сменить пароль', 'Change password')}</button><button type="button" class="pt-btn" data-pt-note="mfa">${l('Двухфакторный вход', 'Two-factor sign-in')}</button></div>
              <p class="pt-hint" role="status" data-pt-security-note></p></article>
            <article class="pt-card"><small>${l('Коллеги', 'Colleagues')}</small>
              <ul class="pt-people">
                <li><div><strong>${l('Мария Н.', 'Maria N.')}</strong><span>${l('Проект: сайт и ассистент', 'Project: website and assistant')}</span></div>
                  <label class="pt-check pt-check--small"><input type="checkbox" checked><span>${l('Согласует материалы', 'Can approve')}</span></label>
                  <label class="pt-check pt-check--small"><input type="checkbox"><span>${l('Видит финансы', 'Sees finance')}</span></label></li>
              </ul>
              <button type="button" class="pt-btn" data-pt-invite>${l('Пригласить коллегу', 'Invite a colleague')}</button>
              <p class="pt-hint" role="status" data-pt-invite-note></p>
              <small>${l('Аккаунт', 'Account')}</small>
              <button type="button" class="pt-btn pt-btn--danger" data-pt-note="delete">${l('Удалить аккаунт', 'Delete account')}</button></article>
          </div>
        </section>

      </div>
    </div>
  </div>`;

  const steps = [
    [l('Заявка', 'Request'), l('Опишите задачу или выберите направление. Расчёт из калькулятора подтянется сам.', 'Describe the task or pick an area. Your calculator estimate carries over.')],
    [l('Согласование', 'Agreement'), l('Менеджер уточняет детали, прикладывает предложение и готовит договор.', 'A manager clarifies details, attaches a proposal and prepares the contract.')],
    [l('Проект появляется в кабинете', 'Project appears in the portal'), l('Мы подключаем его вручную: этапы, куратор, версии и счета.', 'We link it by hand: stages, account lead, versions and invoices.')],
    [l('Работа и приёмка', 'Work and review'), l('Принимаете версии, оплачиваете счета и пишете в поддержку.', 'You approve versions, pay invoices and message support.')],
  ];

  const roles = [
    [l('Владелец компании', 'Company owner'), l('Проекты компании, приглашение коллег в выбранные проекты, отзыв доступа.', 'Company projects, inviting colleagues to selected projects, revoking access.')],
    [l('Коллега', 'Colleague'), l('Выданные проекты. Согласование материалов и финансы включаются отдельно.', 'Assigned projects. Approvals and finance are granted separately.')],
    [l('Менеджер студии', 'Studio manager'), l('Назначенные проекты, переписка, материалы, счета и отметки об оплате.', 'Assigned projects, messages, materials, invoices and payment records.')],
    [l('Владелец студии', 'Studio owner'), l('Сотрудники, назначения, скидки и лимиты, справка и журнал действий.', 'Staff, assignments, discounts and limits, help articles and the audit log.')],
  ];

  const principles = [
    [l('Данные компаний разделены', 'Company data is isolated'), l('Клиент видит только выданные ему проекты, файлы и счета. Отзыв доступа действует сразу.', 'A client only sees the projects, files and invoices assigned to them. Revoked access takes effect immediately.')],
    [l('Журнал действий', 'Audit trail'), l('Операции с деньгами и доступом фиксируют автора, время и результат.', 'Operations with money or access record who did what, when, and the result.')],
    [l('Безопасный вход', 'Safe sign-in'), l('Пароли хранятся хешем, ссылки подтверждения одноразовые и ограничены по времени, сессии можно завершить.', 'Passwords are hashed, confirmation links are single-use and time-limited, sessions can be ended.')],
    [l('Русский и английский', 'Russian and English'), l('Интерфейс, письма и ошибки на двух языках, светлая и тёмная темы, уменьшенное движение по настройке системы.', 'Interface, emails and errors in both languages, light and dark themes, reduced motion by system setting.')],
  ];

  const faqs = [
    [l('Кабинет уже работает?', 'Is the portal live?'), open
      ? l('Да, вход открыт. Если у вас уже есть проект, менеджер привяжет его к вашему аккаунту.', 'Yes, sign-in is open. If you already have a project, a manager will link it to your account.')
      : l('Пока это предпросмотр с демо-данными. Сначала студия проходит две приёмки на тестовых заказчиках, потом открывает регистрацию. Запросите доступ, и мы напишем, когда он появится.', 'This is a preview with demo data for now. The studio first completes two acceptance runs with test clients, then opens registration. Request access and we will let you know.')],
    [l('Нужно ли регистрироваться, чтобы получить смету?', 'Do I need an account to get a quote?'), l('Нет. Расчёт и заявку можно отправить в Telegram без кабинета. Кабинет нужен, чтобы вести проект, версии, счета и поддержку в одном месте.', 'No. You can send an estimate and request through Telegram without the portal. The portal is for running the project, versions, invoices and support in one place.')],
    [l('Как проект появляется в кабинете?', 'How does a project appear in the portal?'), l('После согласования заявки и договора менеджер подключает проект к вашему аккаунту вручную. До этого в разделах «Версии» и «Счета» пусто.', 'After the request and contract are agreed, a manager links the project to your account by hand. Until then the Versions and Invoices sections are empty.')],
    [l('Как работает согласование версий?', 'How does version approval work?'), l('Открываете конкретную версию со ссылкой на репозиторий и нажимаете «Принять» или «Запросить правки». Для правок нужен комментарий. Решение остаётся в истории с автором и временем.', 'You open a specific version with its repository link and choose Approve or Request changes. Changes need a comment. The decision stays on record with its author and time.')],
  ];

  return `<div class="portal-page">
    <section class="wrap pt-hero">
      <div class="pt-hero-copy">
        <p class="eyebrow"><i></i>${l('Клиентский портал', 'Client portal')}</p>
        <h1>${l('Личный кабинет Devlarion', 'Devlarion client portal')}</h1>
        <p class="intro">${l('Заявка, смета, версии работы, счета и поддержка в одном месте. Видно, что происходит с проектом и что ждут от вас.', 'Your request, estimate, work versions, invoices and support in one place. See what is happening with the project and what is expected from you.')}</p>
        <div class="actions">${portalLoginLink(lang, portal, tg)}<a class="ghost" href="${home}#quiz">${l('Рассчитать проект', 'Estimate a project')}</a></div>
        <p class="pt-status ${open ? 'pt-status--open' : ''}"><i aria-hidden="true"></i>${open ? l('Кабинет открыт', 'Portal is open') : l('Предпросмотр · регистрация откроется после тестовых приёмок', 'Preview · registration opens after test acceptance runs')}</p>
      </div>
      <div class="pt-hero-art" aria-hidden="true">${art.orbit}<div class="pt-hero-mark"><devlarion-logo variant="mark" height="132" intro></devlarion-logo></div></div>
    </section>
    <section class="wrap pt-stage" aria-labelledby="pt-demo-title">
      <h2 id="pt-demo-title">${l('Как выглядит кабинет', 'What the portal looks like')}</h2>
      <p class="pt-lead">${l('Переключайте состояние и нажимайте на разделы: так кабинет выглядит у нового клиента и когда проект уже идёт. Все данные условные.', 'Switch the state and click through the sections: this is how the portal looks for a new client and once a project is under way. All data is sample data.')}</p>
      ${mock}
    </section>
    <section class="wrap pt-section"><h2>${l('С чего начинается работа', 'How it starts')}</h2>
      <ol class="pt-steps">${steps.map(([h, p], i) => `<li><span>${String(i + 1).padStart(2, '0')}</span><h3>${h}</h3><p>${p}</p></li>`).join('')}</ol></section>
    <section class="wrap pt-section"><h2>${l('Роли и доступы', 'Roles and access')}</h2>
      <div class="pt-roles">${roles.map(([h, p]) => `<article><h3>${h}</h3><p>${p}</p></article>`).join('')}</div></section>
    <section class="wrap pt-section"><h2>${l('Надёжность', 'Reliability')}</h2>
      <div class="pt-roles">${principles.map(([h, p]) => `<article><h3>${h}</h3><p>${p}</p></article>`).join('')}</div></section>
    <section class="wrap pt-section"><h2>${l('Вопросы о кабинете', 'Portal questions')}</h2>${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>
    <section class="wrap pt-section pt-cta"><devlarion-logo variant="full" height="46" view aria-hidden="true"></devlarion-logo><h2>${l('Начнём с расчёта', 'Start with an estimate')}</h2><div class="actions">${portalLoginLink(lang, portal, tg)}<a class="ghost" href="${home}#quiz">${l('Рассчитать проект', 'Estimate a project')}</a></div></section>
  </div>`;
}
