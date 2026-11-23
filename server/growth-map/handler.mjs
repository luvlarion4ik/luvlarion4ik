// Growth Map AI endpoint. Platform-neutral: a Web-standard Request in, a Response out.
// server.mjs runs it on plain Node 22, worker.mjs on Cloudflare Workers.
import { catalog, sales } from './data.mjs';
import { analyzeSystem, parseSystem } from './prompts.mjs';
import { cleanAnalyze, cleanParse, extractJson } from './validate.mjs';

const BODY_LIMIT = 20000;
const LIMITS = { '/analyze': 6, '/parse': 20 }; // per IP per hour

export function createHandler({ now = () => Date.now(), fetchImpl = (...args) => fetch(...args), log = line => console.log(line) } = {}) {
  const buckets = new Map();
  let day = { stamp: '', count: 0 };

  const origins = env => String(env.ALLOWED_ORIGINS || '').split(',').map(item => item.trim().replace(/\/+$/, '')).filter(Boolean);
  const cors = (env, origin) => origin && origins(env).includes(origin) ? {
    'access-control-allow-origin': origin, 'access-control-allow-methods': 'POST, GET, OPTIONS',
    'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400', vary: 'Origin',
  } : {};
  const reply = (body, status, headers = {}) => new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });

  function limited(path, ip, env) {
    const time = now();
    const stamp = new Date(time).toISOString().slice(0, 10);
    if (day.stamp !== stamp) day = { stamp, count: 0 };
    if (day.count >= Number(env.DAILY_LIMIT || 400)) return true;
    const key = path + '|' + ip;
    const hits = (buckets.get(key) || []).filter(at => time - at < 3600000);
    if (hits.length >= LIMITS[path]) { buckets.set(key, hits); return true; }
    hits.push(time);
    buckets.set(key, hits);
    day.count += 1;
    if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.some(at => time - at < 3600000)) buckets.delete(k);
    return false;
  }

  async function complete(env, messages, maxTokens) {
    const base = String(env.CLODEX_BASE_URL || 'https://clodex.xyz/v1').replace(/\/+$/, '');
    const send = async body => {
      const response = await fetchImpl(base + '/chat/completions', {
        method: 'POST',
        headers: { authorization: 'Bearer ' + env.CLODEX_API_KEY, 'content-type': 'application/json' },
        body: JSON.stringify(body), signal: AbortSignal.timeout(Number(env.TIMEOUT_MS || 25000)),
      });
      const data = await response.json().catch(() => ({}));
      return { status: response.status, data };
    };
    let first = await send({ model: env.GM_MODEL, messages, max_tokens: maxTokens, response_format: { type: 'json_object' } });
    if (first.status === 400) first = await send({ model: env.GM_MODEL, messages, max_completion_tokens: maxTokens });
    if (first.status !== 200) throw Object.assign(new Error('provider ' + first.status), { code: first.status });
    const content = first.data?.choices?.[0]?.message?.content;
    return { content, usage: first.data?.usage };
  }

  async function analyze(env, input) {
    const lang = input.lang === 'en' ? 'en' : 'ru';
    const user = `<brief>${JSON.stringify(input.brief ?? {})}</brief>\n<variants>${JSON.stringify(input.variants ?? {})}</variants>\n<economy>${JSON.stringify(input.economy ?? {})}</economy>`;
    const messages = [{ role: 'system', content: analyzeSystem({ catalog, sales }, lang) }, { role: 'user', content: user }];
    let last;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const { content, usage } = await complete(env, messages, 4000);
      try {
        const { result, problems } = cleanAnalyze(extractJson(content), input, catalog, { drop: attempt === 1 });
        if (!problems.length || attempt === 1) return { result, usage, retried: attempt > 0 };
        last = problems.join('; ');
      } catch (error) {
        last = error.message;
      }
      messages.push({ role: 'assistant', content: String(content ?? '') },
        { role: 'user', content: `Ответ не прошёл проверку: ${last}. Верни исправленный JSON целиком; все числа только метками в фигурных скобках.` });
    }
    throw new Error('invalid answer: ' + last);
  }

  async function parse(env, input) {
    const text = String(input.text ?? '').slice(0, 2000);
    if (!text.trim()) throw Object.assign(new Error('empty'), { code: 400 });
    const messages = [{ role: 'system', content: parseSystem({ catalog }) }, { role: 'user', content: `<brief>${text}</brief>` }];
    const { content, usage } = await complete(env, messages, 1200);
    return { result: cleanParse(extractJson(content), catalog), usage };
  }

  return async function handle(request, env = {}, ip = '') {
    const started = now();
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const origin = request.headers.get('origin') || '';
    const headers = cors(env, origin);
    const finish = (body, status, extra = {}) => {
      log(JSON.stringify({ at: new Date(started).toISOString(), path, status, ms: now() - started, model: env.GM_MODEL, ...extra }));
      return reply(body, status, headers);
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: headers['access-control-allow-origin'] ? 204 : 403, headers });
    if (request.method === 'GET' && (path === '/health' || path === '/')) {
      return reply({ ok: true, configured: Boolean(env.CLODEX_API_KEY && env.GM_MODEL), model: env.GM_MODEL || null }, 200, headers);
    }
    if (request.method !== 'POST' || !LIMITS[path]) return finish({ error: 'not_found' }, 404);
    if (!headers['access-control-allow-origin']) return finish({ error: 'forbidden_origin' }, 403);
    if (!env.CLODEX_API_KEY || !env.GM_MODEL) return finish({ error: 'not_configured' }, 503);
    if (limited(path, ip || 'unknown', env)) return finish({ error: 'rate_limited' }, 429);

    const raw = await request.text();
    if (raw.length > BODY_LIMIT) return finish({ error: 'too_large' }, 413);
    let input;
    try { input = JSON.parse(raw); } catch { return finish({ error: 'bad_json' }, 400); }

    try {
      const { result, usage, retried } = path === '/analyze' ? await analyze(env, input) : await parse(env, input);
      return finish(result, 200, { usage, retried });
    } catch (error) {
      const status = error.code === 400 ? 400 : 502;
      return finish({ error: status === 400 ? 'bad_request' : 'unavailable' }, status, { reason: String(error.message).slice(0, 160) });
    }
  };
}
