"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { checkout, site } from "@/lib/copy";

export default function FoundingFamilyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consents, setConsents] = useState([false, false, false]);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState("");

  function toggleConsent(index: number) {
    setConsents((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  function onSubmit(e: FormEvent) {
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

    const params = new URLSearchParams({
      email: email.trim(),
      demo: "1",
    });
    if (marketing) params.set("marketing", "1");
    if (name.trim()) params.set("name", name.trim());
    router.push(`/welcome/founding-family?${params.toString()}`);
  }

  return (
    <div className="shell section">
      <div className="page-hero" style={{ paddingTop: 0 }}>
        <p className="eyebrow">FOUNDING FAMILY</p>
        <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)" }}>
          Secure checkout
        </h1>
        <p className="lede" style={{ marginTop: "0.75rem" }}>
          Review what you&apos;re joining, then continue. Payment processing will
          be connected with Stripe later today.
        </p>
      </div>

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
            />
          </div>

          <div className="pay-placeholder" role="note">
            <strong style={{ color: "var(--veya-forest)" }}>
              Stripe payment placeholder
            </strong>
            <p style={{ marginTop: "0.35rem" }}>{checkout.demoNote}</p>
            <div className="field-row" style={{ marginTop: "0.85rem" }}>
              <div className="field">
                <label htmlFor="card-demo">Card number</label>
                <input id="card-demo" disabled placeholder="•••• •••• •••• ••••" />
              </div>
            </div>
            <div className="field-row" style={{ marginTop: "0.65rem" }}>
              <div className="field">
                <label htmlFor="exp-demo">Expiry</label>
                <input id="exp-demo" disabled placeholder="MM/YY" />
              </div>
              <div className="field">
                <label htmlFor="cvc-demo">CVC</label>
                <input id="cvc-demo" disabled placeholder="CVC" />
              </div>
            </div>
          </div>

          {checkout.consents.map((label, index) => (
            <label key={label} className="consent">
              <input
                type="checkbox"
                checked={consents[index]}
                onChange={() => toggleConsent(index)}
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
            />
            <span>{checkout.marketingOptIn}</span>
          </label>

          {error ? (
            <p role="alert" style={{ color: "#9b2c2c", fontWeight: 600 }}>
              {error}
            </p>
          ) : null}

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            {checkout.payCta}
          </button>
          <p className="microcopy" style={{ textAlign: "center" }}>
            Demo mode — no charge will be made.
          </p>
        </form>
      </div>
    </div>
  );
}
