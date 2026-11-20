import { randomUUID } from 'node:crypto';
import { rename, rm, writeFile } from 'node:fs/promises';

const base = 'RUB';
const frankfurter = 'https://api.frankfurter.dev/v2';
const rateCatalog = frankfurter + '/currencies';
const cldrVersion = '49.0.0';
const cldrPackage = 'https://raw.githubusercontent.com/unicode-org/cldr-json/'
  + cldrVersion + '/cldr-json/cldr-core';
const territoryData = cldrPackage + '/supplemental/currencyData.json';
const territoryLicense = cldrPackage + '/LICENSE';
const output = new URL('../docs/assets/exchange-rates.json', import.meta.url);
const rateUrl = new URL(frankfurter + '/rates');
rateUrl.searchParams.set('base', base);

function isDay(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

const [dateFlag, extraFlag] = process.argv.slice(2);
if (dateFlag !== undefined) {
  const date = dateFlag.startsWith('--date=') ? dateFlag.slice(7) : null;
  if (extraFlag !== undefined || !isDay(date)) throw Error('Usage: node scripts/update-exchange.mjs [--date=YYYY-MM-DD]');
  rateUrl.searchParams.set('date', date);
}

async function fetchData(url, format = 'json') {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw Error('HTTP ' + response.status + ' from ' + url);
  return format === 'json' ? response.json() : response.text();
}

const [catalog, quotations, localeData, license] = await Promise.all([
  fetchData(rateCatalog),
  fetchData(rateUrl),
  fetchData(territoryData),
  fetchData(territoryLicense, 'text'),
]);

const iso = code => typeof code === 'string' && /^[A-Z]{3}$/.test(code);
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const regions = localeData?.supplemental?.currencyData?.region;
if (!Array.isArray(catalog) || !Array.isArray(quotations)
    || !isObject(regions) || !license.includes('UNICODE LICENSE V3')
    || !license.includes('Permission is hereby granted')) {
  throw Error('The currency data sources returned an unexpected schema.');
}

const listedFiat = new Set(catalog.filter(entry => entry?.type === 'currency' && iso(entry.iso_code))
  .map(entry => entry.iso_code));
const fetchedRates = new Map();
for (const entry of quotations) {
  if (!listedFiat.has(entry?.quote)) continue;
  if (entry.base !== base || !isDay(entry.date) || !Number.isFinite(entry.rate) || entry.rate <= 0) {
    throw Error('Frankfurter returned an invalid quote.');
  }
  if (fetchedRates.has(entry.quote)) throw Error('Frankfurter returned duplicate quotes for ' + entry.quote + '.');
  fetchedRates.set(entry.quote, { rate: entry.rate, date: entry.date });
}

if (!['USD', 'EUR'].every(code => fetchedRates.has(code))) {
  throw Error('Frankfurter is missing the USD or EUR fallback rate.');
}
const asOf = [...fetchedRates.values()].map(({date}) => date).sort().at(-1);
const requestedDay = rateUrl.searchParams.get('date');
if (requestedDay && asOf > requestedDay) throw Error('The source returned rates later than the requested date.');

const acceptedFiat = new Set();
const primaryTender = {};
for (const [territory, entries] of Object.entries(regions).sort()) {
  if (!/^[A-Z]{2}$/.test(territory) || !Array.isArray(entries)) continue;
  const active = entries.flatMap(Object.entries).filter(([currency, interval]) =>
    iso(currency) && isObject(interval) && interval._tender !== 'false'
    && (!interval._from || interval._from <= asOf) && (!interval._to || asOf <= interval._to));
  for (const [currency] of active) acceptedFiat.add(currency);
  // CLDR lists the primary currency first when tender intervals overlap.
  if (active.length) primaryTender[territory] = active[0][0];
}

const rates = Object.fromEntries([...fetchedRates].sort().filter(([code]) => code !== base && acceptedFiat.has(code)));
const territories = Object.fromEntries(Object.entries(primaryTender)
  .filter(([, code]) => code === base || Object.hasOwn(rates, code)));
if (territories.US !== 'USD' || territories.FR !== 'EUR' || territories.RU !== base) {
  throw Error('Current territory mappings for USD, EUR or RUB could not be verified.');
}

const snapshot = {
  base,
  asOf,
  sources: {
    rates: {
      name: 'Frankfurter v2 blended reference rates',
      url: rateUrl.href,
      catalog: rateCatalog,
      terms: 'https://frankfurter.dev/license/',
    },
    territories: {
      name: 'Unicode CLDR ' + cldrVersion,
      url: territoryData,
      license: territoryLicense,
      notice: license.trim(),
    },
  },
  rates,
  territories,
};

const temporary = new URL('.exchange-rates-' + randomUUID() + '.tmp', output);
try {
  await writeFile(temporary, JSON.stringify(snapshot, null, 2) + '\n', { flag: 'wx' });
  await rename(temporary, output);
} finally {
  await rm(temporary, { force: true });
}
console.log('Exchange rates on ' + asOf + ': ' + Object.keys(rates).length
  + ' currencies and ' + Object.keys(territories).length + ' territory defaults.');
