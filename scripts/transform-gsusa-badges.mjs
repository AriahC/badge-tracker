/**
 * Transform data/gsusa/girl-scout-badges → data/badges.seed.json
 *
 * Uses the Badge Explorer pack the user provided:
 * - Official title, level, topics, and step titles
 * - icon_slug = badge.slug → /assets/badges/<level>/<slug>.png
 *
 * Also corrects known feed mistakes where Cadette (diamond) badges were
 * tagged as Junior because their Explorer filter was wrong.
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packPath = join(root, "data/gsusa/girl-scout-badges/data/badges.json");
const outPath = join(root, "data/badges.seed.json");
const badgesDir = join(root, "public/assets/badges");

const LEVEL_NAME = {
  daisy: "Daisy",
  brownie: "Brownie",
  junior: "Junior",
  cadette: "Cadette",
  senior: "Senior",
  ambassador: "Ambassador",
};

const LEVEL_KEYS = Object.keys(LEVEL_NAME);

const CATEGORY_BY_TOPIC_KEY = {
  nature: "Animals and Nature",
  art: "Art and Imagination",
  awards: "Awards",
  health: "Balanced Living",
  "highest-award-prerequisite": "Highest Awards",
  "highest-awards": "Highest Awards",
  Journey: "Journeys",
  journey: "Journeys",
  leadership: "Leadership and Your Future",
  "leadership-awards": "Leadership Awards",
  outdoors: "Outdoor Adventure",
  sports: "Sports and Recreation",
  technology: "Technology and Innovation",
  "space-science": "Your World Near and Far",
  Lifeskills: "Balanced Living",
  lifeskills: "Balanced Living",
  Stem: "Technology and Innovation",
  stem: "Technology and Innovation",
  Financialliteracy: "Leadership and Your Future",
  financialliteracy: "Leadership and Your Future",
  Relationships: "Balanced Living",
  relationships: "Balanced Living",
  Entrepreneurship: "Leadership and Your Future",
  entrepreneurship: "Leadership and Your Future",
};

const TYPE_ORDER = { petal: 1, badge: 2, pin: 3, journey: 4, award: 5 };

const pack = JSON.parse(readFileSync(packPath, "utf8"));

function cleanTitle(title) {
  return String(title || "")
    .replace(/^Journey:\s*/i, "")
    .replace(
      /^(Daisy|Brownie|Junior|Cadette|Senior|Ambassador)\s+/i,
      "",
    )
    .replace(/®|™/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Infer true program level from official art path / filename / title. */
function levelFromArt(badge) {
  const url = String(badge.image?.sourceUrl || "").toLowerCase();
  const fn = String(badge.image?.sourceFilename || "").toLowerCase();
  const title = String(badge.title || "").toLowerCase();
  const blob = `${url} ${fn}`;

  const checks = [
    ["daisy", ["/daisy", "daisy_", "daisypetal", "daisies"]],
    ["brownie", ["/brownie", "brownie_", "brownies"]],
    ["junior", ["/junior", "junior_", "juniors"]],
    ["cadette", ["/cadette", "cadette_", "cadettes"]],
    ["senior", ["/senior", "senior_", "seniors"]],
    ["ambassador", ["/ambassador", "ambassador_", "ambassadors"]],
  ];

  for (const [level, keys] of checks) {
    if (keys.some((k) => blob.includes(k))) return level;
  }

  for (const level of LEVEL_KEYS) {
    const name = LEVEL_NAME[level].toLowerCase();
    if (title.startsWith(`${name} `) || title === name) return level;
  }

  return null;
}

function resolveLevel(badge) {
  const declared = badge.level?.key || "daisy";
  const title = String(badge.title || "");
  // Shared awards (e.g. Senior/Ambassador True North) keep their feed level.
  if (/senior\s*\/\s*ambassador|ambassador\s*\/\s*senior/i.test(title)) {
    return declared;
  }
  const inferred = levelFromArt(badge);
  // Trust art path when it clearly disagrees with the Explorer filter tag.
  if (inferred && inferred !== declared) return inferred;
  return declared;
}

function resolveSlug(badge, levelKey) {
  const raw = String(badge.slug || "");
  let rest = raw.includes("--") ? raw.split("--").slice(1).join("--") : raw;
  // Avoid cadette--cadette-trail-adventure
  const prefix = `${levelKey}-`;
  if (rest.startsWith(prefix)) rest = rest.slice(prefix.length);
  return `${levelKey}--${rest}`;
}

function resolveCategory(badge) {
  if (badge.type === "petal") return "Petals";
  if (badge.type === "journey") return "Journeys";
  if (badge.type === "pin") return "Pins";
  if (badge.type === "award") {
    const keys = new Set((badge.topics || []).map((t) => t.key));
    if (keys.has("highest-awards") || keys.has("highest-award-prerequisite")) {
      return "Highest Awards";
    }
    if (keys.has("leadership-awards")) return "Leadership Awards";
    return "Awards";
  }

  for (const topic of badge.topics || []) {
    const byKey = CATEGORY_BY_TOPIC_KEY[topic.key];
    if (byKey) return byKey;
    const byName = CATEGORY_BY_TOPIC_KEY[topic.name];
    if (byName) return byName;
  }
  return "Awards";
}

function descriptionFor(badge) {
  const summary = String(badge.summary || "").trim();
  if (summary) {
    return summary.length > 280
      ? `${summary.slice(0, 277).replace(/\s+\S*$/, "")}…`
      : summary;
  }
  const outcome = String(badge.outcome || "").trim();
  if (outcome) return outcome;
  return `Earn the ${cleanTitle(badge.title)}.`;
}

function requirementsFor(badge) {
  const official = Array.isArray(badge.requirements) ? badge.requirements : [];
  const texts = official
    .slice()
    .sort((a, b) => (a.step ?? 0) - (b.step ?? 0))
    .map((r) => String(r.text || "").trim())
    .filter(Boolean);
  if (texts.length) return texts;
  return ["Explore this badge and write what you learned."];
}

/** Ensure PNG lives under the corrected level folder + slug. */
function syncBadgeImage(oldSlug, newSlug, levelKey) {
  const destDir = join(badgesDir, levelKey);
  mkdirSync(destDir, { recursive: true });
  const dest = join(destDir, `${newSlug}.png`);
  if (existsSync(dest)) return "ok";

  const candidates = [];
  if (oldSlug) {
    const oldLevel = oldSlug.split("--")[0];
    candidates.push(join(badgesDir, oldLevel, `${oldSlug}.png`));
  }
  candidates.push(join(badgesDir, levelKey, `${oldSlug}.png`));

  for (const src of candidates) {
    if (src && existsSync(src) && src !== dest) {
      try {
        renameSync(src, dest);
        return "moved";
      } catch {
        copyFileSync(src, dest);
        return "copied";
      }
    }
  }
  return "missing";
}

const byLevel = {};
const corrections = [];

for (const badge of pack.badges) {
  const levelKey = resolveLevel(badge);
  const declared = badge.level?.key || "daisy";
  if (levelKey !== declared) {
    corrections.push({
      from: declared,
      to: levelKey,
      oldSlug: badge.slug,
      title: badge.title,
    });
  }
  (byLevel[levelKey] ||= []).push({ badge, levelKey, declared });
}

const badges = [];
const imageMoves = [];

for (const levelKey of LEVEL_KEYS) {
  const items = byLevel[levelKey] || [];
  items.sort((a, b) => {
    const to = (TYPE_ORDER[a.badge.type] ?? 9) - (TYPE_ORDER[b.badge.type] ?? 9);
    if (to !== 0) return to;
    const ca = resolveCategory(a.badge).localeCompare(resolveCategory(b.badge));
    if (ca !== 0) return ca;
    return cleanTitle(a.badge.title).localeCompare(cleanTitle(b.badge.title));
  });

  items.forEach(({ badge, declared }, index) => {
    const slug = resolveSlug(badge, levelKey);
    const imageStatus = syncBadgeImage(badge.slug, slug, levelKey);
    if (imageStatus !== "ok") {
      imageMoves.push({ slug, from: badge.slug, status: imageStatus });
    }

    badges.push({
      id: slug,
      level: LEVEL_NAME[levelKey],
      category: resolveCategory(badge),
      name: cleanTitle(badge.title),
      description: descriptionFor(badge),
      icon_slug: slug,
      sort_order: index + 1,
      type: badge.type,
      requirements: requirementsFor(badge),
      ...(levelKey !== declared
        ? { level_corrected_from: LEVEL_NAME[declared] || declared }
        : {}),
    });
  });
}

const seed = {
  meta: {
    provider: "gsusa",
    source: pack.meta?.explorerPage || pack.meta?.source,
    fetchedAt: pack.meta?.fetchedAt,
    total: badges.length,
    byLevel: Object.fromEntries(
      LEVEL_KEYS.map((k) => [
        k,
        badges.filter((b) => b.level === LEVEL_NAME[k]).length,
      ]),
    ),
    levelCorrections: corrections.length,
    note:
      "Uses Badge Explorer titles/steps/art. A few Cadette badges mis-tagged as Junior in the feed are corrected from their official art path.",
  },
  badges,
};

writeFileSync(outPath, JSON.stringify(seed, null, 2) + "\n");

const byLevelOut = {};
for (const b of badges) byLevelOut[b.level] = (byLevelOut[b.level] || 0) + 1;

console.log(`Wrote ${badges.length} badges → ${outPath}`);
console.log("byLevel", byLevelOut);
console.log("level corrections", corrections.length);
for (const c of corrections) {
  console.log(`  ${c.from} → ${c.to}: ${c.oldSlug} (${c.title})`);
}
if (imageMoves.length) {
  console.log("image sync", imageMoves);
}
