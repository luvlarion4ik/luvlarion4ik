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
  // Позиции с конфигурациями (Mac mini, Mac Studio) лежат в корзине под ключом «id:конфигурация».
  const cfgsOf = el => el._cfgs ??= JSON.parse(el.dataset.configs || 'null');
  const keyOf = el => el.dataset.cfg ? el.dataset.id + ':' + el.dataset.cfg : el.dataset.id;
  function info(line) {
    const [id, k] = line.split(':'), el = byId[id];
    if (!el) return null;
    if (!k) return el.dataset.configs ? null : { title: el.dataset.title, rub: +el.dataset.rub || 0, unit: el.dataset.unit };
    const c = cfgsOf(el)?.find(x => x.k === k);
    return c ? { title: c.title, rub: c.rub, unit: el.dataset.unit } : null;
  }
  try { state = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}
  for (const id of Object.keys(state)) if (!info(id) || !(state[id] > 0)) delete state[id];

  const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} };
  const qty = () => Object.values(state).reduce((a, b) => a + b, 0);
  const unitText = u => u === 'hour' ? ' ' + t.hour : u === 'month' ? ' ' + t.month : '';

  function render() {
    const n = qty();
    count.textContent = n;
    fab.toggleAttribute('data-has', n > 0);
    for (const el of items) {
      const q = state[keyOf(el)] || 0;
      el.toggleAttribute('data-in-cart', q > 0);
      el.querySelector('[data-qty]').hidden = !q;
      el.querySelector('[data-count]').textContent = q;
      el.querySelector('[data-add]').hidden = q > 0;
    }
    const ids = Object.keys(state);
    list.replaceChildren(...ids.map(id => {
      const it = info(id), q = state[id], rub = it.rub;
      const li = document.createElement('li');
      const name = document.createElement('strong'); name.textContent = it.title;
      const price = document.createElement('small');
      price.textContent = rub ? t.from + ' ' + fmt(rub * q) + unitText(it.unit) + (q > 1 ? ' · ' + q + ' × ' + fmt(rub) : '') : t.request;
      const ctrl = document.createElement('div'); ctrl.className = 'shop-line-qty';
      const mk = (txt, label, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.setAttribute('aria-label', label + ': ' + it.title); b.addEventListener('click', fn); return b; };
      const out = document.createElement('output'); out.textContent = q;
      ctrl.append(mk('−', '−1', () => change(id, -1)), out, mk('+', '+1', () => change(id, 1)), mk('×', t.remove, () => change(id, -q)));
      li.append(name, price, ctrl);
      return li;
    }));
    if (!ids.length) { const li = document.createElement('li'); li.className = 'shop-empty'; li.textContent = t.empty; list.append(li); }
    const sums = { once: 0, month: 0, hour: 0 };
    let request = false;
    for (const id of ids) { const it = info(id), rub = it.rub; if (!rub) { request = true; continue; } sums[it.unit === 'hour' ? 'hour' : it.unit === 'month' ? 'month' : 'once'] += rub * state[id]; }
    total.replaceChildren(...[[t.total, sums.once, ''], [t.monthly, sums.month, ' ' + t.month], [t.hourly, sums.hour, ' ' + t.hour]].filter(([, v]) => v).map(([label, v, u]) => { const p = document.createElement('p'); p.innerHTML = '<span></span><b></b>'; p.firstChild.textContent = label; p.lastChild.textContent = fmt(v) + u; return p; }));
    if (request) { const p = document.createElement('p'); p.className = 'shop-total-note'; p.textContent = t.onRequest; total.append(p); }
    const text = t.greeting + '\n' + ids.map(id => '• ' + info(id).title + (state[id] > 1 ? ' × ' + state[id] : '')).join('\n');
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

  function select(el, k) {
    const c = cfgsOf(el).find(x => x.k === k);
    if (!c) return;
    el.dataset.cfg = k; el.dataset.rub = c.rub; el.dataset.title = c.title;
    for (const b of el.querySelectorAll('[data-chip]')) b.setAttribute('aria-pressed', String(b.dataset.chip === c.chip));
    for (const b of el.querySelectorAll('[data-pick-cfg]')) {
      const other = cfgsOf(el).find(x => x.k === b.dataset.pickCfg);
      b.hidden = other.chip !== c.chip;
      b.setAttribute('aria-pressed', String(b.dataset.pickCfg === k));
    }
    const note = el.querySelector('[data-chip-note]');
    if (note) note.textContent = JSON.parse(el.dataset.chips)[c.chip];
    const market = el.querySelector('.shop-market');
    if (market) market.textContent = c.market;
    const span = el.querySelector('.shop-foot [data-region-price]');
    if (span) {
      span.dataset.regionPrice = c.rub;
      const r = window.devlarionRegion;
      span.textContent = r && r.currency && r.rate && r.currency !== 'RUB'
        ? '≈ ' + new Intl.NumberFormat(t.lang === 'ru' ? 'ru-RU' : 'en-US', { style: 'currency', currency: r.currency, maximumFractionDigits: 0 }).format(c.rub * r.rate)
        : fmt(c.rub);
    }
    render();
    if (sort.value !== 'default') apply();
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
    if (event.target.closest('[data-add]')) change(keyOf(item), 1, event.target.closest('[data-add]'));
    else if (event.target.closest('[data-inc]')) change(keyOf(item), 1);
    else if (event.target.closest('[data-dec]')) change(keyOf(item), -1);
    const chip = event.target.closest('[data-chip]'), pickCfg = event.target.closest('[data-pick-cfg]');
    if (chip && item) {
      // Новый чип: оставляем ту же память и SSD, если такая есть, иначе первую конфигурацию чипа.
      const list = cfgsOf(item), now = list.find(c => c.k === item.dataset.cfg);
      const same = list.filter(c => c.chip === chip.dataset.chip);
      const label = c => c.title.slice(c.title.indexOf(' · '));
      select(item, (same.find(c => label(c) === label(now)) || same[0]).k);
    } else if (pickCfg && item) select(item, pickCfg.dataset.pickCfg);
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
  const saveBtn = $('[data-shop-save]'), status = $('[data-shop-status]');
  saveBtn.addEventListener('click', async () => {
    if (!qty()) { status.textContent = t.empty; return; }
    const lines = Object.keys(state).map(id => '• ' + info(id).title + (state[id] > 1 ? ' × ' + state[id] : '')).join('\n');
    saveBtn.disabled = true; status.textContent = '';
    try {
      const r = await fetch('/account/api/requests', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: 'Заказ из магазина', text: 'Состав заказа:\n' + lines }) });
      if (r.status === 401) { status.innerHTML = ''; const a = document.createElement('a'); a.href = '/account/'; a.textContent = t.open; status.append(t.login + ' ', a); return; }
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || '');
      status.textContent = t.saved; state = {}; save(); render();
    } catch (err) { status.textContent = err.message || t.login; } finally { saveBtn.disabled = false; }
  });

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

// Сторителлинг: кадры меняются, пока листаете шаги.
(() => {
  const story = document.querySelector('[data-story]');
  if (!story) return;
  const frames = [...story.querySelectorAll('.story-frame')], steps = [...story.querySelectorAll('.story-step')];
  const num = story.querySelector('[data-story-n]'), stage = story.querySelector('.story-stage');
  function show(i) {
    frames.forEach((f, n) => f.classList.toggle('is-on', n === i));
    steps.forEach((s, n) => s.classList.toggle('is-on', n === i));
    stage.style.setProperty('--p', (i + 1) / steps.length);
    if (num) num.textContent = String(i + 1).padStart(2, '0');
  }
  show(0);
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) show(+e.target.dataset.step);
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => io.observe(s));
})();

// Калькулятор: память модели с учётом квантизации, контекста и пользователей; варианты железа с количеством и ценой.
(() => {
  const box = document.querySelector('[data-gpucalc]');
  if (!box) return;
  const ru = box.dataset.lang === 'ru';
  const f = n => Math.round(n).toLocaleString(ru ? 'ru-RU' : 'en-GB');
  const gb = n => (n < 10 ? n.toFixed(1) : f(n)) + (ru ? ' ГБ' : ' GB');
  // name, memory per unit (GB), price per unit, max units in one system, unit word, kind
  const options = [
    [ru ? 'ИИ-станция RTX 5090' : 'RTX 5090 workstation', 32, 1490000, 1, 'buy'],
    ['DGX Spark', 128, 939000, 2, 'buy'],
    [ru ? 'Станция RTX PRO 6000' : 'RTX PRO 6000 workstation', 96, 3150000, 1, 'buy'],
    [ru ? 'Сервер 4× RTX PRO 6000' : '4× RTX PRO 6000 server', 384, 12300000, 4, 'buy'],
    ['HGX 8× H200', 1128, 68900000, 4, 'buy'],
    [ru ? 'Аренда H100 80 ГБ' : 'Rent H100 80 GB', 80, 640 * 720, 16, 'rent'],
    [ru ? 'Аренда H200 141 ГБ' : 'Rent H200 141 GB', 141, 770 * 720, 16, 'rent'],
  ];
  const form = box.querySelector('form');
  const $ = s => box.querySelector(s);
  function need(p, q, ctx, users) {
    const w = p * q;
    const k = users * (ctx / 8192) * 0.035 * p * Math.min(1, q);
    const o = (w + k) * 0.1;
    return { w, k, o, total: w + k + o };
  }
  function calc() {
    const d = new FormData(form);
    const p = +d.get('m'), q = +d.get('q'), ctx = +d.get('c'), users = +d.get('u');
    const r = need(p, q, ctx, users);
    $('[data-u]').textContent = users;
    $('[data-mem]').textContent = gb(r.total);
    const sum = r.total || 1;
    box.querySelector('[data-bar="w"]').style.flexBasis = (r.w / sum * 100) + '%';
    box.querySelector('[data-bar="k"]').style.flexBasis = (r.k / sum * 100) + '%';
    box.querySelector('[data-bar="o"]').style.flexBasis = (r.o / sum * 100) + '%';
    $('[data-why]').textContent = ru
      ? `Веса: ${gb(r.w)} (${p} млрд × ${q} байт) · кэш контекста: ${gb(r.k)} · запас: ${gb(r.o)}`
      : `Weights: ${gb(r.w)} (${p}B × ${q} bytes) · context cache: ${gb(r.k)} · margin: ${gb(r.o)}`;
    $('[data-matrix]').replaceChildren(...[[2, 'FP16'], [1, 'FP8'], [0.55, '4 bit']].map(([qq, label]) => {
      const el = document.createElement('div');
      el.className = 'calc-cell' + (qq === q ? ' is-on' : '');
      el.innerHTML = '<span></span><b></b>';
      el.firstChild.textContent = label; el.lastChild.textContent = gb(need(p, qq, ctx, users).total);
      return el;
    }));
    let best = null;
    const rows = options.map(([name, mem, price, max, kind]) => {
      const units = Math.ceil(r.total / (mem * 0.9));
      const ok = units <= max;
      const cost = units * price;
      if (ok && kind === 'buy' && (!best || cost < best.cost)) best = { name, cost };
      return { name, mem, units, ok, cost, kind };
    });
    $('[data-options]').replaceChildren(...[{ head: true }, ...rows].map(o => {
      const row = document.createElement('div');
      row.className = 'calc-row' + (o.head ? ' calc-head' : '') + (!o.head && !o.ok ? ' is-no' : '') + (!o.head && best && o.name === best.name ? ' is-best' : '');
      row.setAttribute('role', 'row');
      const cells = o.head ? (ru ? ['Вариант', 'Память', 'Сколько нужно', 'Стоимость'] : ['Option', 'Memory', 'Units needed', 'Cost'])
        : [o.name, gb(o.mem) + (ru ? ' на единицу' : ' each'), o.ok ? o.units + (ru ? ' шт.' : ' unit' + (o.units > 1 ? 's' : '')) : (ru ? 'не хватит, нужен кластер' : 'not enough, needs a cluster'),
           o.ok ? (o.kind === 'rent' ? (ru ? 'от ' : 'from ') + f(o.cost) + (ru ? ' ₽/мес.' : ' RUB/month') : (ru ? 'от ' : 'from ') + f(o.cost) + ' ₽') : '—'];
      cells.forEach((c, i) => { const s = document.createElement('span'); s.setAttribute('role', o.head ? 'columnheader' : i ? 'cell' : 'rowheader'); s.textContent = c; row.append(s); });
      return row;
    }));
    const tg = document.querySelector('a[href*="t.me/"]')?.href.split('?')[0] || '#';
    const model = form.m.selectedOptions[0].textContent, quant = form.q.selectedOptions[0].textContent.split(' — ')[0];
    $('[data-calc-link]').href = tg + '?text=' + encodeURIComponent((ru ? 'Здравствуйте! Посчитал: ' : 'Hello! I sized: ') + model + ', ' + quant + ', ' + users + (ru ? ' польз., ~' : ' users, ~') + gb(r.total) + (best ? (ru ? '. Подходит: ' : '. Fits: ') + best.name : '') + '.');
  }
  form.addEventListener('input', calc);
  form.addEventListener('change', calc);
  calc();
})();

// Кинематографичный блок: панели текста выезжают слева и справа поверх видео.
(() => {
  const panels = document.querySelectorAll('.cine-panel');
  if (!panels.length || !('IntersectionObserver' in window)) { panels.forEach(p => p.classList.add('is-in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-in', e.isIntersecting)), { rootMargin: '-15% 0px -15% 0px' });
  panels.forEach(p => io.observe(p));
  const video = document.querySelector('.cine video');
  if (video && matchMedia('(prefers-reduced-motion: reduce)').matches) { video.removeAttribute('autoplay'); video.pause(); }
})();

// Кадры «Вычислений» подстраиваются под выбранную тему сайта.
(() => {
  const story = document.querySelector('[data-story]');
  if (!story) return;
  const names = ['spark', 'server', 'rack', 'park'];
  const base = story.querySelector('.story-frame img').src.replace(/\/photos\/.*$/, '/photos/');
  const themeOf = () => {
    const t = document.documentElement.dataset.theme;
    if (t === 'copper') return 'copper-light';
    if (t === 'midnight' || t === 'sage' || t === 'bordeaux') return t;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'midnight' : 'copper-light';
  };
  const probe = new Map();
  async function apply() {
    const theme = themeOf();
    const first = base + 'themes/' + theme + '/frame-1-spark.jpg';
    if (!probe.has(theme)) probe.set(theme, await fetch(first, { method: 'HEAD' }).then(r => r.ok, () => false));
    const ok = probe.get(theme);
    story.querySelectorAll('.story-frame').forEach((f, i) => {
      const img = f.querySelector('img'), src = f.querySelector('source');
      const name = ['frame-1-spark', 'frame-2-server', 'frame-3-rack', 'frame-4-park'][i];
      const dir = ok ? 'themes/' + theme + '/' : '';
      img.src = base + dir + name + '.jpg';
      if (src) src.srcset = `${base}${dir}${name}-960.jpg 960w, ${base}${dir}${name}.jpg 1672w`;
    });
  }
  apply();
  new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', apply);
})();


// Карточка товара: окно с галереей, описанием и характеристиками.
(() => {
  const shop = document.querySelector('[data-shop]');
  if (!shop) return;
  const ru = document.documentElement.lang === 'ru';
  let dlg, items = [], idx = 0, current = null;
  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'pd';
    dlg.innerHTML = `<div class="pd-card"><button type="button" class="pd-close" aria-label="${ru ? 'Закрыть' : 'Close'}">×</button>
      <div class="pd-gallery"><div class="pd-main"><img alt=""><span class="pd-credit"></span><button type="button" class="pd-nav pd-prev" aria-label="${ru ? 'Предыдущее фото' : 'Previous'}">‹</button><button type="button" class="pd-nav pd-next" aria-label="${ru ? 'Следующее фото' : 'Next'}">›</button></div><div class="pd-thumbs"></div></div>
      <div class="pd-info"><h2 class="pd-title"></h2><p class="pd-text"></p><ul class="shop-specs pd-specs"></ul><dl class="pd-more"></dl><div class="pd-price"></div><div class="pd-actions"></div></div></div>`;
    document.body.append(dlg);
    dlg.querySelector('.pd-close').onclick = () => dlg.close();
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    dlg.querySelector('.pd-prev').onclick = () => show(idx - 1);
    dlg.querySelector('.pd-next').onclick = () => show(idx + 1);
    dlg.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
    let x0 = null;
    const main = dlg.querySelector('.pd-main');
    main.addEventListener('pointerdown', e => { x0 = e.clientX; });
    main.addEventListener('pointerup', e => { if (x0 !== null && Math.abs(e.clientX - x0) > 40) show(idx + (e.clientX < x0 ? 1 : -1)); x0 = null; });
  }
  function show(i) {
    if (!items.length) return;
    idx = (i + items.length) % items.length;
    const img = dlg.querySelector('.pd-main img');
    img.classList.remove('pd-in'); void img.offsetWidth;
    img.src = items[idx][0]; img.alt = current.dataset.title;
    img.classList.add('pd-in');
    dlg.querySelector('.pd-credit').textContent = items[idx][1] ? (ru ? 'Фото: ' : 'Photo: ') + items[idx][1] : '';
    dlg.querySelectorAll('.pd-thumbs button').forEach((b, n) => b.setAttribute('aria-current', String(n === idx)));
  }
  function open(card) {
    if (!dlg) build();
    current = card;
    items = JSON.parse(card.dataset.gallery || '[]');
    dlg.querySelector('.pd-title').textContent = card.dataset.title;
    dlg.querySelector('.pd-text').textContent = card.querySelector('.shop-text')?.textContent || '';
    dlg.querySelector('.pd-specs').innerHTML = card.querySelector('.shop-specs')?.innerHTML || '';
    dlg.querySelector('.pd-more').innerHTML = card.querySelector('.shop-more dl')?.innerHTML || '';
    dlg.querySelector('.pd-price').innerHTML = (card.querySelector('.audience-price')?.outerHTML || '') + (card.querySelector('.shop-market')?.outerHTML || '') + (card.querySelector('.shop-quote')?.outerHTML || '');
    const actions = dlg.querySelector('.pd-actions');
    actions.replaceChildren();
    const add = document.createElement('button'); add.type = 'button'; add.className = 'button'; add.textContent = ru ? 'В корзину' : 'Add to basket';
    add.onclick = () => { card.querySelector('[data-add]')?.click() || card.querySelector('[data-inc]')?.click(); add.textContent = ru ? 'Добавлено ✓' : 'Added ✓'; };
    actions.append(add);
    const m3d = card.querySelector('[data-open3d]');
    if (m3d) { const b = document.createElement('button'); b.type = 'button'; b.className = 'ghost'; b.textContent = m3d.textContent; b.onclick = () => { dlg.close(); m3d.click(); }; actions.append(b); }
    const thumbs = dlg.querySelector('.pd-thumbs');
    thumbs.replaceChildren(...items.map((it, n) => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = '<img alt="" loading="lazy">'; b.firstChild.src = it[0]; b.onclick = () => show(n); return b; }));
    dlg.querySelectorAll('.pd-nav').forEach(b => { b.hidden = items.length < 2; });
    dlg.showModal();
    show(0);
  }
  shop.addEventListener('click', e => {
    const t = e.target.closest('[data-open-product], .shop-art');
    if (!t) return;
    const card = t.closest('.shop-item');
    if (card?.dataset.gallery) open(card);
  });
})();
