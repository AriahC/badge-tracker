"use client";

import { speak } from "@/lib/tts";

type SpeakButtonProps = {
  text: string;
  language: string;
  label: string;
};

export function SpeakButton({ text, language, label }: SpeakButtonProps) {
  return (
    <button
      type="button"
      onClick={() => speak(text, language)}
      aria-label={label}
      className="speak-btn"
    >
      <span className="speak-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path
            d="M4 9.5v5h3.2L12 18.5v-13L7.2 9.5H4Z"
            fill="currentColor"
          />
          <path
            d="M15 9.2a3.2 3.2 0 0 1 0 5.6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M17.2 7a5.4 5.4 0 0 1 0 10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </button>
  );
}
