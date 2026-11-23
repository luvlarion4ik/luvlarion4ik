import { realpath, stat } from 'node:fs/promises';
import { relative } from 'node:path';
import { estimator, starterPackages } from '../content/pricing.mjs';
import { cases } from '../content/work.mjs';
import { readySolutions } from '../content/solutions.mjs';

const caseIds = cases.ru.map(project => project.id);
const readyIds = readySolutions.map(solution => solution.id);
const starterIds = starterPackages('ru').map(pack => pack.estimateId);
const stackLayers = ['front', 'back', 'data', 'ai', 'integrations', 'hosting'];
const assets = new URL('../docs/assets/', import.meta.url);

function check(condition, path, message) {
  if (!condition) throw new TypeError(path + ' — ' + message);
}

function record(value, path, keys, required = []) {
  check(value && typeof value === 'object' && !Array.isArray(value), path, 'нужен объект JSON');
  for (const key of Object.keys(value)) check(keys.includes(key), path + '.' + key, 'неизвестное поле');
  for (const key of required) check(Object.hasOwn(value, key), path + '.' + key, 'заполните поле');
}

function string(value, path, empty = false) {
  check(typeof value === 'string' && (empty || value.trim()), path, 'введите текст');
}

function strings(value, path) {
  check(Array.isArray(value), path, 'нужен список строк');
  value.forEach((item, index) => string(item, path + '[' + index + ']'));
}

function date(value, path) {
  const valid = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  check(valid, path, 'укажите существующую дату в формате ГГГГ-ММ-ДД');
}

function positive(value, path, integer = false) {
  check(Number.isFinite(value) && value > 0 && (!integer || Number.isSafeInteger(value)),
    path, integer ? 'нужно целое число больше нуля' : 'нужно число больше нуля');
}

function ruen(value, path, both = true) {
  const langs = ['ru', 'en'];
  record(value, path, langs, both ? langs : []);
  Object.entries(value).forEach(([lang, text]) => string(text, path + '.' + lang));
}

async function asset(value, path) {
  string(value, path, true);
  if (!value) return;
  check(/^(?:[\w-]+\/)*[\w-]+\.(?:avif|gif|jpe?g|png|webp)$/i.test(value), path,
    'укажите относительный путь к изображению внутри docs/assets, например team/ilya.webp');
  const [directory, image] = await Promise.all([realpath(assets), realpath(new URL(value, assets)).catch(() => '')]);
  const assetPath = relative(directory, image || directory);
  check(assetPath && assetPath !== '..' && !assetPath.startsWith('../') && (await stat(image)).isFile(),
    path, 'файл должен находиться в docs/assets');
}

function prices(value) {
  const rubles = amount => Number.isSafeInteger(amount) && amount > 0
    && amount <= Math.floor(Number.MAX_SAFE_INTEGER / 1000);
  record(value, 'pricing', Object.keys(estimator));
  for (const [id, tiers] of Object.entries(value)) {
    const path = 'pricing.' + id;
    record(tiers, path, ['small', 'medium', 'large']);
    for (const [tier, range] of Object.entries(tiers)) {
      if (range === null && !(tier === 'small' && starterIds.includes(id))) continue;
      const valid = tier === 'small' ? rubles(range)
        : Array.isArray(range) && range.length === 2 && range.every(rubles) && range[0] <= range[1];
      check(valid, path + '.' + tier, tier === 'small' ? 'укажите стартовую цену в рублях'
        : 'укажите две целые цены в рублях от меньшей к большей');
    }
  }
}

async function validateTeam(value) {
  check(Array.isArray(value), 'team', 'нужен список участников');
  const ids = new Set(['ilya']);
  for (const [index, person] of value.entries()) {
    const path = 'team[' + index + ']';
    record(person, path, ['id', 'name', 'role', 'bio', 'stack', 'photo', 'consent'], ['id', 'name', 'role', 'consent']);
    check(typeof person.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(person.id) && !ids.has(person.id),
      path + '.id', 'укажите уникальный идентификатор из латинских строчных букв, цифр и дефисов');
    ids.add(person.id);
    ruen(person.name, path + '.name');
    ruen(person.role, path + '.role');
    if (Object.hasOwn(person, 'bio')) ruen(person.bio, path + '.bio', false);
    if (Object.hasOwn(person, 'stack')) strings(person.stack, path + '.stack');
    date(person.consent, path + '.consent');
    if (Object.hasOwn(person, 'photo')) await asset(person.photo, path + '.photo');
  }
  return ids;
}

function validateCases(value, people) {
  record(value, 'caseOverrides', caseIds);
  for (const [id, changes] of Object.entries(value)) {
    record(changes, 'caseOverrides.' + id, ['ru', 'en']);
    for (const [lang, fields] of Object.entries(changes)) {
      const path = 'caseOverrides.' + id + '.' + lang;
      record(fields, path, ['task', 'result', 'solution', 'demoNote', 'curators', 'stack']);
      for (const [key, value] of Object.entries(fields)) {
        const field = path + '.' + key;
        if (key === 'stack') {
          record(value, field, stackLayers);
          for (const [layer, tools] of Object.entries(value)) strings(tools, field + '.' + layer);
        } else if (key === 'curators') {
          check(Array.isArray(value), field, 'нужен список кураторов');
          for (const [index, curator] of value.entries()) {
            const slot = field + '[' + index + ']';
            record(curator, slot, ['person', 'role'], ['person', 'role']);
            check(people.has(curator.person), slot + '.person', 'укажите идентификатор участника команды');
            string(curator.role, slot + '.role');
          }
        } else string(value, field);
      }
    }
  }
}

function validateAchievements(value) {
  check(Array.isArray(value), 'achievements', 'нужен список достижений');
  for (const [index, achievement] of value.entries()) {
    const path = 'achievements[' + index + ']';
    record(achievement, path, ['ru', 'en', 'proof'], ['ru', 'en', 'proof']);
    for (const lang of ['ru', 'en']) {
      const titlePath = path + '.' + lang;
      record(achievement[lang], titlePath, ['title', 'result'], ['title', 'result']);
      string(achievement[lang].title, titlePath + '.title');
      string(achievement[lang].result, titlePath + '.result');
    }
    const proof = typeof achievement.proof === 'string' && URL.canParse(achievement.proof);
    check(proof && new URL(achievement.proof).protocol === 'https:', path + '.proof', 'укажите HTTPS-ссылку на подтверждение');
  }
}

function validateGrowthMap(config) {
  const path = 'growthMap';
  const keys = ['ai', 'endpoint', 'turnstileSiteKey', 'handoffNote', 'guarantees', 'reviews'];
  record(config, path, keys, keys);
  check(['off', 'on'].includes(config.ai), path + '.ai', 'выберите off или on');
  const https = value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password && !/\s/.test(value);
    } catch {
      return false;
    }
  };
  check(config.endpoint === '' || (typeof config.endpoint === 'string' && https(config.endpoint)),
    path + '.endpoint', 'нужен адрес https:// или пустая строка');
  string(config.turnstileSiteKey, path + '.turnstileSiteKey', true);
  string(config.handoffNote, path + '.handoffNote', true);
  check(Array.isArray(config.guarantees), path + '.guarantees', 'нужен список гарантий');
  config.guarantees.forEach((item, index) => ruen(item, path + '.guarantees[' + index + ']'));
  check(Array.isArray(config.reviews), path + '.reviews', 'нужен список отзывов');
  config.reviews.forEach((item, index) => {
    const field = path + '.reviews[' + index + ']';
    record(item, field, ['name', 'business', 'text', 'url', 'date'], ['name', 'text', 'url', 'date']);
    string(item.name, field + '.name');
    if (item.business !== undefined) string(item.business, field + '.business', true);
    ruen(item.text, field + '.text');
    check(typeof item.url === 'string' && https(item.url), field + '.url', 'нужен адрес https://');
    date(item.date, field + '.date');
  });
}

export async function validateSite(value) {
  const keys = ['exchange', 'legal', 'pricing', 'ready', 'caseOverrides', 'founderPhoto', 'team', 'achievements', 'referral', 'portal'];
  record(value, 'site.json', [...keys, 'growthMap'], keys);
  const { exchange, legal, referral } = value;
  const currencies = { BYN: 1, KZT: 100, USD: 1, EUR: 1 };
  const exchangeKeys = ['date', ...Object.keys(currencies)];
  record(exchange, 'exchange', exchangeKeys, exchangeKeys);
  date(exchange.date, 'exchange.date');
  for (const [currency, units] of Object.entries(currencies)) {
    const field = 'exchange.' + currency;
    const rate = exchange[currency];
    positive(rate, field);
    check(Number.isFinite(units / rate), field, 'укажите конечный курс');
  }

  record(legal, 'legal', ['name', 'inn', 'ogrnip'], ['name', 'inn', 'ogrnip']);
  string(legal.name, 'legal.name', true);
  check(typeof legal.inn === 'string' && /^(?:\d{12})?$/.test(legal.inn), 'legal.inn', 'ИНН ИП состоит из 12 цифр');
  check(typeof legal.ogrnip === 'string' && /^(?:\d{15})?$/.test(legal.ogrnip), 'legal.ogrnip', 'ОГРНИП состоит из 15 цифр');

  prices(value.pricing);
  record(value.ready, 'ready', readyIds);
  for (const [id, status] of Object.entries(value.ready)) {
    check(['ready', 'progress', 'soon'].includes(status), 'ready.' + id, 'выберите ready, progress или soon');
  }

  await asset(value.founderPhoto, 'founderPhoto');
  const people = await validateTeam(value.team);
  validateCases(value.caseOverrides, people);
  validateAchievements(value.achievements);

  if (value.portal !== undefined) {
    record(value.portal, 'portal', ['status', 'url'], ['status', 'url']);
    check(['soon', 'open'].includes(value.portal.status), 'portal.status', 'допустимы значения soon или open');
    string(value.portal.url, 'portal.url', value.portal.status === 'soon');
    check(value.portal.url === '' || /^https:\/\/[^\s]+$/.test(value.portal.url), 'portal.url', 'нужен адрес https://');
    check(value.portal.status !== 'open' || value.portal.url !== '', 'portal.url', 'для статуса open укажите адрес кабинета');
  }
  if (value.growthMap !== undefined) validateGrowthMap(value.growthMap);
  record(referral, 'referral', ['percent', 'days', 'cap'], ['percent', 'days', 'cap']);
  positive(referral.percent, 'referral.percent', true);
  positive(referral.days, 'referral.days', true);
  positive(referral.cap, 'referral.cap', true);
  check(referral.cap >= Math.max(8, referral.percent) && referral.cap <= 100, 'referral.cap',
    'лимит должен покрывать реферальную скидку и комбо до 8% и не превышать 100%');
}
