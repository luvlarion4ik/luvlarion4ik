// Личный кабинет Devlarion: вход через Telegram, проекты клиента, сметы, счета, файлы и сообщения.
// Без сторонних пакетов. Два HTTP-сервера на 127.0.0.1:
//   PORTAL_PORT (4175) — кабинет клиента, nginx отдаёт его по https://devlarion.ru/account/
//   PORTAL_ADMIN_PORT (4176) — управление, nginx отдаёт его по /account/admin/ только с паролем.
import { randomBytes, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { basename, extname, join } from 'node:path';
import { createTelegramLogin } from './telegram-login.mjs';
import { allowPasswordAttempt, clearPasswordAttempts, makePasswordHash, passwordMatches, passwordProblem, PasswordBusy } from './password-auth.mjs';

const env = process.env;
const DEV = env.PORTAL_DEV === '1';
const PORT = Number(env.PORTAL_PORT || 4175);
const ADMIN_PORT = Number(env.PORTAL_ADMIN_PORT || 4176);
const BASE = env.PORTAL_BASE || '/account/';
const ADMIN_BASE = env.PORTAL_ADMIN_BASE || BASE + 'admin/';
const ORIGIN = env.PORTAL_ORIGIN || 'https://devlarion.ru';
const SITE = env.PORTAL_SITE || 'https://devlarion.ru/ru/';
const SUPPORT = env.PORTAL_SUPPORT || 'https://t.me/LuvLarion4ik';
const DATA_DIR = env.PORTAL_DATA || new URL('./data/', import.meta.url).pathname;
const BOT_TOKEN = (env.TELEGRAM_BOT_TOKEN || '').trim();
const BOT_NAME = (env.TELEGRAM_BOT_USERNAME || '').trim().replace(/^@/, '');
const certHits = new Map();
const SHOP = env.PORTAL_SHOP || new URL('/ru/shop/', ORIGIN).href;
const telegramLogin = createTelegramLogin({
  token: BOT_TOKEN,
  username: BOT_NAME,
  apiBase: env.TELEGRAM_API_BASE || 'https://api.telegram.org',
  accountUrl: new URL(BASE, ORIGIN).href,
  shopUrl: SHOP,
  supportUrl: SUPPORT,
  ownerChat: env.PORTAL_OWNER_TG || '',
  emoji: (() => { try { return JSON.parse(env.PORTAL_TG_EMOJI || '{}'); } catch { return {}; } })(),
  banner: new URL('./banner.jpg', import.meta.url).pathname,
  certificate: async token => {
    if (!/^[A-Za-z0-9_-]{16}$/.test(token)) return null;
    const file = join(DATA_DIR, 'certs', token + '.png');
    try { await stat(file); } catch { return null; }
    const meta = JSON.parse(await readFile(file + '.json', 'utf8').catch(() => '{}'));
    return { file, name: meta.name || '', code: meta.code || '', done: () => Promise.all([rm(file, { force: true }), rm(file + '.json', { force: true })]) };
  },
  account: tgId => {
    const client = db.clients.find(c => c.tgId && String(c.tgId) === String(tgId));
    return client ? { client, projects: db.projects.filter(p => p.clientId === client.id) } : null;
  },
});
const LOGIN_COOKIE = 'dl_portal_login';
const LOGIN_COOKIE_SECONDS = 15 * 60;
const SESSION_DAYS = 30;
const COOKIE = 'dl_portal';
const ALLOWED_ORIGINS = new Set([ORIGIN, ...(DEV ? ['http://127.0.0.1:' + PORT, 'http://127.0.0.1:' + ADMIN_PORT, 'http://localhost:' + PORT, 'http://localhost:' + ADMIN_PORT] : [])]);
const here = new URL('./', import.meta.url);

// ---------- хранилище ----------
const dataFile = join(DATA_DIR, 'data.json');
const sessionsFile = join(DATA_DIR, 'sessions.json');
const filesDir = join(DATA_DIR, 'files');
await mkdir(filesDir, { recursive: true });

const empty = () => ({ clients: [], projects: [], pending: [] });
async function readStore(file, fallback) {
  try { return JSON.parse(await readFile(file, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}
let db = await readStore(dataFile, empty());
for (const k of ['clients', 'projects', 'pending']) if (!Array.isArray(db[k])) db[k] = [];
let sessions = await readStore(sessionsFile, {});

let writing = Promise.resolve();
function persist(file, value) {
  const snapshot = JSON.stringify(value, null, 2);
  const saved = writing.then(async () => {
    const tmp = file + '.' + randomUUID() + '.tmp';
    await writeFile(tmp, snapshot, { mode: 0o600 });
    await rename(tmp, file);
  });
  writing = saved.catch(e => console.error('Portal store write failed:', e.code || e.name));
  return saved;
}
const saveDb = () => persist(dataFile, db);
const saveSessions = () => persist(sessionsFile, sessions);

// ---------- утилиты ----------
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const now = () => new Date().toISOString();
const id = () => randomBytes(6).toString('hex');
const str = (v, max = 300) => typeof v === 'string' ? v.trim().slice(0, max) : '';
const num = v => { const n = Number(v); return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0; };
const pick = (v, list, fallback) => list.includes(v) ? v : fallback;
const url = v => { const s = str(v, 1000); return /^https:\/\/[^\s"<>]+$/i.test(s) ? s : ''; };
const date = v => { const s = str(v, 10); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''; };
const fileName = v => { const s = basename(str(v, 120)).replace(/[^\p{L}\p{N}._ -]+/gu, '_').replace(/^\.+/, ''); return s || 'file'; };

function send(res, status, body, type = 'application/json; charset=utf-8', extra = {}) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin', ...extra });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
async function readJson(req, limit = 256 * 1024) {
  if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) throw new HttpError(415, 'Нужен JSON.');
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > limit) throw new HttpError(413, 'Слишком большой запрос.'); chunks.push(c); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { throw new HttpError(400, 'Неверный JSON.'); }
}
function sameOrigin(req) {
  if (!ALLOWED_ORIGINS.has(req.headers.origin)) throw new HttpError(403, 'Запрос с чужого сайта отклонён.');
}
function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map(p => p.trim().split('=')).filter(p => p[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]));
}
function sessionCookie(token, maxAge) {
  return `${COOKIE}=${token}; Path=${BASE}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${DEV ? '' : '; Secure'}`;
}
function newSession(client, via, lifetime = SESSION_DAYS * 86400) {
  const token = randomBytes(32).toString('base64url');
  sessions[token] = { clientId: client.id, via, authVersion: client.authVersion, created: now(), expires: Date.now() + lifetime * 1000 };
  return token;
}
function currentClient(req) {
  const token = cookies(req)[COOKIE];
  const s = token && sessions[token];
  if (!s || s.expires < Date.now()) return null;
  const client = db.clients.find(c => c.id === s.clientId);
  return client && s.authVersion === client.authVersion ? { client, token, session: s } : null;
}
const page = name => readFile(new URL(name, here), 'utf8');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const challengeCookieName = purpose => purpose === 'code' ? LOGIN_COOKIE : LOGIN_COOKIE + '_' + purpose;
function loginCookie(purpose, value, maxAge = LOGIN_COOKIE_SECONDS) {
  return `${challengeCookieName(purpose)}=${value}; Path=${BASE}; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${DEV ? '' : '; Secure'}`;
}

function sessionContext(req) {
  const ua = (req.headers['user-agent'] || '').slice(0, 512);
  const device = /iPad|Macintosh.*Mobile/i.test(ua) ? 'iPad' : /iPhone/i.test(ua) ? 'iPhone' :
    /Android/i.test(ua) ? 'Android' : /Windows/i.test(ua) ? 'Windows' : /Mac OS|Macintosh/i.test(ua) ? 'Mac' :
    /CrOS/i.test(ua) ? 'ChromeOS' : /Linux/i.test(ua) ? 'Linux' : 'Устройство не определено';
  const browser = /YaBrowser/i.test(ua) ? 'Яндекс Браузер' : /Edg(?:e|A|iOS)?\//i.test(ua) ? 'Edge' :
    /Firefox|FxiOS/i.test(ua) ? 'Firefox' : /OPR\//.test(ua) ? 'Opera' :
    /SamsungBrowser/i.test(ua) ? 'Samsung Internet' : /Chrome|CriOS/i.test(ua) ? 'Chrome' :
    /Safari/i.test(ua) ? 'Safari' : 'Браузер не определён';
  return { device, browser, timeZone: 'Europe/Moscow' };
}

function clientForTelegram(tg, allowInvitation) {
  const bound = db.clients.find(c => c.tgId && String(c.tgId) === tg.tgId);
  if (bound || !allowInvitation || !tg.username) return bound;
  // Retain empty invitations made before numeric IDs were required for recovery.
  // A recycled username cannot claim an existing client's projects or credentials.
  return db.clients.find(c => !c.tgId && !c.passwordHash && c.tgUsername?.toLowerCase() === tg.username.toLowerCase()
    && !db.projects.some(p => p.clientId === c.id));
}

function bindTelegram(client, tg) {
  client.tgId = tg.tgId;
  client.tgUsername = tg.username;
  for (const other of db.clients) {
    if (tg.username && other !== client && other.tgId && other.tgUsername?.toLowerCase() === tg.username.toLowerCase()) other.tgUsername = '';
  }
  db.pending = db.pending.filter(p => String(p.tgId) !== tg.tgId);
}

function revokeSessions(client) {
  client.authVersion = randomUUID();
  for (const [token, session] of Object.entries(sessions)) if (session.clientId === client.id) delete sessions[token];
}

async function signIn(req, res, client, via, event, purpose) {
  client.lastLogin = now();
  const token = newSession(client, via);
  try { await Promise.all([saveDb(), saveSessions()]); }
  catch (error) { delete sessions[token]; throw error; }
  clearPasswordAttempts(client.id);
  void telegramLogin.notifySession(client.tgId, { event, ...sessionContext(req) });
  const cookie = [sessionCookie(token, SESSION_DAYS * 86400)];
  if (purpose) cookie.push(loginCookie(purpose, '', 0));
  return send(res, 200, { ok: true }, undefined, { 'Set-Cookie': cookie });
}

function checkedTelegram(cookie, code, purpose, consume) {
  const result = telegramLogin.redeem(cookie, code, purpose, consume);
  if (result.error) throw new HttpError(result.status, result.error);
  return result.user;
}

async function authenticate(req, res, action) {
  sameOrigin(req);
  const body = await readJson(req, 32 * 1024);
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Нужны данные формы.');
  if (action === 'password') {
    const identifier = str(body.identifier, 80).replace(/^@/, '').toLowerCase();
    const denied = () => new HttpError(401, 'Проверьте логин и пароль.');
    if (!/^[a-z0-9_]{1,64}$/.test(identifier) || typeof body.password !== 'string' || !body.password) throw denied();
    const numeric = /^\d+$/.test(identifier);
    const client = db.clients.find(c => c.passwordHash && c.tgId && (numeric ? String(c.tgId) === identifier : (c.login === identifier || c.tgUsername?.toLowerCase() === identifier)));
    if (!allowPasswordAttempt(client ? 'client:' + client.id : 'login:' + identifier)) {
      throw new HttpError(429, 'Слишком много попыток. Войдите по коду Telegram или попробуйте через 15 минут.');
    }
    const hash = client?.passwordHash;
    const matches = await passwordMatches(body.password, hash);
    if (!matches || !client || client.passwordHash !== hash || !db.clients.includes(client)) throw denied();
    return signIn(req, res, client, 'password', 'login');
  }

  const jar = cookies(req);
  let purpose = action === 'verify' ? 'code' : action;
  if (action === 'register' && (body.source === 'code' || !jar[challengeCookieName('register')])) purpose = 'code';
  const cookie = jar[challengeCookieName(purpose)];
  const tg = checkedTelegram(cookie, body.code, purpose, false);
  let client = clientForTelegram(tg, action !== 'reset');
  if (action === 'verify') {
    if (!client) return send(res, 409, { needsPassword: true, message: 'Telegram подтверждён. Придумайте пароль для нового кабинета.' });
    checkedTelegram(cookie, body.code, purpose, true);
    bindTelegram(client, tg);
    return signIn(req, res, client, 'telegram', 'login', purpose);
  }

  const problem = passwordProblem(body.password);
  if (problem) throw new HttpError(422, problem);
  if (action === 'reset' && !client) throw new HttpError(404, 'К этому аккаунту Telegram ещё не привязан кабинет. Откройте регистрацию.');
  if (action === 'register' && client?.passwordHash) throw new HttpError(409, 'У вас уже есть пароль. Войдите или воспользуйтесь восстановлением.');
  const previous = client;
  const version = client?.authVersion;
  const hash = await makePasswordHash(body.password);
  // Recheck ownership and consume exactly once after the asynchronous hash.
  checkedTelegram(cookie, body.code, purpose, true);
  client = clientForTelegram(tg, action !== 'reset');
  if (client !== previous || client?.authVersion !== version) throw new HttpError(409, 'Данные кабинета изменились. Получите новый код.');
  if (!client) {
    client = { id: id(), name: tg.name || tg.username || 'Клиент', company: '', note: '', created: now() };
    db.clients.push(client);
  }
  bindTelegram(client, tg);
  client.passwordHash = hash;
  telegramLogin.invalidateUser(tg.tgId);
  revokeSessions(client);
  return signIn(req, res, client, 'telegram', action, purpose);
}

// ---------- данные для клиента ----------
function projectView(p) {
  const unread = p.messages.filter(m => m.from === 'studio' && !m.readByClient).length;
  return {
    id: p.id, title: p.title, summary: p.summary, status: p.status, updated: p.updated,
    stages: p.stages, estimates: p.estimates.map(fileLink(p)), invoices: p.invoices.map(fileLink(p)),
    files: p.files.map(fileLink(p)), messages: p.messages.map(({ id, from, text, at }) => ({ id, from, text, at })), unread,
  };
}
const fileLink = p => item => ({ ...item, href: item.file ? `${BASE}files/${p.id}/${encodeURIComponent(item.file)}` : item.url || '' });

function cleanProject(input, prev = {}) {
  const list = (v, fn, max = 60) => (Array.isArray(v) ? v : []).slice(0, max).map(fn).filter(Boolean);
  const money = x => ({ amount: num(x.amount), currency: pick(str(x.currency, 3).toUpperCase(), ['RUB', 'USD', 'EUR', 'KZT', 'BYN'], 'RUB') });
  return {
    id: prev.id || id(),
    clientId: str(input.clientId, 40),
    title: str(input.title, 140) || 'Проект',
    summary: str(input.summary, 1200),
    status: pick(input.status, ['brief', 'design', 'development', 'review', 'launched', 'support', 'paused'], 'brief'),
    stages: list(input.stages, s => str(s.title, 140) && { title: str(s.title, 140), state: pick(s.state, ['todo', 'active', 'done'], 'todo'), date: date(s.date), note: str(s.note, 400) }),
    estimates: list(input.estimates, e => str(e.title, 140) && { title: str(e.title, 140), ...money(e), status: pick(e.status, ['draft', 'sent', 'approved', 'declined'], 'sent'), note: str(e.note, 400), url: url(e.url), file: e.file ? fileName(e.file) : '' }),
    invoices: list(input.invoices, i => str(i.number, 40) && { number: str(i.number, 40), title: str(i.title, 140), ...money(i), status: pick(i.status, ['unpaid', 'paid', 'overdue', 'cancelled'], 'unpaid'), due: date(i.due), url: url(i.url), file: i.file ? fileName(i.file) : '' }),
    files: list(input.files, f => str(f.title, 140) && (url(f.url) || f.file) && { title: str(f.title, 140), kind: pick(f.kind, ['design', 'build', 'document', 'link'], 'link'), note: str(f.note, 400), date: date(f.date), url: url(f.url), file: f.file ? fileName(f.file) : '' }, 200),
    messages: prev.messages || [],
    created: prev.created || now(),
    updated: now(),
  };
}

// ---------- сервер кабинета ----------
const CSP_CLIENT = "default-src 'self'; script-src 'self'; frame-src 'none'; style-src 'self' 'unsafe-inline' " + (DEV ? '' : ORIGIN) + "; font-src 'self' " + (DEV ? '' : ORIGIN) + "; img-src 'self' data: https://t.me https://telegram.org " + (DEV ? '' : ORIGIN) + "; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";
const htmlHeaders = { 'Content-Security-Policy': CSP_CLIENT, 'X-Frame-Options': 'DENY' };
const types = { '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

async function renderShell(file, vars) {
  let html = await page(file);
  for (const [k, v] of Object.entries(vars)) html = html.replaceAll(`%%${k}%%`, v);
  return html;
}

async function clientHandler(req, res) {
  const u = new URL(req.url, 'http://x');
  const path = u.pathname;
  if (req.method === 'GET' && (path === '/' || path === '')) {
    const me = currentClient(req);
    const mode = pick(u.searchParams.get('mode'), ['code', 'register', 'reset'], 'login');
    if (!me || mode === 'reset') {
      const login = mode === 'login' ? null : telegramLogin.begin(cookies(req)[challengeCookieName(mode)], u.searchParams.get('new-code') === '1', mode, sessionContext(req));
      const html = await renderShell('login.html', {
        BASE, SITE: esc(SITE), SUPPORT: esc(SUPPORT), BOT_URL: esc(login?.link ?? '#'),
        MODE: mode, BOT_HOME: esc(BOT_NAME ? 'https://t.me/' + encodeURIComponent(BOT_NAME) : SUPPORT),
        BOT_AVAILABLE: login ? 'true' : 'false',
      });
      const headers = login ? { ...htmlHeaders, 'Set-Cookie': loginCookie(mode, login.cookie) } : htmlHeaders;
      return send(res, 200, html, 'text/html; charset=utf-8', headers);
    }
    return send(res, 200, await renderShell('client.html', { BASE, SITE: esc(SITE), SUPPORT: esc(SUPPORT) }), 'text/html; charset=utf-8', htmlHeaders);
  }
  if (req.method === 'GET' && path === '/auth') {
    res.writeHead(303, { Location: BASE, 'Cache-Control': 'no-store' });
    return res.end();
  }
  if (path === '/api/certificate' && req.method === 'POST') {
    sameOrigin(req);
    const ip = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const nowMs = Date.now();
    const hits = (certHits.get(ip) || []).filter(t => nowMs - t < 3600_000);
    if (hits.length >= 6) throw new HttpError(429, 'Слишком много сертификатов за час. Попробуйте позже.');
    certHits.set(ip, [...hits, nowMs]);
    if (!BOT_NAME) throw new HttpError(503, 'Бот сейчас недоступен.');
    const body = await readJson(req, 3 * 1024 * 1024);
    const name = str(body.name, 80), code = str(body.code, 40);
    const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(String(body.png || ''));
    if (!name || !m) throw new HttpError(422, 'Нужны имя и изображение сертификата.');
    const png = Buffer.from(m[1], 'base64');
    if (png.length > 2.5 * 1024 * 1024 || png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new HttpError(422, 'Некорректное изображение.');
    const dir = join(DATA_DIR, 'certs');
    await mkdir(dir, { recursive: true });
    for (const f of await readdir(dir).catch(() => [])) {
      const st = await stat(join(dir, f)).catch(() => null);
      if (st && nowMs - st.mtimeMs > 2 * 86400_000) await rm(join(dir, f), { force: true });
    }
    const token = randomBytes(12).toString('base64url');
    await writeFile(join(dir, token + '.png'), png);
    await writeFile(join(dir, token + '.png.json'), JSON.stringify({ name, code, at: now() }));
    return send(res, 200, { bot: 'https://t.me/' + encodeURIComponent(BOT_NAME) + '?start=cert_' + token });
  }
  const auth = path.match(/^\/api\/login\/(verify|register|reset|password)$/);
  if (req.method === 'POST' && auth) return authenticate(req, res, auth[1]);
  if (req.method === 'POST' && path === '/logout') {
    sameOrigin(req);
    const me = currentClient(req);
    if (me) { delete sessions[me.token]; await saveSessions(); }
    res.writeHead(303, { Location: BASE, 'Set-Cookie': sessionCookie('', 0) });
    return res.end();
  }
  if (path.startsWith('/static/') && req.method === 'GET') return serveStatic(res, path.slice(8));
  // дальше — только для вошедших клиентов
  const me = currentClient(req);
  if (path === '/api/me' && req.method === 'GET') {
    if (!me) throw new HttpError(401, 'Войдите в кабинет.');
    const projects = db.projects.filter(p => p.clientId === me.client.id).map(projectView);
    return send(res, 200, { client: { name: me.client.name, company: me.client.company, tgUsername: me.client.tgUsername, tgId: me.client.tgId, login: me.client.login || '', created: me.client.created }, preview: me.session.via === 'admin', projects, links: { shop: SHOP, site: SITE, support: SUPPORT, bot: BOT_NAME ? 'https://t.me/' + BOT_NAME : SUPPORT } });
  }
  if (path === '/api/profile' && req.method === 'POST') {
    sameOrigin(req);
    if (!me) throw new HttpError(401, 'Войдите в кабинет.');
    if (me.session.via === 'admin') throw new HttpError(403, 'В режиме просмотра профиль не меняется.');
    const body = await readJson(req, 8 * 1024);
    const login = str(body.login, 40).replace(/^@/, '').toLowerCase();
    if (login) {
      if (!/^[a-z][a-z0-9_]{2,31}$/.test(login)) throw new HttpError(422, 'Логин: 3–32 символа, латиница, цифры и _, начинается с буквы.');
      const taken = db.clients.some(c => c !== me.client && (c.login === login || c.tgUsername?.toLowerCase() === login));
      if (taken) throw new HttpError(409, 'Такой логин уже занят. Попробуйте другой.');
    }
    me.client.login = login;
    if (typeof body.name === 'string') me.client.name = str(body.name, 80) || me.client.name;
    if (typeof body.company === 'string') me.client.company = str(body.company, 120);
    await saveDb();
    return send(res, 200, { ok: true, client: { name: me.client.name, company: me.client.company, login: me.client.login } });
  }
  if (path === '/api/requests' && req.method === 'POST') {
    sameOrigin(req);
    if (!me) throw new HttpError(401, 'Войдите в кабинет.');
    if (me.session.via === 'admin') throw new HttpError(403, 'В режиме просмотра заявки не отправляются.');
    const body = await readJson(req, 16 * 1024);
    const topic = str(body.topic, 80) || 'Новый проект';
    const text = str(body.text, 3000);
    const budget = str(body.budget, 80);
    if (text.length < 10) throw new HttpError(422, 'Опишите задачу хотя бы парой предложений.');
    const mine = db.projects.filter(p => p.clientId === me.client.id);
    if (mine.filter(p => p.status === 'brief').length >= 5) throw new HttpError(429, 'У вас уже несколько заявок в обсуждении. Дождитесь ответа команды.');
    const recent = mine.map(p => Date.parse(p.created)).filter(Boolean).sort().at(-1);
    if (recent && Date.now() - recent < 60_000) throw new HttpError(429, 'Подождите минуту перед следующей заявкой.');
    const project = cleanProject({ clientId: me.client.id, title: 'Заявка: ' + topic, status: 'brief',
      summary: text + (budget ? '\n\nБюджет: ' + budget : ''),
      stages: [{ title: 'Обсуждение задачи', state: 'active' }, { title: 'Смета и договор', state: 'todo' }, { title: 'Работа над проектом', state: 'todo' }, { title: 'Запуск', state: 'todo' }] });
    project.messages = [{ id: id(), from: 'client', text: '[' + topic + '] ' + text + (budget ? '\nБюджет: ' + budget : ''), at: now(), readByStudio: false }];
    db.projects.push(project);
    await saveDb();
    void telegramLogin.notifyOwner?.(`Новая заявка из кабинета\n${me.client.name}${me.client.company ? ' · ' + me.client.company : ''}\n${topic}: ${text.slice(0, 500)}${budget ? '\nБюджет: ' + budget : ''}`);
    return send(res, 200, { project: projectView(project) });
  }
  const msg = path.match(/^\/api\/projects\/([a-f0-9]+)\/(messages|read)$/);
  if (msg && req.method === 'POST') {
    sameOrigin(req);
    if (!me) throw new HttpError(401, 'Войдите в кабинет.');
    const p = db.projects.find(x => x.id === msg[1] && x.clientId === me.client.id);
    if (!p) throw new HttpError(404, 'Проект не найден.');
    if (msg[2] === 'read') { p.messages.forEach(m => { if (m.from === 'studio') m.readByClient = true; }); await saveDb(); return send(res, 200, { ok: true }); }
    if (me.session.via === 'admin') throw new HttpError(403, 'В режиме просмотра сообщения не отправляются.');
    const body = await readJson(req, 16 * 1024);
    const text = str(body.text, 4000);
    if (!text) throw new HttpError(422, 'Напишите сообщение.');
    const last = p.messages.filter(m => m.from === 'client').at(-1);
    if (last && Date.now() - Date.parse(last.at) < 3000) throw new HttpError(429, 'Подождите пару секунд.');
    const m = { id: id(), from: 'client', text, at: now(), readByStudio: false };
    p.messages.push(m); p.updated = now();
    await saveDb();
    return send(res, 200, { message: { id: m.id, from: m.from, text: m.text, at: m.at } });
  }
  const f = path.match(/^\/files\/([a-f0-9]+)\/([^/]+)$/);
  if (f && req.method === 'GET') {
    if (!me) throw new HttpError(401, 'Войдите в кабинет.');
    const p = db.projects.find(x => x.id === f[1] && x.clientId === me.client.id);
    const name = fileName(decodeURIComponent(f[2]));
    if (!p || !projectHasFile(p, name)) throw new HttpError(404, 'Файл не найден.');
    return serveFile(res, join(filesDir, p.id, name), name);
  }
  throw new HttpError(404, 'Страница не найдена.');
}
const projectHasFile = (p, name) => [...p.files, ...p.estimates, ...p.invoices].some(x => x.file === name);

async function serveStatic(res, name) {
  const safe = basename(name);
  if (!['account.css', 'client.js', 'login.js', 'admin.js', 'admin.css'].includes(safe)) throw new HttpError(404, 'Нет такого файла.');
  const body = await readFile(new URL(safe, here));
  return send(res, 200, body, types[extname(safe)], { 'Cache-Control': 'no-cache' });
}
async function serveFile(res, full, name) {
  const info = await stat(full).catch(() => null);
  if (!info?.isFile()) throw new HttpError(404, 'Файл не найден.');
  const inline = /\.(pdf|png|jpe?g|webp|gif)$/i.test(name);
  const type = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' }[extname(name).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': info.size, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox", 'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(name)}` });
  createReadStream(full).pipe(res);
}

// ---------- сервер управления (за паролем nginx) ----------
const CSP_ADMIN = "default-src 'self'; style-src 'self' 'unsafe-inline' " + (DEV ? '' : ORIGIN) + "; font-src 'self' " + (DEV ? '' : ORIGIN) + "; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";
async function adminHandler(req, res) {
  const u = new URL(req.url, 'http://x');
  const path = u.pathname;
  if (req.method === 'GET' && path === '/') return send(res, 200, await renderShell('admin.html', { BASE, ADMIN_BASE }), 'text/html; charset=utf-8', { 'Content-Security-Policy': CSP_ADMIN, 'X-Frame-Options': 'DENY' });
  if (req.method === 'GET' && path.startsWith('/static/')) return serveStatic(res, path.slice(8));
  if (req.method === 'GET' && path === '/api/state') {
    const clients = db.clients.map(({ id, name, company, tgId, tgUsername, note, created, lastLogin }) =>
      ({ id, name, company, tgId, tgUsername, note, created, lastLogin }));
    return send(res, 200, { clients, projects: db.projects, pending: db.pending, telegram: { configured: Boolean(BOT_TOKEN && BOT_NAME), bot: BOT_NAME } });
  }
  if (req.method !== 'GET') sameOrigin(req);
  if (req.method === 'POST' && path === '/api/clients') {
    const b = await readJson(req);
    const prev = db.clients.find(c => c.id === b.id);
    const tgUsername = str(b.tgUsername, 64).replace(/^@/, '');
    const tgId = str(b.tgId, 20).replace(/\D/g, '');
    if (!tgId && !tgUsername) throw new HttpError(422, 'Укажите Telegram ID или имя пользователя.');
    const clash = db.clients.find(c => c.id !== b.id && ((tgId && c.tgId === tgId) || (tgUsername && c.tgUsername?.toLowerCase() === tgUsername.toLowerCase())));
    if (clash) throw new HttpError(409, 'Этот Telegram уже привязан к клиенту «' + clash.name + '».');
    const client = { id: prev?.id || id(), name: str(b.name, 120) || tgUsername || 'Клиент', company: str(b.company, 120), tgId, tgUsername, note: str(b.note, 600), created: prev?.created || now(), lastLogin: prev?.lastLogin };
    const rebind = prev?.tgId && String(prev.tgId) !== tgId;
    if (rebind) {
      telegramLogin.invalidateUser(prev.tgId);
      delete prev.passwordHash;
      revokeSessions(prev);
    }
    if (prev) Object.assign(prev, client); else db.clients.push(client);
    db.pending = db.pending.filter(p => !(tgId && p.tgId === tgId) && !(tgUsername && p.username?.toLowerCase() === tgUsername.toLowerCase()));
    await saveDb();
    if (rebind) await saveSessions();
    return send(res, 200, client);
  }
  const delClient = path.match(/^\/api\/clients\/([a-f0-9]+)$/);
  if (req.method === 'DELETE' && delClient) {
    if (db.projects.some(p => p.clientId === delClient[1])) throw new HttpError(409, 'Сначала удалите или передайте проекты клиента.');
    db.clients = db.clients.filter(c => c.id !== delClient[1]);
    for (const [t, s] of Object.entries(sessions)) if (s.clientId === delClient[1]) delete sessions[t];
    await saveDb(); await saveSessions();
    return send(res, 200, { ok: true });
  }
  if (req.method === 'DELETE' && path.startsWith('/api/pending/')) {
    const tgId = path.split('/').pop();
    db.pending = db.pending.filter(p => p.tgId !== tgId);
    await saveDb();
    return send(res, 200, { ok: true });
  }
  if (req.method === 'POST' && path === '/api/projects') {
    const b = await readJson(req);
    if (!db.clients.some(c => c.id === b.clientId)) throw new HttpError(422, 'Выберите клиента.');
    const prev = db.projects.find(p => p.id === b.id);
    const project = cleanProject(b, prev);
    if (prev) Object.assign(prev, project); else db.projects.push(project);
    await saveDb();
    return send(res, 200, project);
  }
  const proj = path.match(/^\/api\/projects\/([a-f0-9]+)(?:\/(messages|read))?$/);
  if (proj) {
    const p = db.projects.find(x => x.id === proj[1]);
    if (!p) throw new HttpError(404, 'Проект не найден.');
    if (req.method === 'DELETE' && !proj[2]) {
      db.projects = db.projects.filter(x => x.id !== p.id);
      await rm(join(filesDir, p.id), { recursive: true, force: true });
      await saveDb();
      return send(res, 200, { ok: true });
    }
    if (req.method === 'POST' && proj[2] === 'messages') {
      const text = str((await readJson(req, 16 * 1024)).text, 4000);
      if (!text) throw new HttpError(422, 'Напишите ответ.');
      p.messages.push({ id: id(), from: 'studio', text, at: now(), readByClient: false });
      p.messages.forEach(m => { if (m.from === 'client') m.readByStudio = true; });
      p.updated = now();
      await saveDb();
      return send(res, 200, p);
    }
    if (req.method === 'POST' && proj[2] === 'read') {
      p.messages.forEach(m => { if (m.from === 'client') m.readByStudio = true; });
      await saveDb();
      return send(res, 200, p);
    }
  }
  const up = path.match(/^\/api\/files\/([a-f0-9]+)$/);
  if (req.method === 'PUT' && up) {
    const p = db.projects.find(x => x.id === up[1]);
    if (!p) throw new HttpError(404, 'Сначала сохраните проект.');
    const name = fileName(u.searchParams.get('name'));
    const limit = 40 * 1024 * 1024;
    if (Number(req.headers['content-length']) > limit) throw new HttpError(413, 'Файл больше 40 МБ.');
    await mkdir(join(filesDir, p.id), { recursive: true });
    const chunks = []; let size = 0;
    for await (const c of req) { size += c.length; if (size > limit) throw new HttpError(413, 'Файл больше 40 МБ.'); chunks.push(c); }
    await writeFile(join(filesDir, p.id, name), Buffer.concat(chunks));
    return send(res, 200, { file: name, size });
  }
  const view = path.match(/^\/api\/preview\/([a-f0-9]+)$/);
  if (req.method === 'POST' && view) {
    const client = db.clients.find(c => c.id === view[1]);
    if (!client) throw new HttpError(404, 'Клиент не найден.');
    // просмотр кабинета глазами клиента: короткая сессия только для чтения
    const token = newSession(client, 'admin', 3600);
    await saveSessions();
    return send(res, 200, { url: BASE }, undefined, { 'Set-Cookie': sessionCookie(token, 3600) });
  }
  throw new HttpError(404, 'Не найдено.');
}

function wrap(handler) {
  return async (req, res) => {
    try {
      // nginx срезает префикс сам; при прямом обращении (разработка) срезаем его здесь
      const pre = [ADMIN_BASE, BASE].find(x => req.url.startsWith(x));
      if (pre && (handler === adminHandler) === (pre === ADMIN_BASE)) req.url = '/' + req.url.slice(pre.length);
      await handler(req, res);
    }
    catch (e) {
      req.resume();
      if (e instanceof PasswordBusy) e = new HttpError(503, 'Сейчас выполняется несколько входов. Попробуйте через несколько секунд.');
      if (!(e instanceof HttpError)) console.error(e);
      const status = e instanceof HttpError ? e.status : 500;
      if (res.headersSent) return res.end();
      send(res, status, { error: e instanceof HttpError ? e.message : 'Ошибка сервера. Попробуйте позже.' });
    }
  };
}

setInterval(() => {
  let changed = false;
  for (const [t, s] of Object.entries(sessions)) if (s.expires < Date.now()) { delete sessions[t]; changed = true; }
  if (changed) void saveSessions().catch(() => {});
}, 3600e3).unref();

createServer(wrap(clientHandler)).listen(PORT, '127.0.0.1', () => console.log('Кабинет: http://127.0.0.1:' + PORT + ' → ' + ORIGIN + BASE));
createServer(wrap(adminHandler)).listen(ADMIN_PORT, '127.0.0.1', () => console.log('Управление: http://127.0.0.1:' + ADMIN_PORT + ' → ' + ORIGIN + ADMIN_BASE));
void telegramLogin.startPolling();
