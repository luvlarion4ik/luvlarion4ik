// Cloudflare Workers entry. Secrets: `wrangler secret put CLODEX_API_KEY`. Variables are in wrangler.toml.
import { createHandler } from './handler.mjs';

const handle = createHandler();
export default {
  fetch: (request, env) => handle(request, env, request.headers.get('cf-connecting-ip') || ''),
};
