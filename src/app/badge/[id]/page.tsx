"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BadgeOrb } from "@/components/BadgeOrb";
import { SpeakButton } from "@/components/SpeakButton";
import { decorationSrc } from "@/lib/assets";
import { categoryColor, getBadgeById } from "@/lib/badges";
import { explorerUrl } from "@/lib/journal";
import { t } from "@/lib/i18n";
import { checkRequirementNote } from "@/lib/noteCheck";
import {
  badgeProgressRatio,
  completeRequirement,
  isBadgeEarned,
  loadProgress,
  markMintAttempt,
} from "@/lib/progress";
import { loadProfile } from "@/lib/storage";
import type { Badge, ProgressState, Profile } from "@/lib/types";

export default function BadgeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [badge, setBadge] = useState<Badge | null>(null);
  const [progress, setProgress] = useState<ProgressState>({
    requirements: {},
    earned: {},
  });
  const [activeReqId, setActiveReqId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState<"tooShort" | "gibberish" | "unrelated" | null>(null);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [mintBusy, setMintBusy] = useState(false);
  const [mintFailed, setMintFailed] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      router.replace("/onboarding");
      return;
    }
    setProfile(p);
    const found = getBadgeById(params.id);
    if (!found) {
      router.replace("/home");
      return;
    }
    setBadge(found);
    setProgress(loadProgress());
  }, [params.id, router]);

  const color = badge ? categoryColor(badge.category) : "#4E86C5";
  const lang = profile?.language ?? "en";
  const earned = badge ? isBadgeEarned(badge.id, progress) : false;
  const ratio = badge ? badgeProgressRatio(badge, progress) : 0;
  const doneCount = badge
    ? badge.requirements.filter((r) => progress.requirements[r.id]).length
    : 0;
  const activeReq = useMemo(
    () => badge?.requirements.find((r) => r.id === activeReqId) ?? null,
    [badge, activeReqId],
  );
  const mintStatus = badge ? progress.earned[badge.id]?.mintStatus : undefined;
  const mintAddress = badge ? progress.earned[badge.id]?.mintAddress : undefined;

  const speakText = badge
    ? `${badge.name}. ${badge.description}. ${badge.requirements
        .map((r, i) => `${i + 1}. ${r.text}`)
        .join(" ")}`
    : "";

  function openRequirement(reqId: string) {
    if (progress.requirements[reqId]) return;
    setActiveReqId(reqId);
    setNote("");
    setNoteError(null);
  }

  function saveRequirement() {
    if (!badge || !activeReq || !activeReqId) return;
    const check = checkRequirementNote(activeReq.text, note);
    if (!check.ok) {
      setNoteError(check.reason);
      return;
    }
    const next = completeRequirement(activeReqId, badge, note);
    setProgress(next);
    setActiveReqId(null);
    setNote("");
    setNoteError(null);
    if (isBadgeEarned(badge.id, next)) {
      setShowCelebrate(true);
    }
  }

  function makePermanent() {
    if (!badge) return;
    setMintBusy(true);
    setMintFailed(false);
    window.setTimeout(() => {
      // Demo always succeeds; failure UI remains available for polish.
      const next = markMintAttempt(badge.id, "minted");
      setProgress(next);
      setMintBusy(false);
      setShowCelebrate(false);
    }, 900);
  }

  if (!profile || !badge) {
    return <div className="screen-loading" />;
  }

  const orbState = earned ? "earned" : ratio > 0 ? "in-progress" : "not-started";

  return (
    <div className="detail-shell">
      <header className="detail-top">
        <Link href="/home" className="ghost-btn back-link">
          ← {t(lang, "back")}
        </Link>
        <SpeakButton text={speakText} language={lang} label={t(lang, "speak")} />
      </header>

      <div
        className="detail-hero"
        style={{
          ["--badge-color" as string]: color,
          ["--progress" as string]: String(ratio),
        }}
      >
        <div className={`detail-badge ${earned ? "badge-earned" : ""}`}>
          <BadgeOrb
            iconSlug={badge.iconSlug}
            color={color}
            name={badge.name}
            progress={ratio}
            state={orbState}
            fill
            colorful={false}
            showProgressRing
          />
        </div>
        <p className="detail-category">{badge.category}</p>
        <h1>{badge.name}</h1>
        <p className="hint">{badge.description}</p>
        <p className="progress-summary">
          {t(lang, "progressSummary", {
            done: String(doneCount),
            total: String(badge.requirements.length),
          })}
        </p>
        <p className="hint badge-companion-note">{t(lang, "badgeCompanionNote")}</p>
      </div>

      <section className="req-list" aria-label={t(lang, "requirementsTitle")}>
        <h2>{t(lang, "requirementsTitle")}</h2>
        <ul>
          {badge.requirements.map((req) => {
            const done = progress.requirements[req.id];
            return (
              <li key={req.id}>
                <button
                  type="button"
                  className={`req-row ${done ? "req-done" : ""}`}
                  onClick={() => openRequirement(req.id)}
                  aria-checked={Boolean(done)}
                  role="checkbox"
                >
                  <span className="req-check" aria-hidden="true">
                    {done ? "✓" : ""}
                  </span>
                  <span className="req-text">
                    <span>{req.text}</span>
                    {done ? (
                      <>
                        <span className="req-note">“{done.note}”</span>
                        <span className="req-meta">
                          {t(lang, "reqCompleted")} ·{" "}
                          {new Date(done.completedAt).toLocaleDateString(
                            lang === "es" ? "es" : "en",
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                      </>
                    ) : (
                      <span className="req-meta">{t(lang, "reqNotStarted")}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {earned && (
        <div className="earn-box">
          <p>{t(lang, "badgeEarnedShort", { name: badge.name })}</p>
          {mintStatus === "minted" && mintAddress ? (
            <p className="mint-ok">
              {t(lang, "mintAlreadyDone")}{" "}
              <a
                className="journal-explorer"
                href={explorerUrl(mintAddress)}
                target="_blank"
                rel="noreferrer"
              >
                {t(lang, "journalViewNft")}
              </a>
            </p>
          ) : (
            <button
              type="button"
              className="primary-btn wide permanent"
              onClick={makePermanent}
              disabled={mintBusy}
            >
              {mintBusy ? t(lang, "mintPending") : t(lang, "makePermanent")}
            </button>
          )}
          {mintFailed && (
            <div className="note-error" role="alert">
              <strong>{t(lang, "mintFailTitle")}</strong>
              <p>{t(lang, "mintFailBody")}</p>
            </div>
          )}
        </div>
      )}

      {activeReq && (
        <div
          className="sheet-backdrop"
          role="presentation"
          onClick={() => setActiveReqId(null)}
        >
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="sheet-title">{t(lang, "tellUsTitle")}</h2>
            <p className="hint">{activeReq.text}</p>
            <p className="hint soft">{t(lang, "tellUsMatchHint")}</p>
            <textarea
              className={`field note-field ${noteError ? "field-error" : ""}`}
              rows={4}
              autoFocus
              value={note}
              placeholder={t(lang, "tellUsPlaceholder")}
              onChange={(e) => {
                setNote(e.target.value);
                if (noteError) setNoteError(null);
              }}
            />
            {noteError && (
              <div className="note-error" role="alert">
                <strong>{t(lang, "noteEncourageTitle")}</strong>
                <p>{t(lang, noteError === "unrelated" ? "noteUnrelated" : noteError === "gibberish" ? "noteGibberish" : "noteTooShort")}</p>
                <ul>
                  <li>{t(lang, "noteTipDid")}</li>
                  <li>{t(lang, "noteTipNoticed")}</li>
                  <li>{t(lang, "noteTipLearned")}</li>
                </ul>
              </div>
            )}
            <label className="photo-label">
              <span>📷 {t(lang, "photoOptional")}</span>
              <input type="file" accept="image/*" onChange={() => {}} />
            </label>
            <div className="sheet-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setActiveReqId(null)}
              >
                {t(lang, "back")}
              </button>
              <button
                type="button"
                className="primary-btn"
                disabled={note.trim().length < 8}
                onClick={saveRequirement}
              >
                {t(lang, "saveRequirement")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCelebrate && (
        <div className="sheet-backdrop celebrate" role="presentation">
          <div className="sheet celebrate-sheet" role="dialog" aria-modal="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="celebrate-burst"
              src={decorationSrc("celebration")}
              alt=""
              width={180}
              height={100}
            />
            <div className="celebrate-orb">
              <BadgeOrb
                iconSlug={badge.iconSlug}
                color={color}
                name={badge.name}
                state="earned"
                size={96}
                colorful
              />
            </div>
            <h2>{t(lang, "celebrateTitle", { name: badge.name })}</h2>
            <p className="hint">{t(lang, "celebrateBody")}</p>
            <button
              type="button"
              className="primary-btn wide permanent"
              onClick={makePermanent}
            >
              {t(lang, "makePermanent")}
            </button>
            <button
              type="button"
              className="ghost-btn wide"
              onClick={() => setShowCelebrate(false)}
            >
              {t(lang, "celebrateLater")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
