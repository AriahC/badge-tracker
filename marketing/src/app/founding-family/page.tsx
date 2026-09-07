"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { checkout, site } from "@/lib/copy";

function FoundingFamilyInner() {
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";
  const referredByCode = searchParams.get("ref") ?? undefined;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consents, setConsents] = useState([false, false, false]);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canceledMessage = useMemo(
    () =>
      canceled
        ? "Checkout was canceled. You can try again whenever you’re ready — nothing was charged."
        : "",
    [canceled],
  );

  function toggleConsent(index: number) {
    setConsents((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid adult email address.");
      return;
    }
    if (consents.some((c) => !c)) {
      setError("Please confirm all required acknowledgements.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          marketingOptIn: marketing,
          referredByCode,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || "Unable to start checkout. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error starting checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="shell section">
      <div className="page-hero" style={{ paddingTop: 0 }}>
        <p className="eyebrow">FOUNDING FAMILY</p>
        <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)" }}>
          Secure checkout
        </h1>
        <p className="lede" style={{ marginTop: "0.75rem" }}>
          Review what you&apos;re joining, then pay $1 once through Stripe. Not a
          subscription. Parent or guardian checkout required.
        </p>
      </div>

      {(canceledMessage || error) && (
        <p
          role="status"
          className="card"
          style={{
            marginTop: "1rem",
            color: "#9b2c2c",
            fontWeight: 600,
          }}
        >
          {error || canceledMessage}
        </p>
      )}

      <div
        className="checkout-layout"
        style={{ display: "grid", gap: "1.25rem", marginTop: "1.5rem" }}
      >
        <aside className="offer-panel" style={{ padding: "1.4rem" }}>
          <h2 style={{ fontSize: "1.65rem" }}>{checkout.title}</h2>
          <p
            style={{
              marginTop: "0.45rem",
              fontWeight: 700,
              color: "var(--veya-forest)",
              fontSize: "1.15rem",
            }}
          >
            {checkout.price}
          </p>
          <ul className="check-list">
            {checkout.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="quiet">{site.developmentStatus}</p>
          <p className="quiet" style={{ marginTop: "0.5rem" }}>
            $1 once. Not a subscription. Parent or guardian checkout required.
          </p>
        </aside>

        <form className="card form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="adult-email">Adult email address</label>
            <input
              id="adult-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@example.com"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="adult-name">Adult name (optional)</label>
            <input
              id="adult-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Preferred name"
              disabled={loading}
            />
          </div>

          <div className="pay-placeholder" role="note">
            <strong style={{ color: "var(--veya-forest)" }}>
              Secure payment with Stripe
            </strong>
            <p style={{ marginTop: "0.35rem" }}>
              After you confirm the acknowledgements below, you&apos;ll continue to
              Stripe Checkout to pay $1 once with card, Apple Pay, or Google Pay
              (where available). Veya never stores your card details.
            </p>
          </div>

          {checkout.consents.map((label, index) => (
            <label key={label} className="consent">
              <input
                type="checkbox"
                checked={consents[index]}
                onChange={() => toggleConsent(index)}
                disabled={loading}
              />
              <span>
                {index === 2 ? (
                  <>
                    I agree to the{" "}
                    <Link href="/terms" style={{ textDecoration: "underline" }}>
                      Early Access Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" style={{ textDecoration: "underline" }}>
                      Privacy Policy
                    </Link>
                    .
                  </>
                ) : (
                  label
                )}
              </span>
            </label>
          ))}

          <label className="consent">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              disabled={loading}
            />
            <span>{checkout.marketingOptIn}</span>
          </label>

          {error && !canceledMessage ? (
            <p role="alert" style={{ color: "#9b2c2c", fontWeight: 600 }}>
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Opening Stripe…" : checkout.payCta}
          </button>
          <p className="microcopy" style={{ textAlign: "center" }}>
            You will be charged $1.00 USD once. Not a subscription.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function FoundingFamilyPage() {
  return (
    <Suspense fallback={<div className="shell section">Loading checkout…</div>}>
      <FoundingFamilyInner />
    </Suspense>
  );
}
