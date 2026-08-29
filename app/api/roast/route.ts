import { NextResponse } from "next/server";
import { scrapeWebsite } from "@/lib/scrape";
import { generateRoast } from "@/lib/roast";
import { roastRequestSchema } from "@/types/roast";

const attempts = new Map<string, { count: number; reset: number }>();

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'local';
  const now = Date.now(); const hit = attempts.get(ip);
  if (hit && hit.reset > now && hit.count >= 8) return NextResponse.json({ success: false, error: { code: 'RATE_LIMITED', message: 'Too much emotional damage at once. Try again in a minute.' } }, { status: 429 });
  attempts.set(ip, !hit || hit.reset <= now ? { count: 1, reset: now + 60_000 } : { ...hit, count: hit.count + 1 });
  try {
    const input = roastRequestSchema.parse(await request.json());
    const context = await scrapeWebsite(input.url);
    const data = await generateRoast(context, input.roastMode);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Our professional roasting department had a breakdown.';
    const invalid = message.includes('website') || message.includes('HTTP') || message.includes('URL');
    const safeMessage = invalid
      ? message
      : message.includes('OPENAI_API_KEY')
        ? 'The roasting engine is not configured yet.'
        : 'Our roasting department hit a snag. Please try again.';
    console.error('[roast-api]', error);
    return NextResponse.json({ success: false, error: { code: invalid ? 'INVALID_URL' : 'ROAST_FAILED', message: safeMessage } }, { status: invalid ? 400 : 502 });
  }
}
