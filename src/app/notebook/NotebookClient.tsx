"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { SpeakButton } from "@/components/SpeakButton";
import { decorationSrc } from "@/lib/assets";
import { t } from "@/lib/i18n";
import {
  addPageToEntry,
  formatEntryDate,
  getEntryForDate,
  isToday,
  todayKey,
  upsertEntry,
} from "@/lib/notebook";
import { loadProfile } from "@/lib/storage";
import type { NotebookEntry, Profile } from "@/lib/types";

export default function NotebookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const entryDate = useMemo(() => {
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return dateParam;
    return todayKey();
  }, [dateParam]);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [entry, setEntry] = useState<NotebookEntry | null>(null);
  const [saveLabel, setSaveLabel] = useState("");
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      router.replace("/onboarding");
      return;
    }
    setProfile(p);
  }, [router]);

  useEffect(() => {
    setEntry(getEntryForDate(entryDate));
    setSaveLabel("");
  }, [entryDate]);

  const persist = useCallback((next: NotebookEntry) => {
    setEntry(next);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      upsertEntry(next);
      setSaveLabel("saved");
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, []);

  if (!profile || !entry) {
    return <div className="screen-loading" />;
  }

  const lang = profile.language;
  const heading = isToday(entryDate)
    ? t(lang, "notebookToday")
    : formatEntryDate(entryDate, lang);
  const speakText = `${heading}. ${entry.title}. ${entry.pages.map((p) => p.body).join(" ")}`;

  return (
    <div className="home-shell notebook-shell">
      <header className="home-top">
        <div>
          <p className="brand">{t(lang, "appName")}</p>
          <h1>{t(lang, "notebookTitle")}</h1>
          <p className="hint">{heading}</p>
        </div>
        <div className="header-actions">
          <Link href="/gallery" className="secondary-btn gallery-chip">
            {t(lang, "galleryButton")}
          </Link>
          <SpeakButton text={speakText} language={lang} label={t(lang, "speak")} />
        </div>
      </header>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="notebook-header-art"
        src={decorationSrc("notebook-paper")}
        alt=""
        width={120}
        height={90}
      />

      <div className="notebook-card">
        <label className="sr-only" htmlFor="notebook-title">
          {t(lang, "notebookTitleLabel")}
        </label>
        <input
          id="notebook-title"
          className="field notebook-title"
          value={entry.title}
          placeholder={t(lang, "notebookTitlePlaceholder")}
          onChange={(e) => {
            setSaveLabel("saving");
            persist({ ...entry, title: e.target.value });
          }}
        />

        {entry.pages.map((page, index) => (
          <div key={page.id} className="notebook-page">
            {entry.pages.length > 1 && (
              <p className="page-label">
                {t(lang, "notebookPageLabel", { n: String(index + 1) })}
              </p>
            )}
            <textarea
              className="field notebook-body"
              rows={8}
              value={page.body}
              placeholder={t(lang, "notebookBodyPlaceholder")}
              onChange={(e) => {
                const pages = entry.pages.map((p) =>
                  p.id === page.id ? { ...p, body: e.target.value } : p,
                );
                setSaveLabel("saving");
                persist({ ...entry, pages });
              }}
            />
          </div>
        ))}

        <button
          type="button"
          className="ghost-btn add-page-btn"
          onClick={() => {
            const next = addPageToEntry(entry);
            setSaveLabel("saving");
            persist(next);
          }}
        >
          {t(lang, "notebookAddPage")}
        </button>

        <p className="autosave-status" aria-live="polite">
          {saveLabel === "saving"
            ? t(lang, "notebookSaving")
            : saveLabel === "saved"
              ? t(lang, "notebookSaved")
              : t(lang, "notebookAutosaveHint")}
        </p>
      </div>

      <BottomNav
        homeLabel={t(lang, "navHome")}
        notebookLabel={t(lang, "navNotebook")}
        journalLabel={t(lang, "navJournal")}
      />
    </div>
  );
}
