// Кабинет клиента: данные приходят из /api/me, всё выводится через textContent (без innerHTML с данными).
(() => {
  const base = document.body.dataset.base;
  const support = document.body.dataset.support;
  const root = document.querySelector('[data-root]');
  const hello = document.querySelector('[data-hello]');
  const supportLink = document.querySelector('[data-client-support]');
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'text') el.textContent = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
    return el;
  };
  const fmtDate = s => s ? new Date(s.length === 10 ? s + 'T12:00:00' : s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const fmtTime = s => new Date(s).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const money = (a, c) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: c || 'RUB', maximumFractionDigits: 2 }).format(a || 0);
  const STATUS = {
    brief: ['Обсуждение задачи', 'mute'], design: ['Дизайн', 'warn'], development: ['Разработка', 'warn'], review: ['Проверка и правки', 'warn'],
    launched: ['Запущен', 'ok'], support: ['Поддержка', 'ok'], paused: ['На паузе', 'mute'],
  };
  const EST = { draft: ['Черновик', 'mute'], sent: ['На согласовании', 'warn'], approved: ['Согласована', 'ok'], declined: ['Отклонена', 'bad'] };
  const INV = { unpaid: ['Ожидает оплаты', 'warn'], paid: ['Оплачен', 'ok'], overdue: ['Просрочен', 'bad'], cancelled: ['Отменён', 'mute'] };
  const KIND = { design: 'МК', build: 'ТВ', document: 'ДК', link: '↗' };
  const TABS = [['project', 'Обзор'], ['money', 'Сметы и счета'], ['files', 'Файлы'], ['chat', 'Сообщения']];
  const pill = ([text, tone]) => h('span', { class: 'ac-status', 'data-tone': tone, text });
  const toast = text => { const t = h('div', { class: 'ac-toast', role: 'status', text }); document.body.append(t); setTimeout(() => t.remove(), 2600); };
  const empty = text => h('p', { class: 'ac-empty', text });
  const link = item => item.href ? h('a', { href: item.href, target: item.file ? null : '_blank', rel: item.file ? null : 'noopener', text: item.file ? 'Скачать' : 'Открыть' }) : null;

  let state = null, current = 0, tab = 'project';

  async function load() {
    const r = await fetch(base + 'api/me', { credentials: 'same-origin' });
    if (r.status === 401) { location.href = base; return; }
    if (!r.ok) throw new Error('Не удалось загрузить кабинет.');
    state = await r.json();
    document.querySelector('[data-preview]').hidden = !state.preview;
    document.querySelector('[data-password-settings]').hidden = Boolean(state.preview);
    const first = (state.client.name || '').trim().split(/\s+/)[0];
    const company = document.querySelector('[data-company]');
    hello.textContent = first ? 'Здравствуйте, ' + first + '!' : 'Мои проекты';
    company.textContent = state.client.company || '';
    company.hidden = !company.textContent;
    const loginId = document.querySelector('[data-login-id]');
    const username = (state.client.tgUsername || '').replace(/^@/, '');
    loginId.textContent = state.client.login ? 'Логин: ' + state.client.login : username ? 'Telegram @' + username : state.client.tgId ? 'Telegram ID ' + state.client.tgId : '';
    document.querySelector('[data-open-profile]').hidden = Boolean(state.preview);
    document.querySelector('[data-new-request]').hidden = Boolean(state.preview) || !state.projects.length;
    loginId.hidden = !loginId.textContent || Boolean(state.preview);
    const saved = new URLSearchParams(location.hash.slice(1));
    if (saved.get('p')) current = Math.max(0, state.projects.findIndex(p => p.id === saved.get('p')));
    if (TABS.some(([key]) => key === saved.get('t'))) tab = saved.get('t');
    render();
  }

  function render({ animate = true, focusTab = false, focusProject = false } = {}) {
    root.removeAttribute('aria-busy');
    supportLink.hidden = !state.projects.length;
    if (!state.projects.length) {
      root.replaceChildren(...welcome());
      return;
    }

    const p = state.projects[current] || state.projects[0];
    history.replaceState(null, '', '#p=' + p.id + '&t=' + tab);
    const projects = state.projects.length > 1
      ? h('div', { class: 'ac-projects', role: 'group', 'aria-label': 'Выбор проекта' },
        state.projects.map((item, i) => h('button', {
          type: 'button', 'aria-pressed': String(i === current), text: item.title,
          onclick: () => { current = i; if (tab === 'chat') markRead(item); render({ focusProject: true }); },
        })))
      : null;
    const unpaid = p.invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').length;
    const badge = { chat: p.unread, money: unpaid };
    const projectHead = h('section', { class: 'ac-project-head' },
      projects,
      h('div', { class: 'ac-project-title' },
        h('h2', { text: p.title }),
        pill(STATUS[p.status] || STATUS.brief)),
      p.summary ? h('p', { class: 'ac-note', text: p.summary }) : null);
    const tabs = h('div', { class: 'ac-tabs', role: 'tablist', 'aria-label': 'Разделы проекта', onkeydown: event => {
      if (event.target.getAttribute('role') !== 'tab') return;
      const selected = TABS.findIndex(([key]) => key === tab);
      const last = TABS.length - 1;
      const next = { ArrowRight: (selected + 1) % TABS.length, ArrowLeft: (selected + last) % TABS.length, Home: 0, End: last }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      openTab(TABS[next][0], p);
    } },
    TABS.map(([key, label]) => h('button', {
      type: 'button', role: 'tab', id: 'tab-' + key, 'aria-controls': 'panel-' + key,
      'aria-selected': String(tab === key), tabindex: tab === key ? '0' : '-1',
      onclick: () => openTab(key, p),
    }, label, badge[key] ? h('span', { class: 'ac-badge', text: String(badge[key]) }) : null)));
    const panel = h('section', {
      class: 'ac-panel' + (animate ? ' ac-enter' : ''), role: 'tabpanel',
      id: 'panel-' + tab, 'aria-labelledby': 'tab-' + tab, tabindex: '0',
    });
    panel.append(...{ project: projectPanel, money: moneyPanel, files: filesPanel, chat: chatPanel }[tab](p));
    root.replaceChildren(projectHead, tabs, panel);

    if (tab === 'chat') {
      const chat = root.querySelector('.ac-chat');
      if (chat) chat.scrollTop = chat.scrollHeight;
    }
    if (focusTab) tabs.querySelector('[aria-selected="true"]')?.focus();
    if (focusProject) projects?.querySelector('[aria-pressed="true"]')?.focus();
  }

  function openTab(key, project) {
    if (tab === key) return;
    tab = key;
    if (key === 'chat') markRead(project);
    render({ focusTab: true });
  }

  function projectPanel(p) {
    const done = p.stages.filter(s => s.state === 'done').length;
    const pct = p.stages.length ? Math.round(done / p.stages.length * 100) : 0;
    const active = p.stages.find(s => s.state === 'active');
    const next = p.stages.find(s => s.state === 'todo');
    const currentStage = active?.title || next?.title || (p.stages.length ? 'Все этапы завершены' : 'Этапы ещё не добавлены');
    const progress = h('div', { class: 'ac-card ac-progress-card' },
      h('div', { class: 'ac-progress-copy' },
        h('h3', { text: 'Ход проекта' }),
        h('p', { class: 'ac-note', text: currentStage }),
        p.updated ? h('p', { class: 'ac-note ac-caption', text: 'Обновлено ' + fmtDate(p.updated) }) : null),
      p.stages.length ? h('div', { class: 'ac-progress-value' },
        h('strong', { text: pct + '%' }),
        h('div', { class: 'ac-progress', role: 'progressbar', 'aria-label': 'Готовность проекта', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: 'width:' + pct + '%' })),
        h('p', { class: 'ac-note ac-caption', text: 'Завершено ' + done + ' из ' + p.stages.length + ' этапов' })) : null);
    const steps = p.stages.length
      ? h('ol', { class: 'ac-steps' }, p.stages.map(s => h('li', { 'data-state': s.state },
          h('span', { class: 'ac-dot', 'aria-hidden': 'true' }),
          h('div', {}, h('strong', { text: s.title }), s.note ? h('small', { text: s.note }) : null),
          h('small', { class: 'ac-stage-meta', text: [{ done: 'Готово', active: 'В работе', todo: 'В плане' }[s.state], fmtDate(s.date)].filter(Boolean).join(' · ') }))))
      : empty('Команда добавит этапы после согласования плана.');
    return [dashboard(p, pct, currentStage), attentionCard(p), progress, h('div', { class: 'ac-card ac-stack' }, h('h3', { text: 'Этапы' }), steps), activityCard(p)].filter(Boolean);
  }

  // ---- Центр управления: ключевые показатели, что требует внимания, лента событий ----
  const svg = (tag, attrs = {}) => { const el = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v); return el; };
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function countUp(el, to, suffix = '') {
    if (reduceMotion() || to === 0) { el.textContent = to + suffix; return; }
    const start = performance.now(), dur = 900;
    const tick = now => { const k = Math.min(1, (now - start) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + suffix; if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  function ring(pct) {
    const r = 34, c = 2 * Math.PI * r;
    const box = svg('svg', { viewBox: '0 0 84 84', class: 'ac-ring', 'aria-hidden': 'true' });
    box.append(svg('circle', { cx: 42, cy: 42, r, class: 'ac-ring-track' }), svg('circle', { cx: 42, cy: 42, r, class: 'ac-ring-bar', 'stroke-dasharray': c, 'stroke-dashoffset': c * (1 - pct / 100), style: '--circ:' + c }));
    return box;
  }
  function dueTotals(p) {
    const totals = new Map();
    for (const i of p.invoices.filter(x => x.status === 'unpaid' || x.status === 'overdue')) totals.set(i.currency || 'RUB', (totals.get(i.currency || 'RUB') || 0) + i.amount);
    return [...totals].map(([c, t]) => money(t, c)).join(' · ');
  }
  function dashboard(p, pct, stageText) {
    const num = h('strong', { class: 'ac-kpi-num', text: '0%' });
    countUp(num, pct, '%');
    const due = dueTotals(p);
    const tile = (label, body, tone) => h('div', { class: 'ac-kpi', 'data-tone': tone || null }, h('small', { text: label }), body);
    return h('div', { class: 'ac-kpis' },
      tile('Готовность', h('div', { class: 'ac-kpi-ring' }, ring(pct), num)),
      tile('Сейчас в работе', h('strong', { class: 'ac-kpi-text', text: stageText })),
      tile('К оплате', h('strong', { class: 'ac-kpi-text', text: due || 'Задолженности нет' }), due ? 'warn' : 'ok'),
      tile('Сообщения', h('strong', { class: 'ac-kpi-text', text: p.unread ? 'Новых: ' + p.unread : 'Нет новых' }), p.unread ? 'warn' : null));
  }
  function attentionCard(p) {
    const items = [];
    const toApprove = p.estimates.filter(e => e.status === 'sent');
    if (toApprove.length) items.push(['money', 'Смета ждёт вашего решения', toApprove.map(e => e.title).join(', '), 'warn']);
    const due = p.invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue');
    const late = due.filter(i => i.status === 'overdue');
    if (due.length) items.push(['money', late.length ? 'Есть просроченные счета' : 'Есть счета к оплате', 'Счетов: ' + due.length + ' · ' + dueTotals(p), late.length ? 'bad' : 'warn']);
    if (p.unread) items.push(['chat', 'Новые сообщения от команды', 'Непрочитано: ' + p.unread, 'warn']);
    if (!items.length) return h('section', { class: 'ac-card ac-attention ac-attention--clear' }, h('span', { class: 'ac-attn-dot', 'aria-hidden': 'true' }), h('div', {}, h('h3', { text: 'От вас ничего не требуется' }), h('p', { class: 'ac-note', text: 'Команда работает по плану. Если появится вопрос или счёт, он отобразится здесь.' })));
    return h('section', { class: 'ac-card ac-stack ac-attention' }, h('h3', { text: 'Требует вашего внимания' }),
      h('ul', { class: 'ac-attn-list' }, items.map(([key, title, note, tone]) => h('li', { 'data-tone': tone },
        h('span', { class: 'ac-attn-dot', 'aria-hidden': 'true' }),
        h('div', {}, h('strong', { text: title }), h('small', { text: note })),
        h('button', { type: 'button', class: 'ac-btn ac-btn--ghost', onclick: () => openTab(key, p), text: key === 'chat' ? 'Открыть' : 'Перейти' })))));
  }
  function activityCard(p) {
    const ev = [];
    for (const s of p.stages) if (s.date && s.state === 'done') ev.push([s.date, 'Этап завершён', s.title]);
    for (const f of p.files) if (f.date) ev.push([f.date, 'Новый материал', f.title]);
    for (const e of p.estimates) if (e.date) ev.push([e.date, 'Смета', e.title]);
    for (const i of p.invoices) if (i.date) ev.push([i.date, 'Счёт № ' + i.number, i.title || '']);
    for (const m of p.messages.slice(-3)) ev.push([m.at, m.from === 'client' ? 'Вы написали' : 'Ответ команды', m.text.length > 90 ? m.text.slice(0, 90) + '…' : m.text]);
    ev.sort((a, b) => new Date(b[0]) - new Date(a[0]));
    if (!ev.length) return null;
    return h('section', { class: 'ac-card ac-stack' }, h('h3', { text: 'Последние события' }),
      h('ol', { class: 'ac-feed' }, ev.slice(0, 6).map(([at, title, note]) => h('li', {}, h('span', { class: 'ac-feed-dot', 'aria-hidden': 'true' }), h('div', {}, h('strong', { text: title }), note ? h('small', { text: note }) : null), h('time', { datetime: at, text: fmtDate(at) })))));
  }

  function moneyPanel(p) {
    const table = (rows, head, cells) => h('table', { class: 'ac-table' }, h('thead', {}, h('tr', {}, head.map(x => h('th', { text: x })))), h('tbody', {}, rows.map(r => h('tr', {}, cells(r)))));
    const td = (label, ...kids) => h('td', { 'data-label': label }, ...kids);
    const est = p.estimates.length ? table(p.estimates, ['Смета', 'Сумма', 'Статус', ''], e => [
      td('Смета', h('strong', { text: e.title }), e.note ? h('div', { class: 'ac-muted', text: e.note }) : null),
      h('td', { class: 'num', 'data-label': 'Сумма', text: money(e.amount, e.currency) }), td('Статус', pill(EST[e.status] || EST.sent)), td('', link(e))]) : empty('Смет пока нет.');
    const inv = p.invoices.length ? table(p.invoices, ['Счёт', 'Сумма', 'Статус', 'Срок', ''], i => [
      td('Счёт', h('strong', { text: '№ ' + i.number }), i.title ? h('div', { class: 'ac-muted', text: i.title }) : null),
      h('td', { class: 'num', 'data-label': 'Сумма', text: money(i.amount, i.currency) }), td('Статус', pill(INV[i.status] || INV.unpaid)), td('Срок оплаты', document.createTextNode(fmtDate(i.due) || '—')), td('', link(i))]) : empty('Счетов пока нет.');
    const due = p.invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue');
    const totals = new Map();
    for (const invoice of due) {
      const currency = invoice.currency || 'RUB';
      totals.set(currency, (totals.get(currency) || 0) + invoice.amount);
    }
    return [
      due.length ? h('div', { class: 'ac-card ac-invoice-summary' },
        h('div', { class: 'ac-stack' }, h('h3', { text: 'К оплате' }),
          h('p', { class: 'ac-note', text: 'Счетов: ' + due.length + '. Реквизиты указаны в счёте.' })),
        h('div', { class: 'ac-total-list' }, [...totals].map(([currency, total]) => h('strong', { text: money(total, currency) })))) : null,
      h('section', { class: 'ac-card ac-stack' }, h('h3', { text: 'Сметы' }), est),
      h('section', { class: 'ac-card ac-stack' }, h('h3', { text: 'Счета' }), inv),
    ].filter(Boolean);
  }

  function filesPanel(p) {
    if (!p.files.length) return [empty('Здесь появятся макеты, тестовые версии и документы по проекту.')];
    const groups = [['build', 'Тестовые версии и сборки'], ['design', 'Макеты'], ['document', 'Документы'], ['link', 'Ссылки']];
    return groups.map(([kind, title]) => {
      const items = p.files.filter(f => f.kind === kind);
      if (!items.length) return null;
      return h('section', { class: 'ac-card ac-stack' }, h('h3', { text: title }),
        h('ul', { class: 'ac-files' }, items.map(f => h('li', {},
          h('span', { class: 'ac-kind', 'aria-hidden': 'true', text: KIND[f.kind] }),
          h('div', {}, f.href ? h('a', { href: f.href, target: f.file ? null : '_blank', rel: f.file ? null : 'noopener', text: f.title }) : h('strong', { text: f.title }),
            f.note || f.date ? h('div', { class: 'ac-muted', text: [f.note, fmtDate(f.date)].filter(Boolean).join(' · ') }) : null)))));
    }).filter(Boolean);
  }

  function chatPanel(p) {
    const list = h('div', { class: 'ac-chat', role: 'log', 'aria-label': 'Переписка' },
      p.messages.length ? p.messages.map(m => h('div', { class: 'ac-msg', 'data-from': m.from },
        h('span', { class: 'ac-msg-author', text: m.from === 'client' ? 'Вы' : 'Devlarion' }),
        document.createTextNode(m.text), h('time', { datetime: m.at, text: fmtTime(m.at) })))
        : [h('p', { class: 'ac-chat-empty ac-muted', text: 'Напишите вопрос по проекту — команда ответит здесь.' })]);
    const area = h('textarea', { name: 'text', rows: '2', maxlength: '4000', required: true, 'aria-label': 'Сообщение', placeholder: state.preview ? 'В режиме просмотра отправка отключена' : 'Напишите сообщение…', disabled: state.preview });
    const btn = h('button', { class: 'ac-btn', type: 'submit', text: 'Отправить', disabled: state.preview });
    const form = h('form', { class: 'ac-compose', onsubmit: async e => {
      e.preventDefault();
      const text = area.value.trim(); if (!text) return;
      btn.disabled = true;
      try {
        const r = await fetch(`${base}api/projects/${p.id}/messages`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Не удалось отправить');
        p.messages.push(data.message); area.value = ''; render({ animate: false }); root.querySelector('.ac-compose textarea')?.focus(); toast('Сообщение отправлено');
      } catch (err) { toast(err.message); } finally { btn.disabled = false; }
    } }, area, btn);
    area.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) form.requestSubmit(); });
    return [h('section', { class: 'ac-card ac-stack' }, h('h3', { text: 'Переписка по проекту' }), list, form)];
  }

  function markRead(p) {
    if (!p.unread) return;
    p.unread = 0;
    fetch(`${base}api/projects/${p.id}/read`, { method: 'POST', credentials: 'same-origin' }).catch(() => {});
  }

  // ---- Первый вход: приветствие вместо пустого экрана ----
  function welcome() {
    const L = state.links || {};
    const name = (state.client.name || '').trim().split(/\s+/)[0];
    const svgNS = 'http://www.w3.org/2000/svg';
    const art = document.createElementNS(svgNS, 'svg');
    art.setAttribute('viewBox', '0 0 320 120'); art.setAttribute('class', 'ac-welcome-art'); art.setAttribute('aria-hidden', 'true');
    art.innerHTML = '<path class="ac-w-line" d="M40 60H280"/>' + [40, 160, 280].map((x, i) => `<g class="ac-w-node" style="--i:${i}"><circle cx="${x}" cy="60" r="22"/><text x="${x}" y="66" text-anchor="middle">${i + 1}</text></g>`).join('') + '<circle class="ac-w-dot" r="5" cy="60" cx="40"/>';
    const steps = [['Опишите задачу', 'Пара абзацев: что есть сейчас и что хотите получить.'], ['Смета и договор', 'Ответим в течение дня, зафиксируем объём и цену.'], ['Проект — здесь', 'Этапы, файлы, счета и переписка в одном месте.']];
    const hero = h('section', { class: 'ac-card ac-welcome ac-enter' },
      h('div', { class: 'ac-stack' },
        h('p', { class: 'ac-eyebrow', text: 'Добро пожаловать' }),
        h('h2', { text: 'Кабинет готов к работе' }),
        h('p', { class: 'ac-note', text: 'Проектов пока нет — это нормально для первого входа. Начните с заявки: она сразу попадёт к команде, а её статус вы увидите здесь и в Telegram-боте.' }),
        h('div', { class: 'ac-welcome-actions' },
          h('button', { type: 'button', class: 'ac-btn', onclick: openRequest, text: 'Оставить заявку' }),
          h('a', { class: 'ac-btn ac-btn--ghost', href: support, text: 'Написать в Telegram' }))),
      art,
      h('ol', { class: 'ac-welcome-steps' }, steps.map(([t, d], i) => h('li', { style: '--i:' + i }, h('strong', { text: t }), h('span', { text: d })))));
    const tile = (title, text, href, label, onclick) => h('a', { class: 'ac-card ac-tile ac-enter', href: href || '#', target: href && /^https?:/.test(href) && !href.startsWith(location.origin) ? '_blank' : null, rel: 'noopener', onclick: onclick ? e => { e.preventDefault(); onclick(); } : null },
      h('strong', { text: title }), h('span', { class: 'ac-note', text }), h('span', { class: 'ac-tile-go', text: label + ' →' }));
    const tiles = h('div', { class: 'ac-tiles' },
      tile('Магазин услуг и железа', 'Сайты, боты, ИИ и серверы NVIDIA с ценами.', L.shop, 'Открыть'),
      tile('Бот кабинета', 'Статусы проектов, счета и коды входа прямо в Telegram.', L.bot, 'Открыть бота'),
      tile('Свой логин', state.client.login ? 'Сейчас: ' + state.client.login : 'Задайте логин, чтобы не вводить Telegram ID.', '#', 'Настроить', openProfile));
    return [hero, tiles];
  }

  // ---- Диалоги: профиль и заявка ----
  const profileDialog = document.querySelector('[data-profile-dialog]');
  const requestDialog = document.querySelector('[data-request-dialog]');
  for (const d of [profileDialog, requestDialog]) {
    d.querySelector('[data-close-dialog]').addEventListener('click', () => d.close());
    d.addEventListener('click', e => { if (e.target === d) d.close(); });
  }
  function openProfile() {
    const f = profileDialog.querySelector('form');
    f.login.value = state.client.login || '';
    f.name.value = state.client.name || '';
    f.company.value = state.client.company || '';
    profileDialog.querySelector('[data-profile-error]').textContent = '';
    profileDialog.showModal();
    f.login.focus();
  }
  function openRequest() {
    requestDialog.querySelector('[data-request-error]').textContent = '';
    requestDialog.showModal();
    requestDialog.querySelector('textarea').focus();
  }
  document.querySelector('[data-open-profile]').addEventListener('click', openProfile);
  document.querySelector('[data-new-request]').addEventListener('click', openRequest);
  async function post(path, body) {
    const r = await fetch(base + path, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'Не удалось сохранить. Попробуйте ещё раз.');
    return data;
  }
  profileDialog.querySelector('form').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, err = profileDialog.querySelector('[data-profile-error]'), btn = f.querySelector('[type=submit]');
    btn.disabled = true; err.textContent = '';
    try {
      const data = await post('api/profile', { login: f.login.value.trim(), name: f.name.value.trim(), company: f.company.value.trim() });
      Object.assign(state.client, data.client);
      profileDialog.close();
      toast(data.client.login ? 'Сохранено. Теперь можно входить по логину ' + data.client.login : 'Профиль сохранён');
      load();
    } catch (x) { err.textContent = x.message; } finally { btn.disabled = false; }
  });
  requestDialog.querySelector('form').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, err = requestDialog.querySelector('[data-request-error]'), btn = f.querySelector('[type=submit]');
    btn.disabled = true; err.textContent = '';
    try {
      const data = await post('api/requests', { topic: f.topic.value, text: f.text.value.trim(), budget: f.budget.value.trim() });
      state.projects.unshift(data.project);
      current = 0; tab = 'project';
      requestDialog.close(); f.reset();
      toast('Заявка отправлена. Ответим в течение дня');
      document.querySelector('[data-new-request]').hidden = false;
      render();
    } catch (x) { err.textContent = x.message; } finally { btn.disabled = false; }
  });

  load().catch(() => {
    root.removeAttribute('aria-busy');
    supportLink.hidden = false;
    root.replaceChildren(h('section', { class: 'ac-card ac-stack' },
      h('h2', { text: 'Не удалось загрузить кабинет' }),
      h('a', { class: 'ac-btn ac-btn--ghost', href: base, text: 'Обновить страницу' })));
  });
  // новые ответы команды подтягиваются раз в минуту, пока вкладка открыта
  // (не во время набора сообщения — иначе перерисовка стёрла бы текст)
  setInterval(() => { if (!document.hidden && state && !root.contains(document.activeElement) && !document.querySelector('.ac-compose textarea')?.value) fetch(base + 'api/me', { credentials: 'same-origin' }).then(r => r.ok && r.json()).then(d => { if (d) { state = d; render({ animate: false }); } }).catch(() => {}); }, 60000);
})();
