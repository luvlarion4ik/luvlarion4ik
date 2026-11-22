(() => {
  const base = document.body.dataset.base;
  const root = document.querySelector('[data-root]');
  const summary = document.querySelector('[data-summary]');
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'text') el.textContent = v;
      else if (k === 'value') el.value = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
    return el;
  };
  const toast = t => { const e = h('div', { class: 'ac-toast', role: 'status', text: t }); document.body.append(e); setTimeout(() => e.remove(), 2800); };
  async function api(path, method = 'GET', body) {
    const r = await fetch(base + 'api/' + path, { method, credentials: 'same-origin', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || 'Ошибка ' + r.status);
    return d;
  }
  const act = async (fn, ok) => { try { await fn(); if (ok) toast(ok); await load(); } catch (e) { toast(e.message); } };

  let db, clientId = null, projectId = null, prefill = null;
  const projectStates = [
    ['brief', 'Обсуждение задачи'], ['design', 'Дизайн'], ['development', 'Разработка'],
    ['review', 'Проверка и правки'], ['launched', 'Запущен'], ['support', 'Поддержка'], ['paused', 'На паузе'],
  ];
  const projectStatus = Object.fromEntries(projectStates);
  const unread = project => project.messages.filter(m => m.from === 'client' && !m.readByStudio).length;
  const field = (label, name, val, attrs = {}) => h('label', {}, label, attrs.tag === 'textarea' ? h('textarea', { name, rows: '3', text: val ?? '', ...attrs, tag: null }) : h('input', { name, value: val ?? '', ...attrs }));
  const select = (label, name, val, opts) => h('label', {}, label, h('select', { name }, opts.map(([v, t]) => h('option', { value: v, text: t, selected: v === val }))));
  const formData = f => Object.fromEntries(new FormData(f));

  async function load() { db = await api('state'); render(); }

  function chooseClient(id, initial = null) {
    clientId = id;
    projectId = null;
    prefill = initial;
    render('client');
  }

  function render(focus = '') {
    root.removeAttribute('aria-busy');
    const client = db.clients.find(c => c.id === clientId);
    const projects = db.projects.filter(p => p.clientId === clientId);
    const project = projects.find(p => p.id === projectId);
    const addClient = () => h('button', { class: 'ac-btn ac-btn--ghost ad-small', type: 'button', onclick: () => chooseClient('new'), text: 'Добавить клиента' });
    const metrics = [['Клиенты', db.clients.length], ['Проекты', db.projects.length], ['Непрочитанные', db.projects.reduce((sum, item) => sum + unread(item), 0)]];
    summary.replaceChildren(...metrics.map(([label, value]) => h('div', {}, h('dt', { text: label }), h('dd', { text: value }))));

    const clients = h('section', { class: 'ac-card ad-client-list' },
      h('h2', { text: 'Клиенты' }),
      db.clients.length ? h('ul', { class: 'ad-list' }, db.clients.map(c => h('li', {},
        h('button', { type: 'button', 'aria-pressed': String(c.id === clientId), onclick: () => chooseClient(c.id) },
          c.name, h('small', { text: [c.company, c.tgUsername && '@' + c.tgUsername].filter(Boolean).join(' · ') }))))) : h('p', { class: 'ac-note', text: 'Список пока пуст.' }),
      addClient());

    const pending = db.pending.length ? h('section', { class: 'ac-card ac-stack' },
      h('h2', { text: 'Прежние заявки' }),
      h('ul', { class: 'ad-list' }, db.pending.map(p => h('li', {},
        h('button', { type: 'button', onclick: () => chooseClient('new', p) }, p.name || p.username || p.tgId,
          h('small', { text: p.username ? '@' + p.username : 'ID ' + p.tgId })))))) : null;
    const workspace = clientId === 'new' ? clientForm(null)
      : client ? [clientForm(client), ...projectsBlock(client, projects, project)]
      : h('section', { class: 'ac-card ad-empty ac-enter' },
          h('h2', { text: db.clients.length ? 'Выберите клиента' : 'Добавьте первого клиента' }),
          h('p', { class: 'ac-note', text: db.clients.length ? 'Откроются карточка клиента, его проекты и переписка.' : 'После регистрации клиенты появятся здесь. Карточку также можно создать вручную.' }));
    root.replaceChildren(h('div', { class: 'ad-layout' },
      h('aside', { class: 'ad-side', 'aria-label': 'Клиенты и заявки' },
        db.telegram.configured ? null : h('p', { class: 'ad-notice', role: 'status', text: 'Коды Telegram временно недоступны. Проверьте подключение бота.' }),
        clients, pending),
      h('div', { class: 'ad-workspace' }, workspace)));
    if (focus) root.querySelector('[data-editor="' + focus + '"]')?.focus();
  }

  function clientForm(c) {
    const pre = c || prefill || {};
    const f = h('form', { class: 'ad-form ac-card', onsubmit: e => { e.preventDefault(); act(async () => { const r = await api('clients', 'POST', { ...formData(f), id: c?.id }); clientId = r.id; }, 'Клиент сохранён'); } },
      h('div', { class: 'ad-section-title' }, h('h2', { text: c?.name || 'Новый клиент', tabindex: '-1', 'data-editor': 'client' }), c?.company ? h('p', { class: 'ac-note', text: c.company }) : null),
      h('div', { class: 'ad-row' }, field('Имя', 'name', pre.name), field('Компания', 'company', pre.company)),
      h('div', { class: 'ad-row' }, field('Telegram @username', 'tgUsername', pre.tgUsername ?? pre.username), field('Telegram ID (необязательно)', 'tgId', pre.tgId)),
      field('Заметка (видна только вам)', 'note', pre.note, { tag: 'textarea' }),
      h('div', { class: 'ad-actions' }, h('button', { class: 'ac-btn', type: 'submit', text: 'Сохранить' }),
        c ? [h('button', { class: 'ac-btn ac-btn--ghost', type: 'button', text: 'Посмотреть как клиент', onclick: () => act(async () => { const r = await api('preview/' + c.id, 'POST'); window.open(r.url, '_blank'); }) }),
          h('button', { class: 'ac-btn ac-btn--ghost ad-danger', type: 'button', text: 'Удалить', onclick: () => { if (confirm('Удалить клиента?')) act(async () => { await api('clients/' + c.id, 'DELETE'); clientId = null; }, 'Удалён'); } })] : null));
    return f;
  }

  function projectsBlock(client, projects, project) {
    const list = projects.length ? h('ul', { class: 'ad-list' }, projects.map(p => h('li', {},
      h('button', { type: 'button', 'aria-pressed': String(p.id === projectId), onclick: () => { projectId = p.id; render('project'); } },
        p.title, h('small', { text: unread(p) ? 'Новых сообщений: ' + unread(p) : projectStatus[p.status] || 'Обсуждение задачи' }))))) : h('p', { class: 'ac-note', text: 'У клиента пока нет проектов.' });
    return [
      h('section', { class: 'ac-card ac-stack' },
        h('div', { class: 'ad-section-head' },
          h('h2', { text: 'Проекты клиента' }),
          h('button', { class: 'ac-btn ac-btn--ghost ad-small', type: 'button', text: 'Добавить проект', onclick: () => act(async () => {
            const result = await api('projects', 'POST', { clientId: client.id, title: 'Новый проект' });
            projectId = result.id;
          }) })),
        list),
      project ? projectEditor(project) : null,
    ];
  }

  const STAGE = [['todo', 'Впереди'], ['active', 'Сейчас'], ['done', 'Готово']];
  function listEditor(title, items, make, rowFn, name) {
    const box = h('div', { class: 'ad-list-editor', 'data-list': name });
    const add = () => {
      const row = rowFn(make());
      box.insertBefore(row, addBtn);
      row.querySelector('input,select,textarea')?.focus();
    };
    const addBtn = h('button', { class: 'ac-btn ac-btn--ghost ad-small', type: 'button', text: 'Добавить запись', onclick: add });
    items.forEach(item => box.append(rowFn(item)));
    box.append(addBtn);
    return h('details', { class: 'ad-disclosure', open: name === 'stages' || undefined },
      h('summary', {}, title), box);
  }
  const rowWrap = (...kids) => {
    const r = h('div', { class: 'ad-item' }, kids, h('button', {
      class: 'ac-btn ac-btn--ghost ad-small ad-danger', type: 'button', text: 'Убрать запись', onclick: () => {
        const addBtn = r.parentElement.lastElementChild;
        r.remove();
        addBtn?.focus();
      },
    }));
    return r;
  };
  const CUR = ['RUB', 'USD', 'EUR', 'KZT', 'BYN'].map(x => [x, x]);

  function fileInput(row, pid) {
    const label = h('span', { class: 'ac-muted', text: row.file ? 'Файл: ' + row.file : 'Файл не загружен' });
    const hidden = h('input', { type: 'hidden', name: 'file', value: row.file || '' });
    const pick = h('input', { type: 'file', onchange: async e => {
      const file = e.target.files[0]; if (!file) return;
      try {
        const r = await fetch(`${base}api/files/${pid}?name=${encodeURIComponent(file.name)}`, { method: 'PUT', credentials: 'same-origin', body: file });
        const d = await r.json(); if (!r.ok) throw new Error(d.error);
        hidden.value = d.file; label.textContent = 'Файл: ' + d.file; toast('Файл загружен — сохраните проект');
      } catch (err) { toast(err.message); }
    } });
    return h('label', { class: 'ad-file-input' }, label, pick, hidden);
  }

  function projectEditor(p) {
    const form = h('form', { class: 'ad-form ac-card' },
      h('h2', { text: 'Редактирование проекта', tabindex: '-1', 'data-editor': 'project' }),
      field('Название', 'title', p.title),
      field('Описание для клиента', 'summary', p.summary, { tag: 'textarea' }),
      select('Статус', 'status', p.status, projectStates),
      listEditor('Этапы', p.stages, () => ({ state: 'todo' }), s => rowWrap(h('div', { class: 'ad-row' }, field('Этап', 'title', s.title), select('Состояние', 'state', s.state, STAGE), field('Дата', 'date', s.date, { type: 'date' })), field('Заметка', 'note', s.note)), 'stages'),
      listEditor('Сметы', p.estimates, () => ({ currency: 'RUB', status: 'sent' }), e => rowWrap(h('div', { class: 'ad-row' }, field('Название', 'title', e.title), field('Сумма', 'amount', e.amount, { type: 'number', step: '0.01' }), select('Валюта', 'currency', e.currency, CUR), select('Статус', 'status', e.status, [['draft', 'Черновик'], ['sent', 'На согласовании'], ['approved', 'Согласована'], ['declined', 'Отклонена']])), field('Заметка', 'note', e.note), field('Ссылка https://', 'url', e.url), fileInput(e, p.id)), 'estimates'),
      listEditor('Счета', p.invoices, () => ({ currency: 'RUB', status: 'unpaid' }), i => rowWrap(h('div', { class: 'ad-row' }, field('Номер', 'number', i.number), field('Назначение', 'title', i.title), field('Сумма', 'amount', i.amount, { type: 'number', step: '0.01' }), select('Валюта', 'currency', i.currency, CUR), select('Статус', 'status', i.status, [['unpaid', 'Ожидает оплаты'], ['paid', 'Оплачен'], ['overdue', 'Просрочен'], ['cancelled', 'Отменён']]), field('Оплатить до', 'due', i.due, { type: 'date' })), field('Ссылка https://', 'url', i.url), fileInput(i, p.id)), 'invoices'),
      listEditor('Файлы и версии', p.files, () => ({ kind: 'link' }), f => rowWrap(h('div', { class: 'ad-row' }, field('Название', 'title', f.title), select('Тип', 'kind', f.kind, [['build', 'Тестовая версия'], ['design', 'Макет'], ['document', 'Документ'], ['link', 'Ссылка']]), field('Дата', 'date', f.date, { type: 'date' })), field('Заметка', 'note', f.note), field('Ссылка https://', 'url', f.url), fileInput(f, p.id)), 'files'),
      h('div', { class: 'ad-actions' },
        h('button', { class: 'ac-btn', type: 'submit', text: 'Сохранить проект' }),
        h('button', { class: 'ac-btn ac-btn--ghost ad-danger', type: 'button', text: 'Удалить проект', onclick: () => { if (confirm('Удалить проект и файлы?')) act(async () => { await api('projects/' + p.id, 'DELETE'); projectId = null; }, 'Удалён'); } })));
    form.addEventListener('submit', e => {
      e.preventDefault();
      const rows = name => [...form.querySelectorAll(`[data-list="${name}"] .ad-item`)].map(r => Object.fromEntries([...r.querySelectorAll('[name]')].map(i => [i.name, i.value])));
      const top = Object.fromEntries([...form.querySelectorAll(':scope > label [name]')].map(i => [i.name, i.value]));
      act(() => api('projects', 'POST', { ...top, id: p.id, clientId: p.clientId, stages: rows('stages'), estimates: rows('estimates'), invoices: rows('invoices'), files: rows('files') }), 'Проект сохранён');
    });
    const chat = h('section', { class: 'ac-card ac-stack' }, h('h2', { text: 'Переписка' }),
      h('div', { class: 'ac-chat ad-chat' }, p.messages.length ? p.messages.map(m => h('div', { class: 'ac-msg', 'data-from': m.from === 'client' ? 'studio' : 'client' }, document.createTextNode(m.text), h('time', { text: (m.from === 'client' ? 'Клиент · ' : 'Вы · ') + new Date(m.at).toLocaleString('ru-RU') }))) : h('p', { class: 'ac-muted', text: 'Сообщений нет.' })),
      (() => { const ta = h('textarea', { rows: '2', maxlength: '4000', 'aria-label': 'Ответ' }); return h('div', { class: 'ac-compose' }, ta, h('button', { class: 'ac-btn', type: 'button', text: 'Ответить', onclick: () => ta.value.trim() && act(() => api(`projects/${p.id}/messages`, 'POST', { text: ta.value }), 'Отправлено') })); })());
    if (p.messages.some(m => m.from === 'client' && !m.readByStudio)) api(`projects/${p.id}/read`, 'POST').catch(() => {});
    return h('div', { class: 'ad-workspace' }, form, chat);
  }

  load().catch(() => {
    root.removeAttribute('aria-busy');
    root.replaceChildren(h('section', { class: 'ac-card ac-stack' },
      h('h2', { text: 'Не удалось загрузить кабинет студии' }),
      h('a', { class: 'ac-btn ac-btn--ghost', href: base, text: 'Обновить страницу' })));
  });
})();
