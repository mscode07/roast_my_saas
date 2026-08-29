import * as cheerio from "cheerio";
import { assertPublicUrl, normalizeUrl } from "@/lib/url";

const MAX_BYTES = 1_500_000;
const MAX_CHARS = 18_000;

export type WebsiteContext = {
  url: string; title: string; description: string; headings: string[];
  paragraphs: string[]; buttons: string[]; links: string[];
};

const clean = (value?: string | null) => value?.replace(/\s+/g, ' ').trim() ?? '';

export async function scrapeWebsite(input: string): Promise<WebsiteContext> {
  let current = normalizeUrl(input);
  for (let redirects = 0; redirects <= 3; redirects++) {
    await assertPublicUrl(current);
    const response = await fetch(current, {
      redirect: 'manual', signal: AbortSignal.timeout(10_000),
      headers: { 'user-agent': 'RoastMySaaSBot/1.0 (+https://roastmysaas.com)' },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location || redirects === 3) throw new Error('Too many redirects.');
      current = new URL(location, current);
      if (!['http:', 'https:'].includes(current.protocol)) throw new Error('Unsupported redirect.');
      continue;
    }
    if (!response.ok) throw new Error('Website unavailable.');
    if (!(response.headers.get('content-type') ?? '').includes('text/html')) throw new Error('This URL is not an HTML page.');
    const length = Number(response.headers.get('content-length') ?? 0);
    if (length > MAX_BYTES) throw new Error('Website response is too large.');
    const html = (await response.text()).slice(0, MAX_BYTES);
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
    const serialized = JSON.stringify(context);
    return serialized.length > MAX_CHARS ? { ...context, paragraphs: context.paragraphs.slice(0, 35), links: context.links.slice(0, 20) } : context;
  }
  throw new Error('Website unavailable.');
}

