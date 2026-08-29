import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { HallPreview } from "@/components/hall-preview";
import { getHallOfShame } from "@/lib/neon";
import { connection } from "next/server";
export const metadata: Metadata = { title: 'Hall of Shame — Roast My SaaS', description: 'The lowest-scoring landing pages, listed only with founder consent.' };
export default async function HallPage() { await connection(); const roasts = await getHallOfShame(); return <><SiteHeader/><main className="hall-page shell"><p className="eyebrow">VOLUNTARY EMOTIONAL DAMAGE</p><h1>HALL OF <span>SHAME.</span></h1><p>Nobody was dragged here. These founders volunteered—and gave everyone else permission to learn from the wreckage.</p></main><HallPreview roasts={roasts}/></>; }
