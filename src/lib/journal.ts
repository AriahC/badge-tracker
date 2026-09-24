"use client";

import { getAllBadges } from "./badges";
import { loadProgress } from "./progress";
import type { Badge, EarnedBadgeRecord, ProgressState, RequirementProgress } from "./types";

export type JournalRequirement = {
  id: string;
  text: string;
  note: string;
  photoName?: string;
  completedAt: string;
};

export type JournalBadgeItem = {
  badge: Badge;
  status: "earned" | "in-progress";
  earned?: EarnedBadgeRecord;
  completed: JournalRequirement[];
  latestActivityAt: string;
};

export type JournalDayEvent =
  | {
      id: string;
      type: "requirement";
      at: string;
      badgeId: string;
      badgeName: string;
      category: string;
      requirementText: string;
      note: string;
    }
  | {
      id: string;
      type: "earned";
      at: string;
      badgeId: string;
      badgeName: string;
      category: string;
    }
  | {
      id: string;
      type: "minted";
      at: string;
      badgeId: string;
      badgeName: string;
      category: string;
      mintAddress: string;
    };

export type JournalDayGroup = {
  date: string;
  events: JournalDayEvent[];
};

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export function buildJournalBadges(
  state: ProgressState = loadProgress(),
): JournalBadgeItem[] {
  const items: JournalBadgeItem[] = [];

  for (const badge of getAllBadges()) {
    const completed: JournalRequirement[] = [];
    for (const req of badge.requirements) {
      const progress = state.requirements[req.id];
      if (!progress) continue;
      completed.push({
        id: req.id,
        text: req.text,
        note: progress.note,
        photoName: progress.photoName,
        completedAt: progress.completedAt,
      });
    }

    if (completed.length === 0 && !state.earned[badge.id]) continue;

    completed.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
    const earned = state.earned[badge.id];
    const latestFromReqs = completed[0]?.completedAt ?? "";
    const latestActivityAt = [latestFromReqs, earned?.earnedAt ?? ""]
      .filter(Boolean)
      .sort()
      .at(-1) as string;

    items.push({
      badge,
      status: earned ? "earned" : "in-progress",
      earned,
      completed: completed.sort((a, b) => a.completedAt.localeCompare(b.completedAt)),
      latestActivityAt,
    });
  }

  return items.sort((a, b) => b.latestActivityAt.localeCompare(a.latestActivityAt));
}

export function buildJournalDays(
  state: ProgressState = loadProgress(),
): JournalDayGroup[] {
  const events: JournalDayEvent[] = [];
  const badges = getAllBadges();

  for (const badge of badges) {
    for (const req of badge.requirements) {
      const progress: RequirementProgress | undefined = state.requirements[req.id];
      if (!progress) continue;
      events.push({
        id: `req-${req.id}`,
        type: "requirement",
        at: progress.completedAt,
        badgeId: badge.id,
        badgeName: badge.name,
        category: badge.category,
        requirementText: req.text,
        note: progress.note,
      });
    }

    const earned = state.earned[badge.id];
    if (earned) {
      events.push({
        id: `earned-${badge.id}`,
        type: "earned",
        at: earned.earnedAt,
        badgeId: badge.id,
        badgeName: badge.name,
        category: badge.category,
      });
      if (earned.mintStatus === "minted" && earned.mintAddress) {
        events.push({
          id: `minted-${badge.id}`,
          type: "minted",
          at: earned.earnedAt,
          badgeId: badge.id,
          badgeName: badge.name,
          category: badge.category,
          mintAddress: earned.mintAddress,
        });
      }
    }
  }

  events.sort((a, b) => b.at.localeCompare(a.at));

  const groups = new Map<string, JournalDayEvent[]>();
  for (const event of events) {
    const key = dayKey(event.at);
    const list = groups.get(key) ?? [];
    list.push(event);
    groups.set(key, list);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, dayEvents]) => ({ date, events: dayEvents }));
}

/** Explorer link for a mint tx signature (or legacy address-looking mock ids). */
export function explorerUrl(mintAddress: string): string {
  const looksLikeTx =
    mintAddress.length >= 64 && !mintAddress.startsWith("devnet-mock-");
  const kind = looksLikeTx ? "tx" : "address";
  return `https://explorer.solana.com/${kind}/${encodeURIComponent(mintAddress)}?cluster=devnet`;
}

/** Explorer link for a Solana wallet / leaf owner on devnet. */
export function ownerExplorerUrl(ownerAddress: string): string {
  return `https://explorer.solana.com/address/${encodeURIComponent(ownerAddress)}?cluster=devnet`;
}

/** In-app NFT certificate page for a minted badge. */
export function nftPagePath(badgeId: string): string {
  return `/badge/${encodeURIComponent(badgeId)}/nft`;
}
