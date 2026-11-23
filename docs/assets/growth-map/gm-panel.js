(() => {
  'use strict';

  const gm = window.DevlarionGM;
  const variants = ['now', 'base', 'boost', 'auto'];
  const sheetSizes = ['closed', 'half', 'full'];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent('gm:' + name, { detail }));
  const normalize = text => text.toLocaleLowerCase().replaceAll('ё', 'е').normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const attrs = dataset => Object.entries(dataset).map(([key, value]) =>
    'data-gm-p-' + key + '="' + escape(value) + '"').join(' ');
  const valueOf = button => button.dataset.gmPValue;
  const list = value => Array.isArray(value) ? value : [];

  function createPanel(root, { lang, catalog, t = (key, values) => gm.t(key, lang, values), money, config = {}, pricing = {} }) {
    const panel = root.querySelector('[data-gm-panel]');
    const content = root.querySelector('[data-gm-panel-content]');
    const overlay = root.querySelector('[data-gm-overlay]');
    const economy = root.querySelector('[data-gm-economy]');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = matchMedia('(max-width: 899px)');
    const text = (key, values) => escape(t(key, values));
    const local = record => record?.[lang] ?? '';
    const label = record => escape(local(record?.title));
    const icon = id => gm.icon?.(id) ?? gm.icons?.[id] ?? '';
    const numbers = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 });
    const shortMoney = amount => money(amount).replace(/^≈\s*/, '');
    const amountText = amount => escape(money(amount));
    const formatPct = value => (value > 0 ? '+' : '') + numbers.format(Math.round(value * 100)) + '%';
    const choice = (id, key) => ({ id, title: { [lang]: t(key) } });
    const region = () => window.devlarionRegion ?? { currency: 'RUB', rate: 1 };
    const inputId = field => 'gm-brief-' + field;
    const selectedNode = value => typeof value === 'object' ? value?.id : value;
    const button = (tag, title, data, extra = '') =>
      '<button type="button" class="' + tag + '" ' + attrs(data) + ' ' + extra + '>' + title + '</button>';
    const pressed = value => 'aria-pressed="' + Boolean(value) + '"';

    let state;
    let categoryFilter = '';
    let blockFilter = '';
    let openGroups = new Set(['suggested']);
    let previous = { phase: '', tab: '', step: 0 };
    let briefMountKey = '';
    let furthestStep = 1;
    let sheetSize = 'half';
    let economyOpen = false;
    let economyKey = '';
    let lastRevenue = null;
    let lastGrowth = null;
    let lastLoss = null;
    let frame = 0;
    let announce = 0;
    let lastAnnouncement = 0;
    let sheetDrag;
    let sheetSwipeAt = -Infinity;
    let editing = false;

    const draft = () => state.draft ?? state.brief ?? {};
    const selected = () => state.variant?.nodes.find(node => node.id === selectedNode(state.selected));
    const currentEconomy = () => state.comparison?.economies?.[state.variant?.key];
    const tabName = () => (state.tab === 'block' && !selected() ? 'compare' : state.tab) || 'compare';
    const isEditable = () => !state.readOnly && !state.example;
    const has = (field, id) => (draft()[field] ?? []).includes(id);

    function overlayHtml() {
      if (state.phase === 'choose') {
        const modes = [
          ['manual', 'mode.manual', 'doc'],
          ['text', 'mode.auto', 'chat'],
        ].map(([mode, key, symbol]) => button('gm-mode-card',
          '<span class="gm-mode-icon">' + icon(symbol) + '</span><span class="gm-mode-time">' + text(key + '.time') + '</span>' +
          '<strong>' + text(key + '.title') + '</strong><span>' + text(key + '.text') + '</span>',
          { mode })).join('');
        return '<section class="gm-entry-panel" aria-labelledby="gm-mode-title"><h2 id="gm-mode-title" tabindex="-1">' +
          text('mode.title') + '</h2><div class="gm-mode-options">' + modes + '</div><p>' + text('mode.note') + '</p>' +
          button('gm-text-button', text('mode.example'), { mode: 'example' }) +
          button('gm-text-button', text('act.import'), { import: '' }) + '</section>';
      }
      if (state.phase === 'resume') {
        return '<section class="gm-entry-panel gm-resume-panel" aria-labelledby="gm-mode-title"><h2 id="gm-mode-title" tabindex="-1">' +
          text('mode.resume', { name: state.resumeName || t('act.nameFallback') }) + '</h2><div class="gm-form-actions">' +
          button('button', text('mode.resume.yes'), { mode: 'resume' }) +
          button('gm-secondary', text('mode.resume.no'), { mode: 'restart' }) + '</div>' +
          button('gm-text-button', text('act.import'), { import: '' }) + '</section>';
      }
      if (state.phase === 'text') {
        const examples = [1, 2, 3].map(index => button('gm-chip', text('auto.example' + index + '.label'), { example: index })).join('');
        return '<form class="gm-entry-panel gm-text-form" data-gm-p-form="text" aria-labelledby="gm-mode-title">' +
          '<h2 id="gm-mode-title" tabindex="-1">' + text('auto.title') + '</h2>' +
          '<fieldset><legend>' + text('auto.examples') + '</legend><div class="gm-chip-list">' + examples + '</div></fieldset>' +
          '<label for="gm-business-text">' + text('auto.hint') + '</label>' +
          '<textarea id="gm-business-text" maxlength="2000" rows="6" required aria-describedby="gm-text-counter"></textarea>' +
          '<div class="gm-text-form-footer">' + button('gm-text-button', text('brief.back'), { mode: 'restart' }) +
          '<output id="gm-text-counter">' + text('auto.counter', { n: 0 }) + '</output>' +
          '<button type="submit" class="button" disabled>' + text('auto.parse') + '</button></div></form>';
      }
      if (state.phase === 'scan') {
        return '<div class="gm-scan-line" aria-hidden="true"></div><section class="gm-scan-panel" aria-label="' +
          text('brief.analyze') + '"><ol aria-live="polite" aria-relevant="additions text">' + scanList() +
          '</ol>' + button('gm-secondary', text('scan.skip'), { skip: '' }) + '</section>';
      }
      if (state.phase === 'brief' && draft().name) {
        return '<p class="gm-business-badge">' + text('brief.business.badge', { name: draft().name }) + '</p>';
      }
      return '';
    }

    function scanList() {
      const category = catalog.categoryById[state.brief?.category];
      const niche = category?.niches.find(item => item.id === state.brief.niche);
      const position = Math.min(3, Math.max(0, state.scanIndex || 0));
      return [1, 2, 3, 4].slice(0, position + 1).map((index, offset) => '<li' +
        (offset === position ? ' aria-current="step"' : '') + '>' +
        '<span aria-hidden="true">' + (offset < position ? icon('check') : '') + '</span>' +
        text('scan.' + index, { niche: local(niche?.title ?? category?.title) }) + '</li>').join('');
    }

    function chips(field, records, { multiple = false, icons = false, limit = Infinity } = {}) {
      return '<div class="gm-chip-list">' + records.map(record => {
        const active = multiple ? has(field, record.id) : String(draft()[field]) === String(record.id);
        const disabled = multiple && !active && (draft()[field]?.length ?? 0) >= limit;
        return button('gm-chip', (icons ? icon(record.icon) : '') + label(record),
          { field, value: record.id, ...multiple && { multi: 'true' } },
          pressed(active) + (disabled ? ' disabled' : ''));
      }).join('') + '</div>';
    }

    function field(id, body, { name = id, caption = '', forInput = false, detected = [id] } = {}) {
      const hit = detected.some(key => state.detected?.includes(key));
      const tip = hit ? '<span class="gm-detected-label">' + icon('spark') + text('auto.detected') + '</span>' : '';
      const heading = text('brief.' + name);
      const extra = caption ? '<small>' + escape(caption) + '</small>' : '';
      return (forInput
        ? '<div class="gm-brief-field"' + (hit ? ' data-detected' : '') + '><label for="' + inputId(id) + '">' + heading + '</label>'
        : '<fieldset class="gm-brief-field"' + (hit ? ' data-detected' : '') + '><legend>' + heading + '</legend>') +
        tip + body + extra + (forInput ? '</div>' : '</fieldset>');
    }

    function input(id, { type = 'text', maxLength, placeholder = '', value = draft()[id], extra = '' } = {}) {
      return '<input id="' + inputId(id) + '" type="' + type + '" data-gm-p-input="' + id +
        '" value="' + escape(value) + '" placeholder="' + escape(placeholder) + '" ' +
        (maxLength ? 'maxlength="' + maxLength + '"' : '') + ' ' + extra + '>';
    }

    function categoryOptions() {
      const query = normalize(categoryFilter.trim());
      const matches = catalog.categories.filter(category => !query || normalize([
        local(category.title), ...category.niches.flatMap(niche => [local(niche.title), ...niche.keywords]),
      ].join(' ')).includes(query));
      return matches.length ? chips('category', matches, { icons: true }) :
        '<p class="gm-field-note">' + text('brief.search.empty') + '</p>';
    }

    function itemEditor(niche) {
      const items = draft().items ?? [];
      const suggestions = (local(niche?.itemsHint) || []).filter(item => !items.includes(item));
      return '<div class="gm-item-editor"><div class="gm-chip-list">' + items.map(item =>
        button('gm-chip gm-item-remove', escape(item) + '<span aria-hidden="true">×</span>',
          { removeitem: item }, 'aria-label="' + text('brief.item.remove', { item }) + '"')).join('') +
        '</div>' + input('items', { value: '', placeholder: t('brief.items.ph'), maxLength: 100, extra: items.length >= 12 ? 'disabled' : '' }) +
        '<div class="gm-chip-list gm-item-suggestions">' + suggestions.map(item =>
          button('gm-chip', '<span aria-hidden="true">+</span>' + escape(item), { additem: item }, items.length >= 12 ? 'disabled' : '')).join('') +
        '</div></div>';
    }

    function revenueBand(index) {
      if (index === 0) return t('brief.revenue.below', { money: shortMoney(300000) });
      if (index === 4) return t('brief.revenue.above', { money: shortMoney(20000000) });
      if (!index || index < 0) return t('brief.band.unset');
      const thresholds = [300000, 1000000, 5000000, 20000000];
      return t('brief.revenue.range', { min: shortMoney(thresholds[index - 1]), max: shortMoney(thresholds[index]) });
    }

    function briefFields(step) {
      const data = draft();
      const category = catalog.categoryById[data.category];
      const niche = category?.niches.find(item => item.id === data.niche);
      if (step === 1) {
        const categories = '<input id="' + inputId('category') + '" type="search" data-gm-p-category-filter value="' +
          escape(categoryFilter) + '" placeholder="' + text('brief.category.ph') + '">' +
          '<div class="gm-category-options" data-gm-p-category-options>' + categoryOptions() + '</div>';
        const niches = data.category === 'other'
          ? field('nicheCustom', input('nicheCustom', { maxLength: 100, placeholder: t('brief.niche.ph') }), { name: 'niche', forInput: true })
          : category?.niches.length ? field('niche', chips('niche', category.niches)) : '';
        return field('name', input('name', { maxLength: 60, placeholder: t('brief.name.ph') }), { forInput: true }) +
          field('category', categories, { forInput: true }) + niches +
          field('models', chips('models', catalog.models, { multiple: true }), { name: 'model' });
      }
      if (step === 2) {
        const current = data.filled?.check === false ? '' : data.check;
        const converted = current > 0 ? Math.round(current * region().rate * 100) / 100 : '';
        const cash = '<div class="gm-number-unit">' + input('check', { type: 'number', value: converted, extra: 'min="0" step="any" inputmode="decimal"' }) +
          '<span>' + escape(region().currency) + '</span></div>';
        return field('items', itemEditor(niche), { forInput: true }) +
          field('check', cash, { forInput: true }) +
          field('cycle', chips('cycle', ['day', 'week', 'month', 'long'].map(id => choice(id, 'brief.cycle.' + id))));
      }
      if (step === 3) {
        const range = data.revenueBand ?? -1;
        const revenue = '<output for="' + inputId('revenueBand') + '" data-gm-p-revenue-value>' + escape(revenueBand(range)) + '</output>' +
          input('revenueBand', { type: 'range', value: range, extra: 'min="-1" max="4" step="1" aria-valuetext="' + escape(revenueBand(range)) + '"' });
        return field('size', chips('size', ['solo', 'team', 'mid', 'large'].map(id => choice(id, 'brief.size.' + id)))) +
          field('revenueBand', revenue, { name: 'revenue', forInput: true }) +
          field('leads', input('leads', { type: 'number', value: data.filled?.leads === false ? '' : data.leads, extra: 'inputmode="numeric" min="0" step="1"' }),
            { forInput: true, caption: t('brief.leads.hint') }) +
          field('repeatBand', chips('repeatBand', [0, 1, 2].map(id => choice(id, 'brief.repeat.' + id))), { name: 'repeat' }) +
          '<p class="gm-field-note">' + text('brief.scale.why') + '</p>';
      }
      if (step === 4) {
        const sources = catalog.sources.map(source => {
          const live = has('sources', source.id);
          const main = data.mainSource === source.id;
          return '<div class="gm-source-row">' + button('gm-chip', icon(source.icon) + label(source),
            { field: 'sources', value: source.id, multi: true }, pressed(live)) +
            (live ? button('gm-source-star', icon('star'), { main: source.id },
              pressed(main) + ' aria-label="' + text('brief.source.star', { source: local(source.title) }) + '"') : '') + '</div>';
        }).join('');
        return field('sources', '<div class="gm-sources">' + sources + '</div>', { caption: t('brief.sources.main') }) +
          field('sourcesOther', input('sourcesOther', { maxLength: 120, placeholder: t('brief.sources.other.ph') }),
            { name: 'sources.other', forInput: true }) +
          (lang === 'ru' ? '<p class="gm-field-note">' + text('brief.insta.note') + '</p>' : '');
      }
      if (step === 5) {
        return field('intake', chips('intake', catalog.intake, { multiple: true, icons: true })) +
          field('payment', chips('payment', catalog.payment, { multiple: true, icons: true })) +
          field('pains', chips('pains', catalog.pains, { multiple: true, limit: 3 }), { caption: t('brief.pains.hint') });
      }
      return field('wishes', chips('wishes', catalog.wishes, { multiple: true, icons: true })) +
        field('timing', chips('timing', ['asap', 'soon', 'browsing'].map(id => choice(id, 'brief.timing.' + id))));
    }

    function briefHtml() {
      const step = state.step || 1;
      const progress = [1, 2, 3, 4, 5, 6].map(index => '<li>' + button('gm-progress-step',
        '<span>' + index + '</span><small>' + text('brief.step' + index) + '</small>',
        { step: index }, (index === step ? 'aria-current="step"' : '') +
          (index > furthestStep && state.phase !== 'map' ? ' disabled' : '')) + '</li>').join('');
      const check = state.phase === 'brief' && state.source === 'text' ? '<p class="gm-field-note gm-text-review">' +
        text(state.detected?.includes('category') ? 'auto.check' : 'auto.noCategory') + '</p>' : '';
      const recalc = state.phase === 'map' ? button('gm-secondary gm-recalc', text('brief.recalc'),
        { recalc: '' }, state.briefDirty || editing ? '' : 'disabled') : '';
      const next = state.phase === 'map' && step === 6 ? '' : '<button type="submit" class="button">' +
        text(step === 6 ? 'brief.analyze' : 'brief.next') + '</button>';
      return '<form class="gm-brief" data-gm-p-form="brief"><ol class="gm-progress" aria-label="' +
        text('brief.progress', { step }) + '">' + progress + '</ol><div class="gm-pane gm-brief-body" data-step="' + step + '">' +
        '<div class="gm-pane-heading"><h2 tabindex="-1">' + text('brief.step' + step) + '</h2>' + recalc + '</div>' +
        check + briefFields(step) + '<p class="gm-brief-error" role="alert" hidden></p></div>' +
        '<div class="gm-form-actions">' + (step > 1 ? button('gm-secondary', text('brief.back'), { step: step - 1 }) : '') +
        next + '</div></form>';
    }

    function effect(block) {
      const key = ['t', 'leak', 'conv', 'repeat', 'check', 'hours'].find(id => block.fx[id] > 0);
      return key ? text('fx.' + key, { n: numbers.format(block.fx[key] * (key === 'hours' ? 1 : 100)) }) : '';
    }

    function libraryGroup(id, title, rows, groupIcon, color) {
      if (!rows.length) return '';
      const onMap = new Set(state.variant.nodes.map(node => node.block));
      const disabled = state.variant.nodes.length >= 60;
      return '<details class="gm-library-group" data-gm-p-group="' + id + '" ' +
        (openGroups.has(id) || blockFilter.trim() ? 'open' : '') + '><summary>' + icon(groupIcon) +
        '<span>' + title + '</span></summary><div class="gm-library-list" style="--gm-stage-color:' + color + '">' +
        rows.map(block => {
          const on = onMap.has(block.id);
          return button('gm-library-card' + (on ? ' gm-library-present' : ''),
            '<span class="gm-library-icon">' + icon(block.icon) + '</span><span class="gm-library-card-text">' +
            '<strong>' + label(block) + '</strong><small>' + escape(local(block.benefit)) + '</small>' +
            '<span class="gm-library-effect">' + (on ? text('lib.onMap') : effect(block)) + '</span></span>' +
            '<span class="gm-library-plus" aria-hidden="true">' + icon(on ? 'check' : 'plus') + '</span>' +
            '<span class="gm-sr">' + text('lib.add') + '</span>',
            { add: block.id }, disabled ? 'disabled' : mobile.matches ? '' : 'draggable="true"');
        }).join('') + '</div></details>';
    }

    function libraryGroups() {
      const query = normalize(blockFilter.trim());
      const eligible = catalog.blocks.filter(block =>
        (block.tier > 0 || block.stage === 'traffic') && (!query || normalize(
          [local(block.title), local(block.benefit), ...(block.keywords ?? [])].join(' '),
        ).includes(query)));
      const next = variants[variants.indexOf(state.variant.key) + 1];
      const addition = state.comparison?.differences.find(diff => diff.from === state.variant.key);
      const onMap = new Set(state.variant.nodes.map(node => node.block));
      const candidates = [...new Set(state.variants?.[next]?.nodes.map(node => node.block) ?? [])]
        .filter(id => !onMap.has(id));
      const ranked = next && gm.engine.uplift
        ? gm.engine.uplift(state.brief, state.variant, candidates, catalog).slice(0, 5)
        : addition?.top ?? [];
      const suggested = (!query && next ? ranked : []).map(row => catalog.byId[row.block]).filter(Boolean);
      return libraryGroup('suggested', text('lib.suggested'), suggested, 'spark', 'var(--accent)') +
        catalog.stages.map(stage => libraryGroup(stage.id, label(stage), eligible.filter(block => block.stage === stage.id),
          stage.icon, stage.color)).join('') +
        (eligible.length ? '' : '<p class="gm-field-note">' + text('lib.empty') + '</p>');
    }

    function libraryHtml() {
      if (!isEditable()) return '<div class="gm-pane"><p class="gm-field-note">' + text('insp.readOnly') + '</p></div>';
      const count = state.variant.nodes.length;
      const limit = count >= 60 ? '<p class="gm-field-note">' + text('canvas.limit') + ' <a href="' +
        escape(root.dataset.telegram) + '">' + text('lib.limit.action') + '</a></p>' : '';
      return '<section class="gm-pane gm-library"><h2 tabindex="-1">' + text('tab.blocks') + '</h2>' + limit +
        '<input type="search" data-gm-p-block-filter value="' + escape(blockFilter) + '" aria-label="' +
        text('lib.search') + '" placeholder="' + text('lib.search') + '">' +
        '<div data-gm-p-library-groups>' + libraryGroups() + '</div></section>';
    }

    function priceLabel(row) {
      if (row.price.quote || !row.price.max) return text('cmp.quote');
      if (row.price.min === row.price.max) return amountText(row.price.min);
      return text('eco.range', { min: money(row.price.min), max: shortMoney(row.price.max) });
    }

    function paybackLabel(row) {
      return row.payback && !row.price.quote
        ? text('cmp.months', { n: numbers.format(row.payback) }) : text('cmp.paybackLong');
    }

    function comparisonHtml() {
      const comparison = state.comparison;
      if (!comparison) return '';
      const { economies, differences } = comparison;
      const omitted = text('cmp.noValue');
      const metric = (id, value) => '<div><dt>' + text('cmp.' + id) + '</dt><dd>' + value + '</dd></div>';
      const cards = ['base', 'boost', 'auto'].map(key => {
        const row = economies[key];
        return '<article class="gm-vcard" data-key="' + key + '"' + (state.variant.key === key ? ' data-active' : '') + '>' +
          '<div class="gm-vcard-head"><h3>' + text('v.' + key) + '</h3>' +
          (key === 'boost' ? '<small>' + text('v.recommended') + '</small>' : '') +
          '<span class="gm-vcard-growth">' + formatPct(row.growth) + '</span></div>' +
          '<p class="gm-vcard-revenue"><strong>' + amountText(row.revenue) + '</strong> <span>' + text('cmp.perMonth') + '</span></p>' +
          '<dl>' + metric('yearProfit', amountText(row.yearProfit)) + metric('price', priceLabel(row)) +
          metric('payback', paybackLabel(row)) +
          metric('launch', row.weeks.length ? text('cmp.weeks', { from: row.weeks[0], to: row.weeks[1] }) : omitted) +
          metric('leakLeads', numbers.format(Math.round(row.projectedLostLeads))) +
          metric('hours', row.hours ? '−' + text('eco.hours', { n: numbers.format(row.hours) }) : omitted) + '</dl>' +
          button('gm-text-button', text('cmp.show'), { variant: key },
            'aria-label="' + text('cmp.show') + ': ' + text('v.' + key) + '"') + '</article>';
      }).join('');
      const table = '<p class="gm-baseline">' + text('cmp.now', { money: amountText(economies.now.revenue),
        leads: numbers.format(Math.round(economies.now.projectedLostLeads)) }) + '</p>' +
        '<div class="gm-vcards" aria-label="' + text('tab.compare') + '">' + cards + '</div>';
      const diff = '<section class="gm-differences"><h3>' + text('cmp.differences') + '</h3>' +
        differences.map(row => '<article class="gm-difference"><h4>' + escape(row.title) + '</h4><strong>' +
          text('cmp.growth.month', { money: money(row.money) }) + '</strong><p>' + escape(row.text) + '</p>' +
          (row.top?.length ? '<ul>' + row.top.map(item => '<li>' + label(catalog.byId[item.block]) + '</li>').join('') + '</ul>' : '') +
          '</article>').join('') + '</section>';
      const guarantees = config.guarantees?.length ? '<section class="gm-proof"><h3>' + text('cmp.guarantees') +
        '</h3><ul>' + config.guarantees.map(item => '<li>' + escape(local(item)) + '</li>').join('') + '</ul></section>' : '';
      const reviews = config.reviews?.length ? '<section class="gm-proof"><h3>' + text('cmp.reviews') + '</h3>' +
        [...config.reviews].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map(item =>
          '<figure><blockquote>' + escape(local(item.text)) + '</blockquote><figcaption><a href="' +
          escape(item.url) + '" target="_blank" rel="noopener">' + escape(item.name) + '</a>' +
          (item.business ? ' · ' + escape(item.business) : '') + '</figcaption></figure>').join('') + '</section>' : '';
      const incomplete = economies.now.defaultsUsed.length && isEditable() && !state.example
        ? button('gm-text-button gm-defaults-note', text('brief.defaults'), { defaults: economies.now.defaultsUsed.includes('check') ? 2 : 3 }) : '';
      return '<section class="gm-pane gm-compare-pane"><h2 tabindex="-1">' + text('tab.compare') + '</h2>' +
        '<p class="gm-variant-description">' + text('v.' + state.variant.key + '.tagline') + '</p>' +
        (state.example ? button('button gm-own-map', text('mode.demo.back'), { mode: 'restart' }) : '') +
        (state.shared ? button('gm-secondary', text('act.saveShared'), { saveshared: '' }) : '') +
        table + incomplete + diff + guarantees + reviews + '</section>';
    }

    function settingInput(node, key) {
      const provider = catalog.providers[key];
      if (!provider) return '';
      const values = provider.options.filter(item => !item.locales || item.locales.includes(lang));
      const choice = node.settings?.[key] ?? provider.default?.[lang] ?? '';
      return provider.multiple
        ? '<fieldset class="gm-brief-field"><legend>' + label(provider) + '</legend><div class="gm-chip-list">' +
          values.map(option => button('gm-chip', label(option), { set: key, value: option.id },
            pressed(Array.isArray(choice) && choice.includes(option.id)) + (isEditable() ? '' : ' disabled'))).join('') +
          '</div></fieldset>'
        : '<label class="gm-setting-label">' + label(provider) + '<select data-gm-p-set="' + key + '"' +
          (isEditable() ? '' : ' disabled') + '>' + (!provider.default ? '<option value="">' + text('insp.provider.none') + '</option>' : '') +
          values.map(option => '<option value="' + option.id + '"' + (option.id === choice ? ' selected' : '') + '>' +
            label(option) + '</option>').join('') + '</select></label>';
    }

    function inspectorHtml() {
      const node = selected();
      if (!node) return '';
      const block = catalog.byId[node.block];
      const info = currentEconomy();
      const contribution = gm.engine.contribution(state.brief, state.variant, catalog).find(item => item.id === node.id);
      const connected = state.variant.edges.some(edge => edge.from === node.id || edge.to === node.id);
      const canUseSplit = list(node.settings?.paymentMethods).some(method => ['dolyami', 'split'].includes(method)) &&
        !state.variant.nodes.some(item => item.block === 'pay_split');
      const estimate = pricing[block.service]?.[info?.price.tier];
      const share = node.settings?.crmSystem === 'custom' ? 1 : block.share;
      const price = Array.isArray(estimate) ? t('eco.range', { min: money(estimate[0] * share), max: shortMoney(estimate[1] * share) }) :
        estimate ? money(estimate * share) : '';
      const effectMoney = contribution?.revenue > 0 ? text('insp.effect.money', { money: shortMoney(contribution.revenue) }) : '';
      const effectHours = block.fx.hours > 0 ? text('insp.effect.hours', {
        hours: numbers.format(block.fx.hours * (state.brief.hoursK || 1) * (connected ? 1 : .5)),
      }) : '';
      const targets = state.variant.nodes.filter(other => other.id !== node.id &&
        !state.variant.edges.some(edge => edge.from === node.id && edge.to === other.id));
      const replacements = catalog.blocks.filter(other =>
        other.stage === block.stage && other.id !== block.id && other.tier > 0);
      return '<section class="gm-pane gm-inspector"><div class="gm-inspector-heading">' + icon(block.icon) +
        '<h2 tabindex="-1">' + label(block) + '</h2></div>' +
        '<h3>' + text('insp.why') + '</h3><p>' + escape(node.note || local(block.benefit)) + '</p>' +
        (connected ? '' : '<p class="gm-field-note">' + text('canvas.orphan') + '</p>') +
        '<h3>' + text('insp.effect') + '</h3><p class="gm-inspector-effect">' +
        [effectMoney, effectHours].filter(Boolean).join('<br>') + (effectMoney || effectHours ? '' : effect(block) || text('insp.effect.none')) + '</p>' +
        (block.settingKeys?.length ? '<h3>' + text('insp.settings') + '</h3><div class="gm-settings">' +
          block.settingKeys.map(key => settingInput(node, key)).join('') + '</div>' : '') +
        (canUseSplit && isEditable() ? button('gm-secondary', text('insp.split'), { add: 'pay_split' }) : '') +
        '<h3>' + text('insp.built') + '</h3><p>' + (block.service
          ? text('insp.service.' + block.service) + '<br>' + (price ? text('insp.price', { price }) : text('insp.unpriced'))
          : text('insp.price.included')) + '</p>' +
        (isEditable() ? '<div class="gm-inspector-tools">' +
          (targets.length ? '<label>' + text('insp.connect') + '<select data-gm-p-connect><option value="">' +
            text('insp.provider.none') + '</option>' + targets.map(item =>
              '<option value="' + escape(item.id) + '">' + label(catalog.byId[item.block]) + '</option>').join('') + '</select></label>' : '') +
          (replacements.length ? '<label>' + text('insp.replace') + '<select data-gm-p-replace><option value="">' +
            text('insp.provider.none') + '</option>' + replacements.map(item =>
              '<option value="' + item.id + '">' + label(item) + '</option>').join('') + '</select></label>' : '') +
          button('gm-secondary gm-danger', text('insp.remove'), { delete: node.id }) +
          '</div>' : '<p class="gm-field-note">' + text('insp.readOnly') + '</p>') + '</section>';
    }

    function tabsHtml(active) {
      const ids = state.example ? ['compare'] : ['brief', 'blocks', 'compare', ...(selected() ? ['block'] : [])];
      const buttons = ids.map(id => button('gm-tab', text('tab.' + id), { tab: id },
        'id="gm-tab-' + id + '" role="tab" aria-selected="' + (id === active) +
        '" aria-controls="gm-tab-panel" tabindex="' + (id === active ? 0 : -1) + '"')).join('');
      const handles = sheetSizes.map((size, index) => button('gm-sheet-size',
        '<span aria-hidden="true"></span>', { size }, 'aria-label="' + text('panel.size.' + size) + '" ' +
        pressed(size === sheetSize) + ' style="--gm-sheet-notch:' + (index + 1) + '"')).join('');
      return '<div class="gm-sheet-controls" data-gm-p-sheet>' + handles + '</div><div class="gm-tabs" role="tablist" aria-label="' +
        text('panel.tabs') + '">' + buttons + '</div>';
    }

    function renderEconomy() {
      const row = currentEconomy();
      if (!row || state.phase !== 'map') {
        economy.replaceChildren();
        economyKey = '';
        lastRevenue = lastGrowth = lastLoss = null;
        clearTimeout(announce);
        cancelAnimationFrame(frame);
        return;
      }
      const current = state.comparison.economies.now;
      const identity = JSON.stringify([row.key, row.revenue, row.growth, row.losingNow, row.price, row.payback,
        region().currency, region().rate, economyOpen]);
      if (identity === economyKey) return;
      const old = [lastRevenue, lastGrowth, lastLoss];
      const latest = [row.revenue, row.growth, row.losingNow];
      lastRevenue = row.revenue;
      lastGrowth = row.growth;
      lastLoss = row.losingNow;
      economyKey = identity;
      const canGrow = current.key !== row.key;
      const summary = text(row.payback && !row.price.quote ? 'eco.preview' : 'eco.preview.noPayback', {
        variant: t('v.' + row.key),
        growth: formatPct(row.growth),
        months: row.payback ? t('cmp.months', { n: numbers.format(row.payback) }).replace(/^≈\s*/, '') : '',
      });
      const was = canGrow ? '<small>' + text('eco.was', { money: money(current.revenue) }) + '</small>' : '';
      const stats = '<dl class="gm-economy-stats"><div><dt>' + text('eco.revenue') + '</dt><dd><span data-gm-p-count="0">' +
        amountText(row.revenue) + '</span>' + was + '</dd></div><div class="gm-growth"><dt>' + text('eco.growth') +
        '</dt><dd data-gm-p-count="1">' + formatPct(row.growth) + '</dd></div><div class="gm-loss"><dt>' +
        text(row.key === 'now' ? 'eco.leaking' : 'eco.losing') + '</dt><dd data-gm-p-count="2">' +
        amountText(row.losingNow) + '</dd></div><div><dt>' + text('eco.payback') + '</dt><dd>' +
        (canGrow ? paybackLabel(row) : text('cmp.noValue')) + '</dd></div><div><dt>' + text('eco.build') +
        '</dt><dd>' + (canGrow ? priceLabel(row) : text('cmp.noValue')) + '</dd></div></dl>';
      const body = '<div class="gm-economy-content" data-open="' + economyOpen + '">' + stats +
        '<p class="gm-economy-footnote">' + text('eco.footnote') + '</p></div>';
      let visible = economy.querySelector('.gm-economy-visible');
      if (!visible) {
        economy.innerHTML = '<div class="gm-economy-visible"></div><p class="gm-sr" role="status" data-gm-p-announce></p>';
        visible = economy.querySelector('.gm-economy-visible');
      }
      const hidden = economy.querySelector('[data-gm-p-announce]');
      visible.innerHTML = button('gm-economy-toggle', summary + '<span aria-hidden="true">' + (economyOpen ? '▴' : '▾') + '</span>',
        { economy: '' }, 'aria-expanded="' + economyOpen + '"') + body;
      clearTimeout(announce);
      announce = setTimeout(() => {
        hidden.textContent = t('eco.announce', {
          variant: t('v.' + row.key), money: money(row.revenue), growth: numbers.format(Math.round(row.growth * 100)),
        });
        lastAnnouncement = Date.now();
      }, Math.max(120, 2000 - (Date.now() - lastAnnouncement)));
      cancelAnimationFrame(frame);
      if (!reduced.matches && latest.some((value, i) => old[i] !== value)) {
        const outputs = [...economy.querySelectorAll('[data-gm-p-count]')];
        const formats = [money, formatPct, money];
        const start = performance.now();
        const tick = now => {
          const progress = Math.min(1, (now - start) / 400);
          const weight = 1 - Math.pow(1 - progress, 3);
          outputs.forEach((output, index) => {
            const from = old[index] ?? 0;
            output.textContent = formats[index](from + weight * (latest[index] - from));
          });
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      }
    }

    function snapshotFocus(mount) {
      const focus = document.activeElement;
      if (!focus || !mount.contains(focus)) return '';
      if (focus.id) return '#' + CSS.escape(focus.id);
      for (const key of ['data-gm-p-add', 'data-gm-p-example', 'data-gm-p-mode', 'data-gm-p-main',
        'data-gm-p-step', 'data-gm-p-recalc', 'data-gm-p-additem', 'data-gm-p-size',
        'data-gm-p-variant', 'data-gm-p-set', 'data-gm-p-delete', 'data-gm-p-replace', 'data-gm-p-connect']) {
        if (focus.hasAttribute(key)) return '[' + key + '="' + CSS.escape(focus.getAttribute(key)) + '"]';
      }
      if (focus.hasAttribute('data-gm-p-field')) return '[data-gm-p-field="' +
        CSS.escape(focus.dataset.gmPField) + '"][data-gm-p-value="' + CSS.escape(focus.dataset.gmPValue) + '"]';
      return '';
    }

    function renderContent(force = false) {
      const tab = tabName();
      const focus = snapshotFocus(content);
      const scroll = content.querySelector('.gm-pane')?.scrollTop ?? 0;
      const needStep = state.phase === 'brief' || (state.phase === 'map' && tab === 'brief');
      if (needStep && !force) {
        const key = [state.phase, state.step, region().currency, region().rate].join();
        if (key === briefMountKey && content.querySelector('.gm-brief')) return;
        briefMountKey = key;
      }
      if (!needStep) briefMountKey = '';
      if (state.phase === 'brief') content.innerHTML = briefHtml();
      else if (state.phase === 'map') {
        const body = { brief: briefHtml, blocks: libraryHtml, compare: comparisonHtml, block: inspectorHtml }[tab]?.() ?? '';
        content.innerHTML = tabsHtml(tab) + '<div id="gm-tab-panel" class="gm-tab-panel" role="tabpanel" aria-labelledby="gm-tab-' +
          tab + '">' + body + '</div>';
      } else {
        content.replaceChildren();
      }
      if (force || previous.phase === state.phase && previous.tab === tab && previous.step === state.step) {
        const pane = content.querySelector('.gm-pane');
        if (pane) pane.scrollTop = scroll;
        if (focus) content.querySelector(focus)?.focus({ preventScroll: true });
      }
    }

    function render(next) {
      state = next;
      editing = !!next.briefDirty;
      const moved = state.phase !== previous.phase;
      const tab = tabName();
      if (moved) {
        overlay.innerHTML = overlayHtml();
        sheetSize = 'half';
        if (['choose', 'text', 'resume'].includes(state.phase)) furthestStep = 1;
      } else if (state.phase === 'scan') {
        const list = overlay.querySelector('ol');
        if (list && Number(list.dataset.index) !== Number(state.scanIndex)) {
          list.innerHTML = scanList();
          list.dataset.index = state.scanIndex ?? 0;
        }
      }
      if (tab !== previous.tab && tab === 'block' && sheetSize === 'closed') sheetSize = 'half';
      panel.dataset.sheet = sheetSize;
      if (state.phase === 'brief') furthestStep = Math.max(furthestStep, state.step || 1);
      renderContent();
      renderEconomy();
      if (moved && ['choose', 'resume', 'text'].includes(state.phase)) {
        overlay.querySelector('h2')?.focus({ preventScroll: true });
      } else if ((moved || previous.step !== state.step) && (state.phase === 'brief' || tab === 'brief')) {
        content.querySelector('h2')?.focus({ preventScroll: true });
      } else if (moved && state.phase === 'map') {
        content.querySelector('h2')?.focus({ preventScroll: true });
      } else if (state.phase === 'map' && previous.tab !== tab) {
        const selectedTab = content.querySelector('[aria-selected="true"]');
        if (tab !== 'block') selectedTab?.focus({ preventScroll: true });
      }
      previous = { phase: state.phase, tab, step: state.step };
    }

    function changed(values, rerender = false) {
      const edited = draft();
      Object.assign(edited, values);
      edited.filled ??= {};
      Object.entries(values).forEach(([field, value]) => {
        edited.filled[field] = Array.isArray(value) ? value.length > 0 : value !== '' && value !== null;
      });
      editing = true;
      const recalc = content.querySelector('[data-gm-p-recalc]');
      if (recalc) recalc.disabled = false;
      const error = content.querySelector('.gm-brief-error');
      if (error) error.hidden = true;
      if (state.phase === 'brief') overlay.innerHTML = overlayHtml();
      if (rerender) renderContent(true);
      emit('brief', { draft: edited });
    }

    function toggleList(field, id) {
      const old = draft()[field] ?? [];
      const newValues = old.includes(id) ? old.filter(value => value !== id) : [...old, id];
      if (field === 'pains' && newValues.length > 3) return;
      if (field === 'wishes' && id === 'advise' && newValues.includes('advise')) newValues.splice(0, newValues.length, 'advise');
      if (field === 'wishes' && id !== 'advise' && newValues.includes('advise')) newValues.splice(newValues.indexOf('advise'), 1);
      const main = field === 'sources'
        ? { mainSource: newValues.includes(draft().mainSource) ? draft().mainSource : newValues[0] ?? '' } : {};
      changed({ [field]: newValues, ...main }, true);
    }

    function setChoice(field, id) {
      if (field === 'category') {
        categoryFilter = '';
        if (draft().category === id) {
          renderContent(true);
          return;
        }
        changed({ category: id, niche: '', nicheCustom: '' }, true);
      } else {
        const numeric = field === 'repeatBand';
        const value = String(draft()[field]) === id && !['size'].includes(field) ? (numeric ? null : '') : numeric ? Number(id) : id;
        changed({ [field]: value }, true);
      }
    }

    function addItem(item) {
      const value = item.trim().slice(0, 100);
      const old = draft().items ?? [];
      if (!value || old.includes(value) || old.length >= 12) return;
      changed({ items: [...old, value] }, true);
      content.querySelector('[data-gm-p-input="items"]')?.focus({ preventScroll: true });
    }

    function stepValid(step) {
      const data = draft();
      if (step === 1) return data.category && data.models?.length;
      if (step === 3) return data.size;
      return step !== 4 || data.sources?.length || data.sourcesOther?.trim();
    }

    function formSubmit(event) {
      const type = event.target.dataset.gmPForm;
      if (!type) return;
      event.preventDefault();
      if (type === 'text') {
        const textarea = event.target.querySelector('textarea');
        if (textarea.value.trim()) emit('parse', { text: textarea.value });
        return;
      }
      const step = state.step || 1;
      if (!stepValid(step)) {
        const error = content.querySelector('.gm-brief-error');
        error.textContent = t(step === 4 ? 'brief.source.one' : 'brief.required');
        error.hidden = false;
        error.scrollIntoView({ block: 'nearest' });
        return;
      }
      if (step === 6) emit('analyze', { draft: draft() });
      else emit('step', { step: step + 1 });
    }

    function resizeSheet(size, focus = false) {
      sheetSize = size;
      panel.dataset.sheet = size;
      content.querySelectorAll('[data-gm-p-size]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.gmPSize === size));
      });
      if (focus) content.querySelector('[data-gm-p-size="' + size + '"]')?.focus();
    }

    function updateTextCounter(textarea) {
      overlay.querySelector('output').textContent = t('auto.counter', { n: numbers.format(textarea.value.length) });
      overlay.querySelector('button[type="submit"]').disabled = !textarea.value.trim();
    }

    function click(event) {
      const control = event.target.closest('button');
      if (!control || !root.contains(control) || control.disabled) return;
      const data = control.dataset;
      const node = selected();
      if (data.gmPMode) emit('mode', { mode: data.gmPMode });
      else if ('gmPImport' in data) emit('import');
      else if (data.gmPExample) {
        const textarea = overlay.querySelector('textarea');
        textarea.value = t('auto.example' + data.gmPExample + '.text');
        updateTextCounter(textarea);
        textarea.focus();
      } else if ('gmPSkip' in data) emit('skip');
      else if (data.gmPTab) {
        if (sheetSize === 'closed') resizeSheet('half');
        emit('tab', { tab: data.gmPTab });
      } else if (data.gmPSize) {
        if (event.detail === 0 || performance.now() - sheetSwipeAt > 300) resizeSheet(data.gmPSize);
      } else if (data.gmPStep) emit('step', { step: Number(data.gmPStep) });
      else if ('gmPRecalc' in data) emit('analyze', { draft: draft() });
      else if (data.gmPField) {
        if (data.gmPMulti) toggleList(data.gmPField, valueOf(control));
        else setChoice(data.gmPField, valueOf(control));
      } else if (data.gmPMain) changed({ mainSource: data.gmPMain }, true);
      else if (data.gmPAdditem) addItem(data.gmPAdditem);
      else if (data.gmPRemoveitem) changed({ items: draft().items.filter(item => item !== data.gmPRemoveitem) }, true);
      else if (data.gmPVariant) emit('variant', { key: data.gmPVariant });
      else if (data.gmPDefaults) {
        emit('tab', { tab: 'brief' });
        emit('step', { step: Number(data.gmPDefaults) });
      } else if ('gmPSaveshared' in data) emit('save-shared');
      else if (data.gmPAdd && isEditable()) emit('add', { block: data.gmPAdd });
      else if (data.gmPDelete && isEditable()) emit('delete', { ids: [data.gmPDelete] });
      else if (data.gmPSet && node && isEditable()) {
        const options = list(node.settings[data.gmPSet]);
        const id = valueOf(control);
        const values = options.includes(id) ? options.filter(value => value !== id) : [...options, id];
        emit('settings', { id: node.id, settings: { ...node.settings, [data.gmPSet]: values } });
      } else if ('gmPEconomy' in data) {
        economyOpen = !economyOpen;
        renderEconomy();
        economy.querySelector('[data-gm-p-economy]')?.focus({ preventScroll: true });
      }
    }

    function inputChanged(event) {
      const { target } = event;
      const { dataset, value } = target;
      if (target.id === 'gm-business-text') {
        updateTextCounter(target);
      } else if ('gmPCategoryFilter' in dataset) {
        categoryFilter = value;
        content.querySelector('[data-gm-p-category-options]').innerHTML = categoryOptions();
      } else if ('gmPBlockFilter' in dataset) {
        blockFilter = value;
        content.querySelector('[data-gm-p-library-groups]').innerHTML = libraryGroups();
      } else if (dataset.gmPInput === 'revenueBand') {
        const index = Number(value);
        const label = revenueBand(index);
        target.setAttribute('aria-valuetext', label);
        content.querySelector('[data-gm-p-revenue-value]').textContent = label;
        changed({ revenueBand: index === -1 ? null : index });
      } else if (dataset.gmPInput === 'check') {
        changed({ check: Number(value) > 0 ? Number(value) / region().rate : null, currency: region().currency });
      } else if (dataset.gmPInput === 'leads') {
        changed({ leads: value === '' || Number(value) < 0 ? null : Number(value) });
      } else if (dataset.gmPInput && dataset.gmPInput !== 'items') {
        changed({ [dataset.gmPInput]: value });
      }
    }

    function key(event) {
      const { target, key } = event;
      if (key === 'Enter' && target.dataset.gmPInput === 'items') {
        event.preventDefault();
        addItem(target.value);
      } else if (target.dataset.gmPTab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) {
        event.preventDefault();
        const tabs = [...content.querySelectorAll('[data-gm-p-tab]')];
        const current = tabs.indexOf(target);
        const index = key === 'Home' ? 0 : key === 'End' ? tabs.length - 1 :
          (current + (key === 'ArrowLeft' ? -1 : 1) + tabs.length) % tabs.length;
        tabs[index]?.click();
      } else if (key === 'Enter' && 'gmPCategoryFilter' in target.dataset) {
        event.preventDefault();
        content.querySelector('[data-gm-p-category-options] button')?.click();
      }
    }

    root.addEventListener('click', click);
    root.addEventListener('submit', formSubmit);
    root.addEventListener('input', inputChanged);
    root.addEventListener('keydown', key);
    root.addEventListener('change', ({ target }) => {
      const node = selected();
      if (!node || !isEditable()) return;
      if ('gmPConnect' in target.dataset && target.value) emit('connect', { from: node.id, to: target.value });
      if ('gmPReplace' in target.dataset && target.value) emit('replace', { id: node.id, block: target.value });
      if (target.matches('select[data-gm-p-set]')) {
        const settings = { ...node.settings, [target.dataset.gmPSet]: target.value };
        if (!target.value) delete settings[target.dataset.gmPSet];
        emit('settings', { id: node.id, settings });
      }
    });
    root.addEventListener('dragstart', event => {
      const control = event.target.closest('[data-gm-p-add][draggable]');
      if (!control || !isEditable() || !event.dataTransfer) return;
      event.dataTransfer.setData('application/x-devlarion-block', control.dataset.gmPAdd);
      event.dataTransfer.effectAllowed = 'copy';
    });
    root.addEventListener('toggle', event => {
      const group = event.target.dataset.gmPGroup;
      if (group && !blockFilter.trim()) {
        if (event.target.open) openGroups.add(group);
        else openGroups.delete(group);
      }
    }, true);
    panel.addEventListener('pointerdown', event => {
      const handle = event.target.closest('[data-gm-p-sheet]');
      if (!handle || !mobile.matches || !event.isPrimary) return;
      (event.target.closest('button') ?? handle).setPointerCapture(event.pointerId);
      sheetDrag = { pointerId: event.pointerId, y: event.clientY };
    });
    panel.addEventListener('pointerup', event => {
      if (sheetDrag?.pointerId !== event.pointerId) return;
      const delta = sheetDrag.y - event.clientY;
      if (Math.abs(delta) > 37) {
        sheetSwipeAt = performance.now();
        const next = Math.max(0, Math.min(2, sheetSizes.indexOf(sheetSize) + Math.sign(delta)));
        resizeSheet(sheetSizes[next]);
      }
      sheetDrag = null;
    });
    panel.addEventListener('pointercancel', () => { sheetDrag = null; });

    return { render };
  }

  gm.createPanel = createPanel;
})();
