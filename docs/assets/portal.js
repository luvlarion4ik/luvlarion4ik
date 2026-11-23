(() => {
  const app = document.querySelector('[data-pt-app]');
  if (!app) return;
  const ru = document.documentElement.lang === 'ru';
  const t = (rus, eng) => ru ? rus : eng;
  const tabs = [...app.querySelectorAll('[data-pt-tab]')];
  const panels = [...app.querySelectorAll('.pt-panel')];
  const log = app.querySelector('[data-pt-log]');
  const unread = app.querySelector('[data-pt-unread]');

  function initSavedMaps(section) {
    const { labels, categories, stages } = JSON.parse(section.querySelector('[data-pt-maps-config]').textContent);
    const list = section.querySelector('[data-pt-maps-list]');
    const empty = section.querySelector('[data-pt-maps-empty]');
    const error = section.querySelector('[data-pt-maps-error]');
    const importButton = section.querySelector('[data-pt-maps-import-button]');
    const importInput = section.querySelector('[data-pt-maps-import]');
    const rootUrl = section.dataset.mapUrl;
    const mapsKey = 'devlarion-growth-maps';
    const activeKey = 'devlarion-growth-map-active';
    const format = 'devlarion.growthmap';
    const fileLimit = 400000;
    const dateFormat = new Intl.DateTimeFormat(ru ? 'ru-RU' : 'en', { dateStyle: 'medium' });
    const stageNames = { src: 'traffic', ent: 'entry', cap: 'capture', proc: 'process', pay: 'pay', del: 'deliver', ret: 'retain' };

    function feedback(key) {
      error.hidden = !key;
      error.textContent = key ? labels[key] : '';
    }

    function documents() {
      const raw = localStorage.getItem(mapsKey);
      try {
        const maps = JSON.parse(raw);
        return Array.isArray(maps) ? maps : [];
      } catch {
        return [];
      }
    }

    function create(tag, css, text) {
      const node = document.createElement(tag);
      if (css) node.className = css;
      if (text) node.textContent = text;
      return node;
    }

    function mapRow(map) {
      const { brief, active, variants } = map;
      const name = typeof brief.name === 'string' && brief.name.trim() ? brief.name.trim().slice(0, 60) : labels['intro.eyebrow'];
      const row = create('li', 'pt-maps-row');
      const description = create('div', 'pt-maps-description');
      const meta = create('p', 'pt-maps-meta');
      const timestamp = new Date(map.updatedAt);
      const when = Number.isFinite(timestamp.getTime()) ? labels['cab.saved'].replace('{date}', dateFormat.format(timestamp)) : '';
      const industry = Object.hasOwn(categories, brief.category) ? categories[brief.category] : categories.other;
      meta.textContent = [industry, labels['v.' + active], when].filter(Boolean).join(' · ');
      description.append(create('strong', '', name), meta);

      const preview = create('span', 'pt-maps-preview');
      preview.setAttribute('aria-hidden', 'true');
      const nodes = variants?.[active]?.nodes;
      const occupied = new Set(Array.isArray(nodes) ? nodes
        .filter(node => typeof node?.block === 'string').map(node => stageNames[node.block.split('_', 1)[0]]) : []);
      for (const [stage, color] of stages) {
        const dot = create('i', occupied.has(stage) ? 'is-filled' : '');
        dot.style.setProperty('--dot-color', color);
        preview.append(dot);
      }

      const actions = create('div', 'pt-maps-controls');
      const open = create('a', 'pt-btn', labels['cab.open']);
      open.href = rootUrl + '#open=' + map.id;
      open.setAttribute('aria-label', labels['cab.open'] + ' ' + name);
      const remove = create('button', 'pt-btn pt-maps-remove', labels['cab.delete']);
      remove.type = 'button';
      remove.setAttribute('aria-label', labels['cab.delete'] + ' ' + name);
      remove.addEventListener('click', () => {
        if (!window.confirm(labels['cab.delete.ask'].replace('{name}', () => name))) return;
        try {
          const maps = documents().filter(item => item?.id !== map.id);
          localStorage.setItem(mapsKey, JSON.stringify(maps));
          if (localStorage.getItem(activeKey) === map.id) localStorage.removeItem(activeKey);
          feedback();
          render();
          (list.querySelector('a') ?? empty.querySelector('a')).focus();
        } catch {
          feedback('act.storage.off');
        }
      });
      actions.append(open, remove);
      row.append(preview, description, actions);
      return row;
    }

    function render() {
      let maps = [];
      try {
        maps = documents().filter(map => map?.saved === true && map.format === format &&
          typeof map.id === 'string' && /^[\w-]{1,100}$/.test(map.id) && map.brief &&
          ['now', 'base', 'boost', 'auto'].includes(map.active)).slice(0, 10);
      } catch {
        feedback('act.storage.off');
      }
      list.replaceChildren(...maps.map(mapRow));
      list.hidden = !maps.length;
      empty.hidden = !!maps.length;
    }

    importButton.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', async () => {
      const file = importInput.files[0];
      importInput.value = '';
      if (!file) return;
      feedback();
      try {
        if (file.size > fileLimit) throw new Error('invalid');
        const raw = await file.text();
        const map = JSON.parse(raw);
        if (map?.format !== format || !map.brief) throw new Error('invalid');
        if (map.version > 1) throw new Error('newer');
        const bytes = new TextEncoder().encode(raw);
        let binary = '';
        for (let offset = 0; offset < bytes.length; offset += 8192) {
          binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
        }
        const encoded = btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
        location.assign(rootUrl + '#map=u.' + encoded);
      } catch (problem) {
        feedback(problem.message === 'newer' ? 'act.newer' : 'act.import.bad');
      }
    });

    window.addEventListener('storage', event => {
      if (event.key === mapsKey || event.key === null) render();
    });
    window.addEventListener('pageshow', event => { if (event.persisted) render(); });
    render();
  }

  const savedMaps = app.querySelector('[data-pt-maps]');
  if (savedMaps) initSavedMaps(savedMaps);


  // состояние демо: новый клиент или проект в работе
  const modeButtons = [...document.querySelectorAll('[data-pt-mode]')];
  function setMode(mode) {
    app.dataset.state = mode;
    modeButtons.forEach(button => button.setAttribute('aria-pressed', button.dataset.ptMode === mode));
    if (mode === 'active' && unread && !app.dataset.supportSeen) unread.hidden = false;
  }
  modeButtons.forEach(button => button.addEventListener('click', () => setMode(button.dataset.ptMode)));

  function select(id, focus = false) {
    tabs.forEach(tab => {
      const on = tab.dataset.ptTab === id;
      tab.setAttribute('aria-selected', on);
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    });
    panels.forEach(panel => { panel.hidden = panel.id !== 'pt-panel-' + id; });
    if (id === 'support' && unread) { unread.hidden = true; app.dataset.supportSeen = '1'; }
  }
  const mobileTabs = matchMedia('(max-width: 860px)');
  const tablist = tabs[0].parentElement;
  const updateTabOrientation = () => tablist.setAttribute('aria-orientation', mobileTabs.matches ? 'horizontal' : 'vertical');
  updateTabOrientation();
  mobileTabs.addEventListener('change', updateTabOrientation);
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab.dataset.ptTab));
    tab.addEventListener('keydown', event => {
      const arrows = mobileTabs.matches ? { ArrowRight: 1, ArrowLeft: -1 } : { ArrowDown: 1, ArrowUp: -1 };
      const step = arrows[event.key];
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        select(tabs[event.key === 'Home' ? 0 : tabs.length - 1].dataset.ptTab, true);
      } else if (step) {
        event.preventDefault();
        select(tabs[(i + step + tabs.length) % tabs.length].dataset.ptTab, true);
      }
    });
  });
  app.querySelectorAll('[data-pt-go]').forEach(button =>
    button.addEventListener('click', () => select(button.dataset.ptGo, true)));

  // заявка нового клиента
  const request = app.querySelector('[data-pt-request]');
  const sent = app.querySelector('[data-pt-sent]');
  const requestError = app.querySelector('[data-pt-request-error]');
  const taskField = app.querySelector('[data-pt-task]');
  const contactField = app.querySelector('[data-pt-contact]');
  const directionField = app.querySelector('[data-pt-direction]');
  const telegram = app.querySelector('[data-pt-telegram]');
  request?.addEventListener('submit', event => {
    event.preventDefault();
    const task = taskField.value.trim();
    const contact = contactField.value.trim();
    if (task.length < 12 || !contact) { requestError.hidden = false; (task.length < 12 ? taskField : contactField).focus(); return; }
    requestError.hidden = true;
    const id = 'DL-' + String(Date.now()).slice(-5);
    sent.querySelector('[data-pt-id]').textContent = id;
    const area = directionField.selectedOptions[0].textContent;
    const timeline = request.elements.timeline.value;
    const body = [
      `${t('Заявка', 'Request')} ${id}`,
      `${t('Направление', 'Area')}: ${area}`,
      timeline && `${t('Желаемый срок', 'Target date')}: ${timeline}`,
      `${t('Задача', 'Task')}: ${task}`,
      `${t('Связь', 'Contact')}: ${contact}`,
    ].filter(Boolean).join('\n');
    const base = telegram.dataset.base;
    telegram.href = base + (base.includes('?') ? '&' : '?') + 'text=' + encodeURIComponent(body);
    request.hidden = true;
    sent.hidden = false;
    sent.querySelector('.pt-check-art')?.replaceWith(sent.querySelector('.pt-check-art').cloneNode(true));
    sent.focus();
  });
  app.querySelector('[data-pt-edit-request]')?.addEventListener('click', () => {
    sent.hidden = true; request.hidden = false; taskField.focus();
  });
  app.querySelectorAll('[data-pt-request-for]').forEach(button => button.addEventListener('click', () => {
    setMode('new');
    directionField.value = button.dataset.ptRequestFor;
    select('project', true);
    sent.hidden = true; request.hidden = false;
    taskField.focus();
  }));

  const today = () => new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  const addLog = text => {
    const item = document.createElement('li');
    item.className = 'is-new';
    const time = document.createElement('time');
    time.textContent = today();
    item.append(time, document.createTextNode(text));
    log.append(item);
  };

  // согласование версии
  const state = app.querySelector('[data-pt-version-state]');
  const actions = app.querySelector('[data-pt-version-actions]');
  const form = app.querySelector('[data-pt-revise-form]');
  const comment = app.querySelector('[data-pt-comment]');
  const error = app.querySelector('[data-pt-error]');
  const note = app.querySelector('[data-pt-version-note]');
  const title = app.querySelector('[data-pt-action-title]');
  const text = app.querySelector('[data-pt-action-text]');
  const initial = { title: title.textContent, text: text.textContent, state: state.textContent };
  let logged = 0;

  function decide(kind, message) {
    state.className = 'pt-chip pt-chip--' + (kind === 'ok' ? 'done' : 'new');
    state.textContent = kind === 'ok' ? t('Принято', 'Approved') : t('Правки запрошены', 'Changes requested');
    actions.hidden = form.hidden = true;
    note.textContent = message;
    title.textContent = kind === 'ok' ? t('Версия 2 принята', 'Version 2 approved') : t('Правки отправлены студии', 'Changes sent to the studio');
    text.textContent = kind === 'ok'
      ? t('Спасибо. Подключаем ассистента и готовим версию 3.', 'Thank you. We are connecting the assistant and preparing version 3.')
      : t('Куратор ответит в рабочие часы. Следующая версия пройдёт своё согласование.', 'Your lead will reply during working hours. The next version goes through its own approval.');
    addLog(message);
    logged += 1;
  }
  app.querySelector('[data-pt-approve]').addEventListener('click', () =>
    decide('ok', t('Версия 2 принята', 'Version 2 approved')));
  app.querySelector('[data-pt-revise]').addEventListener('click', () => {
    actions.hidden = false; form.hidden = false; comment.focus();
  });
  app.querySelector('[data-pt-cancel]').addEventListener('click', () => { form.hidden = error.hidden = true; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!comment.value.trim()) { error.hidden = false; comment.focus(); return; }
    error.hidden = true;
    decide('changes', t('Правки к версии 2: ', 'Changes to version 2: ') + comment.value.trim().slice(0, 80));
  });
  app.querySelector('[data-pt-reset]').addEventListener('click', () => {
    state.className = 'pt-chip pt-chip--wait'; state.textContent = initial.state;
    actions.hidden = false; form.hidden = true; error.hidden = true; comment.value = ''; note.textContent = '';
    title.textContent = initial.title; text.textContent = initial.text;
    for (; logged > 0; logged -= 1) log.lastElementChild.remove();
  });

  // чат и оценка поддержки
  const messages = app.querySelector('[data-pt-messages]');
  const compose = app.querySelector('[data-pt-compose]');
  const bubble = (kind, value) => {
    const p = document.createElement('p');
    p.className = 'pt-msg pt-msg--' + kind;
    p.textContent = value;
    messages.append(p);
    messages.scrollTop = messages.scrollHeight;
  };
  compose.addEventListener('submit', event => {
    event.preventDefault();
    const input = compose.querySelector('input');
    const value = input.value.trim();
    if (!value) return;
    bubble('me', value);
    input.value = '';
    bubble('them', t('В рабочем кабинете здесь появится ответ куратора.', 'In your account, your project lead’s reply appears here.'));
  });
  const rateNote = app.querySelector('[data-pt-rate-note]');
  const rateButtons = [...app.querySelectorAll('[data-pt-rate]')];
  rateButtons.forEach(button => button.addEventListener('click', () => {
    rateButtons.forEach(other => other.setAttribute('aria-pressed', other === button));
    rateNote.textContent = t('Оценка отмечена в демо.', 'Rating selected in the demo.');
  }));

  // скидки с общим пределом
  const calc = app.querySelector('[data-pt-calc]');
  if (calc) {
    const cap = Number(calc.dataset.cap), base = Number(calc.dataset.base);
    const format = new Intl.NumberFormat(calc.dataset.locale, { maximumFractionDigits: 0 });
    const money = value => format.format(value).replace(/ /g, ' ') + ' ₽';
    const render = () => {
      const sum = [...calc.querySelectorAll('input:checked')].reduce((total, input) => total + Number(input.value), 0);
      const applied = Math.min(sum, cap);
      calc.querySelector('[data-pt-sum]').textContent = sum + '%';
      calc.querySelector('[data-pt-applied]').textContent = applied + '%';
      calc.querySelector('[data-pt-saving]').textContent = money(base * applied / 100);
      calc.querySelector('[data-pt-total]').textContent = money(base - base * applied / 100);
    };
    calc.addEventListener('change', render);
    render();
  }

  // настройки
  const profile = app.querySelector('[data-pt-profile]');
  profile?.addEventListener('submit', event => {
    event.preventDefault();
    app.querySelector('[data-pt-profile-note]').textContent = t('Сохранено (демо)', 'Saved (demo)');
  });
  const themeButtons = [...app.querySelectorAll('[data-pt-theme]')];
  const radios = () => [...document.querySelectorAll('.theme-picker input[type="radio"]')];
  const activeTheme = () => { try { return localStorage.getItem('devlarion-theme') || 'auto'; } catch { return 'auto'; } };
  const markTheme = () => themeButtons.forEach(button => button.setAttribute('aria-pressed', button.dataset.ptTheme === activeTheme()));
  markTheme();
  themeButtons.forEach(button => button.addEventListener('click', () => {
    // используем настоящий переключатель сайта: он сохраняет выбор и применяет тему
    const radio = radios().find(input => input.value === button.dataset.ptTheme);
    if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
    markTheme();
  }));
  app.querySelector('[data-pt-end-session]')?.addEventListener('click', event => {
    const row = event.currentTarget.closest('li');
    row.remove();
    app.querySelector('[data-pt-security-note]').textContent = t('Сессия завершена (демо).', 'Session ended (demo).');
  });
  const securityNote = app.querySelector('[data-pt-security-note]');
  const notes = {
    password: t('Демо: при восстановлении доступа код приходит в привязанный Telegram. Здесь код не отправляется.', 'Demo: for account recovery, the code goes to your linked Telegram account. This preview sends no code.'),
    mfa: t('Демо: двухфакторный вход подтверждается кодом из приложения-аутентификатора.', 'Demo: two-factor sign-in is confirmed with an authenticator code.'),
    delete: t('Демо: перед удалением аккаунта мы просим подтвердить его по e-mail, а проекты и документы остаются у студии по договору.', 'Demo: before deleting an account we ask for email confirmation, and projects and documents stay with the studio under the contract.'),
  };
  app.querySelectorAll('[data-pt-note]').forEach(button =>
    button.addEventListener('click', () => { securityNote.textContent = notes[button.dataset.ptNote]; }));
  app.querySelector('[data-pt-invite]')?.addEventListener('click', () => {
    app.querySelector('[data-pt-invite-note]').textContent = t(
      'Демо: в кабинете приглашение уходит на e-mail коллеги и действует только для выбранных проектов.',
      'Demo: in the portal an invitation is emailed to your colleague and covers selected projects only.');
  });
})();
