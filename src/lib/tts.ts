"use client";

/** Read text aloud with the browser's built-in speech (free, no API key). */
export function speak(text: string, language: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageToSpeechCode(language);
  utterance.rate = 0.95;

  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) =>
    v.lang.toLowerCase().startsWith(utterance.lang.toLowerCase().slice(0, 2)),
  );
  if (match) utterance.voice = match;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

function languageToSpeechCode(language: string): string {
  const map: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    vi: "vi-VN",
  };
  return map[language] ?? language;
}
