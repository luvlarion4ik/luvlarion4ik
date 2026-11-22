import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

const START_WINDOW = 10 * 60_000;
const CODE_WINDOW = 5 * 60_000;
const ATTEMPTS = 5;
const SESSION_LIMIT = 5_000;
const DELIVERY_INTERVAL = 10_000;
const START_COMMAND = /^\/start(?:@([a-zA-Z0-9_]+))? dl_([A-Za-z0-9_-]{32})$/;

const randomKey = length => randomBytes(length).toString('base64url');
const hash = value => createHash('sha256').update(value).digest();
const digestCode = (code, request) => createHmac('sha256', request.codeKey).update(code).digest();

class BotConfigurationError extends Error {}

class TelegramError extends Error {
  constructor(status) {
    super('Telegram API status ' + status);
    this.status = status;
  }
}

export function createTelegramLogin({ token, username, apiBase }) {
  const requests = new Map();
  const lastDelivery = new Map();
  let ready = false;

  async function telegram(method, body = {}) {
    const response = await fetch(`${apiBase.replace(/\/+$/, '')}/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      redirect: 'error',
      signal: AbortSignal.timeout(method === 'getUpdates' ? 27_000 : 8_000),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) throw new TelegramError(payload?.error_code ?? response.status);
    return payload.result;
  }

  function prune(time) {
    for (const [key, request] of requests) {
      if (request.expires <= time) requests.delete(key);
    }
    for (const [user, last] of lastDelivery) {
      if (last + DELIVERY_INTERVAL <= time) lastDelivery.delete(user);
    }
  }

  function browserRequest(cookie) {
    const match = /^([A-Za-z0-9_-]{32})\.([A-Za-z0-9_-]{43})$/.exec(cookie || '');
    if (!match) return null;
    const [, key, secret] = match;
    const request = requests.get(key);
    if (!request || request.expires <= Date.now() || !timingSafeEqual(hash(secret), request.browserHash)) return null;
    return request;
  }

  function begin(cookie, replace = false) {
    prune(Date.now());
    const active = browserRequest(cookie);
    if (active && !replace) return { link: botLink(active.key), cookie };
    if (!ready) return null;
    if (active) requests.delete(active.key);
    if (requests.size >= SESSION_LIMIT) return null;

    const key = randomKey(24);
    const secret = randomKey(32);
    requests.set(key, { key, browserHash: hash(secret), expires: Date.now() + START_WINDOW, attempts: ATTEMPTS });
    return { link: botLink(key), cookie: `${key}.${secret}` };
  }

  function botLink(key) {
    return `https://t.me/${encodeURIComponent(username)}?start=dl_${key}`;
  }

  async function handleMessage(message) {
    const from = message?.from;
    if (message?.chat?.type !== 'private' || from?.is_bot || !Number.isSafeInteger(from?.id) || from.id !== message.chat.id) return;
    const match = START_COMMAND.exec(message.text || '');
    if (!match || (match[1] && match[1].toLowerCase() !== username.toLowerCase())) return;
    const request = requests.get(match[2]);
    const time = Date.now();
    if (!request || request.expires <= time || request.codeHash || request.delivering) return;
    if ((lastDelivery.get(from.id) ?? 0) + DELIVERY_INTERVAL > time) return;
    prune(time);

    const code = randomInt(0, 100_000_000).toString().padStart(8, '0');
    request.delivering = true;
    request.codeKey = randomBytes(32);
    request.codeHash = digestCode(code, request);
    request.expires = time + CODE_WINDOW;
    request.user = {
      tgId: String(from.id),
      username: typeof from.username === 'string' ? from.username.slice(0, 64) : '',
      name: [from.first_name, from.last_name].filter(value => typeof value === 'string').join(' ').slice(0, 128),
    };
    lastDelivery.set(from.id, time);
    try {
      await telegram('sendMessage', {
        chat_id: from.id,
        parse_mode: 'HTML',
        text: `<b>Devlarion · Личный кабинет</b>\n\nКод для входа\n<code>${code}</code>\n\nДействует 5 минут. Скопируйте код и вставьте его на сайте. Никому его не передавайте.`,
        reply_markup: { inline_keyboard: [[{ text: 'Скопировать код', copy_text: { text: code } }]] },
      });
    } catch (error) {
      delete request.codeHash;
      delete request.codeKey;
      delete request.user;
      throw error;
    } finally {
      request.delivering = false;
    }
  }

  function redeem(cookie, input) {
    const request = browserRequest(cookie);
    if (!request) return { status: 410, error: 'Код истёк или уже использован. Получите новый.' };
    if (!request.codeHash) return { status: 409, error: 'Код ещё не отправлен. Откройте Telegram и нажмите «Старт».' };
    const code = typeof input === 'string' && input.length <= 32 ? input.replace(/[\s-]+/g, '') : '';
    if (!/^\d{8}$/.test(code)) return { status: 422, error: 'Введите восемь цифр из сообщения.' };

    if (timingSafeEqual(digestCode(code, request), request.codeHash)) {
      requests.delete(request.key);
      return { user: request.user };
    }
    request.attempts--;
    if (!request.attempts) {
      requests.delete(request.key);
      return { status: 429, error: 'Попытки закончились. Получите новый код.' };
    }
    return { status: 422, error: 'Код не совпадает. Проверьте сообщение от бота.' };
  }

  async function startPolling() {
    if (!/^\d+:[A-Za-z0-9_-]+$/.test(token) || !/^[A-Za-z0-9_]{5,32}$/.test(username)) {
      console.warn('Telegram login: portal bot is not configured.');
      return;
    }

    let offset;
    let reportedProblem;
    while (true) {
      try {
        if (!ready) {
          const bot = await telegram('getMe');
          if (bot.username?.toLowerCase() !== username.toLowerCase()) throw new BotConfigurationError('configured bot username does not match');
          const webhook = await telegram('getWebhookInfo');
          if (webhook.url) throw new BotConfigurationError('the portal bot already has a webhook');
          ready = true;
          console.log('Telegram login: portal bot connected.');
        }
        const updates = await telegram('getUpdates', { offset, timeout: 20, limit: 30 });
        reportedProblem = null;
        for (const update of updates) {
          try { await handleMessage(update.message); }
          catch (error) {
            console.warn('Telegram login: code delivery failed', error instanceof TelegramError ? error.status : error.name);
          }
          offset = update.update_id + 1;
        }
      } catch (error) {
        ready = false;
        const problem = error instanceof TelegramError ? 'API status ' + error.status :
          error instanceof BotConfigurationError ? error.message : error.name;
        if (problem !== reportedProblem) console.warn('Telegram login:', problem);
        reportedProblem = problem;
        await delay(error.status === 401 || error.status === 409 || error instanceof BotConfigurationError ? 30_000 : 4_000);
      }
    }
  }

  return { ready: () => ready, begin, redeem, startPolling };
}
