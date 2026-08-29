import Link from "next/link";
import { ArrowUpRight, Flame, Skull } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header shell">
      <Link href="/" className="brand" aria-label="Roast My SaaS home">
        <span>
          ROAST{" "}
          <i className="brand-flame">
            <Flame aria-hidden strokeWidth={2.8} fill="currentColor" />
          </i>
        </span>
        <em>MY SAAS</em>
      </Link>
      <nav aria-label="Main navigation">
        <a
          className="x-follow-nav"
          href="https://x.com/mscode07"
          target="_blank"
          rel="noreferrer"
          aria-label="Follow mscode07 on X"
        >
          <span aria-hidden>𝕏</span>
          <b>@mscode07</b>
        </a>
        <Link href="/hall-of-shame" className="hall-nav">
          <span className="hall-nav-icon" aria-hidden>
            <Skull strokeWidth={2.5} />
          </span>
          <span className="hall-nav-copy">
            <strong>Hall of Shame</strong>
            <p className="text-gray-300 text-sm pt-2">See the damage</p>
          </span>
          <ArrowUpRight
            className="hall-nav-arrow"
            aria-hidden
            strokeWidth={2.7}
          />
        </Link>
        {/* <a href="#about">About</a>
        <Link className="ink-button small" href="/#roast-form">
          Roast now
        </Link> */}
      </nav>
    </header>
  );
}
