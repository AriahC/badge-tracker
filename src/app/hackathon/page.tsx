import Image from "next/image";

/** Marketing site on team vercel-mvnxyzs-projects / project veya-marketing */
const WAITLIST_URL =
  process.env.NEXT_PUBLIC_WAITLIST_URL ??
  "https://veya-marketing-eta.vercel.app";

/**
 * App demo lives on the same Vercel project as this page:
 * team vercel-mvnxyzs-projects / project veya
 * Prefer same-origin `/` so we never point at the old ariahs-projects URL.
 */
const DEMO_URL = process.env.NEXT_PUBLIC_DEMO_URL ?? "/";

export default function HackathonPage() {
  const demoIsExternal = /^https?:\/\//i.test(DEMO_URL);

  return (
    <main className="hackathon-shell">
      <section className="hackathon-hero" aria-labelledby="veya-brand">
        <div className="hackathon-copy">
          <p className="hackathon-kicker">Hackathon submission</p>
          <h1 id="veya-brand" className="hackathon-brand">
            Veya
          </h1>
          <p className="hackathon-lede">
            Big adventures. Progress you can see — and permanent digital badges
            on Solana when she finishes.
          </p>

          <div className="hackathon-actions">
            <a
              className="hackathon-btn hackathon-btn-primary"
              href={WAITLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Waitlist website
            </a>
            <a
              className="hackathon-btn hackathon-btn-secondary"
              href={DEMO_URL}
              {...(demoIsExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              App demo
            </a>
          </div>

          <p className="hackathon-note">
            Founding Family waitlist · live Badge Journey demo
          </p>
        </div>

        <div className="hackathon-visual" aria-hidden="true">
          <div className="hackathon-glow" />
          <div className="hackathon-phone hackathon-phone-a">
            <Image
              src="/veya/app-screen-home.png"
              alt=""
              width={440}
              height={900}
              priority
            />
          </div>
          <div className="hackathon-phone hackathon-phone-b">
            <Image
              src="/veya/app-screen-badge.png"
              alt=""
              width={440}
              height={900}
              priority
            />
          </div>
        </div>
      </section>
    </main>
  );
}
