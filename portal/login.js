(() => {
  const auth = document.querySelector('[data-auth-mode]');
  if (!auth) return;

  const base = auth.dataset.base;
  const mode = auth.dataset.authMode;
  const codeMode = mode !== 'login';
  const form = auth.querySelector(codeMode ? '[data-auth-kind="code"]' : '[data-auth-kind="password"]');
  const fields = form.querySelector('fieldset');
  const status = auth.querySelector('[data-login-status]');
  const reset = auth.querySelector('[data-login-reset]');
  const newPassword = form.querySelector('[data-new-password]');
  let action = codeMode ? mode : 'password';

  auth.querySelector('[data-auth-tab="' + mode + '"]')?.setAttribute('aria-current', 'page');
  reset.href = base + '?mode=' + mode + '&new-code=1';
  if (codeMode && auth.dataset.botAvailable !== 'true') return;
  if (mode === 'register' || mode === 'reset') form.elements.password.required = true;
  fields.disabled = false;

  function show(message, tone) {
    status.dataset.tone = tone;
    status.textContent = message;
  }

  function invalid(field, message) {
    field.setAttribute('aria-invalid', 'true');
    show(message, 'error');
    field.focus();
  }

  function strongEnough(value) {
    return [...value].length >= 6 && /\p{Lu}/u.test(value) && /\p{Ll}/u.test(value);
  }

  form.addEventListener('input', event => {
    event.target.removeAttribute('aria-invalid');
    if (status.dataset.tone === 'error') show('', '');
  });

  for (const button of form.querySelectorAll('[data-reveal-password]')) {
    const input = document.getElementById(button.getAttribute('aria-controls'));
    button.addEventListener('click', () => {
      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      button.textContent = reveal ? 'Скрыть' : 'Показать';
      button.setAttribute('aria-label', reveal ? 'Скрыть пароль' : 'Показать пароль');
    });
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (fields.disabled) return;

    const input = codeMode ? form.elements.code : form.elements.identifier;
    const password = form.elements.password;
    const code = codeMode ? input.value.replace(/[\s\p{Dash_Punctuation}−]/gu, '') : '';
    if (codeMode && !/^\d{8}$/.test(code)) {
      invalid(input, 'Введите восемь цифр из сообщения Telegram.');
      return;
    }
    if (!codeMode && !input.value.trim()) {
      invalid(input, 'Введите имя пользователя или ID в Telegram.');
      return;
    }
    if (action === 'password' && !password.value) {
      invalid(password, 'Введите пароль.');
      return;
    }
    if ((action === 'register' || action === 'reset') && !strongEnough(password.value)) {
      invalid(password, 'Пароль должен содержать не менее шести символов, заглавную и строчную буквы.');
      return;
    }

    const body = codeMode ? { code } : { identifier: input.value.trim() };
    if (action !== 'code') body.password = password.value;
    if (mode === 'code' && action === 'register') body.source = 'code';

    fields.disabled = true;
    form.setAttribute('aria-busy', 'true');
    show('Проверяем…', 'progress');

    let renew = false;
    let focus = input;
    try {
      const endpoint = action === 'code' ? 'verify' : action;
      const response = await fetch(base + 'api/login/' + endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data?.ok === true) {
        password.value = '';
        renew = true;
        window.location.assign(base);
        return;
      }

      if (codeMode && response.status === 409 && data?.needsPassword === true) {
        action = 'register';
        newPassword.classList.add('ac-password-required');
        password.required = true;
        form.querySelector('[data-code-submit]').textContent = 'Задать пароль и войти';
        show('Telegram подтверждён. Задайте пароль для следующих входов.', 'info');
        focus = password;
      } else {
        renew = codeMode && (response.status === 410 || response.status === 429);
        show(data?.error || 'Не удалось войти. Попробуйте ещё раз.', 'error');
        if (response.status === 401 || response.status === 422) {
          focus = codeMode ? input : password;
          focus.setAttribute('aria-invalid', 'true');
        }
      }
    } catch {
      show('Не удалось связаться с кабинетом. Попробуйте ещё раз.', 'error');
    } finally {
      form.removeAttribute('aria-busy');
      fields.disabled = renew;
    }

    if (renew) {
      input.value = '';
      password.value = '';
      reset.hidden = false;
      reset.focus();
    } else {
      focus.focus();
      if (focus.hasAttribute('aria-invalid')) focus.select();
    }
  });
})();
