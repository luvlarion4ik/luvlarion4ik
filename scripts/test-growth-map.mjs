import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { estimator } from '../content/pricing.mjs';

const context = createContext({ window: {} });
const files = new URL('../docs/assets/growth-map/', import.meta.url);
for (const filename of ['gm-copy.js', 'gm-catalog.js', 'gm-engine.js']) {
  runInContext(readFileSync(new URL(filename, files), 'utf8'), context, { filename });
}
const { engine, catalog, copy } = context.window.DevlarionGM;
const readBrief = name => JSON.parse(readFileSync(new URL(`fixtures/growth-map/${name}.json`, import.meta.url), 'utf8'));
const normalizeRealm = value => JSON.parse(JSON.stringify(value));
const metrics = {
  base: { count: [8, 13], floor: .12, cap: .45 },
  boost: { count: [14, 21], floor: .30, cap: 1.2 },
  auto: { count: [20, 30], floor: .60, cap: 2.4 },
};
const blocks = variant => new Set(variant.nodes.map(node => node.block));
const compare = (brief, variants, lang = 'ru') => engine.compare(brief, variants, catalog, { pricing: estimator, lang });
const documentFor = (brief, variants) => ({
  format: 'devlarion.growthmap', version: 1, id: 'gm_test',
  createdAt: '2026-11-22T18:00:00.000Z', updatedAt: '2026-11-22T18:05:00.000Z',
  lang: 'ru', source: 'manual', brief, active: 'boost', variants,
});

test('catalogue IDs, links, pricing services and bilingual copy resolve', () => {
  const ids = new Set(catalog.blocks.map(block => block.id));
  assert.equal(ids.size, catalog.blocks.length);
  for (const block of catalog.blocks) {
    for (const field of ['stage', 'icon', 'title', 'benefit', 'fx', 'tier']) assert.ok(Object.hasOwn(block, field), block.id + '.' + field);
    for (const lang of ['ru', 'en']) {
      assert.ok(block.title[lang], block.id + ' title ' + lang);
      assert.ok(block.benefit[lang], block.id + ' benefit ' + lang);
    }
    assert.ok(block.service === null || Object.hasOwn(estimator, block.service), block.id + ' service');
    for (const target of [...(block.next ?? []), ...(block.replaces ?? [])]) {
      assert.ok(ids.has(target), block.id + ' points to ' + target);
    }
  }
  assert.deepEqual(Object.keys(copy.ru).sort(), Object.keys(copy.en).sort());
});

for (const name of ['barber', 'kitchens', 'course', 'coffee', 'logistics']) {
  const brief = readBrief(name);
  const variants = engine.buildAll(brief, catalog);
  const { economies } = compare(brief, variants);
  test(name + ' has valid and deterministic graphs in the intended size ranges', () => {
    assert.equal(JSON.stringify(variants), JSON.stringify(engine.buildAll(brief, catalog)));
    for (const [key, variant] of Object.entries(variants)) {
      assert.equal(variant.key, key);
      if (metrics[key]) {
        const [low, high] = metrics[key].count;
        assert.ok(variant.nodes.length >= low && variant.nodes.length <= high, `${key}: ${variant.nodes.length}`);
      }
      const nodes = new Set(variant.nodes.map(node => node.id));
      assert.equal(nodes.size, variant.nodes.length);
      for (const node of variant.nodes) {
        assert.ok(Object.hasOwn(catalog.byId, node.block), node.block);
        assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y));
      }
      assert.ok(variant.edges.length < 120);
      for (const edge of variant.edges) {
        assert.ok(nodes.has(edge.from), edge.from);
        assert.ok(nodes.has(edge.to), edge.to);
      }
    }
    for (const [from, to] of [['base', 'boost'], ['boost', 'auto']]) {
      const previous = blocks(variants[from]);
      const next = blocks(variants[to]);
      const replaced = new Set([...next].flatMap(id => catalog.byId[id].replaces ?? []));
      for (const id of previous) assert.ok(next.has(id) || replaced.has(id), `${id} lost in ${from} → ${to}`);
    }
  });

  test(name + ' has rising revenue and prices, bounded growth and usable payback', () => {
    for (const [from, to] of [['now', 'base'], ['base', 'boost'], ['boost', 'auto']]) {
      const previous = economies[from];
      const next = economies[to];
      const { floor, cap } = metrics[to];
      assert.ok(next.revenue > previous.revenue, `${from} → ${to}: ${previous.revenue} → ${next.revenue}`);
      assert.ok(next.growth >= floor && next.growth <= cap);
      assert.ok(previous.price.max <= next.price.max, `${from} → ${to}: ${previous.price.max} → ${next.price.max}`);
      assert.ok(next.price.min <= next.price.max);
      assert.ok(next.payback === null || (next.payback >= 1 && next.payback <= 24 && Number.isInteger(next.payback * 2)));
      if (next.price.tier === 'small') {
        const services = [...blocks(variants[to])].map(id => catalog.byId[id].service);
        if (services.includes('mobile') || services.includes('agents')) assert.equal(next.price.quote, true);
      }
    }
  });

  test(name + ' migrates unchanged and generates complete bilingual comparison text', () => {
    const doc = normalizeRealm(documentFor(brief, variants));
    assert.deepEqual(normalizeRealm(engine.migrate(doc, catalog)), doc);
    assert.throws(() => engine.migrate({ ...doc, version: 99 }, catalog), { message: 'newer' });
    for (const lang of ['ru', 'en']) {
      const { differences } = compare(brief, variants, lang);
      assert.equal(differences.length, 3);
      for (const row of differences) {
        assert.ok(row.title && row.text);
        assert.doesNotMatch(row.title + row.text, /[{}]|undefined|NaN/);
      }
    }
  });
}

test('forecast includes the niche-specific blocks in the requested variants', () => {
  const kitchens = engine.buildAll(readBrief('kitchens'), catalog);
  assert.ok(blocks(kitchens.boost).has('cap_quiz'));
  assert.ok(blocks(kitchens.boost).has('proc_kp'));
  const barber = engine.buildAll(readBrief('barber'), catalog);
  assert.ok(blocks(barber.base).has('cap_booking'));
  assert.ok(blocks(barber.base).has('del_remind'));
  const course = engine.buildAll(readBrief('course'), catalog);
  assert.ok(blocks(course.base).has('del_access'));
  assert.ok(!blocks(course.base).has('ent_app'));
  assert.ok(blocks(course.boost).has('ent_app'));
  const logistics = engine.buildAll(readBrief('logistics'), catalog);
  for (const variant of Object.values(logistics)) assert.ok(blocks(variant).has('src_site'));
  assert.deepEqual(normalizeRealm(engine.buildDemo(catalog)), normalizeRealm(engine.buildAll(readBrief('coffee'), catalog)));
});

test('local parser recognises the three example briefs', () => {
  const barber = engine.parseText('Барбершоп в Казани, 3 мастера. Клиенты из Яндекс Карт и Instagram, записываем через WhatsApp. Средний чек 1800, в месяц около 400 стрижек, оборот около 700 тысяч', catalog, 'ru');
  assert.equal(barber.brief.category, 'beauty');
  assert.equal(barber.brief.niche, 'barber');
  assert.equal(barber.brief.check, 1800);
  assert.equal(barber.brief.leads, 400);
  assert.equal(barber.brief.size, 'team');
  assert.equal(barber.brief.revenueBand, 1);
  assert.ok(barber.brief.models.includes('booking'));
  assert.ok(barber.brief.sources.includes('src_maps'));
  assert.ok(barber.brief.sources.includes('src_insta'));
  assert.deepEqual(normalizeRealm(barber.brief.intake), ['dm']);
  assert.ok(barber.detected.includes('check'));

  const kitchens = engine.parseText('Делаю кухни на заказ. Заявки с Авито и от знакомых, считаю всё вручную в Excel. Чек от 250 тысяч, 10–15 заказов в месяц', catalog, 'ru');
  assert.equal(kitchens.brief.category, 'repair');
  assert.equal(kitchens.brief.niche, 'furniture');
  assert.equal(kitchens.brief.check, 250000);
  assert.equal(kitchens.brief.leads, 12.5);
  assert.equal(engine.normalizeBrief(kitchens.brief, catalog).leads, 13);
  assert.ok(kitchens.brief.sources.includes('src_avito'));
  assert.ok(kitchens.brief.sources.includes('src_word'));
  assert.ok(kitchens.brief.intake.includes('table'));

  const course = engine.parseText('Онлайн-курс по иллюстрации. Продаю через Telegram-канал на 12 тысяч подписчиков, оплату принимаю переводом на карту', catalog, 'ru');
  assert.ok(['education/online_school', 'digital/info'].includes(course.brief.category + '/' + course.brief.niche));
  assert.ok(course.brief.models.includes('digital'));
  assert.ok(course.brief.sources.includes('src_tg'));
  assert.ok(course.brief.payment.includes('card'));
  assert.equal(course.brief.leads, undefined);

  const english = engine.parseText('North Street barbershop, 3 barbers. Appointments from Google Maps. Average order 1,800. Around 400 haircuts per month.', catalog, 'en');
  assert.equal(english.brief.category, 'beauty');
  assert.equal(english.brief.check, 1800);
  assert.equal(english.brief.leads, 400);
  assert.equal(english.brief.size, 'team');
});

test('English examples preserve the entered currency and detect numeric volume', () => {
  const barber = engine.parseText(copy.en['auto.example1.text'], catalog, 'en');
  assert.equal(barber.brief.check, 28);
  assert.equal(barber.brief.leads, 400);
  assert.equal(barber.brief.currency, 'GBP');
  assert.ok(barber.detected.includes('currency'));
  const kitchens = engine.parseText(copy.en['auto.example2.text'], catalog, 'en');
  assert.equal(kitchens.brief.check, 9000);
  assert.equal(kitchens.brief.leads, 12.5);
  assert.equal(kitchens.brief.currency, 'GBP');
  assert.equal(engine.normalizeBrief(kitchens.brief, catalog).leads, 13);
  const course = engine.parseText(copy.en['auto.example3.text'], catalog, 'en');
  assert.equal(course.brief.leads, undefined);
});

test('migration removes unknown blocks and attached edges', () => {
  const brief = readBrief('barber');
  const variant = normalizeRealm(engine.buildAll(brief, catalog));
  const removed = variant.boost.nodes.find(node => variant.boost.edges.some(edge => edge.from === node.id));
  removed.block = 'missing_from_catalogue';
  const imported = engine.migrate(documentFor(brief, variant), catalog).variants.boost;
  assert.ok(!imported.nodes.some(node => node.id === removed.id));
  assert.ok(!imported.edges.some(edge => edge.from === removed.id || edge.to === removed.id));
});

test('an orphan block contributes half the effect and repeat nodes contribute thirty per cent', () => {
  const brief = readBrief('barber');
  const variant = engine.buildAll(brief, catalog).boost;
  const target = variant.nodes.find(node => node.block === 'proc_notify') ??
    variant.nodes.find(node => node.block === 'cap_booking');
  const regular = engine.economy(brief, variant, catalog, { pricing: estimator });
  const disconnected = {
    ...variant, edges: variant.edges.filter(edge => edge.from !== target.id && edge.to !== target.id),
  };
  const orphan = engine.economy(brief, disconnected, catalog, { pricing: estimator });
  const hours = catalog.byId[target.block].fx.hours;
  assert.ok(regular.hours - orphan.hours >= hours * .5);
  const duplicate = engine.economy(brief, {
    ...variant, nodes: [...variant.nodes, { ...target, id: 'copy' }],
    edges: [...variant.edges, { id: 'extra', from: 'copy', to: variant.nodes[0].id, kind: 'flow' }],
  }, catalog, { pricing: estimator });
  assert.ok(Math.abs(duplicate.hours - regular.hours - hours * .3) < .00001);
});
