// Магазин Devlarion: фильтры, поиск, сортировка, корзина с количеством (localStorage), заявка в Telegram.
(() => {
  const shop = document.querySelector('[data-shop]');
  if (!shop) return;
  const t = JSON.parse(shop.dataset.labels);
  const tg = shop.dataset.tg;
  const key = 'devlarion-cart-v2';
  const items = [...shop.querySelectorAll('.shop-item')];
  const byId = Object.fromEntries(items.map(el => [el.dataset.id, el]));
  const grids = [...shop.querySelectorAll('[data-grid]')];
  const original = new Map(grids.map(g => [g, [...g.children]]));
  const $ = s => document.querySelector(s);
  const fab = $('[data-shop-open]'), count = $('[data-shop-count]'), cart = $('#shop-cart'), scrim = $('[data-shop-scrim]');
  const list = $('[data-shop-list]'), total = $('[data-shop-total]'), send = $('[data-shop-send]'), none = shop.querySelector('[data-none]');
  const search = shop.querySelector('[data-search]'), sort = shop.querySelector('[data-sort]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const locale = t.lang === 'ru' ? 'ru-RU' : 'en-GB';
  const fmt = rub => new Intl.NumberFormat(locale, { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(rub);
  let filter = 'all';
  let state = {};
  try { state = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}
  for (const id of Object.keys(state)) if (!byId[id] || !(state[id] > 0)) delete state[id];

  const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} };
  const qty = () => Object.values(state).reduce((a, b) => a + b, 0);
  const unitText = u => u === 'hour' ? ' ' + t.hour : u === 'month' ? ' ' + t.month : '';

  function render() {
    const n = qty();
    count.textContent = n;
    fab.toggleAttribute('data-has', n > 0);
    for (const el of items) {
      const q = state[el.dataset.id] || 0;
      el.toggleAttribute('data-in-cart', q > 0);
      el.querySelector('[data-qty]').hidden = !q;
      el.querySelector('[data-count]').textContent = q;
      el.querySelector('[data-add]').hidden = q > 0;
    }
    const ids = Object.keys(state);
    list.replaceChildren(...ids.map(id => {
      const el = byId[id], q = state[id], rub = +el.dataset.rub || 0;
      const li = document.createElement('li');
      const name = document.createElement('strong'); name.textContent = el.dataset.title;
      const price = document.createElement('small');
      price.textContent = rub ? t.from + ' ' + fmt(rub * q) + unitText(el.dataset.unit) + (q > 1 ? ' · ' + q + ' × ' + fmt(rub) : '') : t.request;
      const ctrl = document.createElement('div'); ctrl.className = 'shop-line-qty';
      const mk = (txt, label, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.setAttribute('aria-label', label + ': ' + el.dataset.title); b.addEventListener('click', fn); return b; };
      const out = document.createElement('output'); out.textContent = q;
      ctrl.append(mk('−', '−1', () => change(id, -1)), out, mk('+', '+1', () => change(id, 1)), mk('×', t.remove, () => change(id, -q)));
      li.append(name, price, ctrl);
      return li;
    }));
    if (!ids.length) { const li = document.createElement('li'); li.className = 'shop-empty'; li.textContent = t.empty; list.append(li); }
    const sums = { once: 0, month: 0, hour: 0 };
    let request = false;
    for (const id of ids) { const el = byId[id], rub = +el.dataset.rub; if (!rub) { request = true; continue; } sums[el.dataset.unit === 'hour' ? 'hour' : el.dataset.unit === 'month' ? 'month' : 'once'] += rub * state[id]; }
    total.replaceChildren(...[[t.total, sums.once, ''], [t.monthly, sums.month, ' ' + t.month], [t.hourly, sums.hour, ' ' + t.hour]].filter(([, v]) => v).map(([label, v, u]) => { const p = document.createElement('p'); p.innerHTML = '<span></span><b></b>'; p.firstChild.textContent = label; p.lastChild.textContent = fmt(v) + u; return p; }));
    if (request) { const p = document.createElement('p'); p.className = 'shop-total-note'; p.textContent = t.onRequest; total.append(p); }
    const text = t.greeting + '\n' + ids.map(id => '• ' + byId[id].dataset.title + (state[id] > 1 ? ' × ' + state[id] : '')).join('\n');
    send.href = tg + (tg.includes('?') ? '&' : '?') + 'text=' + encodeURIComponent(text);
    send.toggleAttribute('aria-disabled', !ids.length);
  }

  function fly(from) {
    if (reduced || !from) return;
    const a = from.getBoundingClientRect(), b = fab.getBoundingClientRect();
    const dot = document.createElement('i');
    dot.className = 'shop-fly';
    dot.style.left = a.left + a.width / 2 + 'px';
    dot.style.top = a.top + a.height / 2 + 'px';
    document.body.append(dot);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    dot.animate([
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx * .5}px), calc(-50% + ${dy * .5 - 80}px)) scale(.8)`, opacity: 1, offset: .5 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.3)`, opacity: .4 },
    ], { duration: 700, easing: 'cubic-bezier(.45,0,.3,1)' }).onfinish = () => {
      dot.remove();
      fab.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
    };
  }

  function change(id, d, source) {
    const before = state[id] || 0;
    const next = Math.max(0, Math.min(99, before + d));
    if (next) state[id] = next; else delete state[id];
    if (!before && next) fly(source);
    save(); render();
  }

  function apply() {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    for (const el of items) {
      const okCat = filter === 'all' || el.dataset.cat === filter;
      const okText = !q || el.textContent.toLowerCase().includes(q);
      el.hidden = !(okCat && okText);
      if (!el.hidden) shown++;
    }
    for (const g of grids) {
      const kids = original.get(g);
      const sorted = sort.value === 'default' ? kids : [...kids].sort((a, b) => {
        const cmp = el => (+el.dataset.rub || Infinity) * (el.dataset.unit === 'hour' ? 720 : 1);
        const pa = cmp(a), pb = cmp(b);
        return sort.value === 'asc' ? pa - pb : (pb === Infinity ? -1 : pa === Infinity ? 1 : pb - pa);
      });
      g.append(...sorted);
      const any = kids.some(k => !k.hidden);
      g.hidden = !any;
      shop.querySelector(`[data-group="${g.dataset.grid}"]`).hidden = !any;
    }
    none.hidden = shown > 0;
    none.textContent = t.none;
  }

  shop.addEventListener('click', event => {
    const item = event.target.closest('.shop-item');
    if (event.target.closest('[data-add]')) change(item.dataset.id, 1, event.target.closest('[data-add]'));
    else if (event.target.closest('[data-inc]')) change(item.dataset.id, 1);
    else if (event.target.closest('[data-dec]')) change(item.dataset.id, -1);
    const f = event.target.closest('[data-filter]');
    if (f) {
      filter = f.dataset.filter;
      for (const b of shop.querySelectorAll('[data-filter]')) b.setAttribute('aria-pressed', String(b === f));
      apply();
    }
  });
  search.addEventListener('input', apply);
  sort.addEventListener('change', apply);

  let lastFocus = null;
  function open(on) {
    cart.hidden = !on;
    scrim.hidden = !on;
    fab.setAttribute('aria-expanded', String(on));
    document.documentElement.classList.toggle('shop-locked', on);
    if (on) { lastFocus = document.activeElement; cart.querySelector('[data-shop-close]').focus(); }
    else lastFocus?.focus();
  }
  fab.addEventListener('click', () => open(cart.hidden));
  scrim.addEventListener('click', () => open(false));
  $('[data-shop-close]').addEventListener('click', () => open(false));
  $('[data-shop-clear]').addEventListener('click', () => { state = {}; save(); render(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !cart.hidden) open(false); });
  send.addEventListener('click', e => { if (!qty()) e.preventDefault(); });

  // Переход по ссылке #id подсвечивает товар.
  const target = location.hash && byId[decodeURIComponent(location.hash.slice(1))];
  if (target) {
    target.scrollIntoView({ block: 'center' });
    target.classList.add('shop-focus');
    setTimeout(() => target.classList.remove('shop-focus'), 2400);
  }
  render();
  apply();
})();
