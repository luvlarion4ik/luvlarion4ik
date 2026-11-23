import { placeholders } from './prompts.mjs';

const known = new Set(placeholders);
const record = value => !!value && typeof value === 'object' && !Array.isArray(value);
const clean = (value, max) => typeof value === 'string'
  ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\{([a-z0-9_.]+)\}/g, (all, key) => known.has(key) ? all : '').trim().slice(0, max)
  : '';
// Money, percentages and durations must come from placeholders, never from the model.
const rawNumber = /\d[\d\s.,]*\s?(₽|руб|rub|тыс|млн|млрд|%|\$|€|£|k\b|m\b|мес|нед|month|week|day|дн)/i;

export function extractJson(text) {
  if (typeof text !== 'string') throw new Error('empty');
  const body = text.replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/, '');
  const start = body.indexOf('{'), end = body.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('no json');
  return JSON.parse(body.slice(start, end + 1));
}

export function cleanAnalyze(raw, input, catalog, { drop = false } = {}) {
  if (!record(raw) || !record(raw.variants)) throw new Error('variants missing');
  const blocks = new Map(catalog.blocks.map(block => [block.id, block]));
  const addable = id => blocks.has(id) && (blocks.get(id).tier > 0 || blocks.get(id).stage === 'traffic');
  const problems = [];
  const text = (value, max, where) => {
    const out = clean(value, max);
    if (!rawNumber.test(out)) return out;
    problems.push(where + ': число без метки');
    return drop ? '' : out;
  };
  const variants = {};
  for (const key of ['base', 'boost', 'auto']) {
    const source = record(raw.variants[key]) ? raw.variants[key] : {};
    const present = new Set(input.variants?.[key] ?? []);
    const add = [...new Set((Array.isArray(source.add) ? source.add : []).filter(id => addable(id) && !present.has(id)))].slice(0, 6);
    const remove = [...new Set((Array.isArray(source.remove) ? source.remove : []).filter(id => present.has(id)))].slice(0, 6);
    const notes = {};
    for (const [id, note] of Object.entries(record(source.notes) ? source.notes : {})) {
      if (blocks.has(id)) notes[id] = text(note, 180, key + '.notes.' + id);
    }
    variants[key] = { add, remove, pitch: text(source.pitch, 320, key + '.pitch'), notes };
  }
  const gaps = (Array.isArray(raw.gaps) ? raw.gaps : []).slice(0, 3)
    .map((gap, i) => ({ title: text(gap?.title, 80, 'gaps.' + i), text: text(gap?.text, 360, 'gaps.' + i) }))
    .filter(gap => gap.title && gap.text);
  const objections = (Array.isArray(raw.objections) ? raw.objections : []).slice(0, 3)
    .map((item, i) => ({ q: text(item?.q, 90, 'objections.' + i), a: text(item?.a, 340, 'objections.' + i) }))
    .filter(item => item.q && item.a);
  const reasons = (Array.isArray(raw.reasons) ? raw.reasons : []).slice(0, 4)
    .map((item, i) => text(item, 200, 'reasons.' + i)).filter(Boolean);
  const result = { headline: text(raw.headline, 140, 'headline'), reasons, variants, gaps: gaps.length === 3 ? gaps : [], objections };
  if (!result.headline && !reasons.length && !objections.length) problems.push('нет текстов');
  return { result, problems };
}

export function cleanParse(raw, catalog) {
  const brief = record(raw?.brief) ? raw.brief : record(raw) ? raw : {};
  const ids = rows => new Set(rows.map(row => row.id));
  const out = {};
  for (const key of ['models', 'sources', 'intake', 'payment', 'pains', 'wishes']) {
    if (!Array.isArray(brief[key])) continue;
    const allowed = ids(catalog[key]);
    const values = [...new Set(brief[key].filter(id => allowed.has(id)))].slice(0, key === 'pains' ? 3 : 12);
    if (values.length) out[key] = values;
  }
  const category = catalog.categories.find(item => item.id === brief.category);
  if (category) {
    out.category = category.id;
    if (category.niches.some(item => item.id === brief.niche)) out.niche = brief.niche;
  }
  if (ids(catalog.sources).has(brief.mainSource)) out.mainSource = brief.mainSource;
  for (const key of ['check', 'leads']) {
    const value = Number(brief[key]);
    if (Number.isFinite(value) && value > 0 && value < 1e9) out[key] = Math.round(value);
  }
  for (const [key, max] of [['revenueBand', 4], ['repeatBand', 2]]) {
    if (Number.isInteger(brief[key]) && brief[key] >= 0 && brief[key] <= max) out[key] = brief[key];
  }
  if (['solo', 'team', 'mid', 'large'].includes(brief.size)) out.size = brief.size;
  if (['day', 'week', 'month', 'long'].includes(brief.cycle)) out.cycle = brief.cycle;
  if (Array.isArray(brief.items)) {
    const items = brief.items.filter(item => typeof item === 'string').map(item => clean(item, 60)).filter(Boolean).slice(0, 12);
    if (items.length) out.items = items;
  }
  if (typeof brief.currency === 'string' && /^[A-Z]{3}$/.test(brief.currency)) out.currency = brief.currency;
  return { brief: out };
}
