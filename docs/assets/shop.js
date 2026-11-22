// Магазин услуг Devlarion: фильтры, корзина в localStorage, заявка в Telegram.
(() => {
  const shop = document.querySelector('[data-shop]');
  if (!shop) return;
  const t = JSON.parse(shop.dataset.labels);
  const tg = shop.dataset.tg;
  const key = 'devlarion-cart';
  const items = [...shop.querySelectorAll('.shop-item')];
  const byId = Object.fromEntries(items.map(el => [el.dataset.id, el]));
  const fab = document.querySelector('[data-shop-open]');
  const count = document.querySelector('[data-shop-count]');
  const cart = document.querySelector('#shop-cart');
  const list = document.querySelector('[data-shop-list]');
  const total = document.querySelector('[data-shop-total]');
  const send = document.querySelector('[data-shop-send]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = rub => new Intl.NumberFormat(t.lang === 'ru' ? 'ru-RU' : 'en-GB', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(rub);
  let state = [];
  try { state = JSON.parse(localStorage.getItem(key) || '[]').filter(id => byId[id]); } catch {}

  function save() { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }

  function render() {
    count.textContent = state.length;
    fab.toggleAttribute('data-has', state.length > 0);
    for (const el of items) {
      const on = state.includes(el.dataset.id);
      el.toggleAttribute('data-in-cart', on);
      el.querySelector('[data-add]').setAttribute('aria-pressed', String(on));
    }
    list.replaceChildren(...state.map(id => {
      const el = byId[id];
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = el.dataset.title;
      const price = document.createElement('small');
      price.textContent = el.dataset.rub ? (t.lang === 'ru' ? 'от ' : 'from ') + fmt(+el.dataset.rub) : (t.lang === 'ru' ? 'по запросу' : 'on request');
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'shop-remove';
      rm.setAttribute('aria-label', t.remove + ': ' + el.dataset.title);
      rm.textContent = '×';
      rm.addEventListener('click', () => toggle(id));
      li.append(name, price, rm);
      return li;
    }));
    if (!state.length) {
      const li = document.createElement('li');
      li.className = 'shop-empty';
      li.textContent = t.empty;
      list.append(li);
    }
    const sum = state.reduce((n, id) => n + (+byId[id].dataset.rub || 0), 0);
    const onRequest = state.some(id => !byId[id].dataset.rub);
    total.textContent = state.length ? t.total + ' ' + fmt(sum) + (onRequest ? ' · ' + t.onRequest : '') : '';
    const text = t.greeting + '\n' + state.map(id => '• ' + byId[id].dataset.title).join('\n');
    send.href = tg + (tg.includes('?') ? '&' : '?') + 'text=' + encodeURIComponent(text);
    send.toggleAttribute('aria-disabled', !state.length);
  }

  function fly(from) {
    if (reduced || !from) return;
    const a = from.getBoundingClientRect(), b = fab.getBoundingClientRect();
    const dot = document.createElement('i');
    dot.className = 'shop-fly';
    dot.style.left = a.left + a.width / 2 + 'px';
    dot.style.top = a.top + a.height / 2 + 'px';
    document.body.append(dot);
    dot.animate([
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${b.left + b.width / 2 - a.left - a.width / 2}px), calc(-50% + ${b.top + b.height / 2 - a.top - a.height / 2}px)) scale(.4)`, opacity: .6 },
    ], { duration: 650, easing: 'cubic-bezier(.5,-0.3,.4,1)' }).onfinish = () => { dot.remove(); fab.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 320 }); };
  }

  function toggle(id, source) {
    const i = state.indexOf(id);
    if (i >= 0) state.splice(i, 1); else { state.push(id); fly(source); }
    save(); render();
  }

  shop.addEventListener('click', event => {
    const add = event.target.closest('[data-add]');
    if (add) toggle(add.dataset.add, add);
    const filter = event.target.closest('[data-filter]');
    if (filter) {
      for (const b of shop.querySelectorAll('[data-filter]')) b.setAttribute('aria-pressed', String(b === filter));
      for (const el of items) el.hidden = filter.dataset.filter !== 'all' && el.dataset.cat !== filter.dataset.filter;
    }
  });

  function open(state) {
    cart.hidden = !state;
    fab.setAttribute('aria-expanded', String(state));
    if (state) cart.querySelector('[data-shop-close]').focus();
  }
  fab.addEventListener('click', () => open(cart.hidden));
  document.querySelector('[data-shop-close]').addEventListener('click', () => { open(false); fab.focus(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !cart.hidden) { open(false); fab.focus(); } });
  send.addEventListener('click', e => { if (!state.length) e.preventDefault(); });
  render();
})();
