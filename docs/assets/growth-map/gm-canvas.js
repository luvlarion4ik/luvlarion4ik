(() => {
  'use strict';

  const gm = window.DevlarionGM = window.DevlarionGM || {};
  const SVG = 'http://www.w3.org/2000/svg';
  const nodeWidth = 216;
  const edgeInset = 400;
  const laneX = order => 80 + order * 280;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const snap = value => Math.round(value / 8) * 8;
  const point = (x, y) => ({ x, y });
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const byId = entries => Array.isArray(entries) ? Object.fromEntries(entries.map(entry => [entry.id, entry])) : entries;
  const position = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; };
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent('gm:' + name, { detail }));
  const html = (tag, className, content) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content != null) element.textContent = content;
    return element;
  };
  const attrs = (element, properties) => {
    for (const [name, value] of Object.entries(properties)) element.setAttribute(name, value);
    return element;
  };
  const svg = (tag, properties = {}) => attrs(document.createElementNS(SVG, tag), properties);
  const midpoint = (a, b) => point((a.x + b.x) / 2, (a.y + b.y) / 2);
  const curve = (start, end) => {
    const dx = Math.max(60, Math.abs(end.x - start.x) * .45);
    return `M${start.x} ${start.y} C${start.x + dx} ${start.y},${end.x - dx} ${end.y},${end.x} ${end.y}`;
  };

  gm.createCanvas = (stage, { lang, catalog, t }) => {
    const blocks = byId(catalog.blocks);
    const stageData = byId(catalog.stages);
    const mainStages = ['traffic', 'entry', 'capture', 'process', 'pay', 'deliver', 'retain'];
    const stages = [...mainStages, 'insight'];
    const colors = ['#7aa2ff', '#8b7bff', '#c07bff', '#ff7bc0', '#ffae6b', '#f5d76b', '#6be0a8', '#6bd5e0'];
    const shade = key => stageData?.[key]?.color || colors[stages.indexOf(key)] || colors[0];
    const blockOf = node => blocks[node.block];
    const stageOf = node => blockOf(node).stage;
    const orderOf = node => stages.indexOf(stageOf(node));
    const titleOf = node => blockOf(node).title[lang];
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = matchMedia('(max-width: 899px), (pointer: coarse)');
    const activePointers = new Map();
    const views = new Map();
    const links = new Map();
    const adjacency = new Map();
    const seen = new Set();
    const prefix = 'gm-edge-' + Math.random().toString(36).slice(2);
    let serial = 0;
    let nodes = [];
    let edges = [];
    let graph;
    let meta = {};
    let bounds;
    let camera = { x: 0, y: 0, scale: 1 };
    let rotation = { x: 55, z: -35 };
    let selected = new Set();
    let selectedEdge = null;
    let volume = false;
    let listing = false;
    let localFit = true;
    let interaction = null;
    let space = false;
    let frame = 0;
    let visible = true;
    let mapPointer = null;
    let draggingBlock = null;
    let cameraAnimation;
    let newBadgeTimeout;

    const background = html('div', 'gm-bg');
    const world = html('div', 'gm-world');
    const lanes = html('div', 'gm-lanes');
    const connections = svg('svg', { class: 'gm-edges', 'aria-hidden': 'true' });
    const defs = svg('defs');
    const rails = svg('g');
    const effects = svg('g');
    const trace = svg('path', { class: 'gm-connection-trace', visibility: 'hidden' });
    connections.append(defs, rails, effects, trace);
    const guides = html('div', 'gm-guides');
    const guideX = html('i', 'gm-guide-x');
    const guideY = html('i', 'gm-guide-y');
    guideX.hidden = guideY.hidden = true;
    guides.append(guideX, guideY);
    const shadows = html('div', 'gm-node-shadows');
    const nodeList = html('div', 'gm-nodes');
    attrs(nodeList, { role: 'list', 'aria-label': t('canvas.label') });
    const edgeAction = html('button', 'gm-edge-action', '×');
    edgeAction.type = 'button';
    edgeAction.hidden = true;
    edgeAction.setAttribute('aria-label', t('canvas.disconnect'));
    edgeAction.title = t('canvas.disconnect');
    world.append(lanes, connections, guides, shadows, nodeList, edgeAction);
    const minimap = html('div', 'gm-minimap');
    const miniSvg = svg('svg', { viewBox: '0 0 160 100', 'aria-hidden': 'true' });
    const miniNodes = svg('g');
    const miniWindow = svg('rect', { class: 'gm-mini-window', rx: 3 });
    minimap.setAttribute('aria-hidden', 'true');
    miniSvg.append(miniNodes, miniWindow);
    minimap.append(miniSvg);
    const listView = html('div', 'gm-linear-list');
    listView.hidden = true;
    const empty = html('div', 'gm-empty');
    empty.hidden = true;
    const restore = html('button', 'gm-canvas-restore', t('canvas.restore'));
    restore.type = 'button';
    empty.append(html('p', null, t('canvas.empty')), restore);
    const selectionBox = html('div', 'gm-selection-box');
    const ghost = html('div', 'gm-drop-ghost');
    selectionBox.hidden = ghost.hidden = true;
    const hud = html('div', 'gm-hud');
    hud.append(empty);
    for (const decorative of [background, lanes, shadows, guides, selectionBox, ghost]) decorative.setAttribute('aria-hidden', 'true');
    stage.append(background, world, minimap, listView, hud, selectionBox, ghost);
    if (!stage.hasAttribute('tabindex')) stage.tabIndex = 0;
    attrs(stage, { role: 'application', 'aria-roledescription': t('canvas.label') });

    const laneElements = new Map();
    for (const [order, key] of stages.entries()) {
      const lane = html('div', 'gm-lane');
      lane.dataset.stage = key;
      lane.style.setProperty('--gm-color', shade(key));
      const heading = html('div', 'gm-lane-heading');
      heading.innerHTML = gm.icon(stageData?.[key]?.icon || 'layers');
      heading.append(html('span', null, t(key)));
      const description = stageData?.[key]?.description?.[lang] || t('stage.' + key + '.description');
      lane.append(heading, html('div', 'gm-lane-caption', description));
      lane.style.left = (key === 'insight' ? laneX(2) : laneX(order) - 16) + 'px';
      lanes.append(lane);
      laneElements.set(key, lane);
    }

    function sizeWorld() {
      const base = nodes.filter(node => stageOf(node) !== 'insight');
      const minY = Math.min(0, ...base.map(node => node.y));
      const maxY = Math.max(180, ...base.map(node => node.y + views.get(node.id).h));
      const top = minY - 66;
      for (const key of mainStages) {
        const lane = laneElements.get(key);
        lane.style.top = top + 'px';
        lane.style.height = (maxY - top + 20) + 'px';
      }
      const insight = laneElements.get('insight');
      const insightNodes = nodes.filter(node => stageOf(node) === 'insight');
      insight.hidden = !insightNodes.length;
      if (insightNodes.length) {
        const left = Math.min(...insightNodes.map(node => node.x)) - 16;
        const top = Math.min(...insightNodes.map(node => node.y)) - 50;
        const right = Math.max(...insightNodes.map(node => node.x + nodeWidth)) + 16;
        insight.style.width = (right - left) + 'px';
        insight.style.height = '139px';
        position(insight, left, top);
      }
      bounds = {
        left: Math.min(laneX(0) - 16, ...nodes.map(node => node.x - 16)),
        right: Math.max(laneX(6) + nodeWidth + 16, ...nodes.map(node => node.x + nodeWidth + 16)),
        top: Math.min(top, ...insightNodes.map(node => node.y - 50)),
        bottom: maxY + 145,
        floor: maxY + 33
      };
      const { left, right, bottom, top: high } = bounds;
      const width = right - left + edgeInset * 2;
      const height = bottom - high + edgeInset * 2;
      attrs(connections, { width, height, viewBox: `${left - edgeInset} ${high - edgeInset} ${width} ${height}` });
      connections.style.width = width + 'px';
      connections.style.height = height + 'px';
      position(connections, left - edgeInset, high - edgeInset);
      updateMinimap();
    }

    function nodeHeight(key) {
      return nodes.filter(node => stageOf(node) === key).length > 6 ? 56 : 72;
    }

    function effectOf(node) {
      const fx = blockOf(node).fx;
      const key = ['t', 'leak', 'conv', 'repeat', 'check', 'hours'].find(name => fx?.[name]);
      return key ? t('fx.' + key, { n: Math.round(fx[key] * (key === 'hours' ? 1 : 100)) }) : '';
    }

    function linkedTitles(id) {
      const linked = new Set();
      for (const link of adjacency.get(id) || []) linked.add(link.from === id ? link.to : link.from);
      return [...linked].map(target => titleOf(views.get(target).node)).join(', ');
    }

    function syncNodeView(view, isNew) {
      const { el, shadow, node, h } = view;
      const block = blockOf(node);
      position(el, node.x, node.y);
      position(shadow, node.x, node.y);
      el.style.setProperty('--gm-color', shade(block.stage));
      el.style.setProperty('--gm-lift', ((orderOf(node) + 1) * 12) + 'px');
      shadow.style.setProperty('--gm-color', shade(block.stage));
      el.style.height = shadow.style.height = h + 'px';
      el.classList.toggle('is-compact', h === 56);
      const orphan = !adjacency.get(node.id)?.size;
      el.classList.toggle('is-orphan', orphan);
      el.classList.toggle('is-leaking', (adjacency.get(node.id) && [...adjacency.get(node.id)].some(edge => edge.from === node.id && edge.leak > 0)) || false);
      view.title.textContent = block.title[lang];
      const settingKey = block.settings;
      const settingValue = settingKey && node.settings?.[settingKey];
      view.subtitle.textContent = node.note || (typeof settingValue === 'string' && settingValue) || block.benefit[lang];
      const effect = graph?.key === 'now' ? '' : effectOf(node);
      view.effect.hidden = !effect;
      view.effect.textContent = effect;
      view.badge.textContent = graph?.key !== 'now' && meta.existing?.has(block.id || node.block) ? t('canvas.existing') : isNew ? t('canvas.new') : '';
      view.badge.classList.toggle('is-new', isNew);
      view.badge.hidden = !view.badge.textContent;
      const list = linkedTitles(node.id);
      el.setAttribute('aria-label', [t(block.stage) + ': ' + block.title[lang], effect, list && t('canvas.connections', { nodes: list }), orphan && t('canvas.orphan')].filter(Boolean).join('. '));
    }

    function createNode(node, h) {
      const key = stageOf(node);
      const el = html('div', 'gm-node');
      el.dataset.node = node.id;
      el.dataset.stage = key;
      attrs(el, { role: 'listitem', tabindex: 0 });
      const face = html('div', 'gm-node-face');
      const icon = html('span', 'gm-node-icon');
      icon.innerHTML = gm.icon(blockOf(node).icon);
      const text = html('div', 'gm-node-text');
      const title = html('span', 'gm-node-title');
      const subtitle = html('span', 'gm-node-subtitle');
      text.append(title, subtitle);
      const effect = html('span', 'gm-node-effect');
      const badge = html('span', 'gm-node-badge');
      face.append(icon, text, effect, badge);
      for (const direction of ['in', 'out']) {
        const port = html('span', 'gm-port gm-port-' + direction);
        port.dataset.port = direction;
        port.setAttribute('aria-hidden', 'true');
        face.append(port);
      }
      el.append(face);
      const shadow = html('i', 'gm-node-shadow');
      shadows.append(shadow);
      return { el, face, shadow, node, h, title, subtitle, effect, badge };
    }

    function edgeWeight(edge, incoming, counts) {
      const from = views.get(edge.from).node;
      const traffic = nodes.filter(node => stageOf(node) === 'traffic');
      const total = meta.economy?.leads || meta.brief?.leads || 1;
      const primary = traffic.find(node => node.block === meta.brief?.mainSource);
      const portion = traffic.length === 1 ? 1 : primary ? (primary === from ? .4 : .6 / (traffic.length - 1)) : 1 / Math.max(1, traffic.length);
      const source = stageOf(from) === 'traffic' ? total * portion : incoming.get(from.id) || total / Math.max(1, nodes.filter(node => stageOf(node) === stageOf(from)).length);
      return source / Math.max(1, counts.get(from.id) || 1);
    }

    function linkShape(edge) {
      const from = views.get(edge.from);
      const to = views.get(edge.to);
      const a = { x: from.node.x + nodeWidth, y: from.node.y + from.h / 2 };
      const b = { x: to.node.x, y: to.node.y + to.h / 2 };
      if (edge.kind === 'loop') {
        const x1 = a.x, x2 = b.x, y = bounds.floor;
        return {
          a, b, center: point((x1 + x2) / 2, y + 92),
          d: `M${x1} ${a.y} C${x1 + 28} ${a.y},${x1 + 27} ${y - 24},${x1} ${y} C${x1} ${y + 110},${x2} ${y + 110},${x2} ${y} C${x2 - 27} ${y - 24},${x2 - 28} ${b.y},${x2} ${b.y}`
        };
      }
      if (edge.kind === 'data') {
        a.x -= nodeWidth / 2;
        a.y += from.h / 2;
        b.x += nodeWidth / 2;
        b.y -= to.h / 2;
        return { a, b, center: midpoint(a, b), d: `M${a.x} ${a.y} L${b.x} ${b.y}` };
      }
      if (from.node.x === to.node.x) {
        a.x -= nodeWidth / 2;
        a.y += from.h / 2;
        b.x += nodeWidth / 2;
        b.y -= to.h / 2;
        const center = midpoint(a, b);
        return { a, b, center, d: `M${a.x} ${a.y} C${a.x} ${center.y},${b.x} ${center.y},${b.x} ${b.y}` };
      }
      return { a, b, center: midpoint(a, b), d: curve(a, b) };
    }

    function drawLink(edge) {
      const link = links.get(edge.id);
      const shape = linkShape(edge);
      for (const path of link.paths) path.setAttribute('d', shape.d);
      attrs(link.gradient, { x1: shape.a.x, y1: shape.a.y, x2: shape.b.x, y2: shape.b.y });
      link.center = shape.center;
      if (link.marker) {
        const { x, y } = shape.center;
        link.marker.setAttribute('transform', `translate(${x} ${y})`);
        link.lossPath.setAttribute('d', `M${x} ${y} C${x + 8} ${y + 8},${x + 12} ${y + 32},${x + 12} ${y + 49}`);
      }
    }

    function addParticle(path, time, index, loss) {
      const circle = svg('circle', { r: loss ? 2 : 2.5, class: loss ? 'gm-particle gm-particle-loss' : 'gm-particle' });
      const motionElement = svg('animateMotion', { dur: time + 's', repeatCount: 'indefinite', begin: (-index * .69) + 's' });
      motionElement.append(svg('mpath', { href: '#' + path.id }));
      if (loss) circle.append(svg('animate', { attributeName: 'opacity', values: '0;1;0', dur: time + 's', repeatCount: 'indefinite' }));
      circle.append(motionElement);
      effects.append(circle);
    }

    function prepareLinks(animate) {
      const active = new Set(edges.map(edge => edge.id));
      for (const [id, link] of links) {
        if (active.has(id)) continue;
        if (animate && !motion.matches) {
          link.group.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220 }).onfinish = () => link.group.remove();
        } else link.group.remove();
        link.gradient.remove();
        links.delete(id);
      }
      effects.replaceChildren();
      const backgroundLoop = svg('g', { class: 'gm-loop-guide' });
      const returnText = svg('text', { 'text-anchor': 'middle' });
      const loop = edges.find(edge => edge.kind === 'loop');
      if (loop) {
        const center = linkShape(loop).center;
        attrs(returnText, { x: center.x, y: center.y + 20 });
        returnText.textContent = t('canvas.return');
      } else if (nodes.length && !nodes.some(node => stageOf(node) === 'retain')) {
        const x1 = laneX(6) + nodeWidth, x2 = laneX(1), y = bounds.floor;
        backgroundLoop.append(svg('path', { d: `M${x1} ${y} C${x1} ${y + 110},${x2} ${y + 110},${x2} ${y}` }));
        attrs(returnText, { x: (x1 + x2) / 2, y: y + 102 });
        returnText.textContent = t('canvas.noReturn');
      }
      backgroundLoop.append(returnText);
      effects.append(backgroundLoop);
      const weights = new Map();
      const counts = new Map();
      const incoming = new Map();
      for (const edge of edges) if (edge.kind === 'flow') counts.set(edge.from, (counts.get(edge.from) || 0) + 1);
      for (const edge of edges.toSorted((a, b) => orderOf(views.get(a.from).node) - orderOf(views.get(b.from).node))) {
        const weight = edge.kind === 'flow' ? edgeWeight(edge, incoming, counts) : 0;
        weights.set(edge.id, weight);
        incoming.set(edge.to, (incoming.get(edge.to) || 0) + weight);
      }
      const maxWeight = Math.max(1, ...weights.values());
      let particles = 0;
      const activeMotion = !motion.matches && !mobile.matches;
      for (const edge of edges) {
        const previouslyDrawn = links.has(edge.id);
        if (!previouslyDrawn) {
          const unique = prefix + '-' + serial++;
          const gradient = svg('linearGradient', { id: unique + '-shade', gradientUnits: 'userSpaceOnUse' });
          gradient.append(svg('stop', { offset: 0 }), svg('stop', { offset: 1 }));
          defs.append(gradient);
          const group = svg('g', { 'data-edge': edge.id });
          const depth = svg('path', { class: 'gm-edge-depth' });
          const main = svg('path', { class: 'gm-edge-main', id: unique, stroke: `url(#${gradient.id})` });
          const pulse = svg('path', { class: 'gm-edge-pulse' });
          const hit = svg('path', { class: 'gm-edge-hit' });
          group.append(depth, main, pulse, hit);
          rails.append(group);
          links.set(edge.id, { group, gradient, paths: [depth, main, pulse, hit], main });
        }
        const link = links.get(edge.id);
        const weight = weights.get(edge.id) / maxWeight;
        const [fromColor, toColor] = [shade(stageOf(views.get(edge.from).node)), shade(stageOf(views.get(edge.to).node))];
        link.gradient.firstChild.setAttribute('stop-color', fromColor);
        link.gradient.lastChild.setAttribute('stop-color', toColor);
        link.group.style.setProperty('--gm-source-color', fromColor);
        link.group.style.setProperty('--gm-edge-width', 2 + 3 * weight);
        link.group.classList.toggle('is-flow', edge.kind === 'flow');
        link.group.classList.toggle('is-loop', edge.kind === 'loop');
        link.group.classList.toggle('is-data', edge.kind === 'data');
        link.group.classList.toggle('is-selected', selectedEdge === edge.id);
        const leak = graph.key === 'now' && Number(edge.leak);
        link.marker?.remove();
        link.lossPath?.remove();
        link.marker = link.lossPath = null;
        if (leak > 0) {
          link.marker = svg('g', { class: 'gm-leak' });
          const label = svg('text', { x: 12, y: -9 });
          label.textContent = t('canvas.leak', { percent: Math.round(leak * 100) });
          link.marker.append(svg('path', { d: 'M0 -8C2 -4 7 0 7 4A7 7 0 1 1 -7 4C-7 0 -2 -4 0 -8Z' }), label);
          link.lossPath = svg('path', { id: link.main.id + '-loss', fill: 'none', stroke: 'none' });
          effects.append(link.marker, link.lossPath);
        }
        drawLink(edge);
        if (animate && !previouslyDrawn && !motion.matches) {
          const length = link.main.getTotalLength();
          link.main.animate([{ strokeDasharray: length, strokeDashoffset: length, opacity: 0 }, { strokeDasharray: length, strokeDashoffset: 0, opacity: 1 }], {
            duration: edge.kind === 'loop' ? 900 : 500, delay: edge.kind === 'loop' ? 820 : 450, easing: 'ease-out', fill: 'backwards'
          });
        }
        if (activeMotion && edge.kind !== 'data') {
          const count = edge.kind === 'loop' ? 1 : 1 + Math.round(2 * weight);
          for (let index = 0; index < count && particles < 80; index++, particles++) addParticle(link.main, 2.4, index + particles, false);
          if (leak > 0 && particles < 80) addParticle(link.lossPath, 2.4, particles++, true);
        }
      }
      refreshMotion();
    }

    function refreshMotion() {
      if (motion.matches || mobile.matches || !visible || document.hidden || listing) connections.pauseAnimations?.();
      else connections.unpauseAnimations?.();
    }

    function selectNodes(ids, announce = true) {
      selected = new Set([...ids].filter(id => views.has(id)));
      for (const [id, view] of views) view.el.classList.toggle('is-selected', selected.has(id));
      if (announce) emit('select', { id: [...selected].at(-1) || null, ids: [...selected] });
    }

    function selectEdge(id) {
      if (meta.locked || volume) return;
      selectedEdge = id;
      for (const [key, link] of links) link.group.classList.toggle('is-selected', key === id);
      edgeAction.hidden = !links.has(id);
      if (id) {
        const center = links.get(id).center;
        position(edgeAction, center.x, center.y);
      }
    }

    function makeList() {
      listView.replaceChildren();
      for (const key of stages) {
        const stageNodes = nodes.filter(node => stageOf(node) === key).sort((a, b) => a.y - b.y);
        if (!stageNodes.length) continue;
        const section = html('section');
        const ordered = html('ol');
        for (const node of stageNodes) {
          const item = html('li');
          const button = html('button', 'gm-list-node', titleOf(node));
          button.type = 'button';
          button.addEventListener('click', () => selectNodes([node.id]));
          const name = html('strong', null, effectOf(node));
          name.hidden = graph.key === 'now' || !name.textContent;
          item.append(button, name);
          const linked = linkedTitles(node.id);
          if (linked) item.append(html('p', null, t('canvas.connections', { nodes: linked })));
          ordered.append(item);
        }
        section.append(html('h3', null, t(key)), ordered);
        listView.append(section);
      }
    }

    function effectSettings() {
      let state = {};
      const preferred = meta.existing;
      if (preferred instanceof Set) state.existing = preferred;
      else state.existing = new Set((preferred?.nodes || preferred || []).map(node => typeof node === 'string' ? node : node.block));
      return state;
    }

    function render(variant, options = {}) {
      const prior = graph;
      const oldViews = [...views.values()];
      const oldByBlock = new Map();
      const focused = document.activeElement?.dataset.node;
      for (const view of oldViews) {
        const matching = oldByBlock.get(view.node.block) || [];
        matching.push(view);
        oldByBlock.set(view.node.block, matching);
      }
      graph = variant;
      meta = options;
      meta = { ...meta, ...effectSettings() };
      if (meta.locked && interaction) stopGesture();
      const first = !prior || !prior.nodes?.length;
      const transition = Boolean(options.animate !== false && (first || options.animate || prior?.key !== variant.key) && !listing);
      const morph = transition && !motion.matches;
      const firstSeen = !seen.has(variant.key) && variant.key !== 'now';
      if (options.animate !== false || !meta.locked) seen.add(variant.key);
      nodes = (variant.nodes || []).filter(node => blocks[node.block]).map(node => ({ ...node }));
      edges = (variant.edges || []).map(edge => ({ ...edge }));
      const ids = new Set(nodes.map(node => node.id));
      edges = edges.filter(edge => ids.has(edge.from) && ids.has(edge.to));
      adjacency.clear();
      for (const id of ids) adjacency.set(id, new Set());
      for (const edge of edges) {
        adjacency.get(edge.from).add(edge);
        adjacency.get(edge.to).add(edge);
      }
      if (morph) {
        for (const view of oldViews) view.oldRect = view.el.getBoundingClientRect();
      }
      views.clear();
      const matched = new Set();
      const sorted = nodes.toSorted((a, b) => orderOf(a) - orderOf(b) || a.y - b.y || a.x - b.x);
      const count = new Map();
      for (const [index, node] of sorted.entries()) {
        const previousIndex = count.get(node.block) || 0;
        count.set(node.block, previousIndex + 1);
        const previous = oldByBlock.get(node.block)?.[previousIndex];
        const h = nodeHeight(stageOf(node));
        const view = previous || createNode(node, h);
        if (previous) matched.add(previous);
        Object.assign(view, { node, h, index });
        view.el.dataset.node = node.id;
        views.set(node.id, view);
      }
      for (const view of oldViews) {
        if (matched.has(view)) continue;
        view.shadow.remove();
        view.el.inert = true;
        if (morph) {
          view.face.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.8)' }], { duration: 220 }).onfinish = () => view.el.remove();
        } else view.el.remove();
      }
      clearTimeout(newBadgeTimeout);
      for (const view of views.values()) {
        const isNew = firstSeen && !meta.locked && !meta.existing.has(view.node.block);
        syncNodeView(view, isNew);
        nodeList.append(view.el);
      }
      newBadgeTimeout = setTimeout(() => {
        for (const view of views.values()) if (view.badge.classList.contains('is-new')) view.badge.hidden = true;
      }, 3000);
      selectedEdge = edges.some(edge => edge.id === selectedEdge) && !meta.locked ? selectedEdge : null;
      selectNodes(prior?.key === variant.key ? selected : [], false);
      sizeWorld();
      prepareLinks(morph);
      if (listing) makeList();
      empty.hidden = Boolean(nodes.length || meta.locked);
      minimap.hidden = Boolean(!nodes.length || listing);
      if (first || (localFit && prior?.key !== variant.key)) fit(true);
      else updateMinimapWindow();
      if (morph) {
        const ease = 'cubic-bezier(.22, 1, .36, 1)';
        for (const view of views.values()) {
          const current = view.el.getBoundingClientRect();
          if (view.oldRect && matched.has(view) && !volume) {
            const scale = camera.scale;
            const x = (view.oldRect.left - current.left) / scale;
            const y = (view.oldRect.top - current.top) / scale;
            if (Math.abs(x) + Math.abs(y) > .5) view.face.animate([{ transform: `translate(${x}px,${y}px)` }, { transform: 'none' }], { duration: 480, easing: ease });
          } else if (!volume) {
            const frames = first ? [{ opacity: 0, transform: 'translateZ(-500px) rotateX(25deg)' }, { opacity: 1, transform: 'none' }] :
              [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }];
            view.face.animate(frames, { duration: first ? 640 : 420, delay: Math.min(1200, (first ? 0 : 190) + view.index * 40), easing: ease, fill: 'backwards' });
          }
        }
        if (variant.key === 'auto' && prior?.key !== 'auto') {
          const wave = html('div', 'gm-auto-wave');
          stage.append(wave);
          wave.animate([{ opacity: .25, transform: 'scale(.1)' }, { opacity: 0, transform: 'scale(1.8)' }], 900).onfinish = () => wave.remove();
        }
      } else if (transition && motion.matches) {
        nodeList.animate([{ opacity: .55 }, { opacity: 1 }], 150);
      }
      if (focused && views.has(focused)) views.get(focused).el.focus({ preventScroll: true });
      if (selectedEdge) selectEdge(selectedEdge);
      else edgeAction.hidden = true;
    }

    const mapScale = () => Math.min(148 / Math.max(1, bounds.right - bounds.left), 88 / Math.max(1, bounds.bottom - bounds.top));
    function updateMinimap() {
      const ratio = mapScale();
      miniNodes.replaceChildren(...nodes.map(node => svg('rect', {
        x: 6 + (node.x - bounds.left) * ratio, y: 6 + (node.y - bounds.top) * ratio,
        width: nodeWidth * ratio, height: Math.max(3, views.get(node.id).h * ratio), rx: 1,
        fill: shade(stageOf(node))
      })));
      updateMinimapWindow();
    }

    function updateMinimapWindow() {
      if (!bounds) return;
      const ratio = mapScale();
      const x = 6 + (-camera.x / camera.scale - bounds.left) * ratio;
      const y = 6 + (-camera.y / camera.scale - bounds.top) * ratio;
      attrs(miniWindow, { x, y, width: stage.clientWidth / camera.scale * ratio, height: stage.clientHeight / camera.scale * ratio });
    }

    function applyCamera(announce = false) {
      const { x, y, scale } = camera;
      let transform = `translate(${x}px, ${y}px) scale(${scale})`;
      if (volume && bounds) {
        const midX = (bounds.left + bounds.right) / 2, midY = (bounds.top + bounds.bottom) / 2;
        transform += ` translate(${midX}px,${midY}px) rotateX(${rotation.x}deg) rotateZ(${rotation.z}deg) translate(${-midX}px,${-midY}px)`;
      }
      world.style.transform = transform;
      background.style.backgroundSize = 24 * scale + 'px ' + 24 * scale + 'px';
      background.style.backgroundPosition = `${x % (24 * scale)}px ${y % (24 * scale)}px`;
      stage.classList.toggle('is-small', scale < .6);
      updateMinimapWindow();
      if (announce) emit('zoom', { scale });
    }

    function coordinates(clientX, clientY) {
      const rect = stage.getBoundingClientRect();
      return point((clientX - rect.left - camera.x) / camera.scale, (clientY - rect.top - camera.y) / camera.scale);
    }

    function zoomTo(scale, x = stage.clientWidth / 2, y = stage.clientHeight / 2, immediately = false) {
      const target = clamp(scale, .35, 1.8);
      const origin = { ...camera };
      const anchor = point((x - origin.x) / origin.scale, (y - origin.y) / origin.scale);
      const update = (value, done) => {
        camera = { x: x - anchor.x * value, y: y - anchor.y * value, scale: value };
        applyCamera(done);
      };
      localFit = false;
      cancelAnimationFrame(cameraAnimation);
      if (immediately || motion.matches || Math.abs(target - origin.scale) < .001) {
        update(target, true);
        return;
      }
      const start = performance.now();
      const tick = (time) => {
        const part = clamp((time - start) / 120, 0, 1);
        update(origin.scale + (target - origin.scale) * (1 - (1 - part) ** 3), part >= 1);
        if (part < 1) cameraAnimation = requestAnimationFrame(tick);
      };
      cameraAnimation = requestAnimationFrame(tick);
    }

    function fit(immediately = false) {
      if (!bounds || !stage.clientWidth || !stage.clientHeight) return;
      const width = bounds.right - bounds.left;
      const height = bounds.bottom - bounds.top;
      const scale = clamp(Math.min((stage.clientWidth - 32) / width, (stage.clientHeight - 32) / height), .35, 1.1);
      const target = {
        x: (stage.clientWidth - width * scale) / 2 - bounds.left * scale,
        y: (stage.clientHeight - height * scale) / 2 - bounds.top * scale, scale
      };
      if (stage.clientWidth < 600 && width * scale > stage.clientWidth) target.x = 16 - bounds.left * scale;
      localFit = true;
      cancelAnimationFrame(cameraAnimation);
      if (immediately || motion.matches) {
        camera = target;
        applyCamera(true);
        return;
      }
      const origin = { ...camera }, start = performance.now();
      const tick = (time) => {
        const part = clamp((time - start) / 120, 0, 1);
        const eased = 1 - (1 - part) ** 3;
        camera = Object.fromEntries(Object.keys(origin).map(key => [key, origin[key] + (target[key] - origin[key]) * eased]));
        applyCamera(part >= 1);
        if (part < 1) cameraAnimation = requestAnimationFrame(tick);
      };
      cameraAnimation = requestAnimationFrame(tick);
    }

    function ensureVisible(view) {
      const el = view.el;
      const mounted = stage.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      const x = Math.min(0, mounted.right - 24 - rect.right) + Math.max(0, mounted.left + 24 - rect.left);
      const y = Math.min(0, mounted.bottom - 24 - rect.bottom) + Math.max(0, mounted.top + 24 - rect.top);
      if (x || y) {
        camera.x += x;
        camera.y += y;
        applyCamera();
      }
    }

    function setVolume(enabled) {
      if (enabled === volume) return;
      stopGesture();
      if (enabled && listing) setList(false);
      if (enabled) selectEdge(null);
      volume = enabled;
      rotation = { x: 55, z: -35 };
      stage.classList.toggle('is-volume', volume);
      stage.classList.add('gm-volume-transition');
      applyCamera();
      setTimeout(() => stage.classList.remove('gm-volume-transition'), volume ? 900 : 700);
      emit('volume', { enabled: volume });
    }

    function setList(enabled) {
      if (enabled === listing) return;
      stopGesture();
      if (enabled && volume) setVolume(false);
      listing = enabled;
      if (listing && graph) makeList();
      world.hidden = listing;
      listView.hidden = !listing;
      minimap.hidden = listing || !nodes.length;
      stage.classList.toggle('is-listing', listing);
      refreshMotion();
    }

    function change() {
      emit('change', { nodes: nodes.map(node => ({ ...node })), edges: edges.map(edge => ({ ...edge })) });
    }

    function allowLink(from, to) {
      return views.has(from) && views.has(to) && from !== to && !edges.some(edge => edge.from === from && edge.to === to);
    }

    function connect(from, to) {
      if (meta.locked || volume || edges.length >= 120 || !allowLink(from, to)) return false;
      const source = stageOf(views.get(from).node), target = stageOf(views.get(to).node);
      const kind = source === 'retain' && ['entry', 'traffic'].includes(target) ? 'loop' : source === 'insight' ? 'data' : 'flow';
      edges.push({ id: prefix + '-' + serial++, from, to, kind });
      change();
      return true;
    }

    function removeConnection() {
      if (!selectedEdge || meta.locked || volume) return;
      edges = edges.filter(edge => edge.id !== selectedEdge);
      selectEdge(null);
      stage.focus({ preventScroll: true });
      change();
    }

    function snapPosition(view, x, y) {
      const result = point(snap(x), snap(y));
      guideX.hidden = guideY.hidden = true;
      const key = stageOf(view.node);
      for (const other of views.values()) {
        if (other === view || selected.has(other.node.id) || stageOf(other.node) !== key) continue;
        if (guideX.hidden && Math.abs(other.node.x - x) <= 6) {
          result.x = other.node.x;
          position(guideX, result.x, Math.min(y, other.node.y) - 14);
          guideX.style.height = (Math.abs(y - other.node.y) + view.h + 28) + 'px';
          guideX.hidden = false;
        }
        for (const common of [other.node.y, other.node.y + (other.h - view.h) / 2, other.node.y + other.h - view.h]) {
          if (guideY.hidden && Math.abs(common - y) <= 6) {
            result.y = common;
            position(guideY, Math.min(x, other.node.x) - 10, common);
            guideY.style.width = (Math.abs(x - other.node.x) + nodeWidth + 20) + 'px';
            guideY.hidden = false;
          }
        }
      }
      return result;
    }

    function moveNodes(origins, reference, dx, dy, align = true) {
      const original = origins.get(reference.node.id);
      const target = align ? snapPosition(reference, original.x + dx, original.y + dy) :
        point(original.x + dx, original.y + dy);
      const affected = new Set();
      for (const [id, origin] of origins) {
        const view = views.get(id);
        if (!view) continue;
        view.node.x = origin.x + target.x - original.x;
        view.node.y = origin.y + target.y - original.y;
        position(view.el, view.node.x, view.node.y);
        position(view.shadow, view.node.x, view.node.y);
        for (const edge of adjacency.get(id)) affected.add(edge);
      }
      for (const edge of affected) drawLink(edge);
    }

    function beginNodeDrag(gesture) {
      const id = gesture.nodeId;
      if (!views.has(id)) return;
      if (!selected.has(id)) selectNodes([id], false);
      gesture.type = 'node';
      gesture.positions = new Map([...selected].map(key => [key, point(views.get(key).node.x, views.get(key).node.y)]));
      for (const key of gesture.positions.keys()) views.get(key).el.classList.add('is-dragging');
      stage.classList.add('is-moving-node');
      if (gesture.touch) navigator.vibrate?.(10);
    }

    function beginLink(gesture) {
      if (!views.has(gesture.nodeId) || edges.length >= 120) return;
      gesture.type = 'link';
      for (const view of views.values()) view.el.classList.toggle('is-link-target', allowLink(gesture.nodeId, view.node.id));
      stage.classList.add('is-linking');
      trace.setAttribute('visibility', 'visible');
    }

    function runMove() {
      frame = 0;
      const gesture = interaction;
      if (!gesture) return;
      if (gesture.type === 'pinch') {
        const pointers = [...activePointers.values()];
        if (pointers.length < 2) return;
        const center = midpoint(pointers[0], pointers[1]);
        const rect = stage.getBoundingClientRect();
        const scale = clamp(gesture.scale * distance(pointers[0], pointers[1]) / gesture.distance, .35, 1.8);
        camera = { x: center.x - rect.left - gesture.anchor.x * scale, y: center.y - rect.top - gesture.anchor.y * scale, scale };
        localFit = false;
        applyCamera(true);
        return;
      }
      const last = activePointers.get(gesture.pointer);
      if (!last) return;
      const dx = last.x - gesture.start.x, dy = last.y - gesture.start.y;
      if (gesture.type === 'hold') {
        if (Math.hypot(dx, dy) < 4) return;
        clearTimeout(gesture.hold);
        if (gesture.touch) gesture.type = 'pan';
        else if (gesture.port) beginLink(gesture);
        else beginNodeDrag(gesture);
      }
      if (gesture.type === 'pan') {
        camera.x = gesture.origin.x + dx;
        camera.y = gesture.origin.y + dy;
        localFit = false;
        stage.classList.add('is-panning');
        applyCamera();
      } else if (gesture.type === 'rotate') {
        rotation.x = clamp(gesture.rotate.x - dy * .23, 40, 65);
        rotation.z = clamp(gesture.rotate.z + dx * .25, -60, -10);
        applyCamera();
      } else if (gesture.type === 'node') {
        moveNodes(gesture.positions, views.get(gesture.nodeId), dx / camera.scale, dy / camera.scale);
      } else if (gesture.type === 'link') {
        const from = views.get(gesture.nodeId);
        const candidate = document.elementFromPoint(last.x, last.y)?.closest('[data-node]')?.dataset.node;
        gesture.target = allowLink(gesture.nodeId, candidate) ? candidate : null;
        for (const view of views.values()) view.el.classList.toggle('is-link-hover', gesture.target === view.node.id);
        trace.setAttribute('d', curve(point(from.node.x + nodeWidth, from.node.y + from.h / 2), coordinates(last.x, last.y)));
      } else if (gesture.type === 'box') {
        const rect = stage.getBoundingClientRect();
        selectionBox.hidden = false;
        position(selectionBox, Math.min(last.x, gesture.start.x) - rect.left, Math.min(last.y, gesture.start.y) - rect.top);
        selectionBox.style.width = Math.abs(dx) + 'px';
        selectionBox.style.height = Math.abs(dy) + 'px';
      }
    }

    function stopGesture() {
      if (interaction) clearTimeout(interaction.hold);
      interaction = null;
      stage.classList.remove('is-panning', 'is-moving-node', 'is-linking');
      for (const view of views.values()) view.el.classList.remove('is-dragging', 'is-link-target', 'is-link-hover');
      trace.setAttribute('visibility', 'hidden');
      selectionBox.hidden = guideX.hidden = guideY.hidden = true;
    }

    stage.addEventListener('pointerdown', event => {
      if (listing || event.button !== 0 && event.button !== 1 || event.target.closest('.gm-minimap, button')) return;
      if (!event.isPrimary && !activePointers.size) return;
      cancelAnimationFrame(cameraAnimation);
      const start = point(event.clientX, event.clientY);
      activePointers.set(event.pointerId, start);
      stage.setPointerCapture(event.pointerId);
      if (activePointers.size === 2) {
        if (interaction?.positions) moveNodes(interaction.positions, views.get(interaction.nodeId), 0, 0, false);
        stopGesture();
        const [first, second] = [...activePointers.values()];
        const center = midpoint(first, second);
        interaction = { type: 'pinch', distance: Math.max(1, distance(first, second)), scale: camera.scale, anchor: coordinates(center.x, center.y) };
        return;
      }
      if (activePointers.size > 2) return;
      const nodeId = event.target.closest('[data-node]')?.dataset.node;
      const edgeId = event.target.closest('[data-edge]')?.dataset.edge;
      const port = event.target.closest('[data-port="out"]');
      const touch = event.pointerType === 'touch';
      const editable = !meta.locked && !volume;
      const type = volume ? 'rotate' : !space && nodeId && editable ? 'hold' : event.shiftKey && editable && !nodeId && !touch ? 'box' : 'pan';
      interaction = { type, pointer: event.pointerId, origin: { ...camera }, rotate: { ...rotation }, start, nodeId, edgeId, port, touch, shift: event.shiftKey };
      if (type === 'hold' && touch) {
        const gesture = interaction;
        interaction.hold = setTimeout(() => {
          if (interaction !== gesture) return;
          if (port) beginLink(gesture);
          else beginNodeDrag(gesture);
        }, 400);
      }
      if (!touch && event.shiftKey) event.preventDefault();
      if (nodeId) views.get(nodeId)?.el.focus({ preventScroll: true });
      else stage.focus({ preventScroll: true });
    });

    stage.addEventListener('pointermove', event => {
      if (!activePointers.has(event.pointerId)) {
        if (motion.matches || mobile.matches || volume || listing) return;
        const el = event.target.closest('.gm-node');
        if (!el) return;
        const box = el.getBoundingClientRect();
        if (!box.width || frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          el.style.setProperty('--gm-rx', (clamp((.5 - (event.clientY - box.top) / box.height) * 12, -6, 6)) + 'deg');
          el.style.setProperty('--gm-ry', (clamp(((event.clientX - box.left) / box.width - .5) * 12, -6, 6)) + 'deg');
        });
        return;
      }
      if (volume && motion.matches) return;
      activePointers.set(event.pointerId, point(event.clientX, event.clientY));
      if (!frame) frame = requestAnimationFrame(runMove);
    });

    function endPointer(event, cancelled) {
      if (!activePointers.has(event.pointerId)) return;
      const gesture = interaction;
      if (!gesture) {
        activePointers.delete(event.pointerId);
        return;
      }
      const end = point(event.clientX, event.clientY);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (!cancelled && !(volume && motion.matches)) {
        activePointers.set(event.pointerId, end);
        runMove();
      }
      activePointers.delete(event.pointerId);
      if (gesture.type === 'pinch' && activePointers.size) {
        const [pointer, start] = [...activePointers.entries()][0];
        interaction = { type: 'pan', pointer, start, origin: { ...camera }, touch: true };
        return;
      }
      if (gesture.type === 'node') {
        const view = views.get(gesture.nodeId);
        if (cancelled) moveNodes(gesture.positions, view, 0, 0, false);
        else if (distance(gesture.start, end) >= 4) {
          sizeWorld();
          const moved = gesture.positions;
          stopGesture();
          change();
          selectNodes(moved.keys());
          return;
        }
      }
      stopGesture();
      if (cancelled) return;
      if (gesture.type === 'link') connect(gesture.nodeId, gesture.target);
      else if (gesture.type === 'box' && distance(gesture.start, end) >= 4) {
        const a = coordinates(Math.min(gesture.start.x, end.x), Math.min(gesture.start.y, end.y));
        const b = coordinates(Math.max(gesture.start.x, end.x), Math.max(gesture.start.y, end.y));
        selectNodes([...views.values()].filter(({ node, h }) => node.x <= b.x && node.x + nodeWidth >= a.x && node.y <= b.y && node.y + h >= a.y).map(view => view.node.id));
      } else if (distance(gesture.start, end) < 4) {
        if (gesture.nodeId) {
          selectEdge(null);
          const next = gesture.shift ? new Set(selected) : new Set();
          if (gesture.shift && next.has(gesture.nodeId)) next.delete(gesture.nodeId);
          else next.add(gesture.nodeId);
          selectNodes(next);
        } else if (gesture.edgeId && links.has(gesture.edgeId)) {
          selectNodes([]);
          selectEdge(gesture.edgeId);
          if (!edgeAction.hidden) edgeAction.focus({ preventScroll: true });
        } else {
          selectEdge(null);
          selectNodes([]);
        }
      }
    }

    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      stage.addEventListener(name, event => endPointer(event, name !== 'pointerup'));
    }

    stage.addEventListener('wheel', event => {
      if (listing || event.target.closest('.gm-minimap, button')) return;
      event.preventDefault();
      const rect = stage.getBoundingClientRect();
      if (event.ctrlKey || event.metaKey) zoomTo(camera.scale * Math.exp(-event.deltaY * .004), event.clientX - rect.left, event.clientY - rect.top, true);
      else {
        const coefficient = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1;
        camera.x -= coefficient * (event.shiftKey ? event.deltaY : event.deltaX);
        camera.y -= coefficient * (event.shiftKey ? 0 : event.deltaY);
        localFit = false;
        applyCamera();
      }
    }, { passive: false });

    stage.addEventListener('focusin', event => {
      const nodeId = event.target.dataset.node;
      if (nodeId && views.has(nodeId)) {
        stage.scrollLeft = stage.scrollTop = 0;
        ensureVisible(views.get(nodeId));
      }
    });
    const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    stage.addEventListener('keydown', event => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.target.closest('button')) return;
      const key = event.key;
      const view = views.get(event.target.dataset.node);
      const editable = !meta.locked && !volume;
      if (key === 'Escape' && volume) setVolume(false);
      else if (key.toLowerCase() === 'f') fit();
      else if (key === '+' || key === '=') zoomTo(camera.scale * 1.16);
      else if (key === '-' || key === '−') zoomTo(camera.scale / 1.16);
      else if (key === '0') zoomTo(1);
      else if (arrows[key]) {
        const [dx, dy] = arrows[key];
        if (view && editable) {
          const step = event.shiftKey ? 40 : 8;
          moveNodes(new Map([[view.node.id, point(view.node.x, view.node.y)]]), view, dx * step, dy * step, false);
          ensureVisible(view);
          change();
        } else {
          camera.x -= dx * 40;
          camera.y -= dy * 40;
          localFit = false;
          applyCamera();
        }
      } else if (key === 'Enter' && view) selectNodes([view.node.id]);
      else if (key === ' ' && !view) space = true;
      else if (['Delete', 'Backspace'].includes(key) && editable) {
        if (selectedEdge) removeConnection();
        else {
          const ids = selected.size ? [...selected] : view ? [view.node.id] : [];
          if (!ids.length) return;
          stage.focus({ preventScroll: true });
          emit('delete', { ids });
        }
      } else return;
      event.preventDefault();
      event.stopPropagation();
    });
    const workbench = stage.closest('[data-gm-app], main') || stage;
    workbench.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !volume || event.defaultPrevented) return;
      event.preventDefault();
      setVolume(false);
    });
    addEventListener('keyup', event => { if (event.key === ' ') space = false; });
    addEventListener('blur', () => { space = false; });
    edgeAction.addEventListener('click', removeConnection);
    restore.addEventListener('click', () => emit('restore', {}));

    function panFromMinimap(event) {
      const box = minimap.getBoundingClientRect();
      const ratio = mapScale();
      const x = bounds.left + ((event.clientX - box.left) * 160 / box.width - 6) / ratio;
      const y = bounds.top + ((event.clientY - box.top) * 100 / box.height - 6) / ratio;
      camera.x = stage.clientWidth / 2 - x * camera.scale;
      camera.y = stage.clientHeight / 2 - y * camera.scale;
      localFit = false;
      applyCamera();
    }
    minimap.addEventListener('pointerdown', event => {
      if (!bounds) return;
      mapPointer = event.pointerId;
      minimap.setPointerCapture(event.pointerId);
      panFromMinimap(event);
    });
    minimap.addEventListener('pointermove', event => { if (mapPointer === event.pointerId) panFromMinimap(event); });
    minimap.addEventListener('lostpointercapture', () => { mapPointer = null; });

    const dropType = 'application/x-devlarion-block';
    const clearDrop = () => {
      draggingBlock = null;
      ghost.hidden = true;
      for (const lane of laneElements.values()) lane.classList.remove('is-drop-target');
    };
    function readDrop(event) {
      const key = event.dataTransfer?.getData(dropType) || event.dataTransfer?.getData('text/plain') || draggingBlock;
      return blocks[key] ? key : null;
    }
    document.addEventListener('dragstart', event => {
      const block = event.target.closest?.('[data-gm-block], [data-block]')?.dataset;
      draggingBlock = block?.gmBlock || block?.block || readDrop(event);
    });
    document.addEventListener('dragend', clearDrop);
    stage.addEventListener('dragover', event => {
      if (meta.locked || volume || listing || !event.dataTransfer || !graph) return;
      const key = readDrop(event);
      if (!key && ![...event.dataTransfer.types].includes(dropType)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      if (key) {
        const block = blocks[key];
        if (ghost.dataset.block !== key) {
          ghost.dataset.block = key;
          ghost.innerHTML = gm.icon(block.icon);
          ghost.append(html('span', null, t('canvas.dropHere')));
          for (const [laneKey, lane] of laneElements) lane.classList.toggle('is-drop-target', laneKey === block.stage);
        }
      } else ghost.textContent = t('canvas.dropHere');
      const rect = stage.getBoundingClientRect();
      position(ghost, event.clientX - rect.left + 12, event.clientY - rect.top + 12);
      ghost.hidden = false;
    });
    stage.addEventListener('dragleave', event => {
      if (stage.contains(event.relatedTarget)) return;
      ghost.hidden = true;
      for (const lane of laneElements.values()) lane.classList.remove('is-drop-target');
    });
    function acceptDrop(block, clientX, clientY, at) {
      if (!blocks[block] || meta.locked || volume || listing) return;
      const position = at || coordinates(clientX, clientY);
      const rounded = Number.isFinite(position.x) && Number.isFinite(position.y) ? point(snap(position.x), snap(position.y)) : undefined;
      emit('add', { block, position: rounded });
    }
    stage.addEventListener('drop', event => {
      event.preventDefault();
      acceptDrop(readDrop(event), event.clientX, event.clientY);
      clearDrop();
    });
    document.addEventListener('gm:drop', event => {
      if (!event.detail) return;
      const { block, clientX, clientY, position } = event.detail;
      acceptDrop(block, clientX, clientY, position);
    });

    new ResizeObserver(() => { if (localFit) fit(true); else updateMinimapWindow(); }).observe(stage);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; refreshMotion(); }).observe(stage);
    document.addEventListener('visibilitychange', refreshMotion);
    const updateMotion = () => { if (graph) prepareLinks(false); };
    motion.addEventListener('change', updateMotion);
    mobile.addEventListener('change', updateMotion);

    return {
      render, fit, zoomBy: factor => zoomTo(camera.scale * factor),
      setVolume, setList, setSelected: id => selectNodes(id ? [id] : [], false),
      coordinates, connect
    };
  };
})();
