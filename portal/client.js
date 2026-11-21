// Кабинет клиента: данные приходят из /api/me, всё выводится через textContent (без innerHTML с данными).
(() => {
  const base = document.body.dataset.base;
  const support = document.body.dataset.support;
  const root = document.querySelector('[data-root]');
  const hello = document.querySelector('[data-hello]');
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
  const KIND = { design: 'МК', build: 'BLD', document: 'DOC', link: '↗' };
  const pill = ([text, tone]) => h('span', { class: 'ac-status', 'data-tone': tone, text });
  const toast = text => { const t = h('div', { class: 'ac-toast', role: 'status', text }); document.body.append(t); setTimeout(() => t.remove(), 2600); };
  const empty = text => h('p', { class: 'ac-empty', text });
  const link = item => item.href ? h('a', { href: item.href, target: item.file ? null : '_blank', rel: item.file ? null : 'noopener', text: item.file ? 'Скачать' : 'Открыть' }) : null;

  let state = null, current = 0, tab = 'project';

  async function load() {
    const r = await fetch(base + 'api/me', { credentials: 'same-origin' });
    if (r.status === 401) { location.href = base; return; }
    if (!r.ok) { root.replaceChildren(empty('Не удалось загрузить кабинет. Обновите страницу.')); return; }
    state = await r.json();
    document.querySelector('[data-preview]').hidden = !state.preview;
    const first = (state.client.name || '').split(' ')[0];
    hello.textContent = first ? `Здравствуйте, ${first}!` : 'Здравствуйте!';
    const saved = new URLSearchParams(location.hash.slice(1));
    if (saved.get('p')) current = Math.max(0, state.projects.findIndex(p => p.id === saved.get('p')));
    if (saved.get('t')) tab = saved.get('t');
    render();
  }

  function render() {
    if (!state.projects.length) {
      root.replaceChildren(h('div', { class: 'ac-card' },
        h('h2', { text: 'Проект скоро появится' }),
        h('p', { class: 'ac-muted', text: 'Мы готовим карточку проекта: этапы, смету и материалы. Как только всё будет готово, они появятся здесь.' }),
        h('p', {}, h('a', { class: 'ac-btn', href: support, text: 'Написать команде' }))));
      return;
    }
    const p = state.projects[current] || state.projects[0];
    history.replaceState(null, '', `#p=${p.id}&t=${tab}`);
    const kids = [];
    if (state.projects.length > 1) kids.push(h('div', { class: 'ac-projects', role: 'group', 'aria-label': 'Проекты' },
      state.projects.map((x, i) => h('button', { type: 'button', 'aria-pressed': String(i === current), text: x.title, onclick: () => { current = i; render(); } }))));
    const tabs = [['project', 'Проект'], ['money', 'Сметы и счета'], ['files', 'Файлы и версии'], ['chat', 'Сообщения']];
    const unpaid = p.invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').length;
    const badge = { chat: p.unread, money: unpaid };
    kids.push(h('div', { class: 'ac-tabs', role: 'tablist', 'aria-label': 'Разделы проекта' },
      tabs.map(([key, label]) => h('button', { type: 'button', role: 'tab', id: 'tab-' + key, 'aria-controls': 'panel-' + key, 'aria-selected': String(tab === key), onclick: () => { tab = key; render(); if (key === 'chat') markRead(p); } },
        label, badge[key] ? h('span', { class: 'ac-badge', 'aria-label': `новых: ${badge[key]}`, text: String(badge[key]) }) : null))));
    const panel = h('section', { class: 'ac-panel', role: 'tabpanel', id: 'panel-' + tab, 'aria-labelledby': 'tab-' + tab });
    panel.append(...({ project: projectPanel, money: moneyPanel, files: filesPanel, chat: chatPanel }[tab] || projectPanel)(p));
    kids.push(panel);
    root.replaceChildren(...kids);
    if (tab === 'chat') { const c = root.querySelector('.ac-chat'); if (c) c.scrollTop = c.scrollHeight; }
  }

  function projectPanel(p) {
    const done = p.stages.filter(s => s.state === 'done').length;
    const pct = p.stages.length ? Math.round(done / p.stages.length * 100) : 0;
    const active = p.stages.find(s => s.state === 'active');
    const next = p.stages.find(s => s.state === 'todo');
    const cards = h('div', { class: 'ac-grid' },
      h('div', { class: 'ac-card' }, h('p', { class: 'ac-eyebrow', text: 'Статус' }), h('h2', { text: p.title, style: 'margin:.4rem 0 .7rem' }), pill(STATUS[p.status] || STATUS.brief),
        p.summary ? h('p', { class: 'ac-muted', text: p.summary }) : null,
        p.updated ? h('p', { class: 'ac-muted', text: 'Обновлено ' + fmtDate(p.updated) }) : null),
      h('div', { class: 'ac-card' }, h('p', { class: 'ac-eyebrow', text: 'Прогресс' }), h('h2', { text: `${pct}%`, style: 'margin:.4rem 0 0' }),
        h('div', { class: 'ac-progress', role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: `width:${pct}%` })),
        h('p', { class: 'ac-muted', text: active ? `Сейчас: ${active.title}` : next ? `Дальше: ${next.title}` : p.stages.length ? 'Все этапы завершены' : 'Этапы появятся после согласования' })));
    const steps = p.stages.length
      ? h('ol', { class: 'ac-steps' }, p.stages.map(s => h('li', { 'data-state': s.state },
          h('span', { class: 'ac-dot', 'aria-hidden': 'true' }),
          h('div', {}, h('strong', { text: s.title }), s.note ? h('small', { text: s.note }) : null),
          h('small', { text: (s.state === 'done' ? '✓ ' : '') + fmtDate(s.date) }))))
      : empty('Этапы проекта появятся после согласования сметы.');
    return [cards, h('div', { class: 'ac-card', style: 'margin-top:1rem' }, h('h2', { text: 'Этапы', style: 'font-size:1.5rem;margin-bottom:.4rem' }), steps)];
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
    const total = due.reduce((s, i) => s + (i.currency === (due[0]?.currency) ? i.amount : 0), 0);
    return [
      due.length ? h('div', { class: 'ac-card', style: 'margin-bottom:1rem' }, h('p', { class: 'ac-eyebrow', text: 'К оплате' }), h('h2', { text: money(total, due[0].currency), style: 'margin-top:.4rem' }), h('p', { class: 'ac-muted', text: `Счетов: ${due.length}. Реквизиты — в файле счёта.` })) : null,
      h('h2', { text: 'Сметы', style: 'font-size:1.5rem;margin:.4rem 0 .6rem' }), est,
      h('h2', { text: 'Счета', style: 'font-size:1.5rem;margin:1.6rem 0 .6rem' }), inv,
    ];
  }

  function filesPanel(p) {
    if (!p.files.length) return [empty('Здесь появятся макеты, тестовые версии и документы по проекту.')];
    const groups = [['build', 'Тестовые версии и сборки'], ['design', 'Макеты'], ['document', 'Документы'], ['link', 'Ссылки']];
    return groups.map(([kind, title]) => {
      const items = p.files.filter(f => f.kind === kind);
      if (!items.length) return null;
      return h('section', { style: 'margin-bottom:1.4rem' }, h('h2', { text: title, style: 'font-size:1.4rem;margin-bottom:.6rem' }),
        h('ul', { class: 'ac-files' }, items.map(f => h('li', {},
          h('span', { class: 'ac-kind', 'aria-hidden': 'true', text: KIND[f.kind] }),
          h('div', {}, f.href ? h('a', { href: f.href, target: f.file ? null : '_blank', rel: f.file ? null : 'noopener', text: f.title }) : h('strong', { text: f.title }),
            f.note || f.date ? h('div', { class: 'ac-muted', text: [f.note, fmtDate(f.date)].filter(Boolean).join(' · ') }) : null)))));
    }).filter(Boolean);
  }

  function chatPanel(p) {
    const list = h('div', { class: 'ac-chat', role: 'log', 'aria-label': 'Переписка' },
      p.messages.length ? p.messages.map(m => h('div', { class: 'ac-msg', 'data-from': m.from },
        h('span', { class: 'ac-muted', text: m.from === 'client' ? 'Вы' : 'Devlarion', style: 'display:block;font-size:.78rem' }),
        document.createTextNode(m.text), h('time', { datetime: m.at, text: fmtTime(m.at) })))
        : [h('p', { class: 'ac-muted', style: 'margin:auto;text-align:center;padding:2rem', text: 'Напишите вопрос по проекту — команда ответит здесь.' })]);
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
        p.messages.push(data.message); area.value = ''; render(); toast('Сообщение отправлено');
      } catch (err) { toast(err.message); } finally { btn.disabled = false; }
    } }, area, btn);
    area.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) form.requestSubmit(); });
    return [list, form, h('p', { class: 'ac-muted', style: 'font-size:.85rem;margin-top:.5rem', text: 'Срочно? Напишите в Telegram — ответим быстрее.' })];
  }

  async function markRead(p) {
    if (!p.unread) return;
    p.unread = 0; render();
    fetch(`${base}api/projects/${p.id}/read`, { method: 'POST', credentials: 'same-origin' }).catch(() => {});
  }

  load();
  // новые ответы команды подтягиваются раз в минуту, пока вкладка открыта
  // (не во время набора сообщения — иначе перерисовка стёрла бы текст)
  setInterval(() => { if (!document.hidden && state && !document.querySelector('.ac-compose textarea')?.value) fetch(base + 'api/me', { credentials: 'same-origin' }).then(r => r.ok && r.json()).then(d => { if (d) { state = d; render(); } }).catch(() => {}); }, 60000);
})();
