"use client";

const PROFILE_KEY = "badge-tracker:profile";
const DRAFT_KEY = "badge-tracker:onboarding-draft";

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
