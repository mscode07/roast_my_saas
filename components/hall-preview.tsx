"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Flame, Skull, Trophy } from "lucide-react";
import { getRoastModeLabel, type RoastResult } from "@/types/roast";

const demo = [
  // {
  //   id: "",
  //   overallScore: 28,
  //   roastMode: "hard",
  //   shareQuote:
  //     "Your homepage has six CTAs and apparently all of them are fighting for custody of the user.",
  //   createdAt: "2026-01-03",
  //   website: {
  //     url: "#",
  //     domain: "somestartup.com",
  //     name: "SomeStartup.com",
  //     detectedProduct: "",
  //     detectedAudience: "",
  //   },
  // },
  // {
  //   id: "",
  //   overallScore: 34,
  //   roastMode: "normal",
  //   shareQuote:
  //     "You somehow made an AI product sound less clear after adding AI to the sentence.",
  //   createdAt: "2026-01-02",
  //   website: {
  //     url: "#",
  //     domain: "aiworkflow.io",
  //     name: "AIWorkflow.io",
  //     detectedProduct: "",
  //     detectedAudience: "",
  //   },
  // },
  // {
  //   id: "",
  //   overallScore: 41,
  //   roastMode: "easy",
  //   shareQuote:
  //     "It’s not bad, it’s just hiding the good stuff under a mountain of blah.",
  //   createdAt: "2026-01-01",
  //   website: {
  //     url: "#",
  //     domain: "quickboost.app",
  //     name: "QuickBoost.app",
  //     detectedProduct: "",
  //     detectedAudience: "",
  //   },
  // },
] as const;

export function HallPreview({
  roasts,
  compact = false,
}: {
  roasts: RoastResult[];
  compact?: boolean;
}) {
  const [sort, setSort] = useState<"worst" | "latest">("worst");
  const source = roasts.length ? roasts : demo;
  const entries = useMemo(() => {
    const sorted = [...source].sort((a, b) =>
      sort === "worst"
        ? a.overallScore - b.overallScore
        : new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
    );
    return compact ? sorted.slice(0, 3) : sorted;
  }, [source, sort, compact]);

  return (
    <section className="hall-preview shell">
      <div className="hall-intro">
        <span className="hall-live">
          <i /> LIVE LEADERBOARD
        </span>
        <h2>
          <Skull /> HALL OF SHAME
        </h2>
        <strong>
          The bravest founders
          <br />
          on the internet.
        </strong>
        <p>
          (Nobody was dragged here.
          <br />
          They all volunteered.)
        </p>
        <div className="hall-rule">
          <Trophy />
          <span>
            <b>THE RULE</b>
            <small>Lowest score gets top billing.</small>
          </span>
        </div>
        <Flame className="hall-flame" />
        <Link href="/hall-of-shame">
          VIEW ALL ROASTS <ArrowUpRight />
        </Link>
      </div>
      <div className="hall-list">
        <header className="hall-list-head">
          <div className="hall-tabs" role="group" aria-label="Sort leaderboard">
            <button
              className={sort === "worst" ? "active" : ""}
              onClick={() => setSort("worst")}
            >
              WORST FIRST
            </button>
            <button
              className={sort === "latest" ? "active" : ""}
              onClick={() => setSort("latest")}
            >
              LATEST ROASTS
            </button>
          </div>
          <span>
            {roasts.length || demo.length} BRAVE SOUL
            {(roasts.length || demo.length) === 1 ? "" : "S"}
          </span>
        </header>
        <div className="hall-rows">
          {entries.map((roast, index) => (
            <article key={roast.id || roast.website.domain}>
              <span className="rank">
                {index < 3 ? <Trophy className={`rank-trophy rank-trophy-${index + 1}`} aria-label={`${index + 1}${index === 0 ? "st" : index === 1 ? "nd" : "rd"} place`} /> : <small>RANK</small>}
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="hall-site">
                <strong>{roast.website.domain}</strong>
                <small>
                  {getRoastModeLabel(roast.roastMode).toUpperCase()}{" "}
                  <Flame fill="currentColor" />
                </small>
              </div>
              <blockquote>
                <span>“</span>
                {roast.shareQuote}
                <span>”</span>
              </blockquote>
              <b className="hall-score">
                <small>
                  PAIN
                  <br />
                  LEVEL
                </small>
                {roast.overallScore}
                <em>/100</em>
              </b>
              {roast.id ? (
                <Link href={`/roast/${roast.id}`}>
                  VIEW ROAST <ArrowUpRight />
                </Link>
              ) : (
                <span className="demo-link">VOLUNTEER →</span>
              )}
            </article>
          ))}
        </div>
        {!entries.length && (
          <div className="hall-empty">
            <Skull /> No volunteers yet. Suspiciously healthy self-esteem.
          </div>
        )}
      </div>
    </section>
  );
}
