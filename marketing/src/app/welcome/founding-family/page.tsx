"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { welcome } from "@/lib/copy";

function WelcomeInner() {
  const params = useSearchParams();
  const email = params.get("email") ?? "your inbox";
  const [selected, setSelected] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "https://veya.family/join";
    return `${window.location.origin}/?ref=demo`;
  }, []);

  function toggle(option: string) {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    );
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({
        title: "Veya Founding Family",
        text: welcome.shareText,
        url: shareUrl,
      });
      return;
    }
    await copyLink();
  }

  return (
    <div className="shell section" style={{ textAlign: "center", maxWidth: 720 }}>
      <div className="seal" aria-hidden="true">
        FOUNDING
        <br />
        FAMILY
        <br />
        2026
      </div>
      <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 3.6rem)" }}>{welcome.headline}</h1>
      <p className="lede" style={{ margin: "0.85rem auto 0", textAlign: "center" }}>
        {welcome.body}
      </p>
      <p className="microcopy" style={{ marginTop: "0.85rem" }}>
        We&apos;ll send early-access details to <strong>{email}</strong>.
      </p>
      <p
        className="card"
        style={{
          display: "inline-block",
          marginTop: "1.35rem",
          fontWeight: 700,
          color: "var(--veya-forest)",
        }}
      >
        {welcome.badgeLabel}
      </p>

      <section className="card" style={{ marginTop: "2rem", textAlign: "left" }}>
        <p className="eyebrow">OPTIONAL · 1 OF 2</p>
        <h2 style={{ fontSize: "1.45rem" }}>{welcome.surveyQuestion}</h2>
        <div className="chip-grid" style={{ marginTop: "1rem" }}>
          {welcome.surveyOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip${selected.includes(option) ? " selected" : ""}`}
              onClick={() => toggle(option)}
              aria-pressed={selected.includes(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.15rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setSubmitted(true)}
            disabled={selected.length === 0}
          >
            Save preferences
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setSubmitted(true)}>
            Skip for now
          </button>
        </div>
        {submitted ? (
          <p className="microcopy" role="status">
            Thanks — your preferences are noted for when Stripe and analytics go live.
          </p>
        ) : null}
      </section>

      <section className="card" style={{ marginTop: "1rem", textAlign: "left" }}>
        <h2 style={{ fontSize: "1.45rem" }}>{welcome.referralHeadline}</h2>
        <p className="lede" style={{ marginTop: "0.5rem" }}>
          {welcome.referralBody}
        </p>
        <div
          style={{
            display: "flex",
            gap: "0.55rem",
            marginTop: "1rem",
            flexWrap: "wrap",
          }}
        >
          <input
            readOnly
            value={shareUrl}
            aria-label="Referral link"
            style={{
              flex: "1 1 220px",
              minHeight: 48,
              borderRadius: "0.85rem",
              border: "1px solid var(--veya-border)",
              padding: "0.7rem 0.9rem",
              background: "var(--veya-sage-light)",
            }}
          />
          <button type="button" className="btn btn-secondary" onClick={copyLink}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: "1rem" }}
          onClick={share}
        >
          Share Veya ↗
        </button>
      </section>

      <p style={{ marginTop: "1.75rem" }}>
        <Link href="/" className="btn btn-ghost">
          Return to Veya
        </Link>
      </p>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="shell section">Loading…</div>}>
      <WelcomeInner />
    </Suspense>
  );
}
