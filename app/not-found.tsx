import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Flame, SearchX, Skull } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="not-found shell">
        <section className="not-found-copy">
          <span className="not-found-kicker"><SearchX aria-hidden /> URL UNDER REVIEW</span>
          <div className="not-found-number" aria-label="Error 404">
            <span>4</span><i><Flame aria-hidden fill="currentColor" /></i><span>4</span>
          </div>
          <h1>THIS PAGE GOT<br /><em>ROASTED OFFLINE.</em></h1>
          <p>We looked everywhere. Then we looked at your URL again. The page is gone, the link is cooked, and even our critic has nothing left to say.</p>
          <div className="not-found-actions">
            <Link className="ink-button" href="/"><ArrowLeft aria-hidden /> BACK TO THE ROAST</Link>
            <Link className="not-found-hall-link" href="/hall-of-shame"><Skull aria-hidden /> VIEW SURVIVORS <ArrowUpRight aria-hidden /></Link>
          </div>
        </section>

        <aside className="not-found-scene" aria-hidden>
          <div className="lost-scribble">We tried to roast it.<br />There was nothing there. ↘</div>
          <div className="lost-mascot">
            <div className="lost-flames">🔥</div>
            <div className="lost-face"><i /><i /><b>?</b></div>
            <div className="lost-sign">YOUR PAGE<br />LEFT THE CHAT.<small>ERROR 404</small></div>
            <div className="lost-feet">︶　︶</div>
          </div>
          <div className="not-found-stamp">CERTIFIED<br />MISSING IN ACTION</div>
        </aside>
      </main>
      <div className="not-found-ticker" aria-hidden>
        <div><span>NO PAGE</span><Flame />NO ROAST <Skull />NO MERCY <span>TRY ANOTHER URL</span><Flame />404 FOREVER</div>
      </div>
    </>
  );
}
