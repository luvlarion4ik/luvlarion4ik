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
  // Единый набор линейных иконок: сетка 24, обводка 1.75, скруглённые концы.
  const ICONS = {
    design: 'M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5C21 6.4 17 3 12 3ZM7.5 12.5h.01M9.5 8h.01M14.5 8h.01M17 11.5h.01',
    build: 'M4 5h16v11H4zM2.5 19.5h19M9 9.5l-2 1.5 2 1.5M15 9.5l2 1.5-2 1.5',
    document: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4',
    link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    client: 'M12 16V4M7 9l5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4',
    money: 'M3 7h18v11H3zM3 10.5h18M7 14.5h3',
    chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12Z',
    check: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM8 12.2l2.7 2.6L16 9.5',
    alert: 'M12 3.5 2.5 20h19zM12 10v4.5M12 17.4h.01',
    stage: 'M5 21V4M5 4h11l-2 4 2 4H5',
    history: 'M3 12a9 9 0 1 0 2.6-6.4L3 8M3 3.5V8h4.5M12 7.5V12l3 2',
    studio: 'M4 20V9l8-5 8 5v11M9.5 20v-5.5h5V20',
    request: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
    shop: 'M5 7h14l-1.2 12.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9zM9 7a3 3 0 0 1 6 0',
    bot: 'M5 9h14v10H5zM12 5v4M9 13.5h.01M15 13.5h.01M9.5 16.5h5M2.5 13v2.5M21.5 13v2.5',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5a7.5 7.5 0 0 1 15 0',
  };
  const icon = (name, cls = 'ac-ico') => {
    const ns = 'http://www.w3.org/2000/svg';
    const el = document.createElementNS(ns, 'svg');
    el.setAttribute('viewBox', '0 0 24 24'); el.setAttribute('class', cls); el.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(ns, 'path'); path.setAttribute('d', ICONS[name] || ICONS.document);
    el.append(path); return el;
  };
  const TABS = [['project', 'Обзор'], ['money', 'Сметы и счета'], ['files', 'Файлы'], ['chat', 'Сообщения'], ['history', 'История']];
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
    const projects = state.projects.length > 1 ? overview() : null;
    const projectsOld = false
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
    panel.append(...{ project: projectPanel, money: moneyPanel, files: filesPanel, chat: chatPanel, history: historyPanel }[tab](p));
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
    if (!items.length) return h('section', { class: 'ac-card ac-attention ac-attention--clear' }, h('span', { class: 'ac-attn-ico' }, icon('check')), h('div', {}, h('h3', { text: 'От вас ничего не требуется' }), h('p', { class: 'ac-note', text: 'Команда работает по плану. Если появится вопрос или счёт, он отобразится здесь.' })));
    return h('section', { class: 'ac-card ac-stack ac-attention' }, h('h3', { text: 'Требует вашего внимания' }),
      h('ul', { class: 'ac-attn-list' }, items.map(([key, title, note, tone]) => h('li', { 'data-tone': tone },
        h('span', { class: 'ac-attn-ico' }, icon(tone === 'bad' ? 'alert' : key)),
        h('div', {}, h('strong', { text: title }), h('small', { text: note })),
        h('button', { type: 'button', class: 'ac-btn ac-btn--ghost', onclick: () => openTab(key, p), text: key === 'chat' ? 'Открыть' : 'Перейти' })))));
  }
  function events(p) {
    if (p.history?.length) return p.history.map(e => [e.at, e.who === 'client' ? 'Вы' : 'Команда', e.text, kindOf(e.text, e.who)]).reverse();
    const ev = [];
    for (const s of p.stages) if (s.date && s.state === 'done') ev.push([s.date, 'Команда', 'Этап завершён: ' + s.title, 'stage']);
    for (const f of p.files) if (f.date) ev.push([f.date, f.byClient ? 'Вы' : 'Команда', 'Файл: ' + f.title, f.byClient ? 'client' : 'document']);
    for (const e of p.estimates) if (e.date) ev.push([e.date, 'Команда', 'Смета: ' + e.title, 'money']);
    for (const i of p.invoices) if (i.date) ev.push([i.date, 'Команда', 'Счёт № ' + i.number, 'money']);
    for (const m of p.messages.slice(-3)) ev.push([m.at, m.from === 'client' ? 'Вы' : 'Команда', m.text.length > 90 ? m.text.slice(0, 90) + '…' : m.text, 'chat']);
    return ev.sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }
  function kindOf(text, who) {
    if (/смет|счёт|оплат/i.test(text)) return 'money';
    if (/файл|макет|верси|документ/i.test(text)) return who === 'client' ? 'client' : 'document';
    if (/этап|статус|создан/i.test(text)) return 'stage';
    if (/сообщ|ответ|переписк/i.test(text)) return 'chat';
    if (/заявк/i.test(text)) return 'request';
    return who === 'client' ? 'user' : 'studio';
  }
  const feedItem = ([at, who, text, kind], timeOnly) => h('li', { 'data-who': who === 'Вы' ? 'client' : 'studio' },
    h('span', { class: 'ac-feed-ico' }, icon(kind)),
    h('div', {}, h('strong', { text }), h('small', { text: who + (at.length === 10 ? '' : ' · ' + (timeOnly === true ? new Date(at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : fmtTime(at))) })));
  function activityCard(p) {
    const ev = events(p);
    if (!ev.length) return null;
    return h('section', { class: 'ac-card ac-stack' },
      h('div', { class: 'ac-card-head' }, h('h3', { text: 'Последние события' }), ev.length > 5 ? h('button', { type: 'button', class: 'ac-link-btn', text: 'Вся история →', onclick: () => openTab('history', p) }) : null),
      h('ol', { class: 'ac-feed' }, ev.slice(0, 5).map(e => feedItem(e))));
  }
  function historyPanel(p) {
    const ev = events(p);
    if (!ev.length) return [empty('История появится, когда по проекту начнутся изменения: этапы, сметы, счета, файлы.')];
    const days = new Map();
    for (const e of ev) { const d = fmtDate(e[0].slice(0, 10)); if (!days.has(d)) days.set(d, []); days.get(d).push(e); }
    return [h('section', { class: 'ac-card ac-stack' }, h('h3', { text: 'История изменений' }),
      h('p', { class: 'ac-note', text: 'Всё, что происходило с проектом: решения по сметам, счета, файлы, смена этапов. Об этих событиях бот присылает уведомления в Telegram.' }),
      ...[...days].map(([day, list]) => h('div', { class: 'ac-day' }, h('h4', { class: 'ac-day-title', text: day }), h('ol', { class: 'ac-feed ac-feed--full' }, list.map(e => feedItem(e, true))))))];
  }

  function moneyPanel(p) {
    const table = (rows, head, cells) => h('table', { class: 'ac-table' }, h('thead', {}, h('tr', {}, head.map(x => h('th', { text: x })))), h('tbody', {}, rows.map(r => h('tr', {}, cells(r)))));
    const td = (label, ...kids) => h('td', { 'data-label': label }, ...kids);
    const est = p.estimates.length ? table(p.estimates, ['Смета', 'Сумма', 'Статус', ''], e => [
      td('Смета', h('strong', { text: e.title }), e.note ? h('div', { class: 'ac-muted', text: e.note }) : null),
      h('td', { class: 'num', 'data-label': 'Сумма', text: money(e.amount, e.currency) }), td('Статус', pill(EST[e.status] || EST.sent)),
      td('', link(e), e.status === 'sent' && !state.preview ? h('div', { class: 'ac-decide' },
        h('button', { type: 'button', class: 'ac-btn ac-btn--sm', text: 'Согласовать', onclick: () => decide(p, p.estimates.indexOf(e), 'approved') }),
        h('button', { type: 'button', class: 'ac-btn ac-btn--ghost ac-btn--sm', text: 'Отклонить', onclick: () => decide(p, p.estimates.indexOf(e), 'declined') })) : null)]) : empty('Смет пока нет.');
    const invActions = i => (i.status === 'unpaid' || i.status === 'overdue') && !state.preview ? h('div', { class: 'ac-decide' },
      h('button', { type: 'button', class: 'ac-btn ac-btn--ghost ac-btn--sm', text: 'Скопировать', onclick: () => { navigator.clipboard?.writeText(`Счёт № ${i.number}, ${money(i.amount, i.currency)}`); toast('Номер и сумма скопированы'); } }),
      h('button', { type: 'button', class: 'ac-btn ac-btn--sm', text: 'Я оплатил', onclick: () => reportPaid(p, i) })) : null;
    const inv = p.invoices.length ? table(p.invoices, ['Счёт', 'Сумма', 'Статус', 'Срок', ''], i => [
      td('Счёт', h('strong', { text: '№ ' + i.number }), i.title ? h('div', { class: 'ac-muted', text: i.title }) : null),
      h('td', { class: 'num', 'data-label': 'Сумма', text: money(i.amount, i.currency) }), td('Статус', pill(INV[i.status] || INV.unpaid)), td('Срок оплаты', document.createTextNode(fmtDate(i.due) || '—')), td('', link(i), invActions(i))]) : empty('Счетов пока нет.');
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

  function uploader(p) {
    const input = h('input', { type: 'file', multiple: true, class: 'ac-sr', 'aria-label': 'Выбрать файлы' });
    const bar = h('i'); const status = h('span', { class: 'ac-up-status', 'aria-live': 'polite' });
    const zone = h('label', { class: 'ac-card ac-upload' + (state.preview ? ' is-off' : '') },
      input, h('span', { class: 'ac-upload-ico' }, icon('client')),
      h('span', { class: 'ac-stack ac-upload-copy' }, h('strong', { text: 'Передать файлы команде' }),
        h('span', { class: 'ac-note', text: state.preview ? 'В режиме просмотра загрузка отключена.' : 'Перетащите сюда или нажмите, чтобы выбрать. ТЗ, логотипы, выгрузки, фото — до 25 МБ за файл.' })),
      h('span', { class: 'ac-up-bar' }, bar), status);
    const send1 = file => new Promise((resolve, reject) => {
      const x = new XMLHttpRequest();
      x.open('PUT', `${base}upload/${p.id}?name=${encodeURIComponent(file.name)}`);
      x.withCredentials = true;
      x.upload.onprogress = e => { if (e.lengthComputable) bar.style.width = Math.round(e.loaded / e.total * 100) + '%'; };
      x.onload = () => { let d = {}; try { d = JSON.parse(x.responseText); } catch {} x.status < 300 ? resolve(d) : reject(new Error(d.error || (x.status === 413 ? 'Файл больше 25 МБ.' : 'Не удалось загрузить файл.'))); };
      x.onerror = () => reject(new Error('Нет связи с сервером.'));
      x.send(file);
    });
    const run = async files => {
      if (state.preview || !files.length) return;
      zone.classList.add('is-busy');
      let ok = 0;
      for (const [n, file] of [...files].entries()) {
        status.textContent = `Загружаем ${n + 1} из ${files.length}: ${file.name}`; bar.style.width = '0%';
        if (file.size > 25 * 1024 * 1024) { toast(`«${file.name}» больше 25 МБ — пришлите ссылкой в сообщениях`); continue; }
        try { const d = await send1(file); Object.assign(p, d.project); ok++; } catch (e) { toast(e.message); }
      }
      zone.classList.remove('is-busy'); status.textContent = '';
      if (ok) { toast(ok === 1 ? 'Файл передан команде' : `Передано файлов: ${ok}`); render({ animate: false }); }
    };
    input.addEventListener('change', () => run(input.files));
    for (const ev of ['dragenter', 'dragover']) zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.add('is-drag'); });
    for (const ev of ['dragleave', 'drop']) zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.remove('is-drag'); });
    zone.addEventListener('drop', e => run(e.dataTransfer.files));
    if (state.preview) input.disabled = true;
    return zone;
  }
  function filesPanel(p) {
    const groups = [['client', 'Ваши файлы'], ['build', 'Тестовые версии и сборки'], ['design', 'Макеты'], ['document', 'Документы'], ['link', 'Ссылки']];
    const lists = groups.map(([kind, title]) => {
      const items = p.files.filter(f => (f.byClient ? 'client' : f.kind) === kind);
      if (!items.length) return null;
      return h('section', { class: 'ac-card ac-stack' }, h('h3', { text: title }),
        h('ul', { class: 'ac-files' }, items.map(f => h('li', {},
          h('span', { class: 'ac-kind', 'data-kind': f.byClient ? 'client' : f.kind }, icon(f.byClient ? 'client' : f.kind)),
          h('div', {}, f.href ? h('a', { href: f.href, target: f.file ? null : '_blank', rel: f.file ? null : 'noopener', text: f.title }) : h('strong', { text: f.title }),
            f.note || f.date ? h('div', { class: 'ac-muted', text: [f.note, fmtDate(f.date)].filter(Boolean).join(' · ') }) : null)))));
    }).filter(Boolean);
    return [uploader(p), ...(lists.length ? lists : [empty('Здесь появятся макеты, тестовые версии и документы по проекту.')])];
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

  // ---- Решения по сметам и оплата счетов ----
  async function decide(p, index, decision) {
    const comment = decision === 'declined' ? (prompt('Что не подошло? Комментарий увидит команда (необязательно).') ?? null) : '';
    if (comment === null) return;
    try {
      const r = await fetch(`${base}api/projects/${p.id}/estimates/${index}`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision, comment }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Не удалось сохранить решение.');
      Object.assign(p, d.project);
      toast(decision === 'approved' ? 'Смета согласована. Команда получила уведомление' : 'Смета отклонена. Команда свяжется с вами');
      render({ animate: false });
    } catch (e) { toast(e.message); }
  }
  async function reportPaid(p, i) {
    try {
      const r = await fetch(`${base}api/projects/${p.id}/messages`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: `Оплатили счёт № ${i.number} на ${money(i.amount, i.currency)}. Проверьте, пожалуйста, поступление.` }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Не удалось отправить.');
      p.messages.push(d.message);
      toast('Отправили команде. Статус обновится после проверки');
    } catch (e) { toast(e.message); }
  }

  // ---- Все проекты одним взглядом (если их несколько) ----
  function overview() {
    if (state.projects.length < 2) return null;
    return h('div', { class: 'ac-overview', role: 'group', 'aria-label': 'Все проекты' }, state.projects.map((p, i) => {
      const done = p.stages.filter(s => s.state === 'done').length, pct = p.stages.length ? Math.round(done / p.stages.length * 100) : 0;
      const due = p.invoices.filter(x => x.status === 'unpaid' || x.status === 'overdue').length;
      return h('button', { type: 'button', class: 'ac-ov' + (i === current ? ' is-on' : ''), 'aria-pressed': String(i === current), onclick: () => { current = i; render({ focusProject: false }); } },
        h('span', { class: 'ac-ov-top' }, pill(STATUS[p.status] || STATUS.brief), p.unread ? h('span', { class: 'ac-badge', text: String(p.unread) }) : null),
        h('strong', { text: p.title }),
        h('span', { class: 'ac-ov-bar' }, h('i', { style: 'width:' + pct + '%' })),
        h('small', { text: pct + '% · ' + (due ? 'счетов к оплате: ' + due : 'без задолженности') }));
    }));
  }

  // ---- Первый вход: приветствие вместо пустого экрана ----
  function welcome() {
    const L = state.links || {};
    const name = (state.client.name || '').trim().split(/\s+/)[0];
    const steps = [['Опишите задачу', 'Пара абзацев: что есть сейчас и что хотите получить.'], ['Смета и договор', 'Ответим в течение дня, зафиксируем объём и цену.'], ['Проект — здесь', 'Этапы, файлы, счета и переписка в одном месте.']];
    const hero = h('section', { class: 'ac-card ac-welcome ac-enter' },
      h('div', { class: 'ac-stack' },
        h('p', { class: 'ac-eyebrow', text: 'Добро пожаловать' }),
        h('h2', { text: 'Кабинет готов к работе' }),
        h('p', { class: 'ac-note', text: 'Проектов пока нет — это нормально для первого входа. Начните с заявки: она сразу попадёт к команде, а её статус вы увидите здесь и в Telegram-боте.' }),
        h('div', { class: 'ac-welcome-actions' },
          h('button', { type: 'button', class: 'ac-btn', onclick: openRequest, text: 'Оставить заявку' }),
          h('a', { class: 'ac-btn ac-btn--ghost', href: support, text: 'Написать в Telegram' }))),
      h('ol', { class: 'ac-welcome-steps' }, steps.map(([t, d], i) => h('li', { style: '--i:' + i }, h('span', { class: 'ac-step-ico' }, icon(['request', 'money', 'stage'][i])), h('small', { class: 'ac-step-n', text: 'Шаг ' + (i + 1) }), h('strong', { text: t }), h('span', { text: d })))));
    const tile = (title, text, href, label, onclick, ico) => h('a', { class: 'ac-card ac-tile ac-enter', href: href || '#', target: href && /^https?:/.test(href) && !href.startsWith(location.origin) ? '_blank' : null, rel: 'noopener', onclick: onclick ? e => { e.preventDefault(); onclick(); } : null },
      h('span', { class: 'ac-tile-ico' }, icon(ico)), h('strong', { text: title }), h('span', { class: 'ac-note', text }), h('span', { class: 'ac-tile-go', text: label + ' →' }));
    const tiles = h('div', { class: 'ac-tiles' },
      tile('Магазин услуг и железа', 'Сайты, боты, ИИ и серверы NVIDIA с ценами.', L.shop, 'Открыть', null, 'shop'),
      tile('Бот кабинета', 'Статусы проектов, счета и коды входа прямо в Telegram.', L.bot, 'Открыть бота', null, 'bot'),
      tile('Свой логин', state.client.login ? 'Сейчас: ' + state.client.login : 'Задайте логин, чтобы не вводить Telegram ID.', '#', 'Настроить', openProfile, 'user'));
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
    f.notify.checked = state.client.notify !== false;
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
  document.querySelector('[data-logout-all]')?.addEventListener('click', async () => {
    if (!confirm('Выйти из кабинета на всех устройствах, включая это?')) return;
    try { await post('api/logout-all', {}); location.href = base; } catch (e) { toast(e.message); }
  });
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
      const data = await post('api/profile', { login: f.login.value.trim(), name: f.name.value.trim(), company: f.company.value.trim(), notify: f.notify.checked });
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
