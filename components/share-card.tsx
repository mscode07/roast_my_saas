"use client";

import { useRef, useState } from "react";
import { Check, Copy, Image as ImageIcon, Share2, Skull } from "lucide-react";
import { toPng } from "html-to-image";
import { getRoastModeLabel, roastResultSchema, type RoastResult } from "@/types/roast";
import { FounderHandle } from "@/components/founder-handle";

type Score = [string, number];

export function ShareCard({
  roast,
  onPublished,
}: {
  roast: RoastResult;
  onPublished: (r: RoastResult) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [shareNote, setShareNote] = useState("");
  const [xHandle, setXHandle] = useState(roast.attribution?.xHandle ?? "");
  const [taggingConsent, setTaggingConsent] = useState(false);
  const [handleError, setHandleError] = useState("");

  function updateAttribution(handle: string, consent: boolean) {
    setXHandle(handle);
    setTaggingConsent(consent);
    setHandleError("");
    const parsed = roastResultSchema.shape.attribution.safeParse(
      consent && handle.trim() ? { xHandle: handle, taggingConsent: true } : undefined,
    );
    if (!parsed.success) setHandleError("Use 1–15 letters, numbers, or underscores, with an optional @.");
    onPublished({ ...roast, attribution: parsed.success ? parsed.data : undefined });
  }
  const scores: Score[] = [
    ["Clarity", roast.categories.clarity.score],
    ["Audience", roast.categories.targetAudience.score],
    ["Value", roast.categories.valueProposition.score],
    ["Trust", roast.categories.trust.score],
    ["CTA", roast.categories.cta.score],
  ];
  const origin =
    typeof window === "undefined"
      ? (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
      : window.location.origin;
  const publicUrl = roast.id ? `${origin}/roast/${roast.id}` : origin;
  const shareText = (url: string) =>
    `I let Roast My SaaS judge my landing page 🔥${roast.attribution?.taggingConsent ? `\nSubmitted by @${roast.attribution.xHandle}` : ""}\n\nScore: ${roast.overallScore}/100\n\n“${roast.shareQuote}”\n\nThink your SaaS can survive?\n${url}`;

  async function renderCard() {
    if (!ref.current) throw new Error("Card is not ready yet.");
    await document.fonts.ready;
    ref.current.classList.add("exporting");
    try {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      return await toPng(ref.current, {
        width: 1200,
        height: 630,
        pixelRatio: 1,
        cacheBust: true,
      });
    } finally {
      ref.current.classList.remove("exporting");
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(
      `🔥 Roast My SaaS\n\n${roast.website.domain} — ${roast.overallScore}/100${roast.attribution?.taggingConsent ? `\nSubmitted by @${roast.attribution.xHandle}` : ""}\n\n${scores.map(([name, score]) => `${name}: ${score}/10`).join("\n")}\n\n“${roast.shareQuote}”\n\n${publicUrl}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function copyImage() {
    setShareNote("");
    try {
      if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
        throw new Error(
          "Image clipboard access is unavailable in this browser.",
        );
      }
      const data = await renderCard();
      const blob = await (await fetch(data)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setImageCopied(true);
      setTimeout(() => setImageCopied(false), 1800);
    } catch (error) {
      setShareNote(
        error instanceof Error
          ? `${error.message} Try Chrome, Edge, or Safari on HTTPS.`
          : "Could not copy the card image.",
      );
    }
  }

  async function shareOnX() {
    setShareNote("");
    const hostname = new URL(origin).hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      setShareNote(
        "X cannot fetch a card image from localhost. Deploy the app to a public HTTPS URL and set NEXT_PUBLIC_SITE_URL first.",
      );
      return;
    }
    let sharedRoast = roast;
    if (!sharedRoast.id) {
      const published = await publish();
      if (!published) return;
      sharedRoast = published;
    }
    const url = `${origin}/roast/${sharedRoast.id}`;
    window.location.assign(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText(url))}`,
    );
  }

  async function publish(): Promise<RoastResult | null> {
    if (handleError || (taggingConsent && !xHandle.trim())) {
      setPublishError("Enter a valid X handle or uncheck tagging consent to publish without one.");
      return null;
    }
    setPublishing(true);
    setPublishError("");
    try {
      const response = await fetch("/api/public-roasts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(roast),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error);
      onPublished(json.data);
      return json.data;
    } catch (error) {
      setPublishError(
        error instanceof Error ? error.message : "Could not publish.",
      );
      return null;
    } finally {
      setPublishing(false);
    }
  }

  return (
    <aside className="share-panel">
      <div className="share-heading">
        <Share2 size={20} /> SHARE YOUR ROAST
      </div>
      {!roast.id && (
        <fieldset className="founder-opt-in" disabled={publishing}>
          <legend>MADE THIS? GET CREDIT.</legend>
          <label htmlFor="founder-x-handle">Your X handle (optional)</label>
          <input id="founder-x-handle" value={xHandle} placeholder="@yourhandle" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-describedby="founder-handle-help founder-handle-error" aria-invalid={!!handleError} onChange={(event) => updateAttribution(event.target.value, taggingConsent)} />
          <label className="founder-consent"><input type="checkbox" checked={taggingConsent} onChange={(event) => updateAttribution(xHandle, event.target.checked)} /><span>Show my handle publicly on the roast, leaderboard and images, and let Roast My SaaS tag me when sharing this roast on X.</span></label>
          <p id="founder-handle-help">Use your own handle. Self-submitted, not verified. Skip this to stay anonymous; the handle is only saved when you opt in and publish.</p>
          <p id="founder-handle-error" className="form-error" role="status">{handleError}</p>
        </fieldset>
      )}
      <div className="social-card" ref={ref}>
        <div className="card-noise" />
        <div className="card-topline">
          <div className="card-brand">
            <span className="card-flame">
              <b>🔥</b>
            </span>
            <b>ROAST</b> <strong>MY SAAS</strong>
          </div>
          <span className="card-stamp">
            CERTIFIED
            <br />
            EMOTIONAL DAMAGE
          </span>
        </div>
        <div className="card-main">
          <div className="card-copy">
            <small>LANDING PAGE UNDER REVIEW</small>
            <h3>{roast.website.domain}</h3>
            <FounderHandle roast={roast} />
            <p>{roast.website.detectedProduct}</p>
            <blockquote>“{roast.shareQuote}”</blockquote>
            <span className="mode-label">
              {getRoastModeLabel(roast.roastMode).toUpperCase()} 🔥
            </span>
          </div>
          <div className="card-score-wrap">
            <span>
              ROAST
              <br />
              SCORE
            </span>
            <div className="card-score">
              {roast.overallScore}
              <small>/100</small>
            </div>
            <i>Ouch.</i>
          </div>
        </div>
        <div className="card-scores">
          {scores.map(([name, score], index) => (
            <div key={name}>
              <small>0{index + 1}</small>
              <span>{name}</span>
              <strong>
                {score}
                <em>/10</em>
              </strong>
            </div>
          ))}
        </div>
        <footer>
          <strong>ROASTED BY @mscode07</strong>
          <b>YOUR HOMEPAGE CALLED. IT WANTS A MAKEOVER.</b>
        </footer>
      </div>
      <button
        className="share-action dark"
        onClick={shareOnX}
        disabled={publishing}
      >
        𝕏{" "}
        {roast.id
          ? "SHARE CARD ON X"
          : publishing
            ? "MAKING IT PUBLIC…"
            : "MAKE PUBLIC & SHARE ON X"}
      </button>
      {!roast.id && (
        <p className="share-note">
          This adds the roast to the Hall of Shame so X can fetch its image
          card.
        </p>
      )}
      {shareNote && (
        <p className="share-note" role="status">
          {shareNote}
        </p>
      )}
      <button className="share-action" onClick={copyImage}>
        {imageCopied ? <Check size={18} /> : <ImageIcon size={18} />}{" "}
        {imageCopied ? "CARD IMAGE COPIED" : "COPY CARD IMAGE"}
      </button>
      <button className="share-action" onClick={copy}>
        {copied ? <Check size={18} /> : <Copy size={18} />}{" "}
        {copied ? "TEXT COPIED" : "COPY TEXT RESULT"}
      </button>
      <div className="opt-in">
        <h4>WANT IMMORTALITY?</h4>
        <p>Public roasts get an automatic image preview when shared on X.</p>
        {roast.id ? (
          <a href={`/roast/${roast.id}`} className="published">
            <Check size={16} /> You’re officially infamous. View roast →
          </a>
        ) : (
          <button onClick={publish} disabled={publishing}>
            <span className="fake-check" />
            <Skull size={18} />{" "}
            {publishing ? "Publishing…" : "Put me in the Hall of Shame"}
          </button>
        )}
        {publishError && <small className="form-error">{publishError}</small>}
      </div>
    </aside>
  );
}
