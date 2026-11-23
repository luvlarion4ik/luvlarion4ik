(() => {
  const form = document.querySelector('[data-estimate]');
  if (!form) return;

  const ru = form.dataset.lang === 'ru';
  const t = (russian, english) => ru ? russian : english;
  const locale = t('ru-RU', 'en-US');
  const steps = [...form.querySelectorAll('[data-step]')];
  const services = [...form.querySelectorAll('[name="service"]')];
  const options = [...form.querySelectorAll('[name="option"]')];
  const questions = form.querySelector('[data-questions]');
  const result = form.querySelector('[data-result]');
  const summary = form.querySelector('[data-summary]');
  const copyStatus = form.querySelector('[data-copy-status]');
  const back = form.querySelector('[data-back]');
  const selectionNeeded = form.querySelector('[data-selection-needed]');
  const { referral, timeline } = form.elements;
  const page = new URL(location.href);
  const initialCode = page.searchParams.get('ref') || page.searchParams.get('start')?.match(/^ref_(.+)$/)?.[1];
  if (initialCode) referral.value = initialCode.slice(0, referral.maxLength);

  const goal = name => document.dispatchEvent(new CustomEvent('bureau-goal', {detail: name}));
  const label = input => input.labels[0].textContent.trim();
  const checked = inputs => inputs.filter(input => input.checked);
  const tokens = value => (value || '').trim().split(/\s+/);
  let current = 0;
  let brief = '';
  let started = false;

  function applyOptionAvailability() {
    const ids = new Set(checked(services).map(input => input.value));
    for (const option of options) {
      const eligible = option.dataset.eligible;
      const available = (!eligible || tokens(eligible).some(id => ids.has(id)))
        && !(option.value === 'design' && ids.has('design'));
      option.disabled = option.labels[0].hidden = !available;
      if (!available) option.checked = false;
    }
  }

  function showStep(index, focus = true) {
    current = index;
    steps.forEach((step, n) => {
      step.disabled = step.hidden = n !== index;
    });
    const progress = form.querySelector('#quiz-progress');
    progress.textContent = t(
      `Шаг ${index + 1} из ${steps.length}`, `Step ${index + 1} of ${steps.length}`
    );
    form.querySelector('[data-progress]').value = index + 1;
    back.hidden = index === 0;
    form.querySelector('[data-next]').textContent = index === steps.length - 1
      ? t('Посмотреть оценку', 'See estimate') : t('Дальше', 'Continue');
    if (focus) steps[index].querySelector('legend').focus();
  }

  function inputRate(input, tier) {
    const value = input.getAttribute(`data-price-${tier}`);
    if (value === null) return null;
    const [min, max = min] = value.split(',').map(Number);
    return [min, max];
  }

  function formatRate(rate, tier, conversion) {
    const amount = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: conversion.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    const [low, high] = rate.map(rub => amount.format(rub * conversion.rate));
    const approx = conversion.currency === 'RUB' ? '' : '≈ ';
    if (tier === 'small') return t(`от ${approx}${low}`, `from ${approx}${low}`);
    return approx + (low === high ? low : t(`от ${low} до ${high}`, `${low} to ${high}`));
  }

  function addLine(list, name, value) {
    const row = document.createElement('div');
    const key = document.createElement('dt');
    key.textContent = name;
    const description = document.createElement('dd');
    description.textContent = value;
    row.append(key, description);
    list.append(row);
  }

  function showResult(focus = true) {
    const tier = form.querySelector('[name="tier"]:checked').value;
    const serviceChoices = checked(services);
    const optionChoices = checked(options);
    const support = serviceChoices.find(input => input.value === 'support');
    const work = serviceChoices.filter(input => input !== support);
    const selected = [...work, ...optionChoices];
    const priced = selected.filter(input => inputRate(input, tier) !== null);
    const manual = selected.filter(input => !priced.includes(input));
    const moduleCount = work.filter(input => priced.includes(input)).length;
    const discount = moduleCount >= 3 ? 8 : moduleCount === 2 ? 5 : 0;
    const total = priced.reduce(([low, high], input) => {
      const [min, max] = inputRate(input, tier);
      return [low + min, high + max];
    }, [0, 0]).map(amount => Math.round(amount * (100 - discount) / 100));
    const [min] = total;
    const supportRate = support && inputRate(support, tier);
    const rub = {currency: 'RUB', rate: 1};
    const region = window.devlarionRegion ?? rub;
    const requestOnly = region.code === 'other';
    const converted = !requestOnly && region.currency !== 'RUB'
      && Number.isFinite(region.rate) && region.rate > 0;
    const active = converted ? region : rub;
    const quote = t('По ТЗ', 'Quoted after scoping');
    const quoteRate = rate => rate && !requestOnly ? formatRate(rate, tier, active) : quote;
    const headline = min ? formatRate(total, tier, active)
      : supportRate && !manual.length ? t('Ежемесячная поддержка', 'Monthly support')
        : t('Индивидуальная смета', 'Tailored quote');

    summary.textContent = requestOnly ? t('Запросите оценку для вашего региона', 'Request an estimate for your region') : headline;
    const currencyNote = form.querySelector('[data-currency-note]');
    currencyNote.hidden = !converted;
    if (converted) {
      const formattedDate = region.date ? new Intl.DateTimeFormat(t('ru-RU', 'en-GB'), {
        timeZone: 'UTC', day: 'numeric', month: ru ? 'numeric' : 'short', year: 'numeric',
      }).format(new Date(region.date)) : '';
      const rateDate = formattedDate ? ' (' + formattedDate + ')' : '';
      currencyNote.textContent = t(
        `Ориентир в ${region.currency} по данным ${region.source}${rateDate}. Валюту счёта согласуем в договоре.`,
        `Approximate conversion to ${region.currency} using ${region.source}${rateDate}. We agree on the billing currency in the contract.`
      );
    }

    const breakdown = form.querySelector('[data-breakdown]');
    breakdown.replaceChildren();
    for (const input of selected) {
      const rate = inputRate(input, tier);
      const scope = input.getAttribute(`data-scope-${tier}`);
      addLine(breakdown, scope ? `${label(input)}. ${scope}` : label(input), quoteRate(rate));
    }
    if (discount && !requestOnly) addLine(breakdown, t('Комбо-скидка на разовые работы', 'Bundle discount on one-off work'), `−${discount}%`);
    if (support) addLine(breakdown, label(support), quoteRate(supportRate));

    const code = referral.value.trim();
    const guidance = [t(
      'Предварительная оценка. Итоговую смету согласуем по ТЗ и фиксируем в договоре. Доступны проектные и реферальные скидки.',
      'Preliminary estimate. We agree a final quote based on your brief and confirm it in the contract. Project and referral discounts are available.'
    )];
    if (!requestOnly && manual.length && min) guidance.push(t('Остальное оценим по ТЗ.', 'We’ll quote the remaining items after scoping.'));
    if (serviceChoices.some(input => ['private-ai', 'fine-tuning', 'agents', 'assistant'].includes(input.value))) {
      guidance.push(t('Оборудование, аренду, вычислительные ресурсы, API и лицензии согласуем отдельно.',
        'Hardware, rental, compute resources, APIs and licences are quoted separately.'));
    }
    if (code) guidance.push(t('Реферальный код указан. Скидку подтвердим после оплаты первого этапа приглашённым клиентом.',
      'Referral code added. We confirm the discount after the referred client pays for their first stage.'));
    form.querySelector('[data-guidance]').textContent = guidance.join('\n');

    const briefRows = selected.map(input => `${label(input)} — ${quoteRate(inputRate(input, tier))}`);
    const source = ['utm_source', 'utm_medium', 'utm_campaign'].map(key => page.searchParams.get(key)?.slice(0, 64)).filter(Boolean);
    const profile = form.querySelector('[name="tier"]:checked').labels[0].querySelector('strong').textContent;
    brief = [
      t('Хочу обсудить проект с Devlarion.', 'I’d like to discuss a project with Devlarion.'),
      `${t('Масштаб проекта', 'Project size')} — ${profile}`,
      ...briefRows,
      !requestOnly && discount && `${t('Комбо-скидка', 'Bundle discount')} — ${discount}%`,
      !requestOnly && min && `${t('Разовые работы', 'One-off work')} — ${formatRate(total, tier, active)}`,
      support && `${label(support)} — ${quoteRate(supportRate)}`,
      timeline.value && `${t('Желаемый срок', 'Target delivery')} — ${timeline.selectedOptions[0].textContent}`,
      converted && currencyNote.textContent,
      source.length && `${t('Источник', 'Source')} — ${source.join(' / ')}`,
      code && `${t('Реферальный код', 'Referral code')} — ${code}`,
      ...guidance
    ].filter(Boolean).join('\n');

    const telegram = new URL(form.dataset.telegram);
    telegram.searchParams.set('text', brief);
    const contact = form.querySelector('[data-brief]');
    contact.href = telegram.href;
    contact.textContent = requestOnly || !min && !supportRate
      ? t('Запросить смету в Telegram', 'Request a quote on Telegram')
      : t('Отправить расчёт в Telegram', 'Send estimate on Telegram');

    const share = new URL('#quiz', page.origin + page.pathname);
    share.searchParams.set('service', serviceChoices.map(input => input.value).join(' '));
    share.searchParams.set('tier', tier);
    if (optionChoices.length) share.searchParams.set('options', optionChoices.map(input => input.value).join(' '));
    if (region.code) share.searchParams.set('currency', requestOnly ? 'other' : active.currency);
    share.searchParams.set('calculated', '1');
    const portalLink = form.querySelector('[data-portal]');
    if (portalLink && form.dataset.portalUrl) {
      // Кабинет заново проверяет выбор и считает цену на сервере; здесь передаём только ответы.
      const start = new URL('start', form.dataset.portalUrl.replace(/\/?$/, '/'));
      for (const [key, value] of share.searchParams) if (key !== 'calculated') start.searchParams.set(key, value);
      if (code) start.searchParams.set('ref', code);
      start.searchParams.set('lang', ru ? 'ru' : 'en');
      portalLink.href = start.href;
      portalLink.hidden = false;
    }
    if (timeline.value) share.searchParams.set('timeline', timeline.value);
    const shareButton = form.querySelector('[data-share]');
    shareButton.dataset.shareUrl = share.href;
    questions.hidden = true;
    result.hidden = false;
    if (focus) {
      summary.focus();
      goal('quiz_complete');
    }
  }

  function applySelection(serviceList, tier, optionList, focus = true) {
    const ids = new Set(tokens(serviceList));
    if (!services.some(input => ids.has(input.value))) return false;
    const targets = form.querySelectorAll('[name="tier"]');
    for (const target of targets) if (target.value === tier) target.checked = true;
    for (const input of services) input.checked = ids.has(input.value);
    applyOptionAvailability();
    const optionIds = new Set(tokens(optionList));
    for (const option of options) option.checked = !option.disabled && optionIds.has(option.value);
    copyStatus.textContent = '';
    result.hidden = selectionNeeded.hidden = true;
    questions.hidden = false;
    showStep(1, focus);
    return true;
  }

  form.addEventListener('change', () => {
    if (!started) goal('quiz_start');
    started = true;
    if (checked(services).length) selectionNeeded.hidden = true;
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (questions.hidden || !form.reportValidity()) return;
    if (current === 1 && !checked(services).length) {
      selectionNeeded.hidden = false;
      services[0].focus();
      return;
    }
    if (current === 1) applyOptionAvailability();
    if (current < steps.length - 1) showStep(current + 1);
    else showResult();
  });
  back.addEventListener('click', () => showStep(current - 1));
  form.querySelector('[data-edit]').addEventListener('click', () => {
    result.hidden = true;
    copyStatus.textContent = '';
    questions.hidden = false;
    showStep(0);
  });
  form.querySelector('[data-copy]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(brief);
      copyStatus.textContent = t('Расчёт скопирован.', 'Estimate copied.');
    } catch {
      copyStatus.textContent = brief;
      const range = document.createRange();
      range.selectNodeContents(copyStatus);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  });
  document.addEventListener('devlarion:regionchange', () => {
    if (!result.hidden) showResult(false);
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-estimate-services]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    applySelection(link.dataset.estimateServices, link.dataset.estimateTier, link.dataset.estimateOptions);
  });

  const requestedTimeline = page.searchParams.get('timeline');
  if ([...timeline.options].some(option => option.value === requestedTimeline)) timeline.value = requestedTimeline;
  showStep(0, false);
  form.hidden = false;
  if (applySelection(page.searchParams.get('service'), page.searchParams.get('tier'), page.searchParams.get('options'), false)
      && page.searchParams.get('calculated') === '1') {
    showResult(false);
  }
})();
