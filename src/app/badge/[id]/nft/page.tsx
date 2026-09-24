"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BadgeOrb } from "@/components/BadgeOrb";
import { BottomNav } from "@/components/BottomNav";
import { categoryColor, getBadgeById } from "@/lib/badges";
import { explorerUrl, ownerExplorerUrl } from "@/lib/journal";
import { t } from "@/lib/i18n";
import { isBadgeEarned, loadProgress } from "@/lib/progress";
import { loadMintWallet, loadProfile } from "@/lib/storage";
import type { Badge, EarnedBadgeRecord, Profile } from "@/lib/types";

function shortAddr(value: string): string {
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-6)}`;
}

export default function BadgeNftPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [badge, setBadge] = useState<Badge | null>(null);
  const [earned, setEarned] = useState<EarnedBadgeRecord | null>(null);

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
    const progress = loadProgress();
    if (!isBadgeEarned(found.id, progress)) {
      router.replace(`/badge/${encodeURIComponent(found.id)}`);
      return;
    }
    const record = progress.earned[found.id];
    if (!record || record.mintStatus !== "minted" || !record.mintAddress) {
      router.replace(`/badge/${encodeURIComponent(found.id)}`);
      return;
    }
    setEarned(record);
  }, [params.id, router]);

  if (!profile || !badge || !earned?.mintAddress) {
    return <div className="screen-loading" />;
  }

  const lang = profile.language;
  const color = categoryColor(badge.category);
  const owner = earned.mintOwner || loadMintWallet();
  const tx = earned.mintAddress;

  return (
    <div className="nft-shell">
      <header className="detail-top">
        <Link
          href={`/badge/${encodeURIComponent(badge.id)}`}
          className="ghost-btn back-link"
        >
          ← {t(lang, "back")}
        </Link>
      </header>

      <main className="nft-main">
        <p className="nft-kicker">{t(lang, "nftPageKicker")}</p>
        <h1 className="nft-title">{t(lang, "nftPageTitle", { name: badge.name })}</h1>
        <p className="hint soft">{t(lang, "nftPageBody")}</p>

        <div
          className="nft-card"
          style={{ ["--badge-color" as string]: color }}
        >
          <div className="nft-art">
            <BadgeOrb
              iconSlug={badge.iconSlug}
              color={color}
              name={badge.name}
              state="earned"
              size={168}
              colorful
            />
          </div>
          <p className="nft-badge-name">{badge.name}</p>
          <p className="nft-meta">
            {badge.level} · {badge.category}
          </p>
          <p className="nft-chain-pill">{t(lang, "nftCluster")}</p>
        </div>

        <dl className="nft-details">
          {owner ? (
            <div className="nft-detail-row">
              <dt>{t(lang, "nftOwnerLabel")}</dt>
              <dd>
                <a
                  className="mono nft-mono-link"
                  href={ownerExplorerUrl(owner)}
                  target="_blank"
                  rel="noreferrer"
                  title={owner}
                >
                  {shortAddr(owner)}
                </a>
              </dd>
            </div>
          ) : null}
          <div className="nft-detail-row">
            <dt>{t(lang, "nftTxLabel")}</dt>
            <dd>
              <a
                className="mono nft-mono-link"
                href={explorerUrl(tx)}
                target="_blank"
                rel="noreferrer"
                title={tx}
              >
                {shortAddr(tx)}
              </a>
            </dd>
          </div>
        </dl>

        <a
          className="primary-btn wide"
          href={explorerUrl(tx)}
          target="_blank"
          rel="noreferrer"
        >
          {t(lang, "nftOpenExplorer")}
        </a>
        {owner ? (
          <a
            className="ghost-btn wide"
            href={ownerExplorerUrl(owner)}
            target="_blank"
            rel="noreferrer"
          >
            {t(lang, "nftOpenOwner")}
          </a>
        ) : null}
        <Link href="/journal" className="ghost-btn wide">
          {t(lang, "mintSuccessJournal")}
        </Link>
      </main>

      <BottomNav
        homeLabel={t(lang, "navHome")}
        notebookLabel={t(lang, "navNotebook")}
        journalLabel={t(lang, "navJournal")}
      />
    </div>
  );
}
