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

test('portal registration, sign-in and Telegram password recovery', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'devlarion-auth-'));
  const updates = [], messages = [];
  let updateId = 0;
  const bot = createServer(async (req, res) => {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const body = JSON.parse(raw || '{}');
    const method = req.url.split('/').at(-1);
    let result;
    if (method === 'getMe') result = { username: 'fixture_bot' };
    if (method === 'getWebhookInfo') result = { url: '' };
    if (method === 'getUpdates') { await delay(20); result = updates.splice(0); }
    if (method === 'sendMessage') { messages.push(body); result = { message_id: messages.length }; }
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
  for (const password of ['Абвгд', 'абвгде', 'АБВГДЕ', '123456']) {
    assert.equal((await post('register', { code: first, password }, register.cookie)).status, 422);
  }
  const password = 'Абвгде';
  const candidate = { code: first, password };
  assert.equal((await post('register', candidate, register.cookie, 'https://elsewhere.invalid')).status, 403);
  assert.equal((await post('register', candidate)).status, 410);
  assert.equal((await post('reset', candidate, register.cookie.replace('_register=', '_reset='))).status, 410);
  const submissions = await Promise.all([post('register', candidate, register.cookie), post('register', candidate, register.cookie)]);
  assert.deepEqual(submissions.map(r => r.status).sort(), [200, 410]);
  const original = session(submissions.find(r => r.ok));
  assert.deepEqual((await (await me(original)).json()).projects, []);
  const dataBefore = await readFile(join(dir, 'data.json'), 'utf8');
  assert.ok(!dataBefore.includes(password));
  const stored = JSON.parse(dataBefore);
  assert.equal(stored.clients.length, 2);
  assert.equal(stored.pending.length, 0);
  assert.match(stored.clients.find(c => c.tgId === '1001').passwordHash, /^scrypt-v1\$/);
  const adminState = await (await fetch(admin + 'api/state')).text();
  assert.ok(!adminState.includes('scrypt-v1') && !adminState.includes('passwordHash'));
  const byName = await post('password', { identifier: '@NEW_CLIENT', password });
  assert.equal(byName.status, 200);
  const another = session(byName);
  assert.equal((await post('password', { identifier: '1001', password: 'incorrect' })).status, 401);

  const legacy = await challenge('code');
  const legacyCode = await code(legacy, 1002, 'renamed_client');
  const legacySession = session(await post('verify', { code: legacyCode }, legacy.cookie));
  assert.equal((await (await me(legacySession)).json()).projects[0].id, 'c0ffee');
  const newcomer = await challenge('code');
  const newcomerCode = await code(newcomer, 1003, 'renamed_client');
  const needs = await post('verify', { code: newcomerCode }, newcomer.cookie);
  assert.equal(needs.status, 409);
  assert.equal((await needs.json()).needsPassword, true);
  const upgraded = await post('register', { source: 'code', code: newcomerCode, password: 'Simple' }, newcomer.cookie + '; ' + register.cookie);
  assert.deepEqual((await (await me(session(upgraded))).json()).projects, []);

  const unrelated = await challenge('reset');
  const unrelatedCode = await code(unrelated, 1004, 'new_client');
  const unrelatedReset = await post('reset', { identifier: '1001', code: unrelatedCode, password: 'Simple' }, unrelated.cookie);
  assert.equal(unrelatedReset.status, 404);
  assert.equal((await me(original)).status, 200);

  const bare = messages.length;
  message(1001, '/change', 'new_client');
  await until(() => messages.slice(bare).some(m => m.reply_markup?.inline_keyboard[0][0].url === account + '?mode=reset'), '/change');
  const reset = await challenge('reset');
  // The bot can enforce a delivery cooldown for the same Telegram account.
  await delay(10_050);
  const resetCode = await code(reset, 1001);
  assert.equal((await post('verify', { code: resetCode }, reset.cookie.replace('_reset=', '='))).status, 410);
  const recovery = { code: resetCode, password: 'Simple' };
  assert.equal((await post('reset', recovery)).status, 410);
  const fresh = session(await post('reset', recovery, reset.cookie));
  assert.equal((await me(original)).status, 401);
  assert.equal((await me(another)).status, 401);
  assert.equal((await me(legacySession)).status, 200);
  assert.equal((await post('reset', recovery, reset.cookie)).status, 410);
  assert.equal((await post('password', { identifier: '1001', password })).status, 401);
  const freshLogin = await post('password', { identifier: '1001', password: recovery.password });
  assert.equal(freshLogin.status, 200);
  await until(() => messages.some(m => m.chat_id === 1001 && m.text.includes('Пароль изменён')), 'reset notification');

  const exited = once(processHandle, 'exit');
  processHandle.kill();
  await exited;
  await start();
  assert.equal((await me(fresh)).status, 200);
  assert.equal((await me(original)).status, 401);
  for (let i = 0; i < 8; i++) assert.equal((await post('password', { identifier: '1001', password: 'incorrect' })).status, 401);
  assert.equal((await post('password', { identifier: '1001', password: 'incorrect' })).status, 429);
});
