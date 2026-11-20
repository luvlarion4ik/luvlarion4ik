(() => {
  const form = document.querySelector('[data-estimate]');
  if (!form) return;
  form.hidden = false;
  const ru = form.dataset.lang === 'ru';
  const t = (russian, english) => ru ? russian : english;
  const result = form.querySelector('[data-result]');
  const summary = form.querySelector('[data-summary]');
  const guidance = form.querySelector('[data-guidance]');
  const copyStatus = form.querySelector('[data-copy-status]');
  let brief = '';
  let started = false;
  const goal = name => document.dispatchEvent(new CustomEvent('bureau-goal', {detail: name}));

  function money(rubles) {
    if (ru) return rubles.toLocaleString('ru-RU') + ' ₽';
    return '$' + (Math.round(rubles / Number(form.dataset.usdRate) / 100) * 100).toLocaleString('en-US');
  }

  form.addEventListener('change', () => {
    if (!started) {
      goal('quiz_start');
      started = true;
    }
    result.hidden = true;
    brief = '';
    copyStatus.textContent = '';
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const {service, scope, timeline, budget} = form.elements;
    const selected = service.selectedOptions[0];
    const hints = [];
    let estimate;
    if (service.value === 'support') {
      estimate = t('Два месяца исправлений включены в стоимость сданного проекта.', 'Two months of fixes are included with delivery.');
      hints.push(t('Стоимость новых функций и дальнейшего сопровождения согласуем по перечню задач.', 'We price new features and ongoing support after reviewing the task list.'));
    } else if (service.value === 'custom') {
      estimate = t('Индивидуальная смета после разбора задачи.', 'A tailored estimate after a review of your brief.');
      hints.push(t('Пришлите описание процесса, необходимые интеграции и ограничения. На встрече согласуем бюджет и этапы.', 'Share the workflow, integrations and constraints. We will agree on a budget and milestones together.'));
    } else {
      // Scale the implementation by scope. Budget and desired date qualify the enquiry
      // without inflating the engineering price or promising an accelerated launch.
      const scale = Number(scope.value);
      const costFactors = service.value === 'agents' ? [1, 2.5, 6] : [1, 1.55, 2.6];
      const basePrice = Number(selected.dataset.price) * costFactors[scale];
      const low = Math.round(basePrice / 10000) * 10000;
      const high = Math.ceil(basePrice * [1.35, 1.55, 1.8][scale] / 10000) * 10000;
      const days = selected.dataset.days.split(',').map(Number);
      const timeFactor = [1, 1.65, 2.8][scale];
      let timing = t('Срок согласуем после выбора платформ и функций.', 'Timeline agreed after reviewing platforms and features.');
      if (days[0]) {
        const minDays = Math.ceil(days[0] * timeFactor);
        const maxDays = Math.ceil(days[1] * timeFactor);
        timing = minDays + '–' + maxDays + t(' дн.', ' days');
        const desiredDays = [Infinity, 30, 90][Number(timeline.value)];
        if (desiredDays < maxDays) hints.push(t('Для запуска в желаемый срок обсудим состав первого этапа.', 'We will review the first milestone to fit your target date.'));
      }
      estimate = money(low) + ' – ' + money(high) + ' · ' + timing;
      if (service.value === 'private-ai') hints.push(t('Оборудование и эксплуатация рассчитываются отдельно.', 'Hardware and operating costs are priced separately.'));
      const budgetCap = [Infinity, 300000, 600000, 1500000, Infinity][Number(budget.value)];
      if (low > budgetCap) hints.push(t('Оценка выше выбранного бюджета. Предложим более узкий первый этап.', 'The estimate exceeds your budget. We can scope a smaller first milestone.'));
      hints.push(t('Уточним объём и зафиксируем смету в договоре.', 'We confirm the scope and price in the contract.'));
      if (!ru) hints.push('USD estimates use ₽81.929 per dollar, rounded to $100 (20 Nov 2026).');
    }
    summary.textContent = estimate;
    guidance.textContent = hints.join(' ');
    const lines = [service, scope, timeline, budget].map(field =>
      field.labels[0].querySelector('span').textContent + ' ' + field.selectedOptions[0].textContent);
    brief = [t('Хочу обсудить проект с DevLarion.', 'I’d like to discuss a project with DevLarion.'), ...lines, estimate, ...hints].join('\n');
    const destination = new URL(form.dataset.telegram);
    destination.searchParams.set('text', brief);
    form.querySelector('[data-brief]').href = destination.href;
    result.hidden = false;
    summary.focus();
    goal('quiz_complete');
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
})();
