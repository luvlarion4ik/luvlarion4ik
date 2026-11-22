import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

const START_WINDOW = 10 * 60_000;
const CODE_WINDOW = 5 * 60_000;
const ATTEMPTS = 5;
const SESSION_LIMIT = 5_000;
const DELIVERY_INTERVAL = 10_000;
const HINT_INTERVAL = 5_000;
const COMMAND = /^\/(start|change)(?:@([a-zA-Z0-9_]+))?(?: ([A-Za-z0-9_-]{1,64}))?$/;
const LOGIN_PAYLOAD = /^dl_([A-Za-z0-9_-]{32})$/;
const CODE_LABELS = {
  code: 'Код для входа',
  register: 'Код для регистрации',
  reset: 'Код для смены пароля',
};
const SESSION_LABELS = {
  login: 'Вход в личный кабинет',
  register: 'Регистрация завершена',
  reset: 'Пароль изменён',
};

// Emoji and their Unicode alternatives from Telegram's own @BotNews posts.
const SHIELD = ['4958900559139570572', '🛡']; // https://t.me/BotNews/118
const CHECK = ['5219899949281453881', '✅']; // https://t.me/BotNews/106

const randomKey = length => randomBytes(length).toString('base64url');
const hash = value => createHash('sha256').update(value).digest();
const digestCode = (code, request) => createHmac('sha256', request.codeKey).update(code).digest();
const escapeHtml = value => value.replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));

function sessionDetails({ device, browser, timeZone } = {}) {
  const detail = value => {
    const line = typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, 100) : '';
    return escapeHtml(line || 'Не определено');
  };
  const format = zone => new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: zone, timeZoneName: 'short',
  });
  let formatter;
  try { formatter = format(typeof timeZone === 'string' && timeZone.length < 100 ? timeZone : 'UTC'); }
  catch { formatter = format('UTC'); }
  return [
    `Устройство · ${detail(device)}`,
    `Браузер · ${detail(browser)}`,
    `Время · ${escapeHtml(formatter.format(new Date()))}`,
  ].join('\n');
}

class BotConfigurationError extends Error {}

class TelegramError extends Error {
  constructor(status, emojiRejected = false) {
    super('Telegram API status ' + status);
    this.status = status;
    this.emojiRejected = emojiRejected;
  }
}

export function createTelegramLogin({ token, username, apiBase, accountUrl }) {
  const requests = new Map();
  const lastDelivery = new Map();
  const lastHint = new Map();
  let ready = false;
  let customEmoji = true;

  async function telegram(method, body = {}) {
    const response = await fetch(`${apiBase.replace(/\/+$/, '')}/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      redirect: 'error',
      signal: AbortSignal.timeout(method === 'getUpdates' ? 27_000 : 8_000),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.ok !== true) {
      const emojiRejected = response.status === 400 && payload?.ok === false && payload.error_code === 400
        && /custom[ _-]+emoji|tg-emoji/i.test(payload.description || '');
      throw new TelegramError(payload?.error_code ?? response.status, emojiRejected);
    }
    return payload.result;
  }

  async function sendMessage(chatId, [emojiId, unicode], text, buttons) {
    const send = symbol => telegram('sendMessage', {
      chat_id: chatId,
      parse_mode: 'HTML',
      text: `${symbol} ${text}`,
      reply_markup: { inline_keyboard: buttons },
    });
    if (customEmoji) {
      try { return await send(`<tg-emoji emoji-id="${emojiId}">${unicode}</tg-emoji>`); }
      catch (error) {
        // Only retry after an explicit API rejection. A transport error may follow delivery.
        if (!error.emojiRejected) throw error;
        customEmoji = false;
      }
    }
    return send(unicode);
  }

  function prune(time) {
    for (const [key, request] of requests) {
      if (request.expires <= time) requests.delete(key);
    }
    for (const [user, last] of lastDelivery) {
      if (last + DELIVERY_INTERVAL <= time) lastDelivery.delete(user);
    }
    for (const [user, last] of lastHint) {
      if (last + HINT_INTERVAL <= time) lastHint.delete(user);
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

  function begin(cookie, replace = false, purpose = 'code', context = {}) {
    if (!Object.hasOwn(CODE_LABELS, purpose)) return null;
    prune(Date.now());
    const previous = browserRequest(cookie);
    const active = previous?.purpose === purpose ? previous : null;
    if (active && !replace) return { link: botLink(active.key), cookie };
    if (!ready) return null;
    if (active) requests.delete(active.key);
    if (requests.size >= SESSION_LIMIT) return null;

    const key = randomKey(24);
    const secret = randomKey(32);
    requests.set(key, { key, purpose, context, browserHash: hash(secret), expires: Date.now() + START_WINDOW, attempts: ATTEMPTS });
    return { link: botLink(key), cookie: `${key}.${secret}` };
  }

  function botLink(key) {
    return `https://t.me/${encodeURIComponent(username)}?start=dl_${key}`;
  }

  async function sendCodeHint(chatId, time, text, url = accountUrl, label = 'Открыть кабинет') {
    if (lastHint.has(chatId)) return;
    lastHint.set(chatId, time);
    await sendMessage(chatId, SHIELD, text, [[{ text: label, url }]]);
  }

  async function handleMessage(message) {
    const from = message?.from;
    if (message?.chat?.type !== 'private' || from?.is_bot || !Number.isSafeInteger(from?.id) || from.id < 1 || from.id !== message.chat.id) return;
    const match = COMMAND.exec(message.text || '');
    if (!match) return;
    const [, command, target, payload] = match;
    if (target && target.toLowerCase() !== username.toLowerCase()) return;
    if ((command === 'change' && !payload) || (command === 'start' && payload === 'change')) {
      await sendMessage(from.id, SHIELD,
        '<b>Смена пароля Devlarion</b>\n\nОткройте кабинет и запросите код. Вставьте код и задайте новый пароль на сайте.',
        [[{ text: 'Восстановить пароль', url: accountUrl + '?mode=reset' }]]);
      return;
    }
    if (command !== 'start') return;
    if (!payload) {
      await sendMessage(from.id, SHIELD,
        '<b>Devlarion · Личный кабинет</b>\n\nОткройте кабинет, чтобы войти или зарегистрироваться. Ваш логин — Telegram ID.\n'
        + `<code>${from.id}</code>\n\nДля смены пароля отправьте /change.`,
        [[{ text: 'Открыть кабинет', url: accountUrl }]]);
      return;
    }
    const login = LOGIN_PAYLOAD.exec(payload);
    if (!login) return;
    const request = requests.get(login[1]);
    const time = Date.now();
    prune(time);
    if (!request || request.expires <= time || (request.user && request.user.tgId !== String(from.id))) {
      await sendCodeHint(from.id, time, 'Эта ссылка больше не действует. Вернитесь в кабинет и запросите новый код.');
      return;
    }
    const formUrl = `${accountUrl}?mode=${request.purpose}`;
    if (request.delivery === 'confirmed') {
      await sendCodeHint(from.id, time,
        'Код уже в чате выше. Введите его в той же вкладке кабинета, где запрашивали.', formUrl);
      return;
    }
    if (request.delivery === 'failed') {
      await sendCodeHint(from.id, time, 'Доставку кода не удалось подтвердить. Запросите новый код в кабинете.',
        formUrl + '&new-code=1', 'Получить новый код');
      return;
    }
    if (request.delivery === 'pending') return;
    const remaining = (lastDelivery.get(from.id) ?? 0) + DELIVERY_INTERVAL - time;
    if (remaining > 0) {
      await sendCodeHint(from.id, time, `Следующий код можно запросить через ${Math.ceil(remaining / 1000)} сек. Затем снова откройте Telegram из исходной вкладки кабинета.`, formUrl);
      return;
    }

    const code = randomInt(0, 100_000_000).toString().padStart(8, '0');
    request.user = {
      tgId: String(from.id),
      username: typeof from.username === 'string' ? from.username.slice(0, 64) : '',
      name: [from.first_name, from.last_name].filter(value => typeof value === 'string').join(' ').slice(0, 128),
    };
    request.delivery = 'pending';
    request.expires = time + CODE_WINDOW;
    lastDelivery.set(from.id, time);
    try {
      const sent = await sendMessage(from.id, SHIELD,
        `<b>${CODE_LABELS[request.purpose]} · Devlarion</b>\n\n<code>${code}</code>\n\n`
        + `Логин (Telegram ID) · <code>${from.id}</code>\n${sessionDetails(request.context ?? undefined)}\n\n`
        + 'Код действует 5 минут. Вставьте его на сайте. Никому его не передавайте. '
        + 'Если вы не запрашивали код, проигнорируйте это сообщение.',
        [[{ text: 'Скопировать код', copy_text: { text: code } }]]);
      if (requests.get(request.key) !== request) return;
      if (!Number.isSafeInteger(sent?.message_id) || sent.message_id < 1) throw new TelegramError('unconfirmed delivery');
      request.codeKey = randomBytes(32);
      request.codeHash = digestCode(code, request);
      request.expires = Date.now() + CODE_WINDOW;
      request.delivery = 'confirmed';
    } catch (error) {
      request.delivery = 'failed';
      throw error;
    }
  }

  function redeem(cookie, input, purpose = 'code', consume = true) {
    const request = browserRequest(cookie);
    if (!request || request.purpose !== purpose) return { status: 410, error: 'Код истёк или уже использован. Получите новый.' };
    if (request.delivery === 'failed') return { status: 410, error: 'Доставку кода не удалось подтвердить. Получите новый код.' };
    if (request.delivery !== 'confirmed') return { status: 409, error: 'Код ещё не отправлен. Откройте Telegram и нажмите «Старт».' };
    const code = typeof input === 'string' && input.length <= 32 ? input.replace(/[\s-]+/g, '') : '';
    if (!/^\d{8}$/.test(code)) return { status: 422, error: 'Введите восемь цифр из сообщения.' };

    if (timingSafeEqual(digestCode(code, request), request.codeHash)) {
      if (consume) requests.delete(request.key);
      return { user: request.user };
    }
    request.attempts--;
    if (!request.attempts) {
      requests.delete(request.key);
      return { status: 429, error: 'Попытки закончились. Получите новый код.' };
    }
    return { status: 422, error: 'Код не совпадает. Проверьте сообщение от бота.' };
  }

  function invalidateUser(tgId) {
    const login = String(tgId);
    for (const [key, request] of requests) {
      if (request.user?.tgId === login) requests.delete(key);
    }
  }

  async function notifySession(tgId, { event, device, browser, timeZone } = {}) {
    const login = String(tgId);
    if (!ready || !/^[1-9]\d{0,15}$/.test(login) || !Number.isSafeInteger(Number(login))
        || !Object.hasOwn(SESSION_LABELS, event)) return;
    try {
      await sendMessage(Number(login), CHECK,
        `<b>${SESSION_LABELS[event]} · Devlarion</b>\n\nЛогин (Telegram ID) · <code>${login}</code>\n`
        + `${sessionDetails({ device, browser, timeZone })}\n\n`
        + 'Если вы не выполняли это действие, отправьте /change и смените пароль на сайте.',
        [[{ text: 'Открыть кабинет', url: accountUrl }]]);
    } catch (error) {
      console.warn('Telegram login: session notification failed', error instanceof TelegramError ? error.status : error.name);
    }
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
            console.warn('Telegram login: bot reply failed', error instanceof TelegramError ? error.status : error.name);
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

  return { ready: () => ready, begin, redeem, invalidateUser, notifySession, startPolling };
}
