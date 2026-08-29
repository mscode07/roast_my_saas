"use client";
import { Brain, Crosshair, Diamond, Flame, MousePointer2, ShieldCheck } from "lucide-react";
import { getRoastModeLabel, type RoastResult } from "@/types/roast";
import { ShareCard } from "@/components/share-card";

const meta = [
  ['clarity','Clarity',Brain],['targetAudience','Audience',Crosshair],['valueProposition','Value',Diamond],['trust','Trust',ShieldCheck],['cta','CTA',MousePointer2],
] as const;

export function RoastReport({ roast, onPublished }: { roast: RoastResult; onPublished: (r: RoastResult) => void }) {
  return <section id="roast-result" className="result-shell shell">
    <main className="report">
      <header className="report-top"><div><h2>{roast.website.name}</h2><p>Roasted in <b>{getRoastModeLabel(roast.roastMode).toUpperCase()}</b> mode</p></div><span className="stamp">ROASTED<br/><small>{roast.createdAt ? new Date(roast.createdAt).toLocaleDateString() : 'TODAY'}</small></span></header>
      <div className="score-overview"><div className="big-score"><span>ROAST SCORE</span><strong>{roast.overallScore}<small>/100</small></strong><p>{roast.verdict}</p></div><div className="score-list">{meta.map(([key,label,Icon]) => { const score = roast.categories[key].score; return <div key={key}><Icon size={19}/><span>{label}</span><i><b style={{width:`${score * 10}%`}}/></i><strong>{score}/10</strong></div>})}</div></div>
      <h3 className="section-title"><Flame size={22} fill="currentColor"/> THE ROAST <small>← the good, the bad, the oof</small></h3>
      <div className="category-grid">{meta.map(([key,label,Icon], index) => { const item = roast.categories[key]; return <article key={key}><header><span>0{index+1}</span><Icon size={18}/><h4>{label}</h4><b>{item.score}/10</b></header><blockquote>{item.roast}</blockquote><p>{item.explanation}</p><strong>FIX IT</strong><p>{item.fix}</p></article>})}</div>
      <h3 className="section-title fixes-title"><Flame size={22} fill="currentColor"/> IF YOU FIX ONLY THREE THINGS…</h3>
      <div className="fix-grid">{roast.topFixes.map((fix, index) => <article key={fix.title}><span>{index+1}</span><div><h4>{fix.title}</h4><p>{fix.explanation}</p></div></article>)}</div>
    </main>
    <ShareCard roast={roast} onPublished={onPublished}/>
  </section>;
}
