import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const deriveKey = promisify(scrypt);
const options = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const keyLength = 32;
const dummySalt = randomBytes(16);
const dummyKey = randomBytes(keyLength);
let active = 0;

export class PasswordBusy extends Error {}

export function passwordProblem(value) {
  if (typeof value !== 'string' || Array.from(value).length < 6 || !/\p{Lu}/u.test(value) || !/\p{Ll}/u.test(value)) {
    return 'Используйте минимум 6 символов, включая заглавную и строчную буквы.';
  }
}

async function derive(password, salt) {
  if (active >= 3) throw new PasswordBusy();
  active++;
  try { return await deriveKey(password, salt, keyLength, options); }
  finally { active--; }
}

export async function makePasswordHash(password) {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return 'scrypt-v1$' + salt.toString('hex') + '$' + key.toString('hex');
}

export async function passwordMatches(password, record) {
  const match = /^scrypt-v1\$([0-9a-f]{32})\$([0-9a-f]{64})$/.exec(record || '');
  const salt = match ? Buffer.from(match[1], 'hex') : dummySalt;
  const key = match ? Buffer.from(match[2], 'hex') : dummyKey;
  const actual = await derive(password, salt);
  return timingSafeEqual(actual, key) && Boolean(match);
}

// The public reverse proxy also limits requests by address. Count both identifiers
// for a known account together, so alternating between a handle and ID gains no tries.
const attempts = new Map();
const windowMs = 15 * 60_000;
let nextSweep = 0;

export function allowPasswordAttempt(key) {
  const time = Date.now();
  if (time >= nextSweep) {
    for (const [id, entry] of attempts) if (entry.until <= time) attempts.delete(id);
    nextSweep = time + 60_000;
  }
  let entry = attempts.get(key);
  if (!entry || entry.until <= time) {
    if (!entry && attempts.size >= 5000) return false;
    entry = { count: 0, until: time + windowMs };
    attempts.set(key, entry);
  }
  if (entry.count >= 8) return false;
  entry.count++;
  return true;
}

export function clearPasswordAttempts(clientId) {
  attempts.delete('client:' + clientId);
}
