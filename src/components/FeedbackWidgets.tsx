"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { saveFeedback, type FeedbackKind } from "@/lib/feedback";
import { t } from "@/lib/i18n";
import { loadProfile } from "@/lib/storage";

type PanelMode = FeedbackKind | null;

export function FeedbackWidgets() {
  const pathname = usePathname();
  const titleId = useId();
  const [lang, setLang] = useState("en");
  const [mode, setMode] = useState<PanelMode>(null);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const profile = loadProfile();
    if (profile?.language) setLang(profile.language);
  }, [pathname]);

  useEffect(() => {
    // Sit above the bottom nav on main app screens.
    setLifted(
      pathname.startsWith("/home") ||
        pathname.startsWith("/badge") ||
        pathname.startsWith("/notebook") ||
        pathname.startsWith("/journal") ||
        pathname.startsWith("/gallery"),
    );
  }, [pathname]);

  function open(next: FeedbackKind) {
    setMode(next);
    setMessage("");
    setSent(false);
  }

  function close() {
    setMode(null);
    setMessage("");
    setSent(false);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!mode || trimmed.length < 3) return;
    saveFeedback(mode, trimmed, pathname || "/");
    setSent(true);
    setMessage("");
  }

  const isBug = mode === "bug";
  const title = isBug ? t(lang, "feedbackBugTitle") : t(lang, "feedbackIdeaTitle");
  const hint = isBug ? t(lang, "feedbackBugHint") : t(lang, "feedbackIdeaHint");
  const placeholder = isBug
    ? t(lang, "feedbackBugPlaceholder")
    : t(lang, "feedbackIdeaPlaceholder");

  return (
    <div
      className={`feedback-dock ${lifted ? "feedback-dock-lifted" : ""}`}
      aria-live="polite"
    >
      <div className="feedback-launchers">
        <button
          type="button"
          className={`feedback-chip ${mode === "bug" ? "is-open" : ""}`}
          onClick={() => (mode === "bug" ? close() : open("bug"))}
          aria-expanded={mode === "bug"}
        >
          <span className="feedback-chip-icon" aria-hidden="true">
            !
          </span>
          {t(lang, "feedbackBugButton")}
        </button>
        <button
          type="button"
          className={`feedback-chip ${mode === "idea" ? "is-open" : ""}`}
          onClick={() => (mode === "idea" ? close() : open("idea"))}
          aria-expanded={mode === "idea"}
        >
          <span className="feedback-chip-icon" aria-hidden="true">
            ✦
          </span>
          {t(lang, "feedbackIdeaButton")}
        </button>
      </div>

      {mode && (
        <div
          className="feedback-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
        >
          <div className="feedback-panel-head">
            <h2 id={titleId}>{title}</h2>
            <button
              type="button"
              className="feedback-close"
              onClick={close}
              aria-label={t(lang, "feedbackClose")}
            >
              ×
            </button>
          </div>

          {sent ? (
            <p className="feedback-thanks">{t(lang, "feedbackThanks")}</p>
          ) : (
            <form className="feedback-form" onSubmit={submit}>
              <p className="feedback-hint">{hint}</p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={placeholder}
                rows={4}
                required
                minLength={3}
                maxLength={1000}
              />
              <button type="submit" className="primary-btn feedback-submit">
                {t(lang, "feedbackSend")}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
