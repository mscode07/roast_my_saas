"use client";
import { useState } from "react";
import {
  Brain,
  Crosshair,
  Diamond,
  Flame,
  MousePointer2,
  ShieldCheck,
} from "lucide-react";
import { RoastForm } from "@/components/roast-form";
import { RoastReport } from "@/components/roast-report";
import type { RoastResult } from "@/types/roast";

const criteria = [
  [Brain, "Clarity"],
  [Crosshair, "Audience"],
  [Diamond, "Value"],
  [ShieldCheck, "Trust"],
  [MousePointer2, "CTA"],
] as const;
export function HomeClient() {
  const [result, setResult] = useState<RoastResult | null>(null);
  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <p className="scribble">
            Think your landing page
            <br />
            is good? ↘
          </p>
          <h1>
            LET’S FIND <span>OUT</span>
          </h1>
          <p className="lead mt-6">
            Drop your SaaS URL and we’ll roast
            <br />
            your landing page brutally (but helpfully)
          </p>
          <RoastForm onResult={(roast) => setResult({ ...roast, createdAt: new Date().toISOString() })} />
        </div>
        <div className="mascot" aria-hidden="true">
          <div className="fire">♨</div>
          <div className="head">
            <i />
            <i />
            <b>⌣</b>
          </div>
          <div className="sign">
            YOUR HOMEPAGE
            <br />
            CALLED,
            <br />
            IT WANTS A<br />
            <span>MAKEOVER.</span>
          </div>
          <div className="legs">╵&nbsp;&nbsp;&nbsp;&nbsp;╵</div>
          <p>
            No signup.
            <br />
            No BS.
            <br />
            Just brutal
            <br />
            truth💀. ←
          </p>
        </div>
      </section>
      <div className="criteria">
        <div className="shell">
          <b>WE JUDGE YOU ON:</b>
          {criteria.map(([Icon, label]) => (
            <span key={label}>
              <i><Icon aria-hidden strokeWidth={2.2} /></i>
              {label}
            </span>
          ))}
        </div>
      </div>
      {result && <RoastReport key={`${result.website.url}-${result.createdAt ?? "draft"}`} roast={result} onPublished={setResult} />}
      <section id="about" className="about shell">
        <Flame />
        <p>
          <strong>
            Built for founders with thick skin and better things to do.
          </strong>
          <br />
          One URL. Five conversion signals. Three fixes worth making.
        </p>
      </section>
    </>
  );
}
