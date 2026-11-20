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

  // Round each displayed component before adding it so the breakdown reconciles in either currency.
  function rounded(rubles) {
    return ru ? Math.round(rubles / 1000) * 1000 : Math.round(rubles / Number(form.dataset.usdRate) / 100) * 100;
  }
  function money(amount) {
    return ru ? amount.toLocaleString('ru-RU') + ' ₽' : '$' + amount.toLocaleString('en-US');
  }

  function estimate(answers, service) {
    const company = ['company', 'public'].includes(answers.client);
    const track = company
      ? t('Для компаний · обсуждение требований и предпроектный анализ', 'For organisations · requirements review and discovery')
      : t('Для частных проектов и бизнеса · согласование состава работ', 'For individuals and businesses · agree the deliverables');
    const costRows = [];
    const hints = [];
    const developmentLabel = t('Разработка', 'Development');
    const analysisLabel = t('Аналитика и документы', 'Analysis and documentation');
    const reserveLabel = t('Резерв на уточнение задачи', 'Scope contingency');
    const compact = ['web', 'mini', 'automation'].includes(answers.service)
      && answers.scope === 'one' && answers.integrations === 'none' && answers.documents === 'standard';
    let total;

    if (compact || !service.dataset.price) {
      total = compact ? t('Компактный проект · цена по брифу', 'Small project · quote after briefing')
        : t('Индивидуальная оценка', 'Tailored estimate');
      if (answers.service === 'support') {
        hints.push(t('Опишите, что уже запущено и какие работы нужны. Для ранее сданного нами проекта два месяца исправления дефектов включены в стоимость.', 'Tell us what is running and where you need help. Projects we delivered include two months of defect fixes.'));
      } else {
        hints.push(t('На первом обсуждении уточним результат и срок. В смете отдельно покажем разработку, подготовку документов и резерв.', 'We will clarify the deliverables and timeline, then itemise development, documentation and contingency in the quote.'));
      }
    } else {
      const scopeIndex = ['one', 'several', 'departments'].indexOf(answers.scope);
      const scale = (answers.service === 'agents' ? [1, 2.5, 6] : [1, 1.55, 2.6])[scopeIndex];
      const integrationFactor = {none: 1, single: 1.15, systems: 1.35}[answers.integrations];
      const rawDevelopment = Number(service.dataset.price) * scale * integrationFactor;
      const overhead = {standard: 0, spec: .1, compliance: .2}[answers.documents];
      const rawAnalysis = rawDevelopment * overhead;
      const dev = rounded(rawDevelopment);
      const analysis = rounded(rawAnalysis);
      const reserve = rounded((rawDevelopment + rawAnalysis) * [.35, .55, .8][scopeIndex]);
      total = money(dev + analysis) + ' – ' + money(dev + analysis + reserve);
      costRows.push([developmentLabel, money(dev)], [analysisLabel, analysis ? money(analysis) : t('Включено', 'Included')],
        [reserveLabel, t('До ', 'Up to ') + money(reserve)]);
      if (service.dataset.days) {
        const [from, to] = service.dataset.days.split(',').map(Number);
        const timeFactor = [1, 1.65, 2.8][scopeIndex] * integrationFactor * (1 + overhead);
        const maximum = Math.ceil(to * timeFactor);
        hints.push(t('Ориентир по сроку: ', 'Estimated timeline: ') + Math.ceil(from * timeFactor) + '–' + maximum + t(' дн.', ' days.'));
        if ((answers.timeline === 'month' && maximum > 30) || (answers.timeline === 'quarter' && maximum > 90))
          hints.push(t('Чтобы уложиться в выбранный срок, обсудим состав первого релиза.', 'We will review the first release scope against your target date.'));
      } else {
        hints.push(t('Срок зависит от функций и платформы.', 'Timing depends on the features and platform.'));
      }
      hints.push(t('Расчёт предварительный. Итоговую сумму и срок согласуем по составу работ.', 'This is a planning range. We will confirm the price and timeline against the agreed scope.'));
      if (!ru) hints.push('USD figures use ₽81.929 per dollar, rounded to $100.');
    }
    if (company) hints.push(t('Объём и стоимость предпроекта согласуем отдельно.', 'Discovery scope and fees are agreed separately.'));
    if (answers.service === 'private-ai') hints.push(t('Оборудование и эксплуатацию оцениваем отдельно.', 'Hardware and operating costs are quoted separately.'));
    if (answers.support === 'request') hints.push(t('Доработки после запуска оцениваем по задаче.', 'Post-launch changes are quoted individually.'));
    if (answers.support === 'sla') hints.push(t('Поддержку с гарантированным временем реакции рассчитываем отдельно.', 'Support with a guaranteed response time is quoted separately.'));
    return {total, track, costRows, hints, company};
  }

  function showResult() {
    const selected = steps.map(step => step.querySelector('input:checked'));
    const answers = Object.fromEntries(selected.map(input => [input.name, input.value]));
    const {total, track, costRows, hints, company} = estimate(answers, selected.find(input => input.name === 'service'));
    summary.textContent = total;
    form.querySelector('[data-track]').textContent = track;
    const costs = form.querySelector('[data-costs]');
    costs.replaceChildren();
    for (const [label, value] of costRows) {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const amount = document.createElement('dd');
      term.textContent = label;
      amount.textContent = value;
      row.append(term, amount);
      costs.append(row);
    }
    costs.hidden = costRows.length === 0;
    form.querySelector('[data-guidance]').textContent = hints.join(' ');
    const fields = selected.map((input, i) => steps[i].querySelector('legend').textContent + ' ' + input.labels[0].textContent.trim());
    brief = [t('Хочу обсудить проект с Devlarion.', 'I’d like to discuss a project with Devlarion.'),
      ...fields, track, total, ...costRows.map(row => row.join(' — ')), ...hints].join('\n');
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
