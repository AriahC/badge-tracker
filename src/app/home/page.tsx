"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeClump } from "@/components/BadgeClump";
import { BottomNav } from "@/components/BottomNav";
import { EmptyAdventure } from "@/components/EmptyAdventure";
import { SpeakButton } from "@/components/SpeakButton";
import {
  getBadgesForLevel,
  getDemoMintBadge,
  groupBadgesByCategory,
} from "@/lib/badges";
import { t } from "@/lib/i18n";
import { clearNotebook } from "@/lib/notebook";
import {
  clearProgress,
  loadProgress,
  seedDemoEarnedBadge,
} from "@/lib/progress";
import { clearProfile, loadProfile } from "@/lib/storage";
import type { Profile, ProgressState } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<ProgressState>({
    requirements: {},
    earned: {},
  });

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      router.replace("/onboarding");
      return;
    }
    if (!p.seenHowItWorks) {
      router.replace("/how-it-works");
      return;
    }
    setProfile(p);
    setProgress(loadProgress());
  }, [router]);

  useEffect(() => {
    function onFocus() {
      setProgress(loadProgress());
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const groups = useMemo(() => {
    if (!profile) return [];
    return groupBadgesByCategory(getBadgesForLevel(profile.level));
  }, [profile]);

  function startMintDemo() {
    const badge = getDemoMintBadge();
    seedDemoEarnedBadge(badge);
    router.push(`/badge/${encodeURIComponent(badge.id)}?demo=1`);
  }

  if (!profile) {
    return <div className="screen-loading" />;
  }

  const lang = profile.language;
  const welcome = t(lang, "homeWelcome", { name: profile.childName });
  const subtitle = t(lang, "homeSubtitle", { level: profile.level });
  const speakText = `${welcome} ${subtitle}`;
  const demoBadge = getDemoMintBadge();

  return (
    <div className="home-shell">
      <header className="home-top">
        <div>
          <p className="brand">{t(lang, "appName")}</p>
          <h1>{welcome}</h1>
          <p className="hint">{subtitle}</p>
        </div>
        <SpeakButton text={speakText} language={lang} label={t(lang, "speak")} />
      </header>

      <div className="clump-stack">
        {groups.length === 0 ? (
          <EmptyAdventure
            title={t(lang, "homeNoBadges")}
            body={t(lang, "homeSubtitle", { level: profile.level })}
            art="backpack"
          />
        ) : (
          groups.map((group) => (
            <BadgeClump
              key={group.category}
              category={group.category}
              badges={group.badges}
              progress={progress}
            />
          ))
        )}
      </div>

      <div className="home-demo-tools">
        <button
          type="button"
          className="ghost-btn demo-mint-link"
          onClick={startMintDemo}
        >
          {t(lang, "demoMintLink", { name: demoBadge.name })}
        </button>
        <button
          type="button"
          className="ghost-btn reset-demo"
          onClick={() => {
            clearProfile();
            clearProgress();
            clearNotebook();
            router.push("/onboarding");
          }}
        >
          {t(lang, "resetDemo")}
        </button>
      </div>

      <BottomNav
        homeLabel={t(lang, "navHome")}
        notebookLabel={t(lang, "navNotebook")}
        journalLabel={t(lang, "navJournal")}
      />
    </div>
  );
}
