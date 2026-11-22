(() => {
  'use strict';

  const gm = (typeof window === 'undefined' ? globalThis : window);
  const api = gm.DevlarionGM ??= {};
  const keys = ['now', 'base', 'boost', 'auto'];
  const flowStages = ['traffic', 'entry', 'capture', 'process', 'pay', 'deliver', 'retain'];
  const tiers = ['small', 'medium', 'large'];
  const bounds = [[0, 60], [8, 13], [14, 21], [20, 30]];
  const growthFloor = [0, .12, .30, .60];
  const growthCeiling = [0, .45, 1.2, 2.4];
  const trafficCeiling = [1, 1.25, 1.6, 2.2];
  const midpoints = [150000, 650000, 3000000, 12000000, 30000000];
  const sizeData = {
    solo: [.35, 600, .5, 0], team: [1, 700, 1, 0],
    mid: [3, 900, 2.2, 1], large: [9, 1100, 4, 2],
  };
  const intakeIds = ['phone', 'dm', 'site', 'table', 'crm'];
  const string = (value, max = 120) => typeof value === 'string' ? value.trim().slice(0, max) : '';
  const present = value => Array.isArray(value) ? value.length > 0 : value != null && value !== '';
  const intersects = (a = [], b = []) => a.some(value => b.includes(value));
  const record = value => !!value && typeof value === 'object' && !Array.isArray(value);
  const clamp = (value, low, high) => Math.max(low, Math.min(value, high));
  const idOf = value => typeof value === 'string' ? value : value.id;
  const unique = values => [...new Set(values)];
  const indexed = records => Object.fromEntries(records.map(row => [row.id, row]));
  const blocksById = catalog => catalog.byId ?? indexed(catalog.blocks);
  const categoriesById = catalog => catalog.categoryById ?? indexed(catalog.categories);

  function list(value, allowed, max = Infinity) {
    const ids = allowed.map(idOf);
    return Array.isArray(value) ? unique(value.filter(item => ids.includes(item))).slice(0, max) : [];
  }

  function normalizeBrief(raw = {}, catalog = api.catalog) {
    const input = record(raw) ? raw : {};
    const categories = categoriesById(catalog);
    const category = Object.hasOwn(categories, input.category) ? categories[input.category] : categories.other;
    const size = Object.hasOwn(sizeData, input.size) ? input.size : 'team';
    const [sizeFactor, hourRate, hoursK] = sizeData[size];
    const conv = category.conv;
    const check = Number.isFinite(input.check) && input.check > 0 ? Math.min(input.check, Number.MAX_SAFE_INTEGER) : category.check;
    const revenueBand = Number.isInteger(input.revenueBand) && input.revenueBand >= 0 && input.revenueBand <= 4
      ? input.revenueBand : null;
    const repeatBand = Number.isInteger(input.repeatBand) && input.repeatBand >= 0 && input.repeatBand <= 2
      ? input.repeatBand : null;
    const estimates = revenueBand === null ? category.leads * sizeFactor : midpoints[revenueBand] / (check * conv);
    const leads = clamp(Math.round(Number.isFinite(input.leads) && input.leads >= 0 ? input.leads : estimates), 10, Number.MAX_SAFE_INTEGER);
    const intakeRecords = indexed(catalog.intake);
    const intake = list(
      Array.isArray(input.intake) ? input.intake.map(id => Object.hasOwn(intakeRecords, id) ? intakeRecords[id].parseAs ?? id : id) : [],
      intakeIds,
    );
    const models = list(input.models, catalog.models);
    const sources = list(input.sources, catalog.sources);
    const brief = {
      name: string(input.name, 60),
      category: category.id,
      niche: category.niches.some(item => item.id === input.niche) ? input.niche : '',
      nicheCustom: category.id === 'other' ? string(input.nicheCustom, 100) : '',
      models: models.length ? models : [...category.models],
      items: Array.isArray(input.items) ? unique(input.items.map(item => string(item, 100)).filter(Boolean)).slice(0, 12) : [],
      check,
      cycle: ['day', 'week', 'month', 'long'].includes(input.cycle) ? input.cycle : category.cycle,
      size,
      revenueBand,
      leads,
      repeatBand,
      sources,
      mainSource: sources.includes(input.mainSource) ? input.mainSource : sources[0] ?? '',
      sourcesOther: string(input.sourcesOther, 120),
      intake,
      payment: list(input.payment, catalog.payment),
      pains: list(input.pains, catalog.pains, 3),
      wishes: list(input.wishes, catalog.wishes),
      timing: ['asap', 'soon', 'browsing'].includes(input.timing) ? input.timing : null,
      currency: /^[A-Z]{3}$/.test(input.currency) ? input.currency : 'RUB',
    };
    const filled = Object.fromEntries(Object.keys(brief).map(field => [
      field, typeof input.filled?.[field] === 'boolean' ? input.filled[field] : present(input[field]),
    ]));
    filled.category &&= Object.hasOwn(categories, input.category);
    filled.niche &&= !!brief.niche;
    filled.models &&= models.length > 0;
    filled.size &&= Object.hasOwn(sizeData, input.size);
    filled.check &&= Number.isFinite(input.check) && input.check > 0;
    filled.leads &&= Number.isFinite(input.leads) && input.leads >= 0;
    filled.revenueBand &&= revenueBand !== null;
    filled.repeatBand &&= repeatBand !== null;
    const leak0 = intake.length ? Math.max(.12, Math.min(...intake.map(id => intakeRecords[id].leak))) : .25;
    return {
      ...brief, filled, conv, margin: category.margin, repeat0: [.08, .33, .5][repeatBand] ?? category.repeat,
      leak0, hourRate, hoursK,
    };
  }

  function layout(variant, catalog = api.catalog, { force = false } = {}) {
    if (variant.edited && !force) return variant;
    const blocks = blocksById(catalog);
    const columns = Object.fromEntries([...flowStages, 'insight'].map(stage => [stage, []]));
    for (const node of variant.nodes) columns[blocks[node.block].stage].push(node);
    const order = new Map(catalog.blocks.map((block, index) => [block.id, index]));
    Object.values(columns).forEach(nodes => nodes.sort((a, b) => order.get(a.block) - order.get(b.block)));
    const step = nodes => nodes.length > 6 ? 72 : 96;
    const height = nodes => nodes.length ? (nodes.length - 1) * step(nodes) + (nodes.length > 6 ? 56 : 72) : 0;
    const tallest = Math.max(...flowStages.map(stage => height(columns[stage])));
    const coordinates = new Map();
    flowStages.forEach((stage, lane) => {
      const nodes = columns[stage];
      nodes.forEach((node, row) => coordinates.set(node.id, {
        x: 80 + lane * 280,
        y: Math.round((tallest - height(nodes)) / 2) + row * step(nodes),
      }));
    });
    const center = 80 + 3.5 * 280;
    columns.insight.forEach((node, i, list) => coordinates.set(node.id, {
      x: center + (i - (list.length - 1) / 2) * 240, y: -140,
    }));
    return { ...variant, nodes: variant.nodes.map(node => ({ ...node, ...coordinates.get(node.id) })) };
  }

  function makeVariant(key, ids, catalog) {
    const order = [...flowStages, 'insight'];
    const wanted = new Set(ids);
    const nodes = order.flatMap(stage => catalog.blocks
      .filter(block => block.stage === stage && wanted.has(block.id)))
      .map((block, index) => ({ id: 'n' + (index + 1), block: block.id, x: 0, y: 0, settings: {}, note: '' }));
    return { key, edited: false, nodes, edges: [] };
  }

  function connect(variant, catalog, leak) {
    const blocks = blocksById(catalog);
    const lanes = Object.fromEntries([...flowStages, 'insight'].map(stage => [stage, []]));
    for (const node of variant.nodes) lanes[blocks[node.block].stage].push(node);
    const nodesByBlock = Object.fromEntries(variant.nodes.map(node => [node.block, node]));
    const edges = [];
    const seen = new Set();
    function add(from, to, kind = 'flow') {
      if (!from || !to || from.id === to.id) return;
      const pair = from.id + '>' + to.id;
      if (seen.has(pair)) return;
      seen.add(pair);
      const edge = { id: 'e' + (edges.length + 1), from: from.id, to: to.id, kind };
      if (variant.key === 'now' && blocks[from.block].stage === 'entry') edge.leak = leak;
      edges.push(edge);
    }
    for (const [index, stage] of flowStages.entries()) {
      const nextStage = flowStages.slice(index + 1).find(id => lanes[id]?.length);
      for (const node of lanes[stage] ?? []) {
        const block = blocks[node.block];
        if (stage === 'retain') {
          if (block.fx.t > 0 || block.id === 'ret_referral') add(node, lanes.entry?.[0], 'loop');
          continue;
        }
        if (variant.key === 'now') {
          for (const target of lanes[nextStage] ?? []) add(node, target);
          continue;
        }
        const preferred = (block.next ?? []).map(id => nodesByBlock[id]).filter(Boolean);
        if (stage === 'pay') {
          preferred.filter(target => blocks[target.block].stage === 'pay').forEach(target => add(node, target));
          add(node, lanes[nextStage]?.[0]);
        } else if (node.block === 'ent_tgbot') {
          add(node, preferred[0] ?? lanes[nextStage]?.[0]);
        } else {
          for (const target of (preferred.length ? preferred : (lanes[nextStage] ?? [])).slice(0, 3)) add(node, target);
        }
      }
    }
    for (const node of lanes.insight ?? []) {
      add(node, nodesByBlock.proc_crm ?? lanes.process[0], 'data');
      add(node, lanes.pay[0], 'data');
    }
    return { ...variant, edges };
  }

  function buildNow(raw, catalog = api.catalog) {
    const brief = normalizeBrief(raw, catalog);
    const intake = catalog.intake.filter(row => brief.intake.includes(row.id)).flatMap(row => row.blocks);
    const payment = catalog.payment.filter(row => brief.payment.includes(row.id)).flatMap(row => row.blocks);
    const blocks = blocksById(catalog);
    const ids = [
      ...(brief.sources.length ? brief.sources : ['src_word']),
      ...(!intake.some(block => blocks[block].stage === 'entry') ? ['ent_dm'] : []),
      ...intake,
      ...(payment.length ? payment : ['pay_cash']),
    ];
    return layout(connect(makeVariant('now', ids, catalog), catalog, brief.leak0), catalog);
  }

  function applicable(block, brief) {
    const when = block.when ?? {};
    if (block.id === 'proc_kp' && brief.category === 'repair' && brief.niche === 'furniture') return true;
    return (!when.models || intersects(when.models, brief.models)) &&
      (!when.categories || when.categories.includes(brief.category)) &&
      (!when.sizes || when.sizes.includes(brief.size)) &&
      (!when.cycle || when.cycle.includes(brief.cycle)) &&
      (!when.pains || intersects(when.pains, brief.pains)) &&
      (!when.wishes || intersects(when.wishes, brief.wishes)) &&
      (!when.minCheck || brief.check >= when.minCheck);
  }

  function effectiveTier(block, brief) {
    return Math.max(1, block.tier - Number(intersects(block.when?.wishes, brief.wishes)));
  }

  function wishesFor(brief) {
    const byWish = {
      site: brief.models.includes('goods') ? 'ent_shop' : 'ent_site',
      bot: 'ent_tgbot', mini: 'ent_tgmini', app: 'ent_app', portal: 'del_portal',
      crm: 'proc_crm', ai: 'cap_ai', payments: 'pay_acq', broadcast: 'ret_broadcast',
    };
    return brief.wishes.filter(wish => Object.hasOwn(byWish, wish)).map(wish => byWish[wish]);
  }

  function entryFor(brief, level, sources, blocks) {
    const { models, pains, size, wishes } = brief;
    const entry = [models.includes('goods') ? 'ent_shop' : applicable(blocks.ent_site, brief) ? 'ent_site' : 'ent_landing'];
    if (intersects(models, ['booking', 'digital']) || pains.includes('slow_reply')) entry.push('ent_tgbot');
    if (level >= 2 && intersects(models, ['booking', 'goods', 'digital'])) entry.push('ent_tgmini');
    if (level >= 2 && models.includes('goods') && sources.includes('src_mp')) entry.push('ent_mpcard');
    if (level === 3) entry.push(['mid', 'large'].includes(size) || wishes.includes('app') ? 'ent_app' : 'ent_pwa', 'ent_maxbot');
    return entry;
  }

  function trimAndFill(brief, catalog, level, selected, protectedIds, candidates) {
    const [min, max] = bounds[level];
    const blocks = blocksById(catalog);
    const project = ids => connect(makeVariant(keys[level], ids, catalog), catalog, brief.leak0);
    const getProfit = ids => projection(brief, project(ids), catalog).profit;
    let ids = [...selected];
    while (ids.length > max) {
      const choices = ids.filter(id => !protectedIds.has(id));
      if (!choices.length) break;
      // This is equivalent to removing the smallest leave-one-out contribution for this graph.
      const drop = choices.reduce((best, id) => {
        const without = getProfit(ids.filter(current => current !== id));
        return without > best.profit ? { id, profit: without } : best;
      }, { id: null, profit: -Infinity });
      ids = ids.filter(id => id !== drop.id);
    }
    while (ids.length < min) {
      const choices = candidates.filter(block => block.tier > 0 && !ids.includes(block.id) &&
        !ids.some(id => blocks[id].replaces?.includes(block.id)) &&
        !block.replaces?.some(id => ids.includes(id)));
      if (!choices.length) break;
      const best = choices.reduce((result, block) => {
        const profit = getProfit([...ids, block.id]);
        return profit > result.profit ? { id: block.id, profit } : result;
      }, { id: null, profit: -Infinity });
      ids.push(best.id);
    }
    return project(ids);
  }

  function assemble(brief, catalog, level, previous) {
    const blocks = blocksById(catalog);
    const set = new Set(previous?.nodes.map(node => node.block) ?? []);
    const protectedIds = new Set(set);
    const add = (id, protect = false) => {
      set.add(id);
      if (protect) protectedIds.add(id);
    };
    const currentSources = brief.sources.length ? brief.sources : ['src_word'];
    const possibleSources = catalog.sources.filter(block =>
      block.tier > 0 && block.id !== 'src_insta' && !currentSources.includes(block.id) && applicable(block, brief));
    const recommended = possibleSources.sort((a, b) => b.fx.t - a.fx.t).slice(0, [0, 0, 2, 4][level]).map(idOf);
    const sources = [...currentSources, ...recommended];
    currentSources.forEach(id => add(id, true));
    recommended.forEach(id => add(id));
    entryFor(brief, level, sources, blocks).forEach(id => add(id, true));

    const candidates = catalog.blocks.filter(block => block.tier >= 1 &&
      !['entry', 'traffic'].includes(block.stage) && applicable(block, brief) &&
      (block.id !== 'proc_crm' || brief.size !== 'solo' || level >= 2));
    for (const block of candidates) {
      if (effectiveTier(block, brief) <= level) add(block.id);
    }
    for (const id of wishesFor(brief)) {
      if (id === 'ent_app' ? level >= 2 : effectiveTier(blocks[id], brief) <= level + 1) add(id, true);
    }
    if (brief.size === 'solo' && level === 1) {
      set.delete('proc_crm');
      add('proc_table', true);
      add('proc_notify', true);
    } else if (brief.size === 'solo') {
      add('proc_crm');
    }
    for (const id of [...set]) {
      if (!set.has(id)) continue;
      for (const replaced of blocks[id].replaces ?? []) {
        if (id === 'cap_ai' && replaced === 'cap_form') continue;
        set.delete(replaced);
        protectedIds.delete(replaced);
      }
    }
    const stageHas = stage => [...set].some(id => blocks[id].stage === stage);
    const ensure = (stage, fallback, preferred = fallback) => {
      const candidate = set.has(preferred) ? preferred : [...set].find(id => blocks[id].stage === stage);
      add(candidate ?? fallback, true);
    };
    ensure('capture', brief.models.includes('booking') ? 'cap_booking' : 'cap_form');
    ensure('process', 'proc_notify', level > 1 ? 'proc_crm' : 'proc_notify');
    ensure('pay', 'pay_link');
    ensure('retain', 'ret_review');
    ensure('insight', 'ins_metrika');
    const deliver = brief.models.includes('booking') ? 'del_remind' : brief.models.includes('digital') ? 'del_access' : 'del_status';
    if (level >= 2 || stageHas('deliver')) ensure('deliver', deliver);
    if (level >= 2 && set.has('proc_kp') && brief.niche === 'furniture') protectedIds.add('proc_kp');
    if (level >= 2 && set.has('cap_quiz') && brief.niche === 'furniture') protectedIds.add('cap_quiz');
    return trimAndFill(brief, catalog, level, set, protectedIds, candidates);
  }

  function buildVariant(raw, catalog = api.catalog, level = 1) {
    if (!Number.isInteger(level) || level < 1 || level > 3) throw new RangeError('variant');
    const brief = normalizeBrief(raw, catalog);
    let variant;
    for (let i = 1; i <= level; i += 1) variant = assemble(brief, catalog, i, variant);
    return layout(variant, catalog);
  }

  function buildAll(raw, catalog = api.catalog) {
    const brief = normalizeBrief(raw, catalog);
    const now = buildNow(brief, catalog);
    const base = assemble(brief, catalog, 1);
    const boost = assemble(brief, catalog, 2, base);
    const auto = layout(assemble(brief, catalog, 3, boost), catalog);
    const positions = new Map(auto.nodes.map(node => [node.block, { x: node.x, y: node.y }]));
    const align = variant => {
      const placed = layout(variant, catalog);
      const missing = placed.nodes.filter(node => !positions.has(node.block));
      const stageOf = node => blocksById(catalog)[node.block].stage;
      const affected = new Set(missing.map(stageOf));
      return { ...placed, nodes: placed.nodes.map(node => affected.has(stageOf(node)) ? node : { ...node, ...positions.get(node.block) }) };
    };
    return { now: align(now), base: align(base), boost: align(boost), auto };
  }

  function projection(brief, variant, catalog) {
    const level = keys.indexOf(variant.key);
    const nodes = level === 0 ? [] : variant.nodes;
    const blocks = blocksById(catalog);
    const connected = new Set(variant.edges.flatMap(edge => [edge.from, edge.to]));
    const counts = new Map();
    let trafficGain = 1;
    let lossFactor = 1;
    let convGain = 1;
    let checkGain = 1;
    let repeatGain = 0;
    let saved = 0;
    for (const node of nodes) {
      const block = blocks[node.block];
      const fx = block.fx;
      const duplicate = counts.has(node.block);
      counts.set(node.block, true);
      const multiplier = (duplicate ? .3 : 1) *
        (connected.has(node.id) || ['traffic', 'insight'].includes(block.stage) ? 1 : .5);
      const channels = node.settings?.broadcastChannels;
      const repeatBonus = Array.isArray(channels) && block.settings === 'broadcastChannels'
        ? Math.min(Math.max(0, unique(channels).length - 1) * .02, .06) : 0;
      trafficGain *= 1 + (fx.t ?? 0) * multiplier;
      lossFactor *= 1 - (fx.leak ?? 0) * multiplier;
      convGain *= 1 + (fx.conv ?? 0) * multiplier;
      checkGain *= 1 + (fx.check ?? 0) * multiplier;
      repeatGain += ((fx.repeat ?? 0) + repeatBonus) * multiplier;
      saved += (fx.hours ?? 0) * multiplier;
    }
    const leads = brief.leads * Math.min(trafficGain, trafficCeiling[level]);
    const leak = level === 0 ? brief.leak0 : Math.max(.03, brief.leak0 * lossFactor);
    const conv = Math.min(brief.conv * convGain, brief.conv * 2.2, .85);
    const check = brief.check * Math.min(checkGain, 1.4);
    const rep = Math.min(brief.repeat0 + repeatGain, .6);
    const revenue = leads * (1 - leak) * conv * check / (1 - rep);
    const hours = saved * brief.hoursK;
    return { leads, leak, conv, check, rep, revenue, hours, profit: revenue * brief.margin + hours * brief.hourRate };
  }

  function pricing(brief, variant, catalog, rates) {
    const level = keys.indexOf(variant.key);
    const blocks = blocksById(catalog);
    const tier = tiers[Math.min(2, sizeData[brief.size][3] + Number(level === 3 && brief.size !== 'solo'))];
    const services = new Map();
    const add = (id, share, tierName = tier) => {
      if (!id) return;
      const row = services.get(id) ?? { share: 0, tier: tierName };
      row.share = Math.min(1, row.share + share);
      services.set(id, row);
    };
    for (const node of level ? variant.nodes : []) {
      const block = blocks[node.block];
      const settings = node.settings ?? {};
      const bespokeCrm = /^(custom|own|своя)/i.test(settings.crmSystem ?? '');
      add(block.service, block.settings === 'crmSystem' && bespokeCrm ? 1 : block.share ?? 0);
      if (block.settings === 'aiModel' && /^(private|local|self|on-prem|на ваших)/i.test(settings.aiModel ?? '')) add('private-ai', 1, 'medium');
      if (block.settings === 'bookingSystem' && /^(custom|own|своя)/i.test(settings.bookingSystem ?? '')) add('mini', .5);
    }
    let min = 0;
    let max = 0;
    const quoteServices = [];
    for (const [service, row] of services) {
      const rate = rates?.[service]?.[row.tier];
      if (rate == null) {
        quoteServices.push(service);
        continue;
      }
      const [low, high] = Array.isArray(rate) ? rate : [rate, rate];
      min += low * row.share;
      max += high * row.share;
    }
    const bundle = services.size >= 4;
    const factor = bundle ? .9 : 1;
    return {
      min: Math.floor(min * factor / 5000) * 5000,
      max: Math.ceil(max * factor / 5000) * 5000,
      quote: quoteServices.length > 0, bundle, quoteServices, tier,
    };
  }

  function economy(raw, variant, catalog = api.catalog, ctx = {}) {
    const brief = normalizeBrief(raw, catalog);
    const level = keys.indexOf(variant.key);
    const projected = projection(brief, variant, catalog);
    const now = level === 0 ? projected : ctx.now ?? projection(brief, { key: 'now', nodes: [], edges: [] }, catalog);
    const growth = level === 0 ? 0 : clamp(projected.revenue / now.revenue - 1, growthFloor[level], growthCeiling[level]);
    const revenue = level === 0 ? projected.revenue : now.revenue * (1 + growth);
    const profit = revenue * brief.margin + projected.hours * brief.hourRate;
    const extraProfit = profit - now.profit;
    const price = pricing(brief, variant, catalog, ctx.pricing ?? ctx.estimator);
    const months = (price.min + price.max) / 2 / extraProfit;
    const payback = extraProfit > 0 && months <= 24 ? Math.max(1, Math.ceil(months * 2) / 2) : null;
    const weeks = [[], [2, 4], [4, 8], [8, 16]][level].map(week => week * (brief.size === 'large' ? 1.5 : 1));
    const leaking = now.leads * now.leak * now.conv * now.check * brief.margin;
    const losingNow = level === 0 ? leaking : ((ctx.auto?.revenue ?? revenue) - now.revenue) * brief.margin;
    return {
      key: variant.key, ...projected, revenue, profit, growth, yearProfit: extraProfit * 12, losingNow, leaking,
      lostLeads: now.leads * now.leak, projectedLostLeads: projected.leads * projected.leak,
      price, weeks, payback, defaultsUsed: ['check', 'leads', 'repeatBand'].filter(field => !brief.filled[field]),
    };
  }

  function contribution(raw, variant, catalog = api.catalog) {
    const brief = normalizeBrief(raw, catalog);
    const before = projection(brief, variant, catalog);
    return variant.nodes.map(node => {
      const after = projection(brief, {
        ...variant, nodes: variant.nodes.filter(item => item.id !== node.id),
        edges: variant.edges.filter(edge => edge.from !== node.id && edge.to !== node.id),
      }, catalog);
      return { id: node.id, block: node.block, money: before.profit - after.profit, revenue: before.revenue - after.revenue };
    });
  }

  function uplift(raw, variant, candidateIds, catalog = api.catalog) {
    const brief = normalizeBrief(raw, catalog);
    const key = variant.key === 'now' ? 'base' : variant.key;
    const nodes = variant.key === 'now' ? [] : variant.nodes;
    const before = projection(brief, { ...variant, key, nodes }, catalog);
    const blocks = blocksById(catalog);
    const oldNodes = new Map();
    for (const node of variant.nodes) {
      if (!oldNodes.has(node.block)) oldNodes.set(node.block, node);
    }
    const usedIds = new Set(variant.nodes.map(node => node.id));
    let newId = 'candidate';
    while (usedIds.has(newId)) newId += '_';
    return unique(candidateIds).filter(id => Object.hasOwn(blocks, id) && !oldNodes.has(id)).map(block => {
      const generated = connect(makeVariant(key, [...oldNodes.keys(), block], catalog), catalog, brief.leak0);
      const candidate = generated.nodes.find(node => node.block === block);
      const ids = new Map(generated.nodes.map(node => [node.id, node.id === candidate.id ? newId : oldNodes.get(node.block)?.id]));
      const newEdges = generated.edges.filter(edge => edge.from === candidate.id || edge.to === candidate.id)
        .map(edge => ({ ...edge, from: ids.get(edge.from), to: ids.get(edge.to) }));
      const after = projection(brief, {
        ...variant, key, nodes: [...nodes, { ...candidate, id: newId }], edges: [...variant.edges, ...newEdges],
      }, catalog);
      return { block, money: after.profit - before.profit, revenue: after.revenue - before.revenue };
    }).sort((a, b) => b.money - a.money);
  }

  function compare(raw, variants, catalog = api.catalog, ctx = {}) {
    const brief = normalizeBrief(raw, catalog);
    const now = economy(brief, variants.now, catalog, ctx);
    const auto = economy(brief, variants.auto, catalog, { ...ctx, now });
    const economies = { now };
    for (const key of ['base', 'boost', 'auto']) {
      economies[key] = economy(brief, variants[key], catalog, { ...ctx, now, auto });
    }
    const lang = ctx.lang === 'en' ? 'en' : 'ru';
    const number = new Intl.NumberFormat(lang, { maximumFractionDigits: 0 }).format;
    const money = ctx.money ?? new Intl.NumberFormat(lang, { currency: 'RUB', style: 'currency', maximumFractionDigits: 0 }).format;
    const titleOf = id => {
      const title = blocksById(catalog)[id].title[lang];
      return lang === 'ru' ? title.replace(/^[А-ЯЁ](?=[а-яё])/, first => first.toLowerCase()) : title;
    };
    const differences = keys.slice(0, -1).map((from, index) => {
      const to = keys[index + 1];
      const first = economies[from];
      const next = economies[to];
      const previous = new Set(variants[from].nodes.map(node => node.block));
      const additions = unique(variants[to].nodes.map(node => node.block)).filter(id => !previous.has(id));
      const top = uplift(brief, variants[from], additions, catalog).slice(0, 3);
      const blockTitles = top.map(item => titleOf(item.block));
      const gap = (next.revenue - first.revenue) * brief.margin;
      const value = index === 0 ? now.leaking : gap;
      const values = {
        lostLeads: number(now.lostLeads), moneyLost: money(now.leaking), gap: money(gap),
        gapYear: money(gap * 12), hoursGap: number(Math.max(0, next.hours - first.hours)),
        top1: blockTitles[0] ?? '', top2: blockTitles[1] ?? '', top3: blockTitles[2] ?? '',
      };
      const { title, text } = differenceText(index, lang, values, gap, now, blockTitles);
      return { from, to, title, text, money: value, top, values };
    });
    return { economies, differences };
  }

  function differenceText(index, lang, v, gap, now, titles) {
    const keysByPair = [
      ['diff.now.title', 'diff.now.body'],
      ['diff.base.title', 'diff.base.body'],
      ['diff.boost.title', 'diff.boost.body'],
    ];
    const [titleKey, bodyKey] = keysByPair[index];
    const localized = api.copy?.[lang];
    const variant = lang === 'ru' ? ['Оставить как есть', 'Остановиться на «Фундаменте»', 'Не включать «Автопилот»']
      : ['Leave things as they are', 'Stop at Foundation', 'Skip Autopilot'];
    const title = localized?.[titleKey] ?? variant[index];
    const quote = value => lang === 'ru' ? '„' + value + '“' : '“' + value + '”';
    const names = titles.map(quote).join(', ');
    if (index === 2 && gap < .03 * now.revenue) {
      return { title, text: localized?.['diff.boost.small'] ?? (lang === 'ru'
        ? 'Для вашего масштаба «Ускорения» хватает с запасом. К «Автопилоту» можно вернуться, когда поток обращений вырастет.'
        : 'Momentum covers your current scale. Revisit Autopilot as your enquiry volume grows.') };
    }
    if (localized?.[bodyKey] && titles.length >= (index === 0 ? 3 : index === 1 ? 2 : 1)) {
      return { title, text: localized[bodyKey].replace(/\{(\w+)\}/g, (_, field) => v[field] ?? '') };
    }
    const sentence = lang === 'ru' ? [
      'Каждый месяц ≈ ' + v.lostLeads + ' заявок уходят без ответа. Это ≈ ' + v.moneyLost + ' недополученной прибыли.',
      '«Ускорение» добавляет ≈ ' + v.gap + ' прибыли в месяц, то есть ' + v.gapYear + ' за год.',
      'Разница с «Ускорением» ≈ ' + v.gap + ' в месяц. Освобождается ещё ≈ ' + v.hoursGap + ' часов вашего времени.',
    ] : [
      'Around ' + v.lostLeads + ' enquiries go unanswered each month. That is about ' + v.moneyLost + ' in lost profit.',
      'Momentum adds around ' + v.gap + ' in monthly profit, or ' + v.gapYear + ' a year.',
      'Autopilot adds around ' + v.gap + ' a month compared with Momentum. It also frees up about ' + v.hoursGap + ' of your hours.',
    ];
    return { title, text: sentence[index] + (names ? (lang === 'ru' ? ' Основные блоки: ' : ' Main blocks: ') + names + '.' : '') };
  }

  const digits = '\\d+(?:[ \\u202f\\u00a0]\\d{3})*(?:[.,]\\d+)?';
  const units = 'тыс[а-я]*|т\\.р\\.?|млн|[кk]|thousand|million|m';
  const quantifier = '(?:около|примерно|порядка|about|around|approximately|~)?\\s*';
  const amount = '(' + digits + ')(?:\\s*(' + units + ')(?![a-zа-я]))?';
  const englishDigits = /^(?:\d{1,3},)+\d{3}$/;
  function readAmount(value, unit = '') {
    const clean = value.replace(/\s+/g, '');
    const numeric = Number(englishDigits.test(clean) ? clean.replace(/,/g, '') : clean.replace(',', '.'));
    const million = /^(млн|million|m)$/.test(unit);
    return numeric * (million ? 1000000 : unit ? 1000 : 1);
  }

  function parseText(value, catalog = api.catalog, lang = 'ru') {
    const original = string(value, 2000);
    const text = original.toLocaleLowerCase(lang).replaceAll('ё', 'е').replace(/[\u00a0\u202f]/g, ' ');
    const brief = {};
    const matches = keywords => (keywords ?? []).filter(keyword =>
      text.includes(keyword.toLocaleLowerCase(lang).replaceAll('ё', 'е')));
    let score = 0;
    for (const category of catalog.categories) {
      for (const niche of category.niches) {
        const current = matches(niche.keywords).length;
        if (current <= score) continue;
        brief.category = category.id;
        brief.niche = niche.id;
        score = current;
      }
    }
    const modelPatterns = {
      booking: /запис|при[её]м|сеанс|barber|salon|appointment|book(?:ing)?\b/,
      goods: /товар|магазин|доставк|склад|\bshop|\bproducts?\b|\bretail\b|\bwarehouse/,
      digital: /курс|онлайн[- ]школ|вебинар|гайд|подписчик.{0,120}оплат|\b(?:courses?|webinars?|digital products?)\b/,
      subscription: /абонемент|подписк|ежемесячн|subscription|membership/,
      b2b: /(?:^|[^а-я])ооо(?:[^а-я]|$)|компани|юрлиц|тендер|\bb2b\b|corporate clients|tenders?/,
      services: /услуг|\bservices?\b/,
    };
    const models = Object.keys(modelPatterns).filter(model => modelPatterns[model].test(text));
    if (models.length || brief.category) brief.models = models.length ? models : [...categoriesById(catalog)[brief.category].models];
    const names = original.slice(0, 100).match(/«([^»]{1,60})»|“([^”]{1,60})”|"([^"]{1,60})"/);
    if (names) brief.name = names[1] ?? names[2] ?? names[3];
    const checkLabel = '(?:средн[а-я]*\\s+чек|чек|стоимост[а-я]*|average (?:order|ticket)|order value|price|jobs? start at|(?:^|\\s)от)';
    const check = text.match(new RegExp(checkLabel + '\\s*(?:от|from)?\\s*' + quantifier + '([£$€₽₸])?\\s*' + amount, 'u'));
    if (check) {
      brief.check = readAmount(check[2], check[3]);
      const currencies = { '£': 'GBP', '$': 'USD', '€': 'EUR', '₽': 'RUB', '₸': 'KZT' };
      if (check[1]) brief.currency = currencies[check[1]];
    }
    const revenue = text.match(new RegExp('(?:оборот[а-я]*|turnover|(?:monthly )?revenue)\\s*' + quantifier + amount, 'u'));
    if (revenue) brief.revenueBand = [300000, 1000000, 5000000, 20000000, Infinity]
      .findIndex(limit => readAmount(revenue[1], revenue[2]) < limit);
    const flowWords = 'клиент[а-я]*|заяв[а-я]*|заказ[а-я]*|стриж[а-я]*|запис[а-я]*|обращ[а-я]*|clients?|enquir(?:y|ies)|leads?|customers?|orders?|bookings?|haircuts?|cuts?';
    const period = 'в месяц|в день|per month|a month|monthly|per day|a day|daily';
    const flow = '(?:' + flowWords + ')(?![a-zа-я])';
    const range = '(' + digits + ')(?:\\s*[-–—]\\s*(' + digits + '))?';
    const measure = range + '(?:\\s*(' + units + ')(?![a-zа-я]))?';
    const volume = text.match(new RegExp(measure + '\\s+' + flow + '(?:\\s+(' + period + '))?', 'u'))
      ?? text.match(new RegExp('(' + period + ')\\s*' + quantifier + measure + '\\s+' + flow, 'u'))?.map((item, index, match) =>
        index === 1 ? match[2] : index === 2 ? match[3] : index === 3 ? match[4] : index === 4 ? match[1] : item)
      ?? text.match(new RegExp('(?:^|[,;:.]\\s+)' + quantifier + measure + '\\s+(' + period + ')(?![a-zа-я])', 'u'));
    if (volume) {
      const lower = readAmount(volume[1], volume[3]);
      const upper = volume[2] ? readAmount(volume[2], volume[3]) : lower;
      brief.leads = (lower + upper) / 2 * (/день|day|daily/.test(volume[4] ?? '') ? 26 : 1);
    }
    const employees = text.match(/(\d+)\s*(?:мастер[а-я]*|сотрудник[а-я]*|человек|менеджер[а-я]*|employees?|staff|barbers?|people|managers?)(?![a-zа-я])/u);
    if (employees) brief.size = Number(employees[1]) === 1 ? 'solo' : Number(employees[1]) <= 10 ? 'team' : Number(employees[1]) <= 50 ? 'mid' : 'large';
    for (const field of ['sources', 'intake', 'payment', 'pains', 'wishes']) {
      const records = catalog[field].filter(row => matches(row.keywords).length);
      const values = unique(records.map(row => row.parseAs ?? row.id)).slice(0, field === 'pains' ? 3 : Infinity);
      if (values.length) brief[field] = values;
    }
    if (brief.sources) brief.mainSource = brief.sources[0];
    return { brief, detected: Object.keys(brief) };
  }

  const safeId = value => typeof value === 'string' && /^[\w-]{1,100}$/.test(value);
  const validDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
  function migrate(doc, catalog = api.catalog) {
    if (!record(doc) || doc.format !== 'devlarion.growthmap') throw new Error('invalid');
    if (Number.isInteger(doc.version) && doc.version > 1) throw new Error('newer');
    if ((doc.version !== undefined && doc.version !== 1) || !safeId(doc.id) || !record(doc.brief) ||
      !keys.includes(doc.active) || !record(doc.variants) || !['ru', 'en'].includes(doc.lang) ||
      !['manual', 'text', 'ai'].includes(doc.source) || !validDate(doc.createdAt) || !validDate(doc.updatedAt)) {
      throw new Error('invalid');
    }
    const blocks = blocksById(catalog);
    const variants = Object.fromEntries(keys.map(key => {
      const variant = doc.variants[key];
      if (!record(variant) || variant.key !== key || !Array.isArray(variant.nodes) || !Array.isArray(variant.edges) ||
        typeof variant.edited !== 'boolean' || variant.nodes.length > 60 || variant.edges.length > 120) throw new Error('invalid');
      const nodeIds = new Set();
      const nodes = variant.nodes.filter(node => {
        if (!record(node) || !safeId(node.id) || typeof node.block !== 'string' ||
          !Number.isFinite(node.x) || !Number.isFinite(node.y) || nodeIds.has(node.id) ||
          !record(node.settings) || typeof node.note !== 'string') throw new Error('invalid');
        nodeIds.add(node.id);
        return Object.hasOwn(blocks, node.block);
      });
      const kept = new Set(nodes.map(node => node.id));
      const edgeIds = new Set();
      const edges = variant.edges.filter(edge => {
        if (!record(edge) || !safeId(edge.id) || !nodeIds.has(edge.from) || !nodeIds.has(edge.to) ||
          edge.from === edge.to || !['flow', 'loop', 'data'].includes(edge.kind) || edgeIds.has(edge.id)) throw new Error('invalid');
        edgeIds.add(edge.id);
        return kept.has(edge.from) && kept.has(edge.to);
      });
      return [key, { ...variant, nodes, edges }];
    }));
    return { ...doc, ...(doc.version === undefined ? {} : { version: 1 }), variants };
  }

  const demoBrief = Object.freeze({
    name: '', category: 'food', niche: 'coffee', size: 'team', models: ['goods'], check: 450,
    sources: ['src_maps', 'src_insta'], mainSource: 'src_maps', payment: ['terminal'], pains: ['no_repeat'],
  });

  api.engine = Object.freeze({
    normalizeBrief, buildNow, buildVariant, buildAll, economy, compare,
    layout, contribution, uplift, parseText, migrate, demoBrief,
    buildDemo: (catalog = api.catalog) => buildAll(demoBrief, catalog),
  });
})();
