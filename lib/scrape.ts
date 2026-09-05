import * as cheerio from "cheerio";
import { assertPublicUrl, normalizeUrl } from "@/lib/url";

const MAX_BYTES = 1_500_000;
const MAX_CHARS = 12_000;

export type WebsiteContext = {
  url: string; title: string; description: string; headings: string[];
  paragraphs: string[]; buttons: string[]; links: string[];
};

const clean = (value?: string | null) => value?.replace(/\s+/g, ' ').trim() ?? '';

export async function scrapeWebsite(input: string): Promise<WebsiteContext> {
  let current = normalizeUrl(input);
  const signal = AbortSignal.timeout(10_000);
  for (let redirects = 0; redirects <= 3; redirects++) {
    await Promise.race([assertPublicUrl(current), new Promise<never>((_, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason), { once: true });
      if (signal.aborted) reject(signal.reason);
    })]);
    const response = await fetch(current, {
      redirect: 'manual', signal,
      headers: { 'user-agent': 'RoastMySaaSBot/1.0 (+https://roastmysaas.com)' },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      await response.body?.cancel();
      if (!location || redirects === 3) throw new Error('Too many redirects.');
      current = new URL(location, current);
      if (!['http:', 'https:'].includes(current.protocol)) throw new Error('Unsupported redirect.');
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(response.status === 403 || response.status === 429
        ? 'This website blocks automated access. Try a different public page.'
        : 'Website unavailable. Check that the page opens publicly.');
    }
    if (!(response.headers.get('content-type') ?? '').toLowerCase().includes('text/html')) {
      await response.body?.cancel();
      throw new Error('This URL is not an HTML page.');
    }
    const length = Number(response.headers.get('content-length') ?? 0);
    if (length > MAX_BYTES) {
      await response.body?.cancel();
      throw new Error('Website response is too large.');
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Website returned an empty page.');
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_BYTES) {
          await reader.cancel();
          throw new Error('Website response is too large.');
        }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const html = Buffer.concat(chunks).toString('utf8');
    const $ = cheerio.load(html);
    $('script,style,svg,noscript,iframe,template,footer,[aria-hidden="true"],.cookie,.cookies,#cookie-banner').remove();
    const take = (selector: string, limit: number) => $(selector).map((_, el) => clean($(el).text())).get().filter((v) => v.length > 1).slice(0, limit);
    const context = {
      url: current.toString(), title: clean($('title').first().text()),
      description: clean($('meta[name="description"]').attr('content')),
      headings: take('h1,h2,h3', 35), paragraphs: take('main p,article p,body p', 70),
      buttons: take('button,[role="button"]', 25),
      links: $('a').map((_, el) => clean($(el).text())).get().filter((v) => v.length > 2 && v.length < 90).slice(0, 40),
    };
    if ([...context.headings, ...context.paragraphs].join(' ').length < 80) throw new Error('We found the site, but not enough words to roast.');
    // Bound individual strings too: a single huge paragraph used to bypass the cap.
    context.title = context.title.slice(0, 300);
    context.description = context.description.slice(0, 600);
    for (const key of ['headings', 'paragraphs', 'buttons', 'links'] as const) {
      context[key] = [...new Set(context[key])].map(value => value.slice(0, 700));
    }
    while (JSON.stringify(context).length > MAX_CHARS) {
      const key = (['paragraphs', 'links', 'headings', 'buttons'] as const)
        .find(key => context[key].length > 0);
      if (!key) break;
      context[key].pop();
    }
    return context;
  }
  throw new Error('Website unavailable.');
}

