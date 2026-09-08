"use client";

const PROFILE_KEY = "badge-tracker:profile";
const DRAFT_KEY = "badge-tracker:onboarding-draft";
const MINT_WALLET_KEY = "badge-tracker:mint-wallet";
const SWIG_ID_KEY = "badge-tracker:swig-id";
const SWIG_AUTHORITY_KEY = "badge-tracker:swig-authority";

import type { OnboardingDraft, Profile } from "./types";
import { EMPTY_ONBOARDING } from "./types";

export function loadDraft(): OnboardingDraft {
  if (typeof window === "undefined") return { ...EMPTY_ONBOARDING };
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return { ...EMPTY_ONBOARDING };
    return { ...EMPTY_ONBOARDING, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_ONBOARDING };
  }
}

export function saveDraft(draft: OnboardingDraft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  clearDraft();
}

export function updateProfile(partial: Partial<Profile>) {
  const current = loadProfile();
  if (!current) return;
  saveProfile({ ...current, ...partial });
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
}

/** Parent Solana address that receives minted badge cNFTs. */
export function loadMintWallet(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(MINT_WALLET_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function saveMintWallet(address: string) {
  localStorage.setItem(MINT_WALLET_KEY, address.trim());
}

/** 32-byte Swig id as base64 (stable across sessions). */
export function loadSwigIdBase64(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(SWIG_ID_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function saveSwigIdBase64(idBase64: string) {
  localStorage.setItem(SWIG_ID_KEY, idBase64.trim());
}

/** Base58-encoded Ed25519 secret for the parent Swig root authority (demo only). */
export function loadSwigAuthoritySecret(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(SWIG_AUTHORITY_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function saveSwigAuthoritySecret(secretBase58: string) {
  localStorage.setItem(SWIG_AUTHORITY_KEY, secretBase58.trim());
}
