/**
 * Checks that a kid's note actually sounds related to the requirement.
 * Uses keyword overlap + simple kid-friendly synonyms (no paid AI).
 */

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "if",
  "to",
  "of",
  "in",
  "on",
  "at",
  "for",
  "with",
  "from",
  "by",
  "as",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "you",
  "your",
  "yours",
  "i",
  "me",
  "my",
  "we",
  "our",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "what",
  "when",
  "where",
  "which",
  "who",
  "how",
  "can",
  "could",
  "would",
  "should",
  "will",
  "just",
  "into",
  "out",
  "up",
  "down",
  "about",
  "over",
  "under",
  "again",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "safe",
  "simple",
  "right",
  "way",
  "things",
  "thing",
  "someone",
  "something",
  "adult",
  "family",
  "member",
  "without",
  "using",
  "make",
  "made",
  "making",
]);

/** Past tense / kid phrasing → related requirement words */
const RELATED: Record<string, string[]> = {
  visit: ["visited", "went", "go", "going", "saw", "see", "trip"],
  visited: ["visit", "went", "saw"],
  went: ["go", "going", "visit", "visited", "trip"],
  go: ["went", "going", "visit"],
  hear: ["heard", "listening", "listen", "sound", "sounds"],
  heard: ["hear", "sound", "sounds", "listening"],
  draw: ["drew", "drawing", "sketch", "sketched", "traced", "trace"],
  drew: ["draw", "drawing", "sketch", "sketched"],
  photograph: ["photo", "photos", "picture", "pictures", "selfie", "camera"],
  photo: ["photograph", "picture", "pictures", "photos"],
  name: ["named", "called", "call"],
  named: ["name", "called"],
  collect: ["collected", "picked", "gather", "gathered", "found"],
  collected: ["collect", "picked", "found", "gathered"],
  sort: ["sorted", "sorting", "grouped", "organized"],
  sorted: ["sort", "grouped"],
  mix: ["mixed", "mixing", "blend", "blended"],
  mixed: ["mix", "mixing"],
  paint: ["painted", "painting", "color", "colored", "colour"],
  painted: ["paint", "painting"],
  watch: ["watched", "watching", "looked", "looking", "observed", "observe"],
  watched: ["watch", "looking", "observed"],
  write: ["wrote", "writing", "written", "journal"],
  wrote: ["write", "writing"],
  share: ["shared", "showed", "told", "show", "tell"],
  shared: ["share", "showed", "told"],
  build: ["built", "building", "made", "create", "created"],
  built: ["build", "building", "made"],
  fix: ["fixed", "repair", "repaired", "fixed"],
  fixed: ["fix", "repair"],
  pack: ["packed", "packing"],
  packed: ["pack"],
  wash: ["washed", "washing", "clean", "cleaned"],
  washed: ["wash", "cleaned"],
  practice: ["practiced", "practised", "tried", "try"],
  practiced: ["practice", "tried"],
  explain: ["explained", "told", "said"],
  explained: ["explain", "told"],
  leave: ["left", "leaving"],
  clean: ["cleaned", "cleaning", "wash", "washed"],
  cleaned: ["clean", "wash"],
  taste: ["tasted", "ate", "eat", "tried", "smell", "smelled"],
  smelled: ["smell", "sniffed", "taste"],
  walk: ["walked", "walking", "hike", "hiked"],
  walked: ["walk", "hike"],
  map: ["mapped", "drawing", "drew", "sketch"],
  breathe: ["breath", "breaths", "breathing"],
  breath: ["breathe", "breaths", "breathing"],
  comfort: ["comforted", "helped", "kind", "caring"],
  role: ["pretend", "practiced", "acted", "play", "played"],
  play: ["played", "pretend", "role"],
  test: ["tested", "try", "tried"],
  tested: ["test", "tried"],
  rebuild: ["rebuilt", "fixed", "stronger"],
  circuit: ["circuits", "battery", "wire", "wires", "electric", "light"],
  bridge: ["bridges", "span", "weight", "strong"],
  leaf: ["leaves", "foliage"],
  leaves: ["leaf"],
  cloud: ["clouds", "sky", "cloudy"],
  clouds: ["cloud", "sky"],
  bug: ["bugs", "insect", "insects", "ant", "bee", "spider"],
  animal: ["animals", "pet", "pets", "bird", "birds", "dog", "cat"],
  animals: ["animal", "pet", "bird"],
  water: ["waterfall", "creek", "fountain", "lake", "river", "stream"],
  waterfall: ["water", "creek", "fountain", "falls"],
  snack: ["food", "ate", "eat", "recipe", "kitchen"],
  robot: ["robots", "bot", "machine"],
  shelter: ["tent", "roof", "cover", "house"],
  outdoor: ["outside", "outdoors", "nature", "park"],
  outdoors: ["outside", "outdoor", "nature"],
  outside: ["outdoors", "outdoor", "nature"],
  hands: ["hand", "washed", "washing"],
  location: ["address", "place", "where", "spot"],
  landmark: ["landmarks", "sign", "tree", "building", "place"],
  landmarks: ["landmark", "places"],
  prediction: ["predict", "guess", "guessed", "thought"],
  color: ["colors", "colour", "colours", "paint", "mixed"],
  colors: ["color", "paint"],
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

function stem(word: string): string {
  if (word.length <= 4) return word;
  if (word.endsWith("ing") && word.length > 5) return word.slice(0, -3);
  if (word.endsWith("ed") && word.length > 4) return word.slice(0, -2);
  if (word.endsWith("es") && word.length > 4) return word.slice(0, -2);
  if (word.endsWith("s") && word.length > 4) return word.slice(0, -1);
  return word;
}

function tokens(text: string): string[] {
  return normalize(text)
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

function expandKeyword(word: string): Set<string> {
  const out = new Set<string>();
  const base = stem(word);
  out.add(word);
  out.add(base);
  for (const related of RELATED[word] ?? []) {
    out.add(related);
    out.add(stem(related));
  }
  for (const related of RELATED[base] ?? []) {
    out.add(related);
    out.add(stem(related));
  }
  return out;
}

function requirementKeywords(requirement: string): Set<string> {
  const keys = new Set<string>();
  for (const token of tokens(requirement)) {
    for (const piece of expandKeyword(token)) {
      keys.add(piece);
    }
  }
  return keys;
}

export type NoteCheckResult =
  | { ok: true }
  | { ok: false; reason: "tooShort" | "gibberish" | "unrelated" };

export function checkRequirementNote(
  requirement: string,
  note: string,
): NoteCheckResult {
  const trimmed = note.trim();
  const noteWords = tokens(trimmed);

  if (trimmed.length < 12 || noteWords.length < 3) {
    return { ok: false, reason: "tooShort" };
  }

  // Reject keyboard smash / repeated junk
  const uniqueChars = new Set(normalize(trimmed).replace(/\s/g, ""));
  if (uniqueChars.size < 5) {
    return { ok: false, reason: "gibberish" };
  }
  if (/^(.)\1{4,}$/i.test(trimmed.replace(/\s/g, ""))) {
    return { ok: false, reason: "gibberish" };
  }

  const needed = requirementKeywords(requirement);
  if (needed.size === 0) {
    // Extremely generic requirement — require a real sentence only
    return noteWords.length >= 4 ? { ok: true } : { ok: false, reason: "tooShort" };
  }

  const noteSet = new Set<string>();
  for (const word of noteWords) {
    noteSet.add(word);
    noteSet.add(stem(word));
    for (const related of RELATED[word] ?? RELATED[stem(word)] ?? []) {
      noteSet.add(related);
      noteSet.add(stem(related));
    }
  }

  let hits = 0;
  for (const key of needed) {
    if (noteSet.has(key) || noteSet.has(stem(key))) {
      hits += 1;
    }
  }

  // Need enough overlap with the requirement's meaningful words
  const minHits = needed.size <= 3 ? 1 : needed.size <= 6 ? 2 : 3;
  if (hits < minHits) {
    return { ok: false, reason: "unrelated" };
  }

  return { ok: true };
}
