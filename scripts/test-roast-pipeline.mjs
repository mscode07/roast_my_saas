// Offline regression checks; no API credits or external websites needed.
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === 'next/server') return next('next/server.js', context);
    if (specifier.startsWith('@/')) return { url: pathToFileURL(`${process.cwd()}/${specifier.slice(2)}.ts`).href, shortCircuit: true };
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith('.ts') && !url.includes('/node_modules/')) return {
      format: 'module', shortCircuit: true,
      source: ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText,
    };
    return next(url, context);
  },
});
const dns = (await import('node:dns/promises')).default;
dns.lookup = async () => [{ address: '93.184.216.34', family: 4 }];
const { scrapeWebsite } = await import('../lib/scrape.ts');
const originalFetch = globalThis.fetch;
const html = '<html><head><title>Test</title></head><body><h1>A landing page</h1>' + '<p>' + 'Useful product copy. '.repeat(2000) + '</p></body></html>';
let signals = [];
globalThis.fetch = async (_, options) => {
  signals.push(options.signal);
  return signals.length === 1 ? new Response(null, { status: 302, headers: { location: '/home' } }) : new Response(html, { headers: { 'content-type': 'text/html' } });
};
const context = await scrapeWebsite('https://example.com');
assert.equal(context.url, 'https://example.com/home');
assert.equal(signals[0], signals[1], 'Redirects share one timeout budget');
assert.ok(JSON.stringify(context).length <= 12000, 'Huge paragraphs respect context budget');
globalThis.fetch = async () => new Response('blocked', { status: 403 });
await assert.rejects(scrapeWebsite('https://example.com'), /blocks automated access/);
globalThis.fetch = async () => new Response('x'.repeat(1_500_001), { headers: { 'content-type': 'text/html' } });
await assert.rejects(scrapeWebsite('https://example.com'), /too large/);
await assert.rejects(scrapeWebsite('http://localhost'), /Private addresses/);
const { POST } = await import('../app/api/roast/route.ts');
const request = body => new Request('http://localhost/api/roast', { method: 'POST', body });
assert.equal((await POST(request('{bad'))).status, 400);
const savedKey = process.env.OPENAI_API_KEY;
process.env.OPENAI_API_KEY = 'offline-test-key';
globalThis.fetch = async () => { throw new DOMException('Timed out', 'TimeoutError'); };
const timeout = await POST(request(JSON.stringify({ url: 'https://example.com' })));
assert.equal(timeout.status, 504);
assert.equal((await timeout.json()).error.code, 'TIMEOUT');
globalThis.fetch = async () => new Response('blocked', { status: 403 });
assert.equal((await POST(request(JSON.stringify({ url: 'https://example.com' })))).status, 422);
let providerCalls = 0;
globalThis.fetch = async (url, options) => {
  if (String(url).includes('api.openai.com')) {
    providerCalls++;
    const body = JSON.parse(options.body);
    assert.equal(body.reasoning.effort, 'minimal');
    assert.equal(body.max_output_tokens, 4000);
    return new Response(JSON.stringify({ error: { message: 'Capacity', type: 'rate_limit_error', code: 'rate_limit_exceeded' } }), { status: 429, headers: { 'content-type': 'application/json' } });
  }
  return new Response(html, { headers: { 'content-type': 'text/html' } });
};
const savedModel = process.env.OPENAI_MODEL;
process.env.OPENAI_MODEL = 'gpt-5-mini';
const busy = await POST(request(JSON.stringify({ url: 'https://example.com' })));
assert.equal(busy.status, 503);
assert.equal((await busy.json()).error.code, 'ENGINE_BUSY');
assert.equal(providerCalls, 1, 'Do not silently retry overloaded AI requests');
if (savedModel === undefined) delete process.env.OPENAI_MODEL;
else process.env.OPENAI_MODEL = savedModel;
if (savedKey === undefined) delete process.env.OPENAI_API_KEY;
else process.env.OPENAI_API_KEY = savedKey;
globalThis.fetch = originalFetch;
console.log('Roast pipeline regression checks passed.');
