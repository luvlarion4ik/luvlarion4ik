#!/usr/bin/env node
// Growth Map AI server for a regular VPS: Node.js 22, no npm packages.
//   node server/growth-map/server.mjs           — start (settings from .env next to this file or the environment)
//   node server/growth-map/server.mjs --check   — check the key and the model at CLODEX, then exit
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { createHandler } from './handler.mjs';

try {
  for (const line of readFileSync(new URL('./.env', import.meta.url), 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !line.trim().startsWith('#') && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
} catch { /* .env is optional */ }

const env = process.env;

if (process.argv.includes('--check')) {
  const base = String(env.CLODEX_BASE_URL || 'https://clodex.xyz/v1').replace(/\/+$/, '');
  if (!env.CLODEX_API_KEY) { console.error('CLODEX_API_KEY is empty'); process.exit(1); }
  const response = await fetch(base + '/models', { headers: { authorization: 'Bearer ' + env.CLODEX_API_KEY } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { console.error('CLODEX answered', response.status, JSON.stringify(data).slice(0, 300)); process.exit(1); }
  const ids = (data.data || []).map(model => model.id).sort();
  console.log('Models available for this key:\n  ' + ids.join('\n  '));
  if (!env.GM_MODEL) { console.error('\nGM_MODEL is empty. Put the GPT Sol 6.2 id from the list above into .env'); process.exit(1); }
  if (!ids.includes(env.GM_MODEL)) { console.error(`\nGM_MODEL=${env.GM_MODEL} is not in the list above`); process.exit(1); }
  console.log(`\nOK: key works, GM_MODEL=${env.GM_MODEL} is available`);
  process.exit(0);
}

const handle = createHandler();
const port = Number(env.PORT || 8787);
const host = env.HOST || '127.0.0.1';

createServer(async (req, res) => {
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 64000) { res.writeHead(413).end(); return; }
      chunks.push(chunk);
    }
    const url = `http://${req.headers.host || 'localhost'}${req.url}`;
    const request = new Request(url, {
      method: req.method, headers: req.headers,
      body: ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? undefined : Buffer.concat(chunks),
    });
    const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const response = await handle(request, env, forwarded || req.socket.remoteAddress || '');
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.writeHead(500, { 'content-type': 'application/json' });
    res.end('{"error":"server"}');
  }
}).listen(port, host, () => console.log(`Growth Map AI listening on http://${host}:${port}`));
