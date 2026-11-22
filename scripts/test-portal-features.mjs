import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

async function listen(server) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return server.address().port;
}

async function port() {
  const socket = createServer();
  const number = await listen(socket);
  await new Promise(resolve => socket.close(resolve));
  return number;
}

async function until(check, description) {
  for (let i = 0; i < 200; i++) {
    const result = await check();
    if (result) return result;
    await delay(30);
  }
  assert.fail('Timed out waiting for ' + description);
}

test('portal profile login, requests and Telegram menu', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'devlarion-features-'));
  const updates = [], messages = [];
  let updateId = 0;
  const bot = createServer(async (req, res) => {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const body = /multipart/.test(req.headers['content-type'] || '') ? { multipart: true } : JSON.parse(raw || '{}');
    const method = req.url.split('/').at(-1);
    let result;
    if (method === 'getMe') result = { username: 'fixture_bot' };
    if (method === 'getWebhookInfo') result = { url: '' };
    if (method === 'getUpdates') { await delay(20); result = updates.splice(0); }
    if (method === 'sendMessage' || method === 'editMessageText') { messages.push({ ...body, method }); result = { message_id: messages.length }; }
    if (method === 'answerCallbackQuery' || method === 'setMyCommands') result = true;
    if (method === 'sendPhoto') { messages.push({ method, photo: true }); result = { message_id: messages.length }; }
    res.writeHead(result ? 200 : 400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: Boolean(result), result }));
  });
  let processHandle;
  t.after(async () => {
    if (processHandle && processHandle.exitCode === null && !processHandle.signalCode) {
      const exited = once(processHandle, 'exit');
      processHandle.kill();
      await exited;
    }
    bot.closeAllConnections();
    await new Promise(resolve => bot.close(resolve));
    await rm(dir, { recursive: true, force: true });
  });

  const botPort = await listen(bot);
  const clientPort = await port(), adminPort = await port();
  const origin = 'http://127.0.0.1:' + clientPort;
  const account = origin + '/account/';
  const admin = 'http://127.0.0.1:' + adminPort + '/account/admin/';
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Mobile Safari/605.1.15';
  const fixture = {
    clients: [{ id: 'abcd', name: 'Existing client', company: 'Studio', tgId: '1002', tgUsername: 'old_handle' }],
    projects: [{ id: 'c0ffee', clientId: 'abcd', title: 'Private project', stages: [], files: [], estimates: [], invoices: [], messages: [] }],
    pending: [{ tgId: '1001', username: 'new_client' }],
  };
  await writeFile(join(dir, 'data.json'), JSON.stringify(fixture));
  const start = async () => {
    processHandle = spawn(process.execPath, [fileURLToPath(new URL('../portal/server.mjs', import.meta.url))], {
      env: { ...process.env, PORTAL_DATA: dir, PORTAL_PORT: String(clientPort), PORTAL_ADMIN_PORT: String(adminPort),
        PORTAL_DEV: '1', PORTAL_ORIGIN: origin, TELEGRAM_BOT_TOKEN: '10:fixture', TELEGRAM_BOT_USERNAME: 'fixture_bot',
        TELEGRAM_API_BASE: 'http://127.0.0.1:' + botPort },
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    let log = '';
    processHandle.stdout.on('data', chunk => { log += chunk; });
    await until(() => log.includes('portal bot connected'), 'bot connection');
  };
  await start();
  const post = (endpoint, body, cookie = '', site = origin) => fetch(account + 'api/login/' + endpoint, {
    method: 'POST', headers: { origin: site, cookie, 'user-agent': ua, 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
  const me = cookie => fetch(account + 'api/me', { headers: { cookie } });
  const session = response => {
    const set = response.headers.getSetCookie().find(value => value.startsWith('dl_portal='));
    assert.match(set || '', /HttpOnly/);
    return set.split(';')[0];
  };
  async function challenge(mode) {
    const response = await fetch(account + '?mode=' + mode, { headers: { 'user-agent': ua } });
    assert.equal(response.status, 200);
    const html = await response.text();
    const payload = /https:\/\/t\.me\/fixture_bot\?start=(dl_[\w-]{32})/.exec(html)?.[1];
    assert.ok(payload);
    const cookie = response.headers.getSetCookie()[0];
    assert.match(cookie, /HttpOnly; SameSite=Strict/);
    return { cookie: cookie.split(';')[0], payload };
  }
  function message(user, text, username) {
    updates.push({ update_id: ++updateId, message: { chat: { id: user, type: 'private' },
      from: { id: user, first_name: 'Fixture', username }, text } });
  }
  async function code(ch, user, username) {
    const before = messages.length;
    message(user, '/start ' + ch.payload, username);
    const notification = await until(() => messages.slice(before).find(msg =>
      msg.chat_id === user && msg.reply_markup?.inline_keyboard[0][0].copy_text), 'one-time code');
    const digits = notification.reply_markup.inline_keyboard[0][0].copy_text.text;
    assert.match(digits, /^\d{8}$/);
    for (const label of ['<code>' + digits + '</code>', 'iPhone', 'Safari', '<code>' + user + '</code>']) assert.ok(notification.text.includes(label));
    return digits;
  }

  const register = await challenge('register');
  const first = await code(register, 1001, 'new_client');
  const password = 'Абвгде';
  const cookie = session(await post('register', { code: first, password }, register.cookie));
  const api = (path, data, site = origin) => fetch(account + path, { method: 'POST', headers: { origin: site, cookie, 'content-type': 'application/json' }, body: JSON.stringify(data) });

  // Новый пользователь получает ссылки для приветственного экрана.
  const fresh = await (await me(cookie)).json();
  assert.deepEqual(fresh.projects, []);
  assert.ok(fresh.links.shop && fresh.links.bot);
  assert.equal(fresh.client.login, '');

  // Свой логин: проверка формата, занятости и вход по нему.
  assert.equal((await api('api/profile', { login: '1x' })).status, 422);
  assert.equal((await api('api/profile', { login: 'old_handle' })).status, 409);
  assert.equal((await api('api/profile', { login: 'anna_sever' }, 'https://elsewhere.invalid')).status, 403);
  const saved = await api('api/profile', { login: '@Anna_Sever', name: 'Анна', company: 'Север' });
  assert.equal(saved.status, 200);
  assert.equal((await saved.json()).client.login, 'anna_sever');
  assert.equal((await post('password', { identifier: 'anna_sever', password })).status, 200);
  assert.equal((await post('password', { identifier: 'ANNA_SEVER', password })).status, 200);
  for (const id of ['@new_client', 'new_client', ' https://t.me/new_client/ ', 't.me/New_Client', '1001', '@1001']) assert.equal((await post('password', { identifier: id, password })).status, 200, id);
  assert.equal((await post('password', { identifier: 'anna_sever', password: 'wrong' })).status, 401);

  // Заявка из кабинета сразу становится проектом клиента.
  assert.equal((await api('api/requests', { topic: 'Сайт', text: 'коротко' })).status, 422);
  const req = await api('api/requests', { topic: 'Сайт', text: 'Нужен сайт с каталогом и заявками в Telegram.', budget: 'до 150 000 ₽' });
  assert.equal(req.status, 200);
  const project = (await req.json()).project;
  assert.equal(project.status, 'brief');
  assert.equal(project.stages[0].state, 'active');
  assert.equal((await api('api/requests', { topic: 'Бот', text: 'Ещё одна заявка сразу следом.' })).status, 429);
  const after = await (await me(cookie)).json();
  assert.equal(after.projects.length, 1);
  assert.equal(after.client.login, 'anna_sever');

  // Короткая форма заявки с сайта.
  const lead = (data, site = origin) => fetch(account + 'api/lead', { method: 'POST', headers: { origin: site, 'content-type': 'application/json' }, body: JSON.stringify(data) });
  assert.equal((await lead({ name: 'Анна' })).status, 422);
  assert.equal((await lead({ name: 'Анна', contact: '@anna' }, 'https://elsewhere.invalid')).status, 403);
  assert.equal((await lead({ name: 'Анна', contact: '@anna', text: 'Нужен бот', page: '/ru/' })).status, 200);
  assert.match(await readFile(join(dir, 'leads.jsonl'), 'utf8'), /"contact":"@anna"/);

  // Меню бота и кнопки.
  const before = messages.length;
  message(1001, '/menu', 'new_client');
  const menu = await until(() => messages.slice(before).find(m => m.chat_id === 1001 && m.reply_markup?.inline_keyboard?.flat().some(b => b.callback_data === 'projects')), 'bot menu');
  assert.ok(menu.text.includes('anna_sever'));
  updates.push({ update_id: ++updateId, callback_query: { id: 'q1', from: { id: 1001, first_name: 'Fixture' }, data: 'projects', message: { message_id: 7, chat: { id: 1001, type: 'private' } } } });
  const list = await until(() => messages.find(m => m.method === 'editMessageText' && m.text.includes('Заявка: Сайт')), 'projects callback');
  assert.equal(list.message_id, 7);
  updates.push({ update_id: ++updateId, callback_query: { id: 'q2', from: { id: 1001, first_name: 'Fixture' }, data: 'invoices', message: { message_id: 7, chat: { id: 1001, type: 'private' } } } });
  await until(() => messages.find(m => m.method === 'editMessageText' && m.text.includes('Счетов пока нет')), 'invoices callback');
  // Незарегистрированный пользователь получает кнопку регистрации.
  const stranger = messages.length;
  message(4242, '/start', 'stranger');
  const welcome = await until(() => messages.slice(stranger).find(m => m.chat_id === 4242), 'stranger menu');
  assert.ok(welcome.reply_markup.inline_keyboard.flat().some(b => b.url?.includes('mode=register')));
});
