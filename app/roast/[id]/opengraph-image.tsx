import { ImageResponse } from "next/og";
import { getPublicRoast } from "@/lib/neon";
import { getRoastModeLabel } from "@/types/roast";

export const alt = "Roast My SaaS result card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const roast = await getPublicRoast(id);
  if (!roast) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f1e9",
          color: "#111",
          fontSize: 64,
          fontWeight: 900,
        }}
      >
        ROAST NOT FOUND.
      </div>,
      size,
    );
  }
  const scores = [
    ["CLARITY", roast.categories.clarity.score],
    ["AUDIENCE", roast.categories.targetAudience.score],
    ["VALUE", roast.categories.valueProposition.score],
    ["TRUST", roast.categories.trust.score],
    ["CTA", roast.categories.cta.score],
  ] as const;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 44,
        background: "#f5f1e9",
        color: "#111",
        border: "8px solid #111",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 22,
          borderBottom: "5px solid #111",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 37,
            fontWeight: 900,
          }}
        >
          <span
            style={{
              width: 62,
              height: 62,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 17,
              borderRadius: "50% 50% 48% 20%",
              background: "#d92736",
              color: "white",
              fontSize: 35,
            }}
          >
            🔥
          </span>
          ROAST <span style={{ color: "#d92736", marginLeft: 9 }}>MY SAAS</span>
        </div>
        <div
          style={{
            display: "flex",
            padding: "10px 16px",
            border: "4px solid #d92736",
            color: "#d92736",
            fontSize: 15,
            lineHeight: 1.15,
            fontWeight: 900,
            textAlign: "center",
            transform: "rotate(2deg)",
          }}
        >
          CERTIFIED
          <br />
          EMOTIONAL DAMAGE
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          padding: "24px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            paddingRight: 35,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: 2 }}>
            {roast.attribution?.taggingConsent
              ? `Submitted by @${roast.attribution.xHandle}`
              : "LANDING PAGE UNDER REVIEW"}
          </span>
          <div
            style={{
              display: "flex",
              fontSize: 51,
              lineHeight: 1,
              fontWeight: 900,
              textTransform: "uppercase",
              margin: "11px 0 21px",
            }}
          >
            {roast.website.domain}
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 735,
              fontSize: 27,
              lineHeight: 1.25,
              fontWeight: 800,
            }}
          >
            “{roast.shareQuote}”
          </div>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              marginTop: 23,
              padding: "9px 14px",
              background: "#111",
              color: "white",
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            {getRoastModeLabel(roast.roastMode).toUpperCase()} 🔥
          </div>
        </div>
        <div
          style={{
            width: 300,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            paddingLeft: 28,
            borderLeft: "5px solid #111",
          }}
        >
          <span
            style={{
              color: "#d92736",
              fontSize: 16,
              lineHeight: 1,
              fontWeight: 900,
              textAlign: "right",
            }}
          >
            ROAST
            <br />
            SCORE
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              color: "#d92736",
              fontSize: 138,
              lineHeight: 0.9,
              fontWeight: 900,
            }}
          >
            {roast.overallScore}
            <small style={{ color: "#111", fontSize: 26, marginBottom: 14 }}>
              /100
            </small>
          </div>
          <i
            style={{
              fontSize: 18,
              fontWeight: 800,
              transform: "rotate(-5deg)",
            }}
          >
            Ouch.
          </i>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          background: "#111",
          border: "5px solid #111",
          gap: 5,
        }}
      >
        {scores.map(([name, score], index) => (
          <div
            key={name}
            style={{
              display: "flex",
              flex: 1,
              alignItems: "flex-end",
              justifyContent: "space-between",
              padding: "13px 15px",
              background: "#f5f1e9",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <small
                style={{ color: "#d92736", fontSize: 12, fontWeight: 800 }}
              >
                0{index + 1}
              </small>
              <span style={{ fontSize: 14, fontWeight: 900 }}>{name}</span>
            </div>
            <strong style={{ fontSize: 29 }}>
              {score}
              <small style={{ fontSize: 12 }}>/10</small>
            </strong>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 16,
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        <span>roastmysaas.com</span>
        <span
          style={{
            color: "#111",
            borderBottom: "3px solid #d92736",
            paddingBottom: 2,
          }}
        >
          MADE BY @mscode07 ON X
        </span>
        <span style={{ color: "#d92736" }}>
          YOUR HOMEPAGE CALLED. IT WANTS A MAKEOVER.
        </span>
      </div>
    </div>,
    size,
  );
}
