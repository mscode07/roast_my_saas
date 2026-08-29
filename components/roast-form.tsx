"use client";
import { useEffect, useState } from "react";
import { Flame, Link2, Skull, Smile } from "lucide-react";
import type { RoastMode, RoastResult } from "@/types/roast";

const modes: {
  value: RoastMode;
  title: string;
  note: string;
  icon: typeof Smile;
}[] = [
  { value: "easy", title: "Be Gentle", note: "Friendly heat", icon: Smile },
  { value: "normal", title: "Spicy", note: "Properly spicy", icon: Flame },
  { value: "hard", title: "F**k it", note: "Bring it on", icon: Skull },
];
const messages = [
  "Reading your heroic claims…",
  "Searching for actual customer benefits…",
  "Looking for social proof…",
  "Asking your CTA what it wants from life…",
  "Preparing emotional damage…",
];

export function RoastForm({
  onResult,
}: {
  onResult: (result: RoastResult) => void;
}) {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<RoastMode>("normal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(0);
  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(
      () => setMessage((v) => (v + 1) % messages.length),
      1800,
    );
    return () => clearInterval(timer);
  }, [loading]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, roastMode: mode }),
      });
      const json = await response.json();
      if (!response.ok || !json.success)
        throw new Error(json.error?.message ?? "The roast escaped. Try again.");
      onResult(json.data);
      setTimeout(
        () =>
          document
            .getElementById("roast-result")
            ?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Our roasting department had a breakdown.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <form id="roast-form" onSubmit={submit} className="roast-form">
      <div className="url-box">
        <Link2 aria-hidden size={20} />
        <label className="sr-only" htmlFor="saas-url">
          Your SaaS URL
        </label>
        <input
          id="saas-url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yourstartup.com"
          inputMode="url"
        />
        <button className="ink-button" disabled={loading}>
          <span>🔥</span>
          {loading ? "ROASTING…" : "ROAST MY SAAS"}
        </button>
      </div>
      {loading && (
        <p className="loading-copy" aria-live="polite">
          <span /> {messages[message]}
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <fieldset>
        <legend>How much pain can you handle?</legend>
        <div className="mode-grid">
          {modes.map(({ value, title, note, icon: Icon }) => (
            <button
              type="button"
              key={value}
              className={`mode ${mode === value ? "selected" : ""}`}
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
            >
              <span className="mode-icon"><Icon aria-hidden strokeWidth={2.5} /></span>
              <strong>{title}</strong>
              <small>{note}</small>
            </button>
          ))}
        </div>
      </fieldset>
    </form>
  );
}
