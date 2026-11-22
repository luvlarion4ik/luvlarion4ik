// Личный кабинет Devlarion: вход через Telegram, проекты клиента, сметы, счета, файлы и сообщения.
// Без сторонних пакетов. Два HTTP-сервера на 127.0.0.1:
//   PORTAL_PORT (4175) — кабинет клиента, nginx отдаёт его по https://devlarion.ru/account/
//   PORTAL_ADMIN_PORT (4176) — управление, nginx отдаёт его по /account/admin/ только с паролем.
import { randomBytes, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { basename, extname, join } from 'node:path';
import { createTelegramLogin } from './telegram-login.mjs';

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
const telegramLogin = createTelegramLogin({
  token: BOT_TOKEN,
  username: BOT_NAME,
  apiBase: env.TELEGRAM_API_BASE || 'https://api.telegram.org',
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
let db = await readFile(dataFile, 'utf8').then(JSON.parse).catch(() => empty());
for (const k of ['clients', 'projects', 'pending']) if (!Array.isArray(db[k])) db[k] = [];
let sessions = await readFile(sessionsFile, 'utf8').then(JSON.parse).catch(() => ({}));

let writing = Promise.resolve();
function persist(file, value) {
  writing = writing.then(async () => {
    const tmp = file + '.' + randomUUID() + '.tmp';
    await writeFile(tmp, JSON.stringify(value, null, 2));
    await rename(tmp, file);
  }).catch(e => console.error('save failed', e));
  return writing;
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
function newSession(clientId, via = 'telegram') {
  const token = randomBytes(32).toString('base64url');
  sessions[token] = { clientId, via, created: now(), expires: Date.now() + SESSION_DAYS * 864e5 };
  saveSessions();
  return token;
}
function currentClient(req) {
  const token = cookies(req)[COOKIE];
  const s = token && sessions[token];
  if (!s || s.expires < Date.now()) return null;
  const client = db.clients.find(c => c.id === s.clientId);
  return client ? { client, token, session: s } : null;
}
const page = name => readFile(new URL(name, here), 'utf8');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function loginCookie(value, maxAge = LOGIN_COOKIE_SECONDS) {
  return `${LOGIN_COOKIE}=${value}; Path=${BASE}; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${DEV ? '' : '; Secure'}`;
}

async function completeTelegramLogin(tg, res) {
  const username = tg.username.toLowerCase();
  const client = db.clients.find(c => String(c.tgId || '') === tg.tgId)
    ?? db.clients.find(c => !c.tgId && username && c.tgUsername?.toLowerCase() === username);

  if (!client) {
    const known = db.pending.find(p => p.tgId === tg.tgId);
    if (known) Object.assign(known, tg, { at: now() }); else db.pending.unshift({ ...tg, at: now() });
    db.pending = db.pending.slice(0, 200);
    await saveDb();
    return send(res, 200, { pending: true, message: 'Telegram подтверждён. Студия проверит заявку и откроет доступ к кабинету.' },
      undefined, { 'Set-Cookie': loginCookie('', 0) });
  }

  client.tgId = tg.tgId;
  client.tgUsername = tg.username || client.tgUsername;
  client.lastLogin = now();
  await saveDb();
  return send(res, 200, { ok: true }, undefined,
    { 'Set-Cookie': [loginCookie('', 0), sessionCookie(newSession(client.id), SESSION_DAYS * 86400)] });
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
    if (!me) {
      const login = telegramLogin.begin(cookies(req)[LOGIN_COOKIE], u.searchParams.get('new-code') === '1');
      const html = await renderShell('login.html', {
        BASE, SITE: esc(SITE), SUPPORT: esc(SUPPORT), BOT_URL: esc(login?.link ?? '#'),
        BOT_AVAILABLE: login ? 'true' : 'false',
      });
      const headers = login ? { ...htmlHeaders, 'Set-Cookie': loginCookie(login.cookie) } : htmlHeaders;
      return send(res, 200, html, 'text/html; charset=utf-8', headers);
    }
    return send(res, 200, await renderShell('client.html', { BASE, SITE: esc(SITE), SUPPORT: esc(SUPPORT) }), 'text/html; charset=utf-8', htmlHeaders);
  }
  if (req.method === 'GET' && path === '/auth') {
    res.writeHead(303, { Location: BASE, 'Cache-Control': 'no-store' });
    return res.end();
  }
  if (req.method === 'POST' && path === '/api/login/verify') {
    sameOrigin(req);
    const body = await readJson(req, 1024);
    const result = telegramLogin.redeem(cookies(req)[LOGIN_COOKIE], body?.code);
    if (result.error) throw new HttpError(result.status, result.error);
    return completeTelegramLogin(result.user, res);
  }
  if (req.method === 'POST' && path === '/logout') {
    sameOrigin(req);
    const me = currentClient(req);
    if (me) { delete sessions[me.token]; saveSessions(); }
    res.writeHead(303, { Location: BASE, 'Set-Cookie': sessionCookie('', 0) });
    return res.end();
  }
  if (path.startsWith('/static/') && req.method === 'GET') return serveStatic(res, path.slice(8));
  // дальше — только для вошедших клиентов
  const me = currentClient(req);
  if (path === '/api/me' && req.method === 'GET') {
    if (!me) throw new HttpError(401, 'Войдите через Telegram.');
    const projects = db.projects.filter(p => p.clientId === me.client.id).map(projectView);
    return send(res, 200, { client: { name: me.client.name, company: me.client.company, tgUsername: me.client.tgUsername }, preview: me.session.via === 'admin', projects });
  }
  const msg = path.match(/^\/api\/projects\/([a-f0-9]+)\/(messages|read)$/);
  if (msg && req.method === 'POST') {
    sameOrigin(req);
    if (!me) throw new HttpError(401, 'Войдите через Telegram.');
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
    if (!me) throw new HttpError(401, 'Войдите через Telegram.');
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
    return send(res, 200, { ...db, telegram: { configured: Boolean(BOT_TOKEN && BOT_NAME), bot: BOT_NAME }, files: undefined });
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
    if (prev) Object.assign(prev, client); else db.clients.push(client);
    db.pending = db.pending.filter(p => !(tgId && p.tgId === tgId) && !(tgUsername && p.username?.toLowerCase() === tgUsername.toLowerCase()));
    await saveDb();
    return send(res, 200, client);
  }
  const delClient = path.match(/^\/api\/clients\/([a-f0-9]+)$/);
  if (req.method === 'DELETE' && delClient) {
    if (db.projects.some(p => p.clientId === delClient[1])) throw new HttpError(409, 'Сначала удалите или передайте проекты клиента.');
    db.clients = db.clients.filter(c => c.id !== delClient[1]);
    for (const [t, s] of Object.entries(sessions)) if (s.clientId === delClient[1]) delete sessions[t];
    await saveDb(); saveSessions();
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
    if (!db.clients.some(c => c.id === view[1])) throw new HttpError(404, 'Клиент не найден.');
    // просмотр кабинета глазами клиента: короткая сессия только для чтения
    return send(res, 200, { url: BASE }, undefined, { 'Set-Cookie': sessionCookie(newSession(view[1], 'admin'), 3600) });
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
  if (changed) saveSessions();
}, 3600e3).unref();

createServer(wrap(clientHandler)).listen(PORT, '127.0.0.1', () => console.log('Кабинет: http://127.0.0.1:' + PORT + ' → ' + ORIGIN + BASE));
createServer(wrap(adminHandler)).listen(ADMIN_PORT, '127.0.0.1', () => console.log('Управление: http://127.0.0.1:' + ADMIN_PORT + ' → ' + ORIGIN + ADMIN_BASE));
void telegramLogin.startPolling();
