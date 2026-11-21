(() => {
  const control = document.querySelector('[data-region-control]');
  if (!control) return;

  const ru = document.documentElement.lang === 'ru';
  const t = (rus, eng) => ru ? rus : eng;
  const locale = t('ru-RU', 'en-US');
  const details = control.querySelector('details');
  const summary = details.querySelector('summary');
  const radios = [...control.querySelectorAll('input[name=region]')];
  const picker = control.querySelector('[data-currency-picker]');
  const quickChoices = new Set(radios.map(input => input.value));
  const search = picker.querySelector('[data-currency-search]');
  const list = picker.querySelector('[data-currency-list]');
  const empty = picker.querySelector('[data-currency-empty]');
  const feedback = control.querySelector('[data-currency-status]');
  const label = control.querySelector('[data-region-label]');
  const priceNodes = document.querySelectorAll('[data-region-price]');
  const notes = document.querySelectorAll('[data-region-note]');
  const preferenceKey = t('devlarion-region', 'devlarion-currency-en');
  const parameters = new URLSearchParams(location.search);
  const aliases = { ru: 'RUB', by: 'BYN', kz: 'KZT', other: 'other' };
  const codeOf = value => {
    if (!value) return null;
    const key = value.toLowerCase();
    return Object.hasOwn(aliases, key) ? aliases[key] : key.toUpperCase();
  };
  const requested = codeOf(parameters.get('currency') || parameters.get('region'));
  const fallback = t('RUB', 'USD');
  const bank = t('Банк России', 'Bank of Russia');
  const market = 'Frankfurter';
  const { rateDate, bynRate, kztRate, usdRate, eurRate, ratesUrl } = control.dataset;
  const rates = new Map([
    ['RUB', { rate: 1, date: null, source: null }],
    ...Object.entries({ BYN: bynRate, KZT: kztRate, USD: usdRate, EUR: eurRate })
      .map(([code, rate]) => [code, { rate: Number(rate), date: rateDate, source: bank }]),
  ]);
  const countries = { US: 'USD', BY: 'BYN', KZ: 'KZT' };
  const european = new Set('AD AT BE BG HR CY DE EE ES FI FR GR IE IT LT LU LV MC ME MT NL PT SI SK SM VA XK 150'.split(' '));
  const formatterOptions = { style: 'currency', minimumFractionDigits: 0, maximumFractionDigits: 0 };
  const formatter = new Intl.DateTimeFormat(t('ru-RU', 'en-GB'), {
    timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric',
  });
  let displayNames, saved, territory, selected;
  let modifiedByVisitor = false;
  try { displayNames = new Intl.DisplayNames([locale], { type: 'currency' }); } catch {}
  try { saved = codeOf(localStorage.getItem(preferenceKey)); } catch {}
  try { territory = new Intl.Locale(navigator.language).maximize().region; } catch {}

  function defaultCurrency() {
    if (ru) {
      const local = countries[territory];
      return local === 'BYN' || local === 'KZT' ? local : fallback;
    }
    if (european.has(territory)) return 'EUR';
    const regional = countries[territory];
    return regional !== 'RUB' && rates.has(regional) ? regional : fallback;
  }

  function preferred() {
    return [requested, saved].find(code => code === 'other' || rates.has(code)) ?? defaultCurrency();
  }

  function show(code) {
    const requestOnly = code === 'other';
    const currency = requestOnly ? 'RUB' : code;
    const rateData = rates.get(currency);
    const { rate, date, source } = rateData;
    const converted = currency !== 'RUB';
    const format = new Intl.NumberFormat(locale, { ...formatterOptions, currency });
    const stamp = date && formatter.format(new Date(date));
    const rateNote = requestOnly
      ? t('Подготовим смету по запросу.', 'We’ll prepare an estimate on request.')
      : converted ? t('Ориентир на ', 'Approximate as of ') + stamp + ' · ' + source : '';

    selected = code;
    window.devlarionRegion = { code: code.toLowerCase(), currency, rate, date, source };
    label.textContent = requestOnly ? t('По запросу', 'On request') : currency;
    radios.forEach(input => { input.checked = !requestOnly && input.value === currency; });
    priceNodes.forEach(node => {
      node.textContent = (converted ? '≈ ' : '') + format.format(Number(node.dataset.regionPrice) * rate);
      const row = node.closest('[data-region-price-row]');
      if (row) row.hidden = requestOnly;
    });
    notes.forEach(note => {
      note.hidden = !rateNote;
      note.textContent = rateNote;
    });
    feedback.textContent = rateNote;
    document.dispatchEvent(new Event('devlarion:regionchange'));
  }

  function renderList() {
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase(locale);
    const query = normalize(search.value.trim());
    const rows = [];
    for (const code of Array.from(rates.keys()).sort()) {
      if (!query && quickChoices.has(code)) continue;
      const name = displayNames?.of(code) ?? code;
      if (!normalize(code + ' ' + name).includes(query)) continue;
      const row = document.createElement('li');
      const option = document.createElement('button');
      option.type = 'button';
      option.dataset.currency = code;
      option.tabIndex = rows.length ? -1 : 0;
      option.setAttribute('aria-pressed', String(code === selected));
      const currencyCode = document.createElement('strong');
      currencyCode.textContent = code;
      option.append(currencyCode);
      if (name !== code) {
        const currencyName = document.createElement('span');
        currencyName.textContent = name;
        option.append(currencyName);
      }
      row.append(option);
      rows.push(row);
    }
    list.replaceChildren(...rows);
    list.scrollTop = 0;
    list.hidden = !rows.length;
    empty.hidden = !!rows.length;
  }

  function choose(code) {
    if (!rates.has(code)) return;
    modifiedByVisitor = true;
    try { localStorage.setItem(preferenceKey, code); } catch {}
    const url = new URL(location.href);
    if (url.searchParams.has('currency') || url.searchParams.has('region')) {
      url.searchParams.delete('region');
      url.searchParams.set('currency', code);
      history.replaceState(history.state, '', url);
    }
    show(code);
    search.value = '';
    details.open = false;
    summary.focus();
  }

  show(preferred());
  control.hidden = false;
  radios.forEach(input => input.addEventListener('change', () => choose(input.value)));
  details.addEventListener('toggle', () => {
    if (details.open && !picker.hidden) renderList();
  });
  search.addEventListener('input', renderList);
  search.addEventListener('keydown', event => {
    const first = list.querySelector('button');
    if (!first) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      first.focus();
    }
    if (event.key === 'Enter') {
      const exact = Array.from(list.querySelectorAll('button'))
        .find(option => option.dataset.currency === search.value.trim().toUpperCase());
      if (exact || list.childElementCount === 1) choose((exact || first).dataset.currency);
    }
  });
  list.addEventListener('click', event => {
    const option = event.target.closest('button[data-currency]');
    if (option) choose(option.dataset.currency);
  });
  list.addEventListener('focusin', event => {
    const active = event.target;
    if (active.matches('button')) {
      list.querySelector('button[tabindex="0"]')?.setAttribute('tabindex', '-1');
      active.tabIndex = 0;
    }
  });
  list.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const row = event.target.closest('li');
    const next = {
      ArrowDown: row?.nextElementSibling,
      ArrowUp: row?.previousElementSibling,
      Home: list.firstElementChild,
      End: list.lastElementChild,
    }[event.key];
    event.preventDefault();
    if (event.key === 'ArrowUp' && !next) search.focus();
    else next?.querySelector('button').focus();
  });
  document.addEventListener('pointerdown', event => {
    if (!control.contains(event.target)) details.open = false;
  });
  details.addEventListener('keydown', event => {
    if (event.key === 'Escape' && details.open) {
      details.open = false;
      summary.focus();
    }
  });

  function updateRates(rows) {
    for (const { quote, date, rate } of rows) {
      const current = rates.get(quote);
      if (quote === 'RUB' || !current || !Number.isFinite(rate) || rate <= 0
        || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date < current.date) continue;
      rates.set(quote, { rate, date, source: market });
    }
  }

  async function refreshIfStale(reference) {
    const oneDay = 24 * 60 * 60 * 1000;
    if (!reference || Date.now() - Date.parse(reference) < 2 * oneDay) return;
    const key = 'devlarion-fx-refresh';
    try {
      const savedRates = JSON.parse(sessionStorage.getItem(key) || 'null');
      if (savedRates && Date.now() - savedRates.at < oneDay) {
        updateRates(savedRates.rows);
        show(selected);
        return;
      }
    } catch {}
    try {
      const response = await fetch('https://api.frankfurter.dev/v2/rates?base=RUB', {
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      });
      if (!response.ok) return;
      const rows = (await response.json()).filter(row => rates.has(row.quote));
      updateRates(rows);
      show(selected);
      try { sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), rows })); } catch {}
    } catch {
      // A dated snapshot still covers every published currency.
    }
  }

  fetch(ratesUrl, { credentials: 'same-origin' })
    .then(response => {
      if (!response.ok) throw new Error('Exchange snapshot unavailable');
      return response.json();
    })
    .then(snapshot => {
      for (const [code, item] of Object.entries(snapshot.rates)) {
        if (/^[A-Z]{3}$/.test(code) && code !== 'RUB' && Number.isFinite(item.rate)
          && item.rate > 0 && /^\d{4}-\d{2}-\d{2}$/.test(item.date)
          && item.date >= (rates.get(code)?.date ?? '')) {
          rates.set(code, { rate: item.rate, date: item.date, source: market });
        }
      }
      Object.assign(countries, snapshot.territories);
      show(modifiedByVisitor ? selected : preferred());
      picker.hidden = false;
      if (details.open) renderList();
      refreshIfStale(snapshot.asOf);
    })
    .catch(() => {
      // Prices and the five quick options remain available if the snapshot cannot load.
      picker.hidden = false;
      if (details.open) renderList();
    });
})();
