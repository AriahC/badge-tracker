"use client";

import type { Badge, ProgressState, RequirementProgress } from "./types";
import { EMPTY_PROGRESS } from "./types";

const PROGRESS_KEY = "badge-tracker:progress";

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return { ...EMPTY_PROGRESS, requirements: {}, earned: {} };
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { requirements: {}, earned: {} };
    const parsed = JSON.parse(raw) as ProgressState;
    return {
      requirements: parsed.requirements ?? {},
      earned: parsed.earned ?? {},
    };
  } catch {
    return { requirements: {}, earned: {} };
  }
}

export function saveProgress(state: ProgressState) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
}

export function clearProgress() {
  localStorage.removeItem(PROGRESS_KEY);
}

export function completeRequirement(
  requirementId: string,
  badge: Badge,
  note: string,
  photoName?: string,
): ProgressState {
  const state = loadProgress();
  const entry: RequirementProgress = {
    note: note.trim(),
    completedAt: new Date().toISOString(),
  };
  if (photoName) entry.photoName = photoName;

  state.requirements[requirementId] = entry;

  const doneCount = badge.requirements.filter((r) => state.requirements[r.id]).length;
  if (doneCount === badge.requirements.length && !state.earned[badge.id]) {
    state.earned[badge.id] = {
      badgeId: badge.id,
      earnedAt: new Date().toISOString(),
      mintStatus: "pending",
    };
  }

  saveProgress(state);
  return state;
}

export function markMintAttempt(
  badgeId: string,
  status: "pending" | "minted" | "failed",
  /** On-chain tx signature when status is "minted". */
  mintSignature?: string,
  /** Destination wallet (leafOwner) when status is "minted". */
  mintOwner?: string,
): ProgressState {
  const state = loadProgress();
  const existing = state.earned[badgeId];
  if (!existing) return state;
  state.earned[badgeId] = {
    ...existing,
    mintStatus: status,
    mintAddress:
      status === "minted" && mintSignature
        ? mintSignature
        : existing.mintAddress,
    mintOwner:
      status === "minted" && mintOwner ? mintOwner : existing.mintOwner,
  };
  saveProgress(state);
  return state;
}

export function badgeProgressRatio(badge: Badge, state: ProgressState): number {
  if (badge.requirements.length === 0) return 0;
  const done = badge.requirements.filter((r) => state.requirements[r.id]).length;
  return done / badge.requirements.length;
}

export function isBadgeEarned(badgeId: string, state: ProgressState): boolean {
  return Boolean(state.earned[badgeId]);
}

/**
 * Hackathon shortcut: mark every requirement done + badge earned so judges
 * can demo Swig + mint without typing notes.
 */
export function seedDemoEarnedBadge(badge: Badge): ProgressState {
  const state = loadProgress();
  const now = new Date().toISOString();
  for (const req of badge.requirements) {
    if (state.requirements[req.id]) continue;
    state.requirements[req.id] = {
      note: "Demo: skipped for minting walkthrough.",
      completedAt: now,
    };
  }
  const existing = state.earned[badge.id];
  state.earned[badge.id] = {
    badgeId: badge.id,
    earnedAt: existing?.earnedAt ?? now,
    // Always re-open mint UI for the shortcut (new cNFT each demo mint).
    mintStatus: "pending",
    mintAddress: undefined,
  };
  saveProgress(state);
  return state;
}
