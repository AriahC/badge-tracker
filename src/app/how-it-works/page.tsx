"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EncouragementTip } from "@/components/EncouragementTip";
import { SpeakButton } from "@/components/SpeakButton";
import { FEATURE_BADGES, decorationSrc } from "@/lib/assets";
import { t } from "@/lib/i18n";
import { loadProfile, updateProfile } from "@/lib/storage";
import type { Profile } from "@/lib/types";

export default function HowItWorksPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      router.replace("/onboarding");
      return;
    }
    if (p.seenHowItWorks) {
      router.replace("/home");
      return;
    }
    setProfile(p);
  }, [router]);

  const lang = profile?.language ?? "en";

  const cards = useMemo(
    () => [
      {
        title: t(lang, "howCard1Title"),
        body: t(lang, "howCard1Body"),
        img: FEATURE_BADGES.explorer,
      },
      {
        title: t(lang, "howCard2Title"),
        body: t(lang, "howCard2Body"),
        img: decorationSrc("notebook-paper"),
      },
      {
        title: t(lang, "howCard3Title"),
        body: t(lang, "howCard3Body"),
        img: FEATURE_BADGES.sparkle,
      },
    ],
    [lang],
  );

  const speakText = `${t(lang, "howItWorksTitle")}. ${cards
    .map((c) => `${c.title}. ${c.body}`)
    .join(" ")}`;

  if (!profile) {
    return <div className="screen-loading" />;
  }

  return (
    <div className="onboard">
      <header className="onboard-top">
        <p className="brand">{t(lang, "appName")}</p>
        <SpeakButton
          text={speakText}
          language={lang}
          label={t(lang, "speak")}
        />
      </header>

      <main className="onboard-main">
        <section className="step">
          <h1>{t(lang, "howItWorksTitle")}</h1>
          <EncouragementTip message={t(lang, "encourageTip")} />
          <div className="how-cards">
            {cards.map((card) => (
              <article key={card.title} className="how-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="how-card-art"
                  src={card.img}
                  alt=""
                  width={72}
                  height={72}
                />
                <h2>{card.title}</h2>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="onboard-footer single">
        <button
          type="button"
          className="primary-btn wide"
          onClick={() => {
            updateProfile({ seenHowItWorks: true });
            router.push("/home");
          }}
        >
          {t(lang, "howContinue")}
        </button>
      </footer>
    </div>
  );
}
