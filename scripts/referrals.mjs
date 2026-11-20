import { randomBytes } from 'node:crypto';
import { mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import site from '../content/site.json' with { type: 'json' };
import { siteBase } from '../content/profile.mjs';

const ledgerPath = process.env.DEVLARION_REFERRALS_FILE
  ? resolve(process.env.DEVLARION_REFERRALS_FILE)
  : fileURLToPath(new URL('../.devlarion-referrals.json', import.meta.url));
const lockPath = ledgerPath + '.lock';
const [action = 'list', code, customer] = process.argv.slice(2);
const own = (obj, key) => Object.hasOwn(obj, key);
const recordId = /^[A-Z0-9][A-Z0-9_-]{0,39}$/i;
const day = 86_400_000;

async function readLedger() {
  try {
    return JSON.parse(await readFile(ledgerPath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

function requireId(value, label) {
  if (!recordId.test(value || '')) {
    throw new Error(label + ' — до 40 латинских букв, цифр, дефисов и подчёркиваний.');
  }
  return value.toUpperCase();
}

function change(ledger) {
  const now = new Date();
  if (action === 'issue') {
    const referrer = requireId(code, 'Внутренний ID приглашающего');
    let newCode;
    do { newCode = randomBytes(5).toString('hex').toUpperCase(); } while (own(ledger, newCode));
    const shareUrl = new URL('ru/', siteBase());
    shareUrl.searchParams.set('ref', newCode);
    shareUrl.hash = 'quiz';
    ledger[newCode] = { referrer, issuedAt: now.toISOString(), terms: site.referral };
    return shareUrl.href;
  }

  const key = requireId(code, 'Код');
  if (!own(ledger, key)) throw new Error('Код не найден.');
  const entry = ledger[key];

  if (action === 'claim') {
    const applicant = requireId(customer, 'Внутренний ID нового заказчика');
    if (entry.customer) throw new Error('Код уже закреплён за заказчиком.');
    if (entry.referrer === applicant) throw new Error('Приглашающий и новый заказчик совпадают.');
    if (Object.values(ledger).some(item => item.customer === applicant)) {
      throw new Error('Заказчик уже участвует в программе.');
    }
    entry.customer = applicant;
    entry.claimedAt = now.toISOString();
    return 'Код закреплён за заказчиком. После оплаты первого этапа подтвердите скидки.';
  }

  if (action === 'confirm') {
    if (!entry.customer) throw new Error('Сначала закрепите код за заказчиком.');
    if (entry.confirmedAt) throw new Error('Скидки уже подтверждены.');
    entry.confirmedAt = now.toISOString();
    entry.expiresAt = new Date(now.getTime() + entry.terms.days * day).toISOString();
    entry.applied = {};
    return 'Скидки подтверждены до ' + entry.expiresAt.slice(0, 10) + ' (UTC).';
  }

  if (!entry.confirmedAt) throw new Error('Подтвердите оплату до применения скидки.');
  if (now >= new Date(entry.expiresAt)) throw new Error('Срок скидки истёк.');
  if (customer !== 'referrer' && customer !== 'customer') {
    throw new Error('Укажите, чью скидку применить: referrer или customer.');
  }
  if (own(entry.applied, customer)) throw new Error('Эта сторона уже использовала скидку.');
  entry.applied[customer] = now.toISOString();
  return own(entry.applied, 'referrer') && own(entry.applied, 'customer')
    ? 'Обе скидки применены. Код закрыт.' : 'Применение скидки записано.';
}

async function updateLedger() {
  await mkdir(dirname(ledgerPath), { recursive: true });
  const lock = await open(lockPath, 'wx');
  const temporary = ledgerPath + '.tmp-' + process.pid;
  try {
    const ledger = await readLedger();
    const message = change(ledger);
    await writeFile(temporary, JSON.stringify(ledger, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
    await rename(temporary, ledgerPath);
    console.log(message);
  } finally {
    await rm(temporary, { force: true });
    await lock.close();
    await rm(lockPath);
  }
}

try {
  if (action === 'list') console.log(JSON.stringify(await readLedger(), null, 2));
  else if (['issue', 'claim', 'confirm', 'apply'].includes(action)) await updateLedger();
  else throw new Error('Команды: list, issue PROJECT_ID, claim CODE CUSTOMER_ID, confirm CODE, apply CODE referrer|customer.');
} catch (error) {
  console.error(error.code === 'EEXIST' ? 'Журнал занят. Завершите другое изменение и повторите.' : error.message);
  process.exitCode = 1;
}
