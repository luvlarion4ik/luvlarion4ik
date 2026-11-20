(() => {
  const control = document.querySelector('[data-region-control]');
  if (control) {
    const ru = document.documentElement.lang === 'ru';
    const locale = ru ? 'ru-RU' : 'en-US';
    const { rateDate, bynRate, kztRate, usdRate, eurRate } = control.dataset;
    const currencies = {
      usd: { currency: 'USD', rate: Number(usdRate), label: 'USD · $' },
      eur: { currency: 'EUR', rate: Number(eurRate), label: 'EUR · €' },
    };
    const regions = ru ? {
      ru: { currency: 'RUB', rate: 1, label: 'RU · ₽' },
      by: { currency: 'BYN', rate: Number(bynRate), label: 'BY · BYN' },
      kz: { currency: 'KZT', rate: Number(kztRate), label: 'KZ · KZT' },
      ...currencies,
      other: { currency: 'RUB', rate: 1, label: 'Другой' },
    } : currencies;
    const key = ru ? 'devlarion-region' : 'devlarion-currency-en';
    const parameter = ru ? 'region' : 'currency';
    const parameters = new URLSearchParams(location.search);
    const options = Array.from(control.querySelectorAll('input[name=region]'));
    const prices = [...document.querySelectorAll('[data-region-price]')]
      .map(node => ({ node, rubles: Number(node.dataset.regionPrice) }));
    const notes = document.querySelectorAll('[data-region-note]');
    const date = new Intl.DateTimeFormat(ru ? 'ru-RU' : 'en-GB', {
      timeZone: 'UTC', day: 'numeric', month: ru ? 'numeric' : 'short', year: 'numeric',
    }).format(new Date(rateDate));
    const regionParam = parameters.get(parameter)?.toLowerCase();
    let saved;
    try { saved = localStorage.getItem(key); } catch {}

    function browserDefault() {
      let region;
      try { region = new Intl.Locale(navigator.language).maximize().region; } catch {}
      if (ru) return ({ BY: 'by', KZ: 'kz' })[region] ?? 'ru';
      const europe = ('AD AL AT BA BE BG CH CY CZ DE DK EE ES FI FR GB GR HR HU IE IS IT LI LT LU LV '
        + 'MC MD ME MK MT NL NO PL PT RO RS SE SI SK SM TR UA VA XK 150').split(' ');
      return europe.includes(region) ? 'eur' : 'usd';
    }

    function selectRegion(code) {
      const { currency, rate, label } = regions[code];
      const converted = currency !== 'RUB';
      const format = new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 });
      window.devlarionRegion = { code, currency, rate, date: rateDate };
      control.querySelector('[data-region-label]').textContent = label;
      options.forEach(option => { option.checked = option.value === code; });
      prices.forEach(({ node, rubles }) => {
        node.textContent = (converted ? '≈ ' : '') + format.format(rubles * rate);
        const priceLine = node.closest('[data-region-price-row]');
        if (priceLine) priceLine.hidden = code === 'other';
      });
      notes.forEach(note => {
        note.hidden = code === 'ru';
        if (ru) {
          note.textContent = code === 'other'
            ? 'Для вашего региона подготовим смету по запросу.'
            : 'Ориентир по курсу Банка России на ' + date + '. Валюту счёта согласуем в договоре.';
        } else {
          note.textContent = 'Approximate prices at the Bank of Russia rate on ' + date
            + '. We agree on the billing currency in the contract.';
        }
      });
      document.dispatchEvent(new Event('devlarion:regionchange'));
    }

    const preferences = parameters.get('calculated') === '1' ? [regionParam, saved] : [saved, regionParam];
    const initial = preferences.find(code => Object.hasOwn(regions, code)) ?? browserDefault();
    selectRegion(initial);
    control.hidden = false;
    const details = control.querySelector('details');
    control.addEventListener('change', event => {
      if (!options.includes(event.target)) return;
      const code = event.target.value;
      try { localStorage.setItem(key, code); } catch {}
      if (parameters.has(parameter)) {
        const url = new URL(location.href);
        url.searchParams.set(parameter, code);
        history.replaceState(history.state, '', url);
      }
      selectRegion(code);
      details.open = false;
      details.querySelector('summary').focus();
    });
    document.addEventListener('click', event => {
      if (!control.contains(event.target)) details.open = false;
    });
    details.addEventListener('keydown', event => {
      if (event.key === 'Escape' && details.open) {
        details.open = false;
        details.querySelector('summary').focus();
      }
    });
  }

  const hero = document.querySelector('.hero');
  const mobileBar = document.querySelector('.mobilebar');
  if (hero && mobileBar && 'IntersectionObserver' in window) {
    const headerHeight = document.querySelector('header').offsetHeight;
    const observer = new IntersectionObserver(([entry]) => {
      mobileBar.classList.toggle('is-visible', entry.boundingClientRect.bottom <= headerHeight);
    }, { rootMargin: '-' + headerHeight + 'px 0px 0px' });
    observer.observe(hero);
  }

  const filter = document.querySelector('[data-case-filter]');
  if (filter) {
    const articles = [...document.querySelectorAll('[data-case-people]')];
    const groups = [...document.querySelectorAll('[data-case-group]')];
    const options = Array.from(filter.querySelectorAll('input'));
    const update = () => {
      const { hash } = location;
      const id = hash.startsWith('#people=') ? hash.slice('#people='.length) : '';
      const selected = options.find(option => option.value === id) ?? options[0];
      selected.checked = true;
      articles.forEach(article => {
        article.hidden = selected.value !== '' && !article.dataset.casePeople.split(' ').includes(selected.value);
      });
      groups.forEach(group => { group.hidden = !group.querySelector('article:not([hidden])'); });
    };
    filter.hidden = false;
    filter.addEventListener('change', event => {
      if (!options.includes(event.target)) return;
      const id = event.target.value;
      history.replaceState(history.state, '', id ? '#people=' + id : '#work');
      update();
    });
    addEventListener('hashchange', update);
    update();
  }

  const share = document.getElementById('share-options');
  if (!share) return;

  let sharedUrl;
  let trigger;
  const field = share.querySelector('[data-share-field]');
  const fieldLabel = field.closest('label');
  const confirmation = share.querySelector('[data-share-status]');
  const showManual = () => {
    fieldLabel.hidden = false;
    field.focus();
    field.select();
  };

  function showShareOptions() {
    const encoded = encodeURIComponent(sharedUrl.href);
    share.querySelector('[data-share-telegram]').href = 'https://t.me/share/url?url=' + encoded;
    share.querySelector('[data-share-vk]').href = 'https://vk.com/share.php?url=' + encoded;
    share.querySelector('[data-share-email]').href = 'mailto:?body=' + encoded;
    field.value = sharedUrl.href;
    fieldLabel.hidden = true;
    confirmation.textContent = '';
    share.showModal();
  }

  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-share]');
    if (!button) return;

    trigger = button;
    const customUrl = button.dataset.shareUrl;
    sharedUrl = customUrl ? new URL(customUrl, location.href) : new URL(location.pathname, location.origin);
    if (sharedUrl.origin !== location.origin) return;
    if (!customUrl) {
      sharedUrl.hash = button.dataset.shareAnchor || '';
      sharedUrl.searchParams.set('utm_source', 'share');
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: sharedUrl.href });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    showShareOptions();
  });

  share.querySelector('[data-share-copy]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(sharedUrl.href);
      confirmation.textContent = document.documentElement.lang === 'ru' ? 'Ссылка скопирована.' : 'Link copied.';
    } catch {
      showManual();
    }
  });
  share.addEventListener('close', () => {
    if (trigger?.closest('dialog:not([open])')) document.querySelector('[data-menu]').focus();
    else trigger?.focus();
  });
})();
