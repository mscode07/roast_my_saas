import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { buildRoastPrompt } from "@/lib/prompts";
import type { WebsiteContext } from "@/lib/scrape";
import { roastResultSchema, type RoastMode } from "@/types/roast";

export async function generateRoast(context: WebsiteContext, roastMode: RoastMode) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured.');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.responses.parse({
    model: process.env.OPENAI_MODEL ?? 'gpt-5-mini',
    input: [{ role: 'system', content: buildRoastPrompt(context, roastMode) }],
    text: { format: zodTextFormat(roastResultSchema.omit({ id: true, createdAt: true }), 'roast_result') },
  });
  if (!response.output_parsed) throw new Error('The roasting department returned an empty tray.');
  const url = new URL(context.url);
  return roastResultSchema.parse({
    ...response.output_parsed, roastMode,
    website: { ...response.output_parsed.website, url: context.url, domain: url.hostname.replace(/^www\./, '') },
  });
}

