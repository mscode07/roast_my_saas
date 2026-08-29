import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { PublicReport } from "@/components/public-report";
import { getPublicRoast } from "@/lib/neon";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const roast = await getPublicRoast(id);
  if (!roast) return { title: "Roast not found" };
  const imageUrl = `/roast/${id}/opengraph-image`;
  return {
    title: `${roast.website.name} scored ${roast.overallScore}/100 — Roast My SaaS`,
    description: roast.shareQuote,
    openGraph: {
      title: `${roast.website.name}: ${roast.overallScore}/100`,
      description: roast.shareQuote,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${roast.website.name} scored ${roast.overallScore} out of 100` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${roast.website.name}: ${roast.overallScore}/100`,
      description: roast.shareQuote,
      images: [imageUrl],
    },
  };
}
export default async function RoastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const roast = await getPublicRoast(id);
  if (!roast) notFound();
  return (
    <>
      <SiteHeader />
      <div className="public-banner">PUBLIC ROAST · PUBLISHED WITH CONSENT</div>
      <PublicReport roast={roast} />
    </>
  );
}
