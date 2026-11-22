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
    loginId.textContent = username ? 'Telegram @' + username : state.client.tgId ? 'Telegram ID ' + state.client.tgId : '';
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
      root.replaceChildren(h('section', { class: 'ac-card ac-empty-project ac-enter' },
        h('div', { class: 'ac-empty-mark', 'aria-hidden': 'true' }),
        h('div', { class: 'ac-stack' },
          h('h2', { text: 'Пока нет проектов' }),
          h('p', { class: 'ac-note', text: 'Когда команда добавит проект, здесь появятся его этапы, файлы, счета и переписка.' })),
        h('a', { class: 'ac-btn', href: support, text: 'Написать команде' })));
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
    return [progress, h('div', { class: 'ac-card ac-stack' }, h('h3', { text: 'Этапы' }), steps)];
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
