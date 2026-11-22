(() => {
  const panel = document.querySelector('[data-payback]');
  if (!panel) return;

  const form = panel.querySelector('form');
  const check = form.querySelector('#payback-check');
  const leads = form.querySelector('#payback-leads');
  const rate = form.querySelector('#payback-rate');
  const currencyLabel = form.querySelector('[data-payback-currency]');
  const leadsLabel = form.querySelector('[data-payback-leads]');
  const rateLabel = form.querySelector('[data-payback-rate]');
  const revenueLabel = form.querySelector('[data-payback-revenue]');
  const monthsLabel = form.querySelector('[data-payback-months]');
  const ru = document.documentElement.lang === 'ru';
  const locale = ru ? 'ru-RU' : 'en-GB';
  const plural = new Intl.PluralRules(locale);
  const monthLabels = ru ? { one: 'месяц', few: 'месяца', many: 'месяцев', other: 'месяца' }
    : { one: 'month', other: 'months' };
  let checkRubles = check.valueAsNumber;
  let region = { currency: 'RUB', rate: 1 };

  function render() {
    leadsLabel.textContent = leads.value;
    rateLabel.textContent = rate.value + '%';

    const pack = form.querySelector('input[name="payback-package"]:checked').value;
    const amount = document.getElementById('package-' + pack).querySelector('[data-region-price]').dataset.regionPrice;
    const revenue = checkRubles * leads.valueAsNumber * (rate.valueAsNumber / 100);
    if (!Number.isFinite(revenue) || revenue <= 0) {
      revenueLabel.textContent = ru ? 'Укажите данные выше' : 'Enter your figures above';
      monthsLabel.textContent = '';
      return;
    }

    const money = new Intl.NumberFormat(locale, {
      style: 'currency', currency: region.currency, maximumFractionDigits: 0,
    });
    const months = Math.ceil(Number(amount) / revenue);
    const duration = Number.isFinite(months)
      ? new Intl.NumberFormat(locale).format(months) + ' ' + monthLabels[plural.select(months)]
      : '';
    revenueLabel.textContent = (ru ? 'Дополнительная выручка: ' : 'Additional revenue: ')
      + money.format(revenue * region.rate) + (ru ? ' в месяц' : ' per month');
    monthsLabel.textContent = duration
      ? (ru ? 'Пакет окупается примерно за ' : 'Estimated payback: ') + duration
      : '';
  }

  function updateCurrency() {
    region = window.devlarionRegion ?? region;
    currencyLabel.textContent = region.currency;
    if (check.value !== '') check.value = Number((checkRubles * region.rate).toPrecision(12));
    render();
  }

  form.addEventListener('input', event => {
    if (event.target === check) checkRubles = Math.max(0, check.valueAsNumber || 0) / region.rate;
    render();
  });
  form.addEventListener('submit', event => event.preventDefault());
  document.addEventListener('devlarion:regionchange', updateCurrency);
  updateCurrency();
  panel.hidden = false;
  if (location.hash === '#payback') panel.scrollIntoView();
})();
