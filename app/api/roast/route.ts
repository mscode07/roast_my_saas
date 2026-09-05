import { NextResponse } from "next/server";
import OpenAI from "openai";
import { scrapeWebsite } from "@/lib/scrape";
import { generateRoast } from "@/lib/roast";
import { roastRequestSchema } from "@/types/roast";

// Leave time for a structured error before the hosting platform ends the request.
export const maxDuration = 60;
const attempts = new Map<string, { count: number; reset: number }>();

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const started = Date.now();
  let stage = 'validation';
  let scrapeMs = 0;
  const fail = (code: string, message: string, status: number) =>
    NextResponse.json({ success: false, error: { code, message, requestId } }, { status });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'local';
  const now = Date.now();
  for (const [key, value] of attempts) if (value.reset <= now) attempts.delete(key);
  const hit = attempts.get(ip);
  if (hit && hit.count >= 8) return fail('RATE_LIMITED', 'Too much emotional damage at once. Try again in a minute.', 429);
  attempts.set(ip, hit ? { ...hit, count: hit.count + 1 } : { count: 1, reset: now + 60_000 });
  try {
    const body = await request.json().catch(() => null);
    const input = roastRequestSchema.safeParse(body);
    if (!input.success) return fail('INVALID_REQUEST', 'Enter a valid website URL and roast mode.', 400);
    if (!process.env.OPENAI_API_KEY) return fail('NOT_CONFIGURED', 'The roasting engine is temporarily unavailable. Please try later.', 503);
    stage = 'scrape';
    const context = await scrapeWebsite(input.data.url);
    scrapeMs = Date.now() - started;
    stage = 'generation';
    const data = await generateRoast(context, input.data.roastMode);
    console.info('[roast-api]', { requestId, status: 'success', scrapeMs, totalMs: Date.now() - started });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    // Log diagnostic metadata without website copy, prompts, or credentials.
    console.error('[roast-api]', {
      requestId, stage, scrapeMs, totalMs: Date.now() - started,
      name: error instanceof Error ? error.name : 'UnknownError',
      ...(error instanceof OpenAI.APIError ? { providerStatus: error.status, providerCode: error.code, providerRequestId: error.requestID } : {}),
    });
    const timeout = error instanceof OpenAI.APIConnectionTimeoutError ||
      (error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name));
    if (timeout) return fail('TIMEOUT', stage === 'scrape'
      ? 'That website took too long to respond. Try another public page.'
      : 'The roast took too long to generate. Please try again.', 504);
    if (stage === 'scrape') {
      const message = error instanceof Error ? error.message : '';
      // Only expose our own known scraper messages, never raw network errors.
      const safe = /^(Website |This website |This URL |Too many redirects|Unsupported redirect|Only HTTP |That doesn't |Private addresses |This address |We found the site)/.test(message);
      return fail('WEBSITE_UNREADABLE', safe ? message : 'We could not read that website. Check the URL and make sure the page is public.', 422);
    }
    if (error instanceof OpenAI.APIError && error.status === 429)
      return fail('ENGINE_BUSY', 'The roasting engine is busy or temporarily at capacity. Please try again later.', 503);
    return fail('ROAST_FAILED', 'The roasting engine could not finish this report. Please try again.', 502);
  }
}
