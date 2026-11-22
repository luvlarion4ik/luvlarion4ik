(() => {
  const app = document.querySelector('[data-pt-app]');
  if (!app) return;
  const ru = document.documentElement.lang === 'ru';
  const t = (rus, eng) => ru ? rus : eng;
  const tabs = [...app.querySelectorAll('[data-pt-tab]')];
  const panels = [...app.querySelectorAll('.pt-panel')];
  const log = app.querySelector('[data-pt-log]');
  const unread = app.querySelector('[data-pt-unread]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const safe = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { sessionStorage.setItem(key, value); } catch { /* демо работает и без хранилища */ } },
  };

  // заставка с приветствием: один раз за сессию
  const splash = app.querySelector('[data-pt-splash]');
  if (splash) {
    if (reduced || safe.get('pt-splash')) splash.remove();
    else {
      safe.set('pt-splash', '1');
      const logo = splash.querySelector('devlarion-logo');
      setTimeout(() => logo?.play?.(), 80);
      setTimeout(() => splash.classList.add('is-gone'), 1900);
      setTimeout(() => splash.remove(), 2500);
    }
  }

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
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab.dataset.ptTab));
    tab.addEventListener('keydown', event => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
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
    const body = `${t('Заявка', 'Request')} ${id}\n${t('Направление', 'Area')}: ${area}\n${t('Задача', 'Task')}: ${task}\n${t('Связь', 'Contact')}: ${contact}`;
    const base = telegram.dataset.base;
    telegram.href = base + (base.includes('?') ? '&' : '?') + 'text=' + encodeURIComponent(body);
    request.hidden = true;
    sent.hidden = false;
    sent.querySelector('.pt-check-art')?.replaceWith(sent.querySelector('.pt-check-art').cloneNode(true));
    sent.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
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
    setTimeout(() => bubble('them', t('Это демо. В кабинете ответ куратора приходит сюда и на почту или в Telegram.', 'This is a demo. In the portal your lead’s reply arrives here and by email or Telegram.')), 700);
  });
  const rateNote = app.querySelector('[data-pt-rate-note]');
  const rateButtons = [...app.querySelectorAll('[data-pt-rate]')];
  rateButtons.forEach(button => button.addEventListener('click', () => {
    rateButtons.forEach(other => other.setAttribute('aria-pressed', other === button));
    rateNote.textContent = button.dataset.ptRate === 'up'
      ? t('Спасибо за оценку. Её увидят менеджеры студии.', 'Thanks for rating. The studio managers will see it.')
      : t('Спасибо. Менеджер увидит оценку и вернётся к вашему вопросу.', 'Thanks. A manager will see the rating and follow up on your question.');
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
