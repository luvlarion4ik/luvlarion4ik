(() => {
  const form = document.querySelector('[data-estimate]');
  if (!form) return;

  const ru = form.dataset.lang === 'ru';
  const t = (russian, english) => ru ? russian : english;
  const steps = [...form.querySelectorAll('[data-step]')];
  const questions = form.querySelector('[data-questions]');
  const result = form.querySelector('[data-result]');
  const summary = form.querySelector('[data-summary]');
  const copyStatus = form.querySelector('[data-copy-status]');
  const back = form.querySelector('[data-back]');
  let current = 0;
  let brief = '';
  let started = false;
  const goal = name => document.dispatchEvent(new CustomEvent('bureau-goal', {detail: name}));

  function showStep(index, focus = true) {
    current = index;
    steps.forEach((step, n) => {
      step.disabled = step.hidden = n !== current;
    });
    form.querySelector('#quiz-progress').textContent = t(
      `Шаг ${index + 1} из ${steps.length}`, `Step ${index + 1} of ${steps.length}`
    );
    form.querySelector('[data-progress]').value = index + 1;
    back.hidden = index === 0;
    form.querySelector('[data-next]').textContent = index === steps.length - 1
      ? t('Посмотреть оценку', 'See estimate') : t('Дальше', 'Continue');
    if (focus) steps[index].querySelector('legend').focus();
  }

  function estimate(answers, service) {
    const company = ['company', 'public'].includes(answers.client);
    const starter = !company && service.dataset.price && answers.scope === 'one'
      && answers.integrations === 'none' && answers.documents === 'standard';
    const total = starter ? service.dataset.package + ' · ' + service.dataset.price
      : t('Индивидуальная смета после созвона', 'A tailored quote after our call');
    const track = starter ? service.dataset.scope : t(
      'Обсудим, как устроен процесс, какие системы нужно подключить и к какому сроку нужен запуск.',
      'We’ll discuss your workflow, integrations and target launch date.'
    );
    const hints = [];
    if (starter) {
      hints.push(t('Это стартовая цена за описанный объём. После созвона подтвердим итоговую стоимость и срок.',
        'This starting price covers the scope above. We’ll confirm the final price and delivery date after our call.'));
    } else {
      hints.push(t('Подберём условия под объём работ, обсудим возможную персональную скидку и пришлём смету с итоговой стоимостью.',
        'We’ll tailor the terms to the scope, discuss any applicable discount and send a written quote with the final price.'));
    }
    if (answers.service === 'support') hints.push(t('Для сданных нами проектов два месяца исправления дефектов входят в стоимость.', 'Our projects include two months of defect fixes after delivery.'));
    if (answers.service === 'private-ai') hints.push(t('Оборудование и эксплуатацию оцениваем отдельно.', 'Hardware and operating costs are quoted separately.'));
    if (answers.support === 'request') hints.push(t('Доработки после запуска оцениваем по задаче.', 'Post-launch changes are quoted individually.'));
    if (answers.support === 'sla') hints.push(t('Поддержку с гарантированным временем реакции рассчитываем отдельно.', 'Support with a guaranteed response time is quoted separately.'));
    return {total, track, hints, company};
  }

  function showResult() {
    const selected = steps.map(step => step.querySelector('input:checked'));
    const answers = Object.fromEntries(selected.map(input => [input.name, input.value]));
    const {total, track, hints, company} = estimate(answers, selected.find(input => input.name === 'service'));
    summary.textContent = total;
    form.querySelector('[data-track]').textContent = track;
    form.querySelector('[data-guidance]').textContent = hints.join(' ');
    const fields = selected.map((input, i) => steps[i].querySelector('legend').textContent + ' ' + input.labels[0].textContent.trim());
    brief = [t('Хочу обсудить проект с Devlarion.', 'I’d like to discuss a project with Devlarion.'),
      ...fields, total, track, ...hints].join('\n');
    const telegram = new URL(form.dataset.telegram);
    telegram.searchParams.set('text', brief);
    const contact = form.querySelector('[data-brief]');
    contact.href = telegram.href;
    contact.textContent = company ? t('Договориться о встрече', 'Arrange a meeting') : t('Обсудить в Telegram', 'Discuss on Telegram');
    questions.hidden = true;
    result.hidden = false;
    summary.focus();
    goal('quiz_complete');
  }

  form.addEventListener('change', () => {
    if (!started) goal('quiz_start');
    started = true;
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (questions.hidden || !form.reportValidity()) return;
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
      copyStatus.textContent = t('Бриф скопирован.', 'Brief copied.');
    } catch {
      copyStatus.textContent = brief;
      const range = document.createRange();
      range.selectNodeContents(copyStatus);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
  showStep(0, false);
  form.hidden = false;
})();
