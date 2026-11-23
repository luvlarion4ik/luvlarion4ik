(() => {
  'use strict';

  const root = document.querySelector('[data-gm-app]');
  if (!root) return;

  const { catalog, engine, icons, createCanvas, createPanel, t: translate } = window.DevlarionGM;
  const lang = document.documentElement.lang;
  const t = (key, values) => translate(key, lang, values);
  const find = selector => root.querySelector(selector);
  const action = name => find(`[data-gm-action="${name}"]`);
  const fromJSON = id => JSON.parse(document.getElementById(id).textContent);
  const pricing = fromJSON('gm-pricing');
  const config = fromJSON('gm-config');
  const exchangeRates = fromJSON('gm-fx');
  const variants = ['now', 'base', 'boost', 'auto'];
  const mapsKey = 'devlarion-growth-maps';
  const activeKey = 'devlarion-growth-map-active';
  const format = 'devlarion.growthmap';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const stage = find('[data-gm-stage]');
  const actions = find('[data-gm-actions]');
  const importField = find('[data-gm-import]');
  const shareField = find('[data-gm-share-field]');
  const feedback = find('[data-gm-feedback]');
  const status = find('[data-gm-status]');
  const portalLink = find('[data-gm-portal]');
  const fileLimit = 400000;
  const sessionGoals = new Set();
  const demoBrief = { ...engine.demoBrief, name: t('mode.demo.name') };
  const demo = engine.buildDemo(catalog);
  const toolIcons = {
    undo: 'undo', redo: 'redo', layout: 'layout', fit: 'fit',
    minus: 'minus', plus: 'plus', '3d': 'cube', list: 'list',
  };
  for (const [name, icon] of Object.entries(toolIcons)) action(name).innerHTML = icons[icon];

  let doc = null;
  let pending = null;
  let phase = 'choose';
  let source = 'manual';
  let draft = {};
  let detected = [];
  let step = 1;
  let tab = 'compare';
  let selected = '';
  let volume = false;
  let list = false;
  let example = false;
  let shared = false;
  let comparison;
  let historyByVariant = {};
  let scanIndex = 0;
  let scanTimers = [];
  let saveTimer, economyTimer;
  let storageWarned = false;

  function money(rubles) {
    const region = window.devlarionRegion;
    const currency = region?.currency ?? 'RUB';
    const amount = Number(rubles) * (region?.rate ?? 1);
    const formatted = new Intl.NumberFormat(lang, {
      currency, style: 'currency', maximumFractionDigits: 0,
    }).format(amount);
    return (currency === 'RUB' ? '' : '≈ ') + formatted;
  }

  const canvas = createCanvas(stage, { lang, catalog, t });
  const panel = createPanel(root, { lang, catalog, t, money, config, pricing });

  function goal(name, once = false) {
    const event = 'growthmap_' + name;
    if (once) {
      try {
        if (sessionStorage.getItem(event) === '1') return;
        sessionStorage.setItem(event, '1');
      } catch {
        if (sessionGoals.has(event)) return;
        sessionGoals.add(event);
      }
    }
    document.dispatchEvent(new CustomEvent('bureau-goal', { detail: event }));
  }

  function notify(key, { portal = false, link = '' } = {}) {
    feedback.hidden = !key;
    status.textContent = key ? t(key) : '';
    portalLink.hidden = !portal;
    shareField.hidden = !link;
    shareField.value = link;
    if (link) {
      shareField.focus();
      shareField.select();
    }
  }

  function storageUnavailable() {
    if (storageWarned) return;
    storageWarned = true;
    notify('act.storage.off');
  }

  function storedMaps() {
    try {
      const records = JSON.parse(localStorage.getItem(mapsKey) ?? '[]');
      return Array.isArray(records) ? records.filter(item => item?.format === format) : [];
    } catch {
      return [];
    }
  }

  function saveNow() {
    if (!doc || example || shared) return false;
    clearTimeout(saveTimer);
    saveTimer = undefined;
    try {
      const existing = storedMaps().filter(record => record.id !== doc.id);
      localStorage.setItem(mapsKey, JSON.stringify([doc, ...existing].slice(0, 10)));
      localStorage.setItem(activeKey, doc.id);
      return true;
    } catch {
      storageUnavailable();
      return false;
    }
  }

  function scheduleSave() {
    if (!doc || example || shared) return;
    doc.updatedAt = new Date().toISOString();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 600);
  }

  function revise() {
    comparison = doc && engine.compare(doc.brief, doc.variants, catalog, { lang, money, pricing });
  }

  function variantHistory() {
    return historyByVariant[doc.active] ??= { past: [], future: [] };
  }

  const displayName = record => record?.brief?.name || t('act.nameFallback');
  const readOnly = () => example || volume;

  function refreshPanel() {
    const variant = doc?.variants[doc.active];
    panel.render({
      phase, brief: phase === 'map' ? doc.brief : draft, draft, detected, source, step, tab,
      variant, variants: doc?.variants, comparison, selected, readOnly: readOnly(),
      briefDirty: Boolean(doc && JSON.stringify(draft) !== JSON.stringify(editableBrief(doc.brief))),
      example, shared, resumeName: displayName(pending), scanIndex,
    });
  }

  function render({ animate = false, fit = false, canvasOnly = false } = {}) {
    root.dataset.phase = phase;
    const isMap = phase === 'map' && !!doc;
    stage.inert = !isMap;
    actions.hidden = !isMap || example;
    find('[data-gm-currency]').hidden = phase !== 'brief' && !isMap;
    const active = isMap ? doc.active : phase === 'brief' ? 'now' : 'boost';
    for (const button of root.querySelectorAll('[data-gm-variant]')) {
      const key = button.dataset.gmVariant;
      button.setAttribute('aria-pressed', String(key === active));
      button.toggleAttribute('data-edited', Boolean(isMap && doc.variants[key].edited));
      button.disabled = !isMap;
    }
    action('undo').disabled = !isMap || readOnly() || !variantHistory().past.length;
    action('redo').disabled = !isMap || readOnly() || !variantHistory().future.length;
    action('layout').disabled = !isMap || readOnly();
    action('reset').disabled = !isMap || readOnly();
    action('3d').setAttribute('aria-pressed', String(volume));
    action('3d').setAttribute('aria-label', t(volume ? 'tb.3d.exit' : 'tb.3d'));
    action('3d').title = t(volume ? 'tb.3d.exit' : 'tb.3d');
    action('list').setAttribute('aria-pressed', String(list));
    action('list').setAttribute('aria-label', t(list ? 'tb.map' : 'tb.list'));
    action('list').title = t(list ? 'tb.map' : 'tb.list');
    const brief = isMap ? doc.brief : phase === 'brief' ? draft : demoBrief;
    const variant = isMap ? doc.variants[active]
      : phase === 'brief' ? engine.buildNow(brief, catalog)
      : phase === 'scan' ? { ...demo.boost, nodes: [], edges: [] } : demo.boost;
    const existing = (isMap ? doc.variants.now : demo.now).nodes.map(node => node.block);
    canvas.render(variant, {
      brief, existing, animate, locked: !isMap || readOnly(), economy: comparison?.economies[active],
    });
    canvas.setSelected(selected);
    if (!canvasOnly) refreshPanel();
    if (fit) requestAnimationFrame(() => canvas.fit());
  }

  function createDoc(brief, resolved = engine.buildAll(brief, catalog)) {
    const now = new Date();
    return {
      format, version: 1, id: 'gm_' + now.getTime().toString(36) + Math.random().toString(36).slice(2, 6),
      createdAt: now.toISOString(), updatedAt: now.toISOString(), lang, source,
      brief: engine.normalizeBrief(brief, catalog), active: 'boost', variants: resolved,
    };
  }

  function editableBrief(brief) {
    const copy = { ...brief, filled: { ...brief.filled } };
    for (const field of ['check', 'leads', 'cycle']) {
      if (copy.filled[field] === false) copy[field] = null;
    }
    return copy;
  }

  function openMap(record, options = {}) {
    clearTimeout(economyTimer);
    doc = record;
    example = !!options.example;
    shared = !!options.shared;
    source = record.source;
    phase = 'map';
    step = 1;
    tab = 'compare';
    draft = editableBrief(record.brief);
    detected = [];
    selected = '';
    volume = false;
    list = matchMedia('(max-width: 640px)').matches;
    canvas.setVolume(false);
    canvas.setList(list);
    historyByVariant = {};
    revise();
    render({ fit: true, animate: true });
    if (options.reveal) {
      find('[data-gm-toolbar]').scrollIntoView({ block: 'start', behavior: 'instant' });
      find('[data-gm-variant="' + doc.active + '"]').focus({ preventScroll: true });
    }
    if (!options.example && !options.shared) scheduleSave();
  }

  const bringIntoView = () => root.scrollIntoView({ block: 'start', behavior: reduced.matches ? 'auto' : 'smooth' });

  function chooseMode(mode) {
    if (saveTimer) saveNow();
    if (mode !== 'restart') bringIntoView();
    notify('');
    if (mode === 'resume' && pending) {
      openMap(pending);
      pending = null;
      return;
    }
    if (mode === 'example') {
      source = 'manual';
      goal('example');
      openMap(createDoc(demoBrief, demo), { example: true, reveal: true });
      return;
    }
    pending = doc = null;
    comparison = undefined;
    example = shared = false;
    draft = {};
    detected = [];
    step = 1;
    tab = 'brief';
    selected = '';
    volume = list = false;
    canvas.setVolume(false);
    canvas.setList(false);
    if (mode === 'restart') {
      try { localStorage.removeItem(activeKey); } catch {}
    }
    phase = mode === 'manual' ? 'brief' : mode === 'text' ? 'text' : 'choose';
    source = mode === 'text' ? 'text' : 'manual';
    if (mode === 'manual' || mode === 'text') goal('mode_' + mode);
    render({ fit: true, animate: phase === 'brief' });
  }

  function finishScan() {
    if (phase !== 'scan') return;
    scanTimers.forEach(clearTimeout);
    scanTimers = [];
    openMap(pending, { reveal: true });
    pending = null;
  }

  function analyze(nextDraft) {
    if (phase !== 'brief' && (phase !== 'map' || readOnly())) return;
    draft = nextDraft ?? draft;
    goal('analyze');
    const generated = createDoc(draft);
    if (doc) {
      const previous = doc;
      generated.id = previous.id;
      generated.createdAt = previous.createdAt;
      if (previous.saved) generated.saved = true;
      for (const key of variants) {
        if (previous.variants[key].edited && !confirm(t('brief.rebuild.ask', { variant: t('v.' + key) }))) {
          generated.variants[key] = previous.variants[key];
        }
      }
    }
    pending = generated;
    if (reduced.matches) {
      phase = 'scan';
      finishScan();
      return;
    }
    scanIndex = 0;
    phase = 'scan';
    render();
    for (let index = 1; index < 4; index += 1) {
      scanTimers.push(setTimeout(() => { scanIndex = index; refreshPanel(); }, index * 950 + 400));
    }
    scanTimers.push(setTimeout(finishScan, 4800));
  }

  function chooseVariant(key) {
    if (phase !== 'map' || !variants.includes(key) || doc.active === key) return;
    doc.active = key;
    selected = '';
    if (tab === 'block') tab = 'compare';
    if (key !== 'now') goal('variant_' + key, true);
    render({ animate: true });
    scheduleSave();
  }

  function commitVariant(next, { added = false } = {}) {
    if (phase !== 'map' || readOnly()) return;
    const prior = doc.variants[doc.active];
    const { past, future } = variantHistory();
    past.push(prior);
    if (past.length > 50) past.shift();
    future.length = 0;
    doc.variants[doc.active] = { ...prior, ...next, edited: next.edited ?? true };
    if (selected && !next.nodes.some(node => node.id === selected)) {
      selected = '';
      tab = 'compare';
    }
    goal('edit', true);
    if (added) goal('block_add', true);
    render({ canvasOnly: true });
    clearTimeout(economyTimer);
    economyTimer = setTimeout(() => { revise(); refreshPanel(); }, 120);
    scheduleSave();
  }

  function restoreHistory(direction) {
    if (!doc || readOnly()) return;
    const { past, future } = variantHistory();
    const [from, to] = direction === 'undo' ? [past, future] : [future, past];
    if (!from.length) return;
    to.push(doc.variants[doc.active]);
    doc.variants[doc.active] = from.pop();
    selected = '';
    if (tab === 'block') tab = 'compare';
    revise();
    render();
    scheduleSave();
  }

  function addBlock(block, position) {
    if (!doc || readOnly() || !Object.hasOwn(catalog.byId, block)) return;
    const current = doc.variants[doc.active];
    if (current.nodes.length >= 60) {
      notify('canvas.limit');
      return;
    }
    let index = current.nodes.length + 1;
    while (current.nodes.some(node => node.id === 'n' + index)) index += 1;
    const node = { id: 'n' + index, block, x: 0, y: 0, settings: {}, note: '' };
    const nodes = [...current.nodes, node];
    const placed = position && Number.isFinite(position.x) && Number.isFinite(position.y)
      ? position : engine.layout({ ...current, nodes }, catalog, { force: true }).nodes.at(-1);
    node.x = placed.x;
    node.y = placed.y;
    selected = node.id;
    tab = 'block';
    root.classList.remove('is-panel-collapsed');
    commitVariant({ nodes, edges: current.edges }, { added: true });
  }

  function updateNodes(ids, update) {
    if (!doc || readOnly()) return;
    const current = doc.variants[doc.active];
    const nodes = current.nodes.map(node => ids.includes(node.id) ? update(node) : node).filter(Boolean);
    const keep = new Set(nodes.map(node => node.id));
    commitVariant({ nodes, edges: current.edges.filter(edge => keep.has(edge.from) && keep.has(edge.to)) });
  }

  function toggleVolume(enabled = !volume) {
    volume = enabled;
    if (volume) { list = false; canvas.setList(false); }
    canvas.setVolume(volume);
    if (volume) goal('3d');
    render();
  }

  function resetVariant(ask = true) {
    if (!doc || readOnly() || (ask && !confirm(t('tb.reset.ask')))) return;
    commitVariant({ ...engine.buildAll(doc.brief, catalog)[doc.active], edited: false });
    canvas.fit();
  }

  function asBase64(bytes) {
    let binary = '';
    for (let index = 0; index < bytes.length; index += 8192) {
      binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
    }
    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
  }

  async function encode(record) {
    const bytes = new TextEncoder().encode(JSON.stringify(record));
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
      const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
      return 'z.' + asBase64(compressed);
    } catch {
      return 'u.' + asBase64(bytes);
    }
  }

  async function decode(value) {
    if (value.length > fileLimit * 1.4 || !/^[uz]\.[A-Za-z0-9_-]+$/.test(value)) throw new Error('invalid');
    const bytes = Uint8Array.from(atob(value.slice(2).replaceAll('-', '+').replaceAll('_', '/')), ch => ch.charCodeAt(0));
    const decoder = new TextDecoder('utf-8', { fatal: true });
    if (value.startsWith('u.')) return JSON.parse(decoder.decode(bytes));
    const reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
    let content = '';
    let size = 0;
    for (;;) {
      const { value: chunk, done } = await reader.read();
      if (done) return JSON.parse(content + decoder.decode());
      size += chunk.length;
      if (size > fileLimit) {
        await reader.cancel();
        throw new Error('invalid');
      }
      content += decoder.decode(chunk, { stream: true });
    }
  }

  async function shareURL(record, limit = 6000, forceCompact = false) {
    const origin = location.origin + location.pathname;
    const linkTo = async item => origin + '#map=' + await encode(item);
    if (!forceCompact) {
      const full = await linkTo(record);
      if (full.length <= limit) return { url: full, shortened: false };
    }
    const { variants: options, ...briefOnly } = record;
    const activeOnly = await linkTo({ ...briefOnly, compact: true, variants: { [record.active]: options[record.active] } });
    return { url: activeOnly.length <= limit ? activeOnly : await linkTo({ ...briefOnly, compact: true }), shortened: true };
  }

  function importRecord(data) {
    if (data?.compact === true && data.format === format) {
      if (data.version > 1) throw new Error('newer');
      const { compact, ...record } = data;
      data = { ...record, variants: { ...engine.buildAll(record.brief, catalog), ...record.variants } };
    }
    const record = engine.migrate(data, catalog);
    return { ...record, brief: engine.normalizeBrief(record.brief, catalog) };
  }

  function importError(error) {
    console.warn('Growth Map import:', error.message);
    notify(error.message === 'newer' ? 'act.newer' : 'act.import.bad');
  }

  async function handleHash() {
    const hash = location.hash;
    if (hash.startsWith('#map=')) {
      try {
        const record = importRecord(await decode(hash.slice(5)));
        if (location.hash === hash) openMap(record, { shared: true });
      } catch (error) {
        if (location.hash === hash) importError(error);
      }
    } else if (hash.startsWith('#open=')) {
      const record = storedMaps().find(item => item.id === hash.slice(6));
      try {
        if (record) openMap(importRecord(record));
        else notify('act.notFound');
      } catch (error) {
        importError(error);
      }
      history.replaceState(history.state, '', location.pathname + location.search);
    }
  }

  function saveCopy(portal) {
    if (!doc || example) return;
    if (shared) {
      const id = createDoc(doc.brief, doc.variants).id;
      doc = { ...doc, id, lang };
      shared = false;
      if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
    }
    const wasSaved = !!doc.saved;
    if (portal) doc.saved = true;
    doc.updatedAt = new Date().toISOString();
    if (!saveNow()) {
      if (!wasSaved) delete doc.saved;
      return;
    }
    goal('cabinet');
    refreshPanel();
    notify('act.cabinet.done', { portal: true });
  }

  function download() {
    const slug = doc.brief.name.toLocaleLowerCase(lang).replace(/[^\p{Letter}\p{Number}]+/gu, '-').replace(/^-|-$/g, '');
    const url = URL.createObjectURL(new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `devlarion-growth-map-${slug || 'map'}-${new Date().toISOString().slice(0, 10)}.json`;
    root.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    goal('download');
  }

  async function copyLink() {
    const link = shareURL(doc);
    try {
      if (typeof ClipboardItem === 'function' && navigator.clipboard?.write) {
        const contents = link.then(({ url }) => new Blob([url], { type: 'text/plain' }));
        await navigator.clipboard.write([new ClipboardItem({ 'text/plain': contents })]);
      } else {
        await navigator.clipboard.writeText((await link).url);
      }
      const { shortened } = await link;
      notify(shortened ? 'act.share.short' : 'act.share.done');
    } catch {
      const { url, shortened } = await link;
      notify(shortened ? 'act.share.short' : 'act.share.error', { link: url });
    }
    goal('share');
  }

  function telegramText(record, shareUrl) {
    const brief = record.brief;
    const category = catalog.categoryById[brief.category];
    const niche = category?.niches.find(item => item.id === brief.niche)?.title[lang]
      || brief.nicheCustom || category?.title[lang] || '';
    const { economies } = engine.compare(brief, record.variants, catalog, { lang, money, pricing });
    const wishes = catalog.wishes.filter(item => brief.wishes.includes(item.id) && item.id !== 'advise')
      .map(item => item.title[lang]).join(', ');
    return [
      t('telegram.greeting'), '',
      brief.name ? t('telegram.business', { name: brief.name, niche }) : niche,
      t('telegram.size', { size: t('brief.size.' + brief.size), revenue: money(economies.now.revenue) }),
      t('telegram.variant', { variant: t('v.' + record.active), growth: Math.round(economies[record.active].growth * 100) }),
      wishes ? t('telegram.wishes', { wishes }) : null,
      '', t('telegram.map', { shareUrl }), config.handoffNote || null,
    ].filter(line => line != null).join('\n');
  }

  async function handoff() {
    const record = doc;
    const popup = window.open('about:blank', '_blank');
    if (!popup) {
      notify('act.handoff.error', { link: (await shareURL(record)).url });
      return;
    }
    popup.opener = null;
    const full = await shareURL(record);
    let body = telegramText(record, full.url);
    if (encodeURIComponent(body).length > 3500) {
      const remainder = 3500 - encodeURIComponent(telegramText(record, '')).length;
      const compact = await shareURL(record, remainder - 18, true);
      body = telegramText(record, compact.url);
    }
    const destination = new URL(root.dataset.telegram);
    destination.searchParams.set('text', body);
    popup.location.replace(destination.href);
    goal('handoff');
  }

  const toolbarHandlers = {
    undo: () => restoreHistory('undo'),
    redo: () => restoreHistory('redo'),
    layout: () => { commitVariant({ ...engine.layout(doc.variants[doc.active], catalog, { force: true }), edited: true }); canvas.fit(); },
    fit: () => canvas.fit(),
    panel: () => { root.classList.toggle('is-panel-collapsed'); root.querySelector('[data-gm-action="panel"]')?.setAttribute('aria-pressed', String(root.classList.contains('is-panel-collapsed'))); },
    minus: () => canvas.zoomBy(1 / 1.18),
    plus: () => canvas.zoomBy(1.18),
    '3d': () => toggleVolume(),
    list: () => {
      list = !list;
      if (list && volume) toggleVolume(false);
      canvas.setList(list);
      render();
    },
    reset: () => resetVariant(),
    import: () => importField.click(),
    download, share: copyLink, handoff, save: () => saveCopy(true), dismiss: () => notify(''),
  };

  root.addEventListener('click', event => {
    const variant = event.target.closest('[data-gm-variant]');
    if (variant) chooseVariant(variant.dataset.gmVariant);
    const button = event.target.closest('[data-gm-action]');
    if (!button || button.disabled) return;
    button.closest('details')?.removeAttribute('open');
    toolbarHandlers[button.dataset.gmAction]?.();
  });

  importField.addEventListener('change', async () => {
    const file = importField.files[0];
    importField.value = '';
    if (!file) return;
    try {
      if (file.size > fileLimit) throw new Error('invalid');
      if (saveTimer) saveNow();
      openMap(importRecord(JSON.parse(await file.text())));
    } catch (error) {
      importError(error);
    }
  });

  const on = (event, handler) => document.addEventListener('gm:' + event, received => handler(received.detail ?? {}));
  on('mode', ({ mode }) => chooseMode(mode));
  on('parse', ({ text }) => {
    const parsed = engine.parseText(text, catalog, lang);
    const selectedRegion = window.devlarionRegion;
    const currency = parsed.brief.currency ?? selectedRegion?.currency ?? 'RUB';
    const rate = currency === 'RUB' ? 1 : selectedRegion?.currency === currency
      ? selectedRegion.rate : exchangeRates[currency]?.rate;
    draft = { ...parsed.brief, currency };
    if (Number.isFinite(draft.check) && rate > 0) draft.check = Math.round(draft.check / rate);
    else if (Number.isFinite(draft.check)) delete draft.check;
    detected = parsed.detected;
    step = 1;
    tab = 'brief';
    phase = 'brief';
    goal('parse');
    render({ fit: true });
  });
  on('brief', ({ draft: next }) => {
    draft = next;
    if (phase === 'brief') render({ canvasOnly: true, fit: true });
  });
  on('step', ({ step: next }) => {
    step = Math.min(6, Math.max(1, next));
    refreshPanel();
  });
  on('analyze', ({ draft: next }) => analyze(next));
  on('skip', finishScan);
  on('import', () => importField.click());
  on('tab', ({ tab: next }) => {
    tab = next;
    refreshPanel();
  });
  on('variant', ({ key }) => chooseVariant(key));
  on('change', next => {
    if (Array.isArray(next.nodes) && Array.isArray(next.edges)) commitVariant(next);
  });
  on('select', ({ id }) => {
    if (phase !== 'map') return;
    selected = id ?? '';
    if (selected) { tab = 'block'; root.classList.remove('is-panel-collapsed'); }
    else if (tab === 'block') tab = 'compare';
    refreshPanel();
  });
  on('add', ({ block, position }) => addBlock(block, position));
  on('delete', ({ ids }) => updateNodes(ids, () => null));
  on('replace', ({ id, block }) => {
    if (Object.hasOwn(catalog.byId, block)) updateNodes([id], node => ({ ...node, block, settings: {}, note: '' }));
  });
  on('settings', ({ id, settings }) => updateNodes([id], node => ({ ...node, settings })));
  on('connect', ({ from, to }) => { if (!readOnly()) canvas.connect(from, to); });
  on('zoom', ({ scale }) => { find('[data-gm-zoom]').textContent = Math.round(scale * 100) + '%'; });
  on('volume', ({ enabled }) => { if (enabled !== volume) toggleVolume(enabled); });
  on('restore', () => resetVariant(false));
  on('save-shared', () => saveCopy(true));

  document.addEventListener('devlarion:regionchange', () => {
    revise();
    refreshPanel();
  });

  document.addEventListener('keydown', event => {
    if (phase !== 'map' || event.target.closest('input,select,textarea,[contenteditable]')) return;
    if (/^[1-4]$/.test(event.key)) chooseVariant(variants[Number(event.key) - 1]);
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !readOnly()) {
      event.preventDefault();
      restoreHistory(event.shiftKey ? 'redo' : 'undo');
    }
    if (event.key === 'Escape' && volume) toggleVolume(false);
  });

  window.addEventListener('hashchange', handleHash);
  window.addEventListener('pagehide', () => { if (saveTimer) saveNow(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && saveTimer) saveNow();
  });
  reduced.addEventListener('change', () => { if (reduced.matches) finishScan(); });

  root.hidden = false;
  try {
    const id = localStorage.getItem(activeKey);
    const last = id && storedMaps().find(record => record.id === id);
    if (last && !/^#(?:map|open)=/.test(location.hash)) {
      pending = importRecord(last);
      phase = 'resume';
    }
    localStorage.setItem('devlarion-growth-map-check', '1');
    localStorage.removeItem('devlarion-growth-map-check');
  } catch (error) {
    if (error instanceof DOMException && ['QuotaExceededError', 'SecurityError'].includes(error.name)) storageUnavailable();
  }
  render({ fit: true });
  handleHash();
  goal('open', true);
})();
