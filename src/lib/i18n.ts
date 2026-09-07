import en from "../../locales/en.json";
import es from "../../locales/es.json";

export type LocaleKey = keyof typeof en;

const dictionaries: Record<string, Record<string, string>> = {
  en,
  es,
};

export const LANGUAGE_CHIPS = [
  { code: "en", labelKey: "langEnglish" as LocaleKey },
  { code: "es", labelKey: "langSpanish" as LocaleKey },
  { code: "fr", labelKey: "langFrench" as LocaleKey },
  { code: "vi", labelKey: "langVietnamese" as LocaleKey },
];

/** Get a translated string. Falls back to English, then the key. */
export function t(
  language: string,
  key: LocaleKey,
  vars?: Record<string, string>,
): string {
  const dict = dictionaries[language] ?? dictionaries.en;
  let text = dict[key] ?? dictionaries.en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replace(`{${name}}`, value);
    }
  }
  return text;
}

export function hasDictionary(language: string): boolean {
  return language in dictionaries;
}
