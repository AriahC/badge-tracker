"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { EmptyAdventure } from "@/components/EmptyAdventure";
import { SpeakButton } from "@/components/SpeakButton";
import { badgeImageSrc, decorationSrc, FEATURE_BADGES } from "@/lib/assets";
import { getBadgeById } from "@/lib/badges";
import { t } from "@/lib/i18n";
import {
  buildJournalDays,
  explorerUrl,
  type JournalDayGroup,
} from "@/lib/journal";
import {
  formatEntryDate,
  isToday,
  listNotebookDays,
  previewText,
} from "@/lib/notebook";
import { loadProgress } from "@/lib/progress";
import { loadProfile } from "@/lib/storage";
import type { NotebookEntry, Profile } from "@/lib/types";

export default function GalleryClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "journal" ? "journal" : "notebook";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([]);
  const [journalDays, setJournalDays] = useState<JournalDayGroup[]>([]);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      router.replace("/onboarding");
      return;
    }
    setProfile(p);
    setNotebookEntries(listNotebookDays());
    setJournalDays(buildJournalDays(loadProgress()));
  }, [router]);

  const lang = profile?.language ?? "en";

  const speakText = useMemo(() => {
    if (view === "journal") {
      return `${t(lang, "galleryJournalTitle")}. ${
        journalDays.length === 0
          ? t(lang, "galleryJournalEmpty")
          : journalDays
              .slice(0, 4)
              .map((d) => formatEntryDate(d.date, lang))
              .join(". ")
      }`;
    }
    return `${t(lang, "galleryTitle")}. ${
      notebookEntries.length === 0
        ? t(lang, "galleryEmpty")
        : notebookEntries
            .slice(0, 5)
            .map((e) => formatEntryDate(e.entryDate, lang))
            .join(". ")
    }`;
  }, [view, lang, journalDays, notebookEntries]);

  if (!profile) {
    return <div className="screen-loading" />;
  }

  return (
    <div className="home-shell">
      <header className="home-top">
        <div>
          <p className="brand">{t(lang, "appName")}</p>
          <h1>
            {view === "journal"
              ? t(lang, "galleryJournalTitle")
              : t(lang, "galleryTitle")}
          </h1>
          <p className="hint">
            {view === "journal"
              ? t(lang, "galleryJournalHint")
              : t(lang, "galleryHint")}
          </p>
        </div>
        <SpeakButton text={speakText} language={lang} label={t(lang, "speak")} />
      </header>

      <div className="gallery-tabs" role="tablist" aria-label={t(lang, "galleryButton")}>
        <Link
          href="/gallery"
          className={`gallery-tab ${view === "notebook" ? "gallery-tab-active" : ""}`}
          role="tab"
          aria-selected={view === "notebook"}
        >
          {t(lang, "navNotebook")}
        </Link>
        <Link
          href="/gallery?view=journal"
          className={`gallery-tab ${view === "journal" ? "gallery-tab-active" : ""}`}
          role="tab"
          aria-selected={view === "journal"}
        >
          {t(lang, "navJournal")}
        </Link>
      </div>

      <div className="gallery-actions">
        <Link
          href={view === "journal" ? "/journal" : "/notebook"}
          className="primary-btn"
        >
          {view === "journal"
            ? t(lang, "galleryBackJournal")
            : t(lang, "galleryWriteToday")}
        </Link>
      </div>

      {view === "notebook" ? (
        notebookEntries.length === 0 ? (
          <EmptyAdventure
            title={t(lang, "galleryEmpty")}
            body={t(lang, "galleryHint")}
            art="backpack"
          />
        ) : (
          <ul className="gallery-list">
            {notebookEntries.map((entry) => (
              <li key={entry.id}>
                <Link
                  href={`/notebook?date=${entry.entryDate}`}
                  className="gallery-item gallery-item-with-art"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="gallery-thumb"
                    src={decorationSrc("notebook-paper")}
                    alt=""
                    width={48}
                    height={48}
                  />
                  <div className="gallery-item-body">
                    <div className="gallery-item-top">
                      <span className="gallery-date">
                        {formatEntryDate(entry.entryDate, lang)}
                      </span>
                      {isToday(entry.entryDate) && (
                        <span className="gallery-today">
                          {t(lang, "galleryTodayBadge")}
                        </span>
                      )}
                    </div>
                    {entry.title.trim() && (
                      <p className="gallery-title">{entry.title.trim()}</p>
                    )}
                    <p className="gallery-preview">
                      {previewText(entry) || t(lang, "galleryNoPreview")}
                    </p>
                    {entry.pages.length > 1 && (
                      <p className="gallery-pages">
                        {t(lang, "galleryPages", {
                          n: String(entry.pages.length),
                        })}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : journalDays.length === 0 ? (
        <EmptyAdventure
          title={t(lang, "galleryJournalEmpty")}
          body={t(lang, "galleryJournalHint")}
          art="tip"
        />
      ) : (
        <ul className="gallery-list">
          {journalDays.map((day) => (
            <li key={day.date} className="gallery-day-block">
              <div className="gallery-item gallery-day-head">
                <div className="gallery-item-top">
                  <span className="gallery-date">
                    {formatEntryDate(day.date, lang)}
                  </span>
                  {isToday(day.date) && (
                    <span className="gallery-today">
                      {t(lang, "galleryTodayBadge")}
                    </span>
                  )}
                </div>
                <p className="gallery-pages">
                  {t(lang, "galleryJournalCount", {
                    n: String(day.events.length),
                  })}
                </p>
              </div>
              <ul className="journal-day-events">
                {day.events.map((event) => {
                  const badge = getBadgeById(event.badgeId);
                  const thumb = badge
                    ? badgeImageSrc(badge.iconSlug)
                    : FEATURE_FALLBACK;
                  return (
                    <li key={event.id}>
                      <Link
                        href={`/badge/${event.badgeId}`}
                        className="journal-day-event journal-day-event-with-art"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="gallery-event-thumb"
                          src={thumb}
                          alt=""
                          width={44}
                          height={44}
                        />
                        <span className="journal-day-event-text">
                          {event.type === "requirement" && (
                            <>
                              <p className="gallery-title">
                                {t(lang, "galleryEventStep", {
                                  badge: event.badgeName,
                                })}
                              </p>
                              <p className="gallery-preview">“{event.note}”</p>
                            </>
                          )}
                          {event.type === "earned" && (
                            <p className="gallery-title">
                              {t(lang, "galleryEventEarned", {
                                badge: event.badgeName,
                              })}
                            </p>
                          )}
                          {event.type === "minted" && (
                            <>
                              <p className="gallery-title">
                                {t(lang, "galleryEventMinted", {
                                  badge: event.badgeName,
                                })}
                              </p>
                              <p className="gallery-preview mono">
                                {event.mintAddress}
                              </p>
                            </>
                          )}
                        </span>
                      </Link>
                      {event.type === "minted" && (
                        <a
                          className="journal-explorer tiny"
                          href={explorerUrl(event.mintAddress)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t(lang, "journalViewNft")}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
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

const FEATURE_FALLBACK = FEATURE_BADGES.explorer;
