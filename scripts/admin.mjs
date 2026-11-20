import { execFile } from 'node:child_process';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual, promisify } from 'node:util';
import { estimator } from '../content/pricing.mjs';
import { cases } from '../content/work.mjs';
import { readySolutions } from '../content/solutions.mjs';
import { validateSite } from './validate-site.mjs';

const host = '127.0.0.1';
const port = Number(process.env.DEVLARION_ADMIN_PORT || 4174);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Укажите порт в диапазоне 1–65535.');
const authority = host + ':' + port;
const origin = 'http://' + authority;
const configPath = new URL('../content/site.json', import.meta.url);
const template = await readFile(new URL('./admin.html', import.meta.url), 'utf8');
const buildSite = () => promisify(execFile)(process.execPath, [fileURLToPath(new URL('./build.mjs', import.meta.url))], {
  timeout: 30000, maxBuffer: 256 * 1024
});

function digest(text) {
  return createHash('sha256').update(text).digest('hex');
}

async function readConfig() {
  const source = await readFile(configPath, 'utf8');
  return { source, config: JSON.parse(source), revision: digest(source) };
}

async function replaceConfig(source) {
  const temporary = new URL('site-' + randomUUID() + '.tmp', configPath);
  try {
    await writeFile(temporary, source, {flag: 'wx'});
    await rename(temporary, configPath);
  } finally {
    await rm(temporary, {force: true}).catch(() => {});
  }
}

class HttpError extends Error {
  constructor(status, message, options = {}) {
    super(message, options);
    this.status = status;
  }
}

async function readBody(request) {
  const limit = 512 * 1024;
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers['content-type'] ?? '')) {
    throw new HttpError(415, 'Отправьте запрос с типом application/json.');
  }
  if (Number(request.headers['content-length']) > limit) throw new HttpError(413, 'Конфигурация превышает 512 КБ.');
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request.iterator({destroyOnReturn: false})) {
    bytes += chunk.length;
    if (bytes > limit) throw new HttpError(413, 'Конфигурация превышает 512 КБ.');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'Проверьте формат JSON.');
  }
}

function json(response, status, value) {
  response.writeHead(status, {'Content-Type': 'application/json; charset=utf-8'});
  response.end(JSON.stringify(value));
}

let saving = false;

async function save(request) {
  if (saving) throw new HttpError(409, 'Дождитесь завершения текущей сборки.');
  saving = true;
  try {
    const body = await readBody(request);
    const previous = await readConfig();
    if (body?.revision !== previous.revision) {
      throw new HttpError(409, 'Файл уже изменился. Перезагрузите страницу и повторите правку.');
    }
    try {
      await validateSite(body.config);
    } catch (error) {
      throw new HttpError(422, error.message);
    }
    if ((await readConfig()).revision !== previous.revision) {
      throw new HttpError(409, 'Файл уже изменился. Перезагрузите страницу и повторите правку.');
    }
    const changed = !isDeepStrictEqual(body.config, previous.config);
    const next = changed ? JSON.stringify(body.config, null, 2) + '\n' : previous.source;
    const revision = digest(next);
    if (changed) await replaceConfig(next);
    try {
      await buildSite();
    } catch (error) {
      console.error(error.stderr || error.message);
      if (changed && (await readConfig()).revision === revision) {
        await replaceConfig(previous.source);
        try {
          await buildSite();
        } catch (rollbackError) {
          console.error(rollbackError.stderr || rollbackError.message);
          throw new HttpError(500, 'Настройки восстановлены. Проверочная сборка тоже завершилась ошибкой. Подробности в терминале.', {cause: rollbackError});
        }
        throw new HttpError(500, 'Сборка завершилась ошибкой. Прежние настройки и страницы восстановлены.', {cause: error});
      }
      throw new HttpError(500, 'Сборка завершилась ошибкой. Подробности в терминале.', {cause: error});
    }
    return { config: body.config, revision };
  } finally {
    saving = false;
  }
}

await validateSite((await readConfig()).config);

const server = createServer(async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'no-referrer');

  try {
    if (request.headers.host !== authority) throw new HttpError(403, 'Откройте админку по адресу ' + origin + '.');
    if (request.method === 'GET' && request.url === '/') {
      const nonce = randomBytes(18).toString('base64');
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "default-src 'none'; script-src 'nonce-" + nonce + "'; style-src 'nonce-" + nonce
          + "'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
      });
      response.end(template.replaceAll('%%NONCE%%', nonce));
      return;
    }
    if (request.url === '/api/config' && request.method === 'GET') {
      if (saving) throw new HttpError(409, 'Дождитесь завершения текущей сборки.');
      const { config, revision } = await readConfig();
      json(response, 200, {
        config,
        revision,
        defaults: {pricing: estimator, ready: readySolutions.map(({id, status, ru}) => ({id, status, name: ru[0]}))},
        projects: cases.ru.map(({id, name}) => ({id, name}))
      });
      return;
    }
    if (request.url === '/api/config' && request.method === 'POST') {
      if (request.headers.origin !== origin) throw new HttpError(403, 'Запрос должен исходить из локальной админки.');
      json(response, 200, await save(request));
      return;
    }
    throw new HttpError(404, 'Страница не найдена.');
  } catch (error) {
    request.resume();
    if (error instanceof HttpError) json(response, error.status, {error: error.message});
    else {
      console.error(error);
      json(response, 500, {error: 'Не удалось прочитать или сохранить настройки. Подробности в терминале.'});
    }
  }
});

server.listen(port, host, () => console.log('Devlarion · управление сайтом — ' + origin));
