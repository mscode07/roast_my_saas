import { neon } from "@neondatabase/serverless";
import type { RoastResult } from "@/types/roast";

type RoastRow = {
  id: string;
  result: RoastResult;
  created_at: string | Date;
};

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  return neon(connectionString);
}

function rowToRoast(row: RoastRow): RoastResult {
  return {
    ...row.result,
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function publishRoast(roast: RoastResult) {
  const sql = database();
  if (!sql) throw new Error("Hall of Shame is not configured yet.");
  const resultJson = JSON.stringify(roast);
  const rows = await sql`
    insert into roasts (
      url, domain, website_name, roast_mode, overall_score,
      clarity_score, audience_score, value_score, trust_score, cta_score,
      verdict, share_quote, result, is_public
    ) values (
      ${roast.website.url}, ${roast.website.domain}, ${roast.website.name}, ${roast.roastMode}, ${roast.overallScore},
      ${roast.categories.clarity.score}, ${roast.categories.targetAudience.score}, ${roast.categories.valueProposition.score},
      ${roast.categories.trust.score}, ${roast.categories.cta.score}, ${roast.verdict}, ${roast.shareQuote},
      ${resultJson}::jsonb, true
    )
    on conflict ((lower(domain))) do update set
      url = excluded.url,
      domain = excluded.domain,
      website_name = excluded.website_name,
      roast_mode = excluded.roast_mode,
      overall_score = excluded.overall_score,
      clarity_score = excluded.clarity_score,
      audience_score = excluded.audience_score,
      value_score = excluded.value_score,
      trust_score = excluded.trust_score,
      cta_score = excluded.cta_score,
      verdict = excluded.verdict,
      share_quote = excluded.share_quote,
      result = excluded.result,
      is_public = true,
      created_at = now()
    returning id, result, created_at
  `;
  return rowToRoast(rows[0] as RoastRow);
}

export async function getPublicRoast(id: string) {
  const sql = database();
  if (!sql) return null;
  const rows = await sql`
    select id, result, created_at
    from roasts
    where id = ${id}::uuid and is_public = true
    limit 1
  `;
  return rows[0] ? rowToRoast(rows[0] as RoastRow) : null;
}

export async function getHallOfShame(limit = 50) {
  const sql = database();
  if (!sql) return [];
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const rows = await sql`
    select id, result, created_at
    from roasts
    where is_public = true
    order by overall_score asc, created_at desc
    limit ${safeLimit}
  `;
  return rows.map((row) => rowToRoast(row as RoastRow));
}
