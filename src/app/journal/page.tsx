"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { EmptyAdventure } from "@/components/EmptyAdventure";
import { SpeakButton } from "@/components/SpeakButton";
import { badgeImageSrc, categoryColor } from "@/lib/assets";
import { t } from "@/lib/i18n";
import { buildJournalBadges, explorerUrl, nftPagePath } from "@/lib/journal";
import { formatEntryDate } from "@/lib/notebook";
import { loadProgress } from "@/lib/progress";
import { loadProfile } from "@/lib/storage";
import type { Profile } from "@/lib/types";
import type { JournalBadgeItem } from "@/lib/journal";

export default function JournalPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<JournalBadgeItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      router.replace("/onboarding");
      return;
    }
    setProfile(p);
    setItems(buildJournalBadges(loadProgress()));
  }, [router]);

  if (!profile) {
    return <div className="screen-loading" />;
  }

  const lang = profile.language;
  const speakText = `${t(lang, "journalTitle")}. ${
    items.length === 0
      ? t(lang, "journalEmpty")
      : items
          .slice(0, 4)
          .map((item) => `${item.badge.name}. ${item.status}`)
          .join(". ")
  }`;

  return (
    <div className="home-shell">
      <header className="home-top">
        <div>
          <p className="brand">{t(lang, "appName")}</p>
          <h1>{t(lang, "journalTitle")}</h1>
          <p className="hint">{t(lang, "journalHint")}</p>
        </div>
        <div className="header-actions">
          <Link href="/gallery?view=journal" className="gallery-chip">
            {t(lang, "galleryButton")}
          </Link>
          <SpeakButton text={speakText} language={lang} label={t(lang, "speak")} />
        </div>
      </header>

      {items.length === 0 ? (
        <EmptyAdventure
          title={t(lang, "journalEmptyTitle")}
          body={t(lang, "journalEmpty")}
          art="backpack"
        >
          <Link href="/home" className="primary-btn wide journal-cta">
            {t(lang, "journalGoHome")}
          </Link>
        </EmptyAdventure>
      ) : (
        <ul className="journal-list">
          {items.map((item) => {
            const color = categoryColor(item.badge.category);
            const expanded = openId === item.badge.id;
            const doneCount = item.completed.length;
            const total = item.badge.requirements.length;

            return (
              <li key={item.badge.id}>
                <button
                  type="button"
                  className={`journal-card ${expanded ? "journal-card-open" : ""}`}
                  style={{ ["--badge-color" as string]: color }}
                  onClick={() =>
                    setOpenId(expanded ? null : item.badge.id)
                  }
                  aria-expanded={expanded}
                >
                  <span className="journal-card-main">
                    <span className="journal-thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={badgeImageSrc(item.badge.iconSlug)}
                        alt=""
                        width={56}
                        height={56}
                      />
                    </span>
                    <span className="journal-meta">
                      <span className="journal-name">{item.badge.name}</span>
                      <span className="journal-sub">
                        {item.badge.category}
                        {" · "}
                        {item.status === "earned"
                          ? t(lang, "journalEarned")
                          : t(lang, "journalInProgress", {
                              done: String(doneCount),
                              total: String(total),
                            })}
                      </span>
                      <span className="journal-when">
                        {formatEntryDate(
                          item.latestActivityAt.slice(0, 10),
                          lang,
                        )}
                      </span>
                    </span>
                    <span className="journal-chevron" aria-hidden="true">
                      {expanded ? "▾" : "▸"}
                    </span>
                  </span>
                </button>

                {expanded && (
                  <div className="journal-details">
                    <p className="hint soft">{t(lang, "journalReadOnly")}</p>
                    <ul className="journal-reqs">
                      {item.badge.requirements.map((req) => {
                        const done = item.completed.find((c) => c.id === req.id);
                        return (
                          <li
                            key={req.id}
                            className={`journal-req ${done ? "journal-req-done" : ""}`}
                          >
                            <p className="journal-req-text">{req.text}</p>
                            {done ? (
                              <>
                                <p className="journal-req-note">“{done.note}”</p>
                                <p className="journal-req-date">
                                  {new Date(done.completedAt).toLocaleString(
                                    lang === "es" ? "es" : "en",
                                  )}
                                </p>
                                {done.photoDataUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    className="journal-req-photo"
                                    src={done.photoDataUrl}
                                    alt={done.photoName ?? t(lang, "journalPhoto")}
                                  />
                                ) : done.photoName ? (
                                  <p className="journal-req-date">
                                    {t(lang, "journalPhoto")}: {done.photoName}
                                  </p>
                                ) : null}
                              </>
                            ) : (
                              <p className="journal-req-date">
                                {t(lang, "journalNotDone")}
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ul>

                    {item.earned?.mintStatus === "minted" && item.earned.mintAddress && (
                      <div className="journal-mint-actions">
                        <Link
                          className="primary-btn journal-nft-btn"
                          href={nftPagePath(item.badge.id)}
                        >
                          {t(lang, "nftViewInApp")}
                        </Link>
                        <a
                          className="journal-explorer"
                          href={explorerUrl(item.earned.mintAddress)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t(lang, "nftOpenExplorer")}
                        </a>
                      </div>
                    )}

                    {item.status === "earned" &&
                      item.earned?.mintStatus !== "minted" && (
                        <p className="hint soft">{t(lang, "journalMintPending")}</p>
                      )}

                    <Link
                      href={`/badge/${item.badge.id}`}
                      className="ghost-btn journal-open-badge"
                    >
                      {t(lang, "journalOpenBadge")}
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <BottomNav
        homeLabel={t(lang, "navHome")}
        notebookLabel={t(lang, "navNotebook")}
        journalLabel={t(lang, "navJournal")}
      />
    </div>
  );
}
