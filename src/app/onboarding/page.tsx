"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SpeakButton } from "@/components/SpeakButton";
import { DaisyPuzzle } from "@/components/DaisyPuzzle";
import { EncouragementTip } from "@/components/EncouragementTip";
import { FEATURE_BADGES } from "@/lib/assets";
import { GRADE_OPTIONS, gradeToLevel } from "@/lib/grade";
import { LANGUAGE_CHIPS, hasDictionary, t } from "@/lib/i18n";
import { loadDraft, saveDraft, saveProfile } from "@/lib/storage";
import type { OnboardingDraft } from "@/lib/types";
import { EMPTY_ONBOARDING } from "@/lib/types";

const STEPS = [
  "language",
  "name",
  "grade",
  "parentName",
  "parentEmail",
  "botCheck",
  "login",
] as const;

type Step = (typeof STEPS)[number];

export default function OnboardingPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY_ONBOARDING);
  const [customLang, setCustomLang] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDraft(loadDraft());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveDraft(draft);
  }, [draft, ready]);

  const step = STEPS[stepIndex];
  const lang = draft.language || "en";

  const speakText = useMemo(() => {
    switch (step) {
      case "language":
        return `${t(lang, "languageTitle")} ${t(lang, "languageHint")}`;
      case "name":
        return t(lang, "nameTitle");
      case "grade": {
        const base = `${t(lang, "gradeTitle")} ${t(lang, "gradeHint")}`;
        if (draft.level) {
          return `${base} ${t(lang, "levelReveal", { level: draft.level })}`;
        }
        return base;
      }
      case "parentName":
        return t(lang, "parentNameTitle");
      case "parentEmail":
        return `${t(lang, "parentEmailTitle")} ${t(lang, "parentEmailHint")}`;
      case "botCheck":
        return `${t(lang, "botCheckTitle")} ${t(lang, "botCheckHint")}`;
      case "login":
        return `${t(lang, "loginTitle")} ${t(lang, "loginHint")}`;
      default:
        return "";
    }
  }, [step, lang, draft.level]);

  function update(partial: Partial<OnboardingDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function canContinue(): boolean {
    switch (step) {
      case "language":
        return draft.language.trim().length > 0;
      case "name":
        return draft.childName.trim().length > 0;
      case "grade":
        return draft.grade !== null && draft.level !== null;
      case "parentName":
        return draft.parentName.trim().length > 0;
      case "parentEmail":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.parentEmail.trim());
      case "botCheck":
        return draft.botCheckPassed;
      case "login":
        return true;
      default:
        return false;
    }
  }

  function goNext() {
    if (step === "login") {
      if (
        draft.grade === null ||
        !draft.level ||
        !draft.childName ||
        !draft.parentEmail
      ) {
        return;
      }
      saveProfile({
        language: draft.language,
        childName: draft.childName.trim(),
        grade: draft.grade,
        level: draft.level,
        parentName: draft.parentName.trim(),
        parentEmail: draft.parentEmail.trim().toLowerCase(),
        createdAt: new Date().toISOString(),
        seenHowItWorks: false,
      });
      router.push("/how-it-works");
      return;
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  if (!ready) {
    return <div className="screen-loading" />;
  }

  return (
    <div className="onboard">
      <header className="onboard-top">
        <p className="brand">{t(lang, "appName")}</p>
        <SpeakButton
          text={speakText}
          language={lang}
          label={t(lang, "speak")}
        />
      </header>

      <div className="progress-dots" aria-hidden="true">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`dot ${i === stepIndex ? "dot-active" : ""} ${i < stepIndex ? "dot-done" : ""}`}
          />
        ))}
      </div>

      <main className="onboard-main">
        {step === "language" && (
          <section className="step">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="onboard-badge-row"
              src={FEATURE_BADGES.explorer}
              alt=""
              width={64}
              height={64}
            />
            <h1>{t(lang, "languageTitle")}</h1>
            <p className="hint">{t(lang, "languageHint")}</p>
            <div className="chip-row">
              {LANGUAGE_CHIPS.map((chip) => (
                <button
                  key={chip.code}
                  type="button"
                  className={`chip ${draft.language === chip.code ? "chip-active" : ""}`}
                  onClick={() => {
                    setCustomLang("");
                    update({ language: chip.code });
                  }}
                >
                  {t(lang, chip.labelKey)}
                </button>
              ))}
            </div>
            <input
              className="field"
              value={customLang}
              placeholder={t(lang, "languageOtherPlaceholder")}
              onChange={(e) => {
                const value = e.target.value;
                setCustomLang(value);
                if (value.trim()) {
                  const code = value.trim().toLowerCase().slice(0, 2);
                  update({
                    language: hasDictionary(code) ? code : "en",
                  });
                }
              }}
            />
            {customLang.trim() && !hasDictionary(customLang.trim().toLowerCase().slice(0, 2)) && (
              <p className="hint soft">
                We&apos;ll keep English words for now — full translation for
                &ldquo;{customLang.trim()}&rdquo; can be added as one new file
                later.
              </p>
            )}
          </section>
        )}

        {step === "name" && (
          <section className="step">
            <h1>{t(lang, "nameTitle")}</h1>
            <input
              className="field field-lg"
              autoFocus
              value={draft.childName}
              placeholder={t(lang, "namePlaceholder")}
              onChange={(e) => update({ childName: e.target.value })}
              maxLength={40}
            />
          </section>
        )}

        {step === "grade" && (
          <section className="step">
            <h1>{t(lang, "gradeTitle")}</h1>
            <p className="hint">{t(lang, "gradeHint")}</p>
            <div className="grade-grid">
              {GRADE_OPTIONS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  className={`grade-btn ${draft.grade === g.value ? "grade-active" : ""}`}
                  onClick={() =>
                    update({
                      grade: g.value,
                      level: gradeToLevel(g.value),
                    })
                  }
                >
                  {t(lang, g.labelKey as "gradeK")}
                </button>
              ))}
            </div>
            {draft.level && (
              <p className="level-reveal" key={draft.level}>
                {t(lang, "levelReveal", { level: draft.level })}
              </p>
            )}
          </section>
        )}

        {step === "parentName" && (
          <section className="step">
            <h1>{t(lang, "parentNameTitle")}</h1>
            <input
              className="field field-lg"
              autoFocus
              value={draft.parentName}
              placeholder={t(lang, "parentNamePlaceholder")}
              onChange={(e) => update({ parentName: e.target.value })}
              maxLength={60}
            />
          </section>
        )}

        {step === "parentEmail" && (
          <section className="step">
            <h1>{t(lang, "parentEmailTitle")}</h1>
            <p className="hint">{t(lang, "parentEmailHint")}</p>
            <input
              className="field field-lg"
              autoFocus
              type="email"
              inputMode="email"
              autoComplete="email"
              value={draft.parentEmail}
              placeholder={t(lang, "parentEmailPlaceholder")}
              onChange={(e) => update({ parentEmail: e.target.value })}
            />
          </section>
        )}

        {step === "botCheck" && (
          <section className="step">
            <h1>{t(lang, "botCheckTitle")}</h1>
            <DaisyPuzzle
              passed={draft.botCheckPassed}
              hint={t(lang, "botCheckHint")}
              wrong={t(lang, "botCheckWrong")}
              done={t(lang, "botCheckDone")}
              onPass={() => update({ botCheckPassed: true })}
            />
          </section>
        )}

        {step === "login" && (
          <section className="step">
            <EncouragementTip message={t(lang, "encourageTip")} />
            <h1>{t(lang, "loginTitle")}</h1>
            <p className="hint">{t(lang, "loginHint")}</p>
            <button type="button" className="primary-btn wide" onClick={goNext}>
              {t(lang, "loginButton")}
            </button>
          </section>
        )}
      </main>

      {step !== "login" && (
        <footer className="onboard-footer">
          {stepIndex > 0 ? (
            <button type="button" className="ghost-btn" onClick={goBack}>
              {t(lang, "back")}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="primary-btn"
            disabled={!canContinue()}
            onClick={goNext}
          >
            {t(lang, "next")}
          </button>
        </footer>
      )}
    </div>
  );
}
