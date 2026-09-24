"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BadgeOrb } from "@/components/BadgeOrb";
import { SpeakButton } from "@/components/SpeakButton";
import { decorationSrc } from "@/lib/assets";
import { categoryColor, getBadgeById } from "@/lib/badges";
import { explorerUrl, nftPagePath, ownerExplorerUrl } from "@/lib/journal";
import { t } from "@/lib/i18n";
import { checkRequirementNote } from "@/lib/noteCheck";
import { readRequirementPhoto } from "@/lib/photo";
import {
  badgeProgressRatio,
  completeRequirement,
  isBadgeEarned,
  loadProgress,
  markMintAttempt,
} from "@/lib/progress";
import { MintDestinationPanel } from "@/components/MintDestinationPanel";
import { loadMintWallet, loadProfile, saveMintWallet } from "@/lib/storage";
import type { Badge, ProgressState, Profile } from "@/lib/types";

function shortAddr(value: string): string {
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-6)}`;
}

export default function BadgeDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
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
  const [photo, setPhoto] = useState<{ name: string; dataUrl: string } | null>(
    null,
  );
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  /** Pride first; mint only after “ask a grown-up”. */
  const [celebratePhase, setCelebratePhase] = useState<"pride" | "mint" | null>(
    null,
  );
  const [showMintSuccess, setShowMintSuccess] = useState(false);
  const [mintBusy, setMintBusy] = useState(false);
  const [mintFailed, setMintFailed] = useState(false);
  const [mintErrorDetail, setMintErrorDetail] = useState<string | null>(null);
  const [ownerAddress, setOwnerAddress] = useState("");
  const [mintExplorerHref, setMintExplorerHref] = useState<string | null>(null);

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
    const next = loadProgress();
    setProgress(next);
    setOwnerAddress(loadMintWallet());
    const demoMint = searchParams.get("demo") === "1";
    const record = next.earned[found.id];
    if (
      demoMint &&
      record &&
      record.mintStatus !== "minted"
    ) {
      setCelebratePhase("pride");
    }
  }, [params.id, router, searchParams]);

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
    setPhoto(null);
    setPhotoError(null);
    setPhotoBusy(false);
  }

  async function onPhotoSelected(file: File | null) {
    if (!file) {
      setPhoto(null);
      setPhotoError(null);
      return;
    }
    setPhotoBusy(true);
    setPhotoError(null);
    try {
      const next = await readRequirementPhoto(file);
      setPhoto(next);
    } catch {
      setPhoto(null);
      setPhotoError(t(lang, "photoFail"));
    } finally {
      setPhotoBusy(false);
    }
  }

  function saveRequirement() {
    if (!badge || !activeReq || !activeReqId || photoBusy) return;
    const check = checkRequirementNote(
      `${activeReq.text}. ${activeReq.detail}`,
      note,
    );
    if (!check.ok) {
      setNoteError(check.reason);
      return;
    }
    const next = completeRequirement(
      activeReqId,
      badge,
      note,
      photo ?? undefined,
    );
    setProgress(next);
    setActiveReqId(null);
    setNote("");
    setNoteError(null);
    setPhoto(null);
    setPhotoError(null);
    if (isBadgeEarned(badge.id, next)) {
      setCelebratePhase("pride");
    }
  }

  async function makePermanent() {
    if (!badge) return;
    const owner = ownerAddress.trim();
    if (!owner) {
      setMintFailed(true);
      setMintErrorDetail(t(lang, "mintNeedWallet"));
      return;
    }
    setMintBusy(true);
    setMintFailed(false);
    setMintErrorDetail(null);
    saveMintWallet(owner);
    try {
      const res = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeId: badge.id, ownerAddress: owner }),
      });
      let data: {
        signature?: string;
        explorerUrl?: string;
        error?: string;
      } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        data = {};
      }
      if (!res.ok || !data.signature) {
        markMintAttempt(badge.id, "failed");
        setMintFailed(true);
        setMintErrorDetail(
          data.error ||
            (res.status === 503
              ? t(lang, "mintNotConfiguredBody")
              : t(lang, "mintFailBody")),
        );
        setCelebratePhase(null);
        setMintBusy(false);
        return;
      }
      const next = markMintAttempt(badge.id, "minted", data.signature, owner);
      setProgress(next);
      setCelebratePhase(null);
      setMintExplorerHref(
        data.explorerUrl ?? explorerUrl(data.signature),
      );
      setShowMintSuccess(true);
      // Land on the in-app NFT certificate so judges always see it.
      router.push(nftPagePath(badge.id));
    } catch {
      markMintAttempt(badge.id, "failed");
      setMintFailed(true);
      setMintErrorDetail(t(lang, "mintFailBody"));
      setCelebratePhase(null);
    } finally {
      setMintBusy(false);
    }
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
                        {done.photoDataUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            className="req-photo-thumb"
                            src={done.photoDataUrl}
                            alt={done.photoName ?? t(lang, "journalPhoto")}
                          />
                        ) : null}
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
            <div className="mint-ok">
              <p>{t(lang, "mintSuccess")}</p>
              <div className="mint-ok-preview">
                <BadgeOrb
                  iconSlug={badge.iconSlug}
                  color={color}
                  name={badge.name}
                  state="earned"
                  size={72}
                  colorful
                />
                <div className="mint-ok-copy">
                  <p className="mint-ok-name">{badge.name}</p>
                  {ownerAddress ? (
                    <p className="hint soft mono" title={ownerAddress}>
                      {t(lang, "nftOwnerLabel")}: {shortAddr(ownerAddress)}
                    </p>
                  ) : null}
                </div>
              </div>
              <Link className="primary-btn wide" href={nftPagePath(badge.id)}>
                {t(lang, "nftViewInApp")}
              </Link>
              <a
                className="journal-explorer"
                href={explorerUrl(mintAddress)}
                target="_blank"
                rel="noreferrer"
              >
                {t(lang, "nftOpenExplorer")}
              </a>
            </div>
          ) : (
            <MintDestinationPanel
              lang={lang}
              ownerAddress={ownerAddress}
              onOwnerAddressChange={setOwnerAddress}
              mintBusy={mintBusy}
              onMint={() => void makePermanent()}
              walletInputId="mint-wallet"
            />
          )}
          {mintFailed && mintStatus !== "minted" && (
            <div className="note-error" role="alert">
              <strong>{t(lang, "mintFailTitle")}</strong>
              <p>{mintErrorDetail || t(lang, "mintFailBody")}</p>
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
            <p className="req-step-label">{activeReq.text}</p>
            <p className="req-howto">{activeReq.detail}</p>
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
              <input
                type="file"
                accept="image/*"
                capture="environment"
                disabled={photoBusy}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  void onPhotoSelected(file);
                  e.target.value = "";
                }}
              />
            </label>
            {photoBusy ? (
              <p className="hint soft">{t(lang, "photoBusy")}</p>
            ) : null}
            {photoError ? (
              <p className="hint soft" role="alert">
                {photoError}
              </p>
            ) : null}
            {photo ? (
              <div className="photo-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.dataUrl} alt={photo.name} />
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => {
                    setPhoto(null);
                    setPhotoError(null);
                  }}
                >
                  {t(lang, "photoRemove")}
                </button>
              </div>
            ) : null}
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
                disabled={note.trim().length < 8 || photoBusy}
                onClick={saveRequirement}
              >
                {t(lang, "saveRequirement")}
              </button>
            </div>
          </div>
        </div>
      )}

      {celebratePhase && (
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
            {celebratePhase === "pride" ? (
              <>
                <p className="hint">{t(lang, "celebrateBody")}</p>
                <button
                  type="button"
                  className="primary-btn wide"
                  onClick={() => setCelebratePhase(null)}
                >
                  {t(lang, "celebrateDone")}
                </button>
                <button
                  type="button"
                  className="ghost-btn wide celebrate-grown-up"
                  onClick={() => setCelebratePhase("mint")}
                >
                  {t(lang, "celebrateAskGrownUp")}
                </button>
              </>
            ) : (
              <>
                <p className="hint">{t(lang, "celebrateMintBody")}</p>
                <MintDestinationPanel
                  lang={lang}
                  ownerAddress={ownerAddress}
                  onOwnerAddressChange={setOwnerAddress}
                  mintBusy={mintBusy}
                  onMint={() => void makePermanent()}
                  walletInputId="celebrate-mint-wallet"
                  footer={
                    <button
                      type="button"
                      className="ghost-btn wide"
                      onClick={() => setCelebratePhase(null)}
                      disabled={mintBusy}
                    >
                      {t(lang, "celebrateLater")}
                    </button>
                  }
                />
              </>
            )}
          </div>
        </div>
      )}

      {showMintSuccess && mintAddress && (
        <div className="sheet-backdrop celebrate" role="presentation">
          <div
            className="sheet celebrate-sheet mint-success-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mint-success-title"
          >
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
            <h2 id="mint-success-title">{t(lang, "mintSuccessTitle")}</h2>
            <p className="hint">
              {t(lang, "mintSuccessBody", { name: badge.name })}
            </p>
            {(ownerAddress || mintAddress) && (
              <dl className="nft-details mint-success-details">
                {ownerAddress ? (
                  <div className="nft-detail-row">
                    <dt>{t(lang, "nftOwnerLabel")}</dt>
                    <dd>
                      <a
                        className="mono nft-mono-link"
                        href={ownerExplorerUrl(ownerAddress)}
                        target="_blank"
                        rel="noreferrer"
                        title={ownerAddress}
                      >
                        {shortAddr(ownerAddress)}
                      </a>
                    </dd>
                  </div>
                ) : null}
                <div className="nft-detail-row">
                  <dt>{t(lang, "nftTxLabel")}</dt>
                  <dd>
                    <a
                      className="mono nft-mono-link"
                      href={mintExplorerHref ?? explorerUrl(mintAddress)}
                      target="_blank"
                      rel="noreferrer"
                      title={mintAddress}
                    >
                      {shortAddr(mintAddress)}
                    </a>
                  </dd>
                </div>
              </dl>
            )}
            <Link className="primary-btn wide" href={nftPagePath(badge.id)}>
              {t(lang, "nftViewInApp")}
            </Link>
            <a
              className="ghost-btn wide"
              href={mintExplorerHref ?? explorerUrl(mintAddress)}
              target="_blank"
              rel="noreferrer"
            >
              {t(lang, "nftOpenExplorer")}
            </a>
            <Link href="/journal" className="ghost-btn wide">
              {t(lang, "mintSuccessJournal")}
            </Link>
            <button
              type="button"
              className="ghost-btn wide"
              onClick={() => setShowMintSuccess(false)}
            >
              {t(lang, "mintSuccessDone")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
