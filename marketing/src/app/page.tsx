import Image from "next/image";
import Link from "next/link";
import { StickyMobileCta } from "@/components/Chrome";
import { Icon } from "@/components/Icons";
import {
  closing,
  forFamilies,
  founderProof,
  founderStory,
  hero,
  offer,
  problem,
  productLoop,
  site,
  trust,
  vision,
} from "@/lib/copy";

export default function HomePage() {
  return (
    <>
      <section id="hero" className="shell hero">
        <div className="hero-copy">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1>{hero.headline}</h1>
          <p className="lede" style={{ marginTop: "1.1rem" }}>
            {hero.body}
          </p>
          <div className="hero-actions">
            <Link href="/founding-family" className="btn btn-primary">
              {hero.primaryCta}
            </Link>
            <Link href="#how-it-works" className="btn btn-secondary">
              {hero.secondaryCta}
            </Link>
          </div>
          <p className="microcopy">{hero.microcopy}</p>
        </div>

        <div className="phone-stack" aria-hidden="false">
          <div className="phone phone-a">
            <Image
              src="/veya/app-screen-home.png"
              alt="Veya home screen with adventure categories"
              width={440}
              height={900}
              priority
            />
          </div>
          <div className="phone phone-b">
            <Image
              src="/veya/app-screen-badge.png"
              alt="Forest Explorer badge progress screen"
              width={440}
              height={900}
              priority
            />
          </div>
          <span className="doodle" style={{ top: "6%", right: "4%" }}>
            Small steps. Big adventures.
          </span>
        </div>
      </section>

      <section className="section-tight">
        <div className="shell founder-strip">
          <div className="polaroid">
            <div
              aria-hidden="true"
              style={{
                height: "14rem",
                borderRadius: "0.35rem",
                background:
                  "linear-gradient(160deg, #d7e4d0 0%, #b7c9b0 42%, #7f9a86 100%)",
                display: "grid",
                placeItems: "center",
                color: "var(--veya-forest-dark)",
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                padding: "1rem",
                textAlign: "center",
              }}
            >
              Two sisters.
              <br />
              A bigger tomorrow.
            </div>
            <p className="annotation">{founderProof.annotation}</p>
          </div>
          <div>
            <h2 style={{ fontSize: "clamp(1.85rem, 4vw, 2.6rem)" }}>
              {founderProof.headline}
            </h2>
            <p className="lede" style={{ marginTop: "0.9rem" }}>
              {founderProof.body}
            </p>
          </div>
        </div>
      </section>

      <section id={problem.id} className="section">
        <div className="shell">
          <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", maxWidth: "16ch" }}>
            {problem.headline}
          </h2>
          <p className="lede" style={{ marginTop: "1rem" }}>
            {problem.body}
          </p>
          <div className="benefit-grid">
            {problem.cards.map((card) => (
              <article key={card.title} className="card benefit-card">
                <div className="icon-circle">
                  <Icon name={card.icon} />
                </div>
                <h3>{card.title}</h3>
                <p className="lede">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id={productLoop.id} className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", maxWidth: "18ch" }}>
            {productLoop.headline}
          </h2>
          <p className="lede" style={{ marginTop: "0.85rem" }}>
            {productLoop.support}
          </p>
          <div className="steps">
            {productLoop.steps.map((step) => (
              <article key={step.title} className="card step-card">
                <span className="step-n">{step.n}</span>
                <div className="icon-circle" style={{ marginBottom: "0.75rem" }}>
                  <Icon name={step.icon} />
                </div>
                <h3 style={{ fontSize: "1.2rem" }}>{step.title}</h3>
                <p className="lede" style={{ marginTop: "0.4rem", fontSize: "0.95rem" }}>
                  {step.body}
                </p>
              </article>
            ))}
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/founding-family" className="btn btn-ghost">
              {productLoop.cta}
            </Link>
          </div>
        </div>
      </section>

      <section id={forFamilies.id} className="section">
        <div className="shell">
          <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", maxWidth: "18ch" }}>
            {forFamilies.headline}
          </h2>
          <p className="lede" style={{ marginTop: "1rem" }}>
            {forFamilies.body}
          </p>
          <div className="use-row">
            {forFamilies.uses.map((use) => (
              <span key={use} className="use-chip">
                {use}
              </span>
            ))}
          </div>
          <div className="callout">
            <h3>{forFamilies.calloutTitle}</h3>
            <p>{forFamilies.calloutBody}</p>
            <p className="quiet">{site.gsDisclosure}</p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", maxWidth: "14ch" }}>
            {vision.headline}
          </h2>
          <p className="lede" style={{ marginTop: "1rem" }}>
            {vision.body}
          </p>
          <div className="vision-grid">
            {vision.cards.map((card) => (
              <article key={card.title} className="card">
                <h3 style={{ fontSize: "1.2rem" }}>{card.title}</h3>
                <p className="lede" style={{ marginTop: "0.45rem", fontSize: "0.95rem" }}>
                  {card.body}
                </p>
                {card.comingLater ? <span className="tag">Coming later</span> : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", maxWidth: "14ch" }}>
            {trust.headline}
          </h2>
          <p className="lede" style={{ marginTop: "1rem" }}>
            {trust.body}
          </p>
          <div className="trust-list">
            {trust.points.map((point) => (
              <article key={point} className="card" style={{ boxShadow: "none" }}>
                <p style={{ fontWeight: 600, color: "var(--veya-forest)", fontSize: "0.95rem" }}>
                  {point}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id={offer.id} className="section">
        <div className="shell">
          <div className="offer-panel">
            <p className="eyebrow">{offer.eyebrow}</p>
            <h2 style={{ fontSize: "clamp(2.1rem, 5vw, 3.2rem)", maxWidth: "12ch" }}>
              {offer.headline}
            </h2>
            <p className="lede" style={{ marginTop: "1rem", color: "var(--veya-ink)" }}>
              {offer.body}
            </p>
            <ul className="check-list">
              {offer.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link href="/founding-family" className="btn btn-primary">
              {offer.cta}
            </Link>
            <p className="microcopy">{offer.microcopy}</p>
            <p className="quiet">{site.developmentStatus}</p>
            <p className="quiet">{offer.refund}</p>
          </div>
        </div>
      </section>

      <section id={founderStory.id} className="section" style={{ paddingTop: 0 }}>
        <div className="shell" style={{ display: "grid", gap: "1.25rem" }}>
          <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", maxWidth: "12ch" }}>
            {founderStory.headline}
          </h2>
          {founderStory.body.map((para) => (
            <p key={para} className="lede" style={{ maxWidth: "40rem" }}>
              {para}
            </p>
          ))}
          <p className="annotation">{founderStory.annotation}</p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="closing">
            <h2>{closing.headline}</h2>
            <p className="lede">{closing.body}</p>
            <Link href="/founding-family" className="btn btn-primary">
              {closing.cta}
            </Link>
            <p className="microcopy">{closing.microcopy}</p>
          </div>
        </div>
      </section>

      <StickyMobileCta />
    </>
  );
}
