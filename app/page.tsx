import { SiteHeader } from "@/components/site-header";
import { HomeClient } from "@/components/home-client";
import { HallPreview } from "@/components/hall-preview";
import { getHallOfShame } from "@/lib/neon";
import { connection } from "next/server";

export default async function Home() {
  await connection();
  const roasts = await getHallOfShame(12);
  return (
    <>
      <SiteHeader />
      <HomeClient />
      <HallPreview roasts={roasts} compact />
    </>
  );
}
