import type { RoastResult } from "@/types/roast";

export function FounderHandle({ roast }: { roast: RoastResult }) {
  if (!roast.attribution?.taggingConsent) return null;
  const { xHandle } = roast.attribution;
  return (
    <a className="founder-handle" href={`https://x.com/${encodeURIComponent(xHandle)}`} target="_blank" rel="noopener noreferrer" title="Self-submitted handle; ownership not verified">
      Submitted by @{xHandle}
    </a>
  );
}
