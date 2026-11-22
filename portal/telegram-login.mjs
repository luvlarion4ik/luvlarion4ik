import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

const START_WINDOW = 10 * 60_000;
const CODE_WINDOW = 5 * 60_000;
const ATTEMPTS = 5;
const SESSION_LIMIT = 5_000;
const DELIVERY_INTERVAL = 10_000;
const HINT_INTERVAL = 5_000;
const COMMAND = /^\/(start|change|menu|projects|help)(?:@([a-zA-Z0-9_]+))?(?: ([A-Za-z0-9_-]{1,64}))?$/;
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

const STATUS = { brief: 'Обсуждение задачи', design: 'Дизайн', development: 'Разработка', review: 'Проверка и правки', launched: 'Запущен', support: 'Поддержка', paused: 'На паузе' };
const money = (amount, currency = 'RUB') => new Intl.NumberFormat('ru-RU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount || 0);

export function createTelegramLogin({ token, username, apiBase, accountUrl, shopUrl = '', supportUrl = '', ownerChat = '', emoji = {}, account = () => null, banner = '', certificate = async () => null }) {
  // Премиум-эмодзи: ID задаются в PORTAL_TG_EMOJI ({"folder":"…","card":"…"}), иначе обычные эмодзи.
  const E = (name, unicode) => [typeof emoji[name] === 'string' && /^\d{5,25}$/.test(emoji[name]) ? emoji[name] : null, unicode];
  const ICON = {
    hello: E('hello', '👋'), folder: E('folder', '📂'), card: E('card', '🧾'), chat: E('chat', '💬'), key: E('key', '🔑'),
    shop: E('shop', '🛍'), rocket: E('rocket', '🚀'), bell: E('bell', '🔔'),
  };
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

  async function sendMessage(chatId, [emojiId, unicode], text, buttons, editId) {
    const send = symbol => telegram(editId ? 'editMessageText' : 'sendMessage', {
      chat_id: chatId,
      ...(editId ? { message_id: editId } : {}),
      parse_mode: 'HTML',
      text: `${symbol} ${text}`,
      reply_markup: { inline_keyboard: buttons },
    });
    if (customEmoji && emojiId) {
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


  async function sendPhoto(chatId, file, caption, buttons) {
    const { readFile } = await import('node:fs/promises');
    const data = await readFile(file);
    const form = new FormData();
    form.append('chat_id', String(chatId));
    form.append('caption', caption);
    form.append('parse_mode', 'HTML');
    if (buttons) form.append('reply_markup', JSON.stringify({ inline_keyboard: buttons }));
    form.append('photo', new Blob([data]), file.endsWith('.png') ? 'image.png' : 'image.jpg');
    const response = await fetch(`${apiBase.replace(/\/+$/, '')}/bot${token}/sendPhoto`, { method: 'POST', body: form, redirect: 'error', signal: AbortSignal.timeout(20_000) });
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.ok !== true) throw new TelegramError(payload?.error_code ?? response.status);
    return payload.result;
  }

  function menuButtons() {
    const rows = [
      [{ text: '📂 Мои проекты', callback_data: 'projects' }, { text: '🧾 Счета', callback_data: 'invoices' }],
      [{ text: '🔐 Открыть кабинет', url: accountUrl }, { text: '🔑 Сменить пароль', callback_data: 'password' }],
    ];
    const extra = [];
    if (shopUrl) extra.push({ text: '🛍 Магазин услуг', url: shopUrl });
    if (supportUrl) extra.push({ text: '💬 Написать Илье', url: supportUrl });
    if (extra.length) rows.push(extra);
    return rows;
  }
  const back = [[{ text: '← Меню', callback_data: 'menu' }, { text: '🔐 Кабинет', url: accountUrl }]];

  function menuText(from) {
    const acc = account(from.id);
    const name = escapeHtml(String(acc?.client?.name || from.first_name || '').split(/\s+/)[0] || '');
    if (!acc) return `<b>${name ? name + ', здравствуйте' : 'Здравствуйте'}!</b>\n\nЭто бот личного кабинета Devlarion. Кабинета на этот Telegram пока нет — зарегистрируйтесь за минуту, код придёт сюда.\n\nВаш Telegram ID: <code>${from.id}</code>`;
    const open = acc.projects.length;
    const unread = acc.projects.reduce((n, p) => n + (p.messages || []).filter(m => m.from === 'studio' && !m.readByClient).length, 0);
    const due = acc.projects.flatMap(p => p.invoices || []).filter(i => i.status === 'unpaid' || i.status === 'overdue').length;
    const login = acc.client.login ? `<code>${escapeHtml(acc.client.login)}</code>` : `<code>${from.id}</code> (Telegram ID)`;
    return `<b>${name ? name + ', здравствуйте' : 'Здравствуйте'}!</b>\n\n`
      + `Проектов: <b>${open}</b>${unread ? ` · новых сообщений: <b>${unread}</b>` : ''}${due ? ` · счетов к оплате: <b>${due}</b>` : ''}\n`
      + `Логин для входа: ${login}\n\nЧто посмотреть?`;
  }

  async function showMenu(from, editId, withBanner = false) {
    if (withBanner && banner) {
      const { stat } = await import('node:fs/promises');
      if (await stat(banner).then(() => true, () => false)) await sendPhoto(from.id, banner, '<b>Devlarion</b> · сайты, боты и корпоративный ИИ').catch(() => {});
    }
    const acc = account(from.id);
    const buttons = acc ? menuButtons() : [[{ text: '✨ Зарегистрироваться', url: accountUrl + '?mode=register' }], [{ text: '🔐 Войти', url: accountUrl }], ...(shopUrl ? [[{ text: '🛍 Магазин услуг', url: shopUrl }]] : [])];
    await sendMessage(from.id, ICON.hello, menuText(from), buttons, editId);
  }

  async function showProjects(from, editId) {
    const acc = account(from.id);
    if (!acc) return showMenu(from, editId);
    if (!acc.projects.length) {
      return sendMessage(from.id, ICON.folder, '<b>Проектов пока нет</b>\n\nОпишите задачу в кабинете — заявка сразу появится у команды, а статус вы увидите здесь.', [[{ text: '✍️ Оставить заявку', url: accountUrl }], ...back], editId);
    }
    const lines = acc.projects.slice(0, 8).map(p => {
      const done = (p.stages || []).filter(x => x.state === 'done').length, all = (p.stages || []).length;
      const active = (p.stages || []).find(x => x.state === 'active');
      const unread = (p.messages || []).filter(m => m.from === 'studio' && !m.readByClient).length;
      const bar = all ? '▰'.repeat(Math.round(done / all * 8)) + '▱'.repeat(8 - Math.round(done / all * 8)) + ` ${Math.round(done / all * 100)}%` : '';
      return `<b>${escapeHtml(p.title)}</b>\n${STATUS[p.status] || ''}${active ? ' · ' + escapeHtml(active.title) : ''}\n${bar}${unread ? `\n💬 новых сообщений: ${unread}` : ''}`;
    });
    await sendMessage(from.id, ICON.folder, '<b>Ваши проекты</b>\n\n' + lines.join('\n\n'), back, editId);
  }

  async function showInvoices(from, editId) {
    const acc = account(from.id);
    if (!acc) return showMenu(from, editId);
    const list = acc.projects.flatMap(p => (p.invoices || []).map(i => ({ ...i, project: p.title })));
    const due = list.filter(i => i.status === 'unpaid' || i.status === 'overdue');
    const text = !list.length ? '<b>Счетов пока нет</b>\n\nКогда команда выставит счёт, он появится здесь и в кабинете.'
      : '<b>Счета</b>\n\n' + list.slice(0, 10).map(i => `${i.status === 'paid' ? '✓' : i.status === 'overdue' ? '‼️' : '•'} № ${escapeHtml(i.number)} — ${money(i.amount, i.currency)}\n<i>${escapeHtml(i.project)}</i>${i.status === 'paid' ? ' · оплачен' : i.status === 'overdue' ? ' · просрочен' : i.status === 'cancelled' ? ' · отменён' : ' · ожидает оплаты'}`).join('\n\n')
        + (due.length ? `\n\nК оплате: <b>${due.length}</b>. Реквизиты — в кабинете.` : '');
    await sendMessage(from.id, ICON.card, text, back, editId);
  }

  async function handleCallback(query) {
    const from = query?.from;
    if (!from || from.is_bot || !query.message || query.message.chat?.id !== from.id) return;
    await telegram('answerCallbackQuery', { callback_query_id: query.id }).catch(() => {});
    const editId = query.message.message_id;
    if (query.data === 'projects') return showProjects(from, editId);
    if (query.data === 'invoices') return showInvoices(from, editId);
    if (query.data === 'password') return sendMessage(from.id, ICON.key, '<b>Смена пароля</b>\n\nОткройте восстановление, запросите код — он придёт сюда — и задайте новый пароль.', [[{ text: '🔑 Восстановить пароль', url: accountUrl + '?mode=reset' }], ...back], editId);
    return showMenu(from, editId);
  }

  async function notifyOwner(text) {
    if (!/^-?\d{3,20}$/.test(String(ownerChat))) return;
    try { await sendMessage(Number(ownerChat), ICON.bell, escapeHtml(text), [[{ text: 'Открыть админку', url: accountUrl + 'admin/' }]]); } catch {}
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
    if (command === 'projects') return showProjects(from);
    if (command === 'start' && payload?.startsWith('cert_')) {
      const cert = await certificate(payload.slice(5));
      if (!cert) return sendMessage(from.id, ICON.card, 'Сертификат не найден или уже выдан. Сгенерируйте его заново на сайте.', [[{ text: 'Открыть сайт', url: shopUrl || accountUrl }]]);
      await sendPhoto(from.id, cert.file, `<b>Сертификат исследователя Devlarion</b>\n${escapeHtml(cert.name)}${cert.code ? `\n\nКод подарка: <code>${escapeHtml(cert.code)}</code>\nСкидка 5% на первый проект и бесплатный аудит — по согласованию.` : ''}`,
        supportUrl ? [[{ text: '💬 Обсудить проект с кодом', url: supportUrl }]] : undefined);
      await cert.done();
      return;
    }
    if (command === 'start' && !payload) return showMenu(from, undefined, true);
    if (command === 'menu' || command === 'help') return showMenu(from);
    if (command !== 'start') return;
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
          await telegram('setMyCommands', { commands: [
            { command: 'menu', description: 'Меню кабинета' },
            { command: 'projects', description: 'Мои проекты' },
            { command: 'change', description: 'Сменить пароль' },
          ] }).catch(() => {});
          console.log('Telegram login: portal bot connected.');
        }
        const updates = await telegram('getUpdates', { offset, timeout: 20, limit: 30, allowed_updates: ['message', 'callback_query'] });
        reportedProblem = null;
        for (const update of updates) {
          try { if (update.callback_query) await handleCallback(update.callback_query); else await handleMessage(update.message); }
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

  return { ready: () => ready, begin, redeem, invalidateUser, notifySession, notifyOwner, startPolling };
}
