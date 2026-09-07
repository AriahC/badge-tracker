"use client";

export type FeedbackKind = "bug" | "idea";

export type FeedbackEntry = {
  id: string;
  kind: FeedbackKind;
  message: string;
  path: string;
  createdAt: string;
};

const FEEDBACK_KEY = "badge-tracker:feedback";

export function loadFeedback(): FeedbackEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FeedbackEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveFeedback(kind: FeedbackKind, message: string, path: string) {
  const entry: FeedbackEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    message: message.trim(),
    path,
    createdAt: new Date().toISOString(),
  };
  const next = [entry, ...loadFeedback()].slice(0, 100);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(next));
  return entry;
}
