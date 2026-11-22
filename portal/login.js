(() => {
  const form = document.querySelector('.ac-code-form');
  const card = form?.closest('[data-bot-available]');
  if (card?.dataset.botAvailable !== 'true') return;

  const fields = form.querySelector('fieldset');
  const input = form.elements.code;
  const status = card.querySelector('[data-login-status]');
  const reset = card.querySelector('[data-login-reset]');
  const base = form.dataset.base;
  fields.disabled = false;

  function announce(message, tone) {
    status.dataset.tone = tone;
    status.textContent = message;
  }

  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    if (status.dataset.tone === 'error') announce('', '');
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (fields.disabled) return;

    const code = input.value.replace(/[\s\p{Dash_Punctuation}−]/gu, '');
    if (!/^\d{8}$/.test(code)) {
      announce('Введите восемь цифр из сообщения Telegram.', 'error');
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }

    input.value = code;
    input.removeAttribute('aria-invalid');
    fields.disabled = true;
    form.setAttribute('aria-busy', 'true');
    announce('Проверяем код…', 'progress');

    let renew = false;
    try {
      const response = await fetch(base + 'api/login/verify', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (response.ok && data?.ok === true) {
        renew = true;
        window.location.assign(base);
        return;
      }
      if (response.ok && data?.pending === true) {
        renew = true;
        announce(data.message || 'Код подтверждён. Студия ещё не открыла доступ к проекту.', 'pending');
      } else {
        renew = response.status === 410 || response.status === 429;
        announce(data?.error || 'Не удалось проверить код. Попробуйте ещё раз.', 'error');
        if ([401, 422].includes(response.status)) input.setAttribute('aria-invalid', 'true');
      }
    } catch {
      announce('Не удалось связаться с кабинетом. Попробуйте ещё раз.', 'error');
    } finally {
      form.removeAttribute('aria-busy');
      fields.disabled = renew;
    }

    if (renew) {
      input.value = '';
      reset.hidden = false;
      reset.focus();
    } else {
      input.focus();
      if (input.hasAttribute('aria-invalid')) input.select();
    }
  });
})();
