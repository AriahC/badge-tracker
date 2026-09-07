"use client";

import type { NotebookEntry, NotebookPage } from "./types";

const NOTEBOOK_KEY = "badge-tracker:notebook";

function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function newPage(): NotebookPage {
  return {
    id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    body: "",
  };
}

function newEntry(entryDate: string): NotebookEntry {
  return {
    id: `entry-${entryDate}`,
    entryDate,
    title: "",
    pages: [newPage()],
    updatedAt: new Date().toISOString(),
  };
}

export function loadNotebook(): NotebookEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTEBOOK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NotebookEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(entries: NotebookEntry[]) {
  localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(entries));
}

export function clearNotebook() {
  localStorage.removeItem(NOTEBOOK_KEY);
}

export function getEntryForDate(entryDate: string): NotebookEntry {
  const entries = loadNotebook();
  const existing = entries.find((e) => e.entryDate === entryDate);
  return existing ? structuredClone(existing) : newEntry(entryDate);
}

export function upsertEntry(entry: NotebookEntry): NotebookEntry {
  const entries = loadNotebook();
  const next: NotebookEntry = {
    ...entry,
    updatedAt: new Date().toISOString(),
    pages: entry.pages.length > 0 ? entry.pages : [newPage()],
  };
  const idx = entries.findIndex((e) => e.entryDate === next.entryDate);
  if (idx >= 0) entries[idx] = next;
  else entries.push(next);
  saveAll(entries);
  return next;
}

/** Drop empty days so Gallery only shows real writing. */
export function listNotebookDays(): NotebookEntry[] {
  return loadNotebook()
    .filter((e) => {
      const hasTitle = e.title.trim().length > 0;
      const hasBody = e.pages.some((p) => p.body.trim().length > 0);
      return hasTitle || hasBody;
    })
    .sort((a, b) => b.entryDate.localeCompare(a.entryDate));
}

export function addPageToEntry(entry: NotebookEntry): NotebookEntry {
  return {
    ...entry,
    pages: [...entry.pages, newPage()],
  };
}

export function previewText(entry: NotebookEntry, max = 90): string {
  const fromPages = entry.pages.map((p) => p.body.trim()).filter(Boolean).join(" ");
  const text = fromPages || entry.title.trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export function formatEntryDate(entryDate: string, language: string): string {
  const [y, m, d] = entryDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  try {
    return new Intl.DateTimeFormat(language === "es" ? "es" : "en", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return entryDate;
  }
}

export function isToday(entryDate: string): boolean {
  return entryDate === todayKey();
}

export { todayKey, newPage };
