import seed from "../../data/badges.seed.json";
import { CATEGORY_ORDER } from "./assets";
import type { Badge, GirlScoutLevel } from "./types";

export { categoryColor, CATEGORY_COLORS, CATEGORY_ORDER } from "./assets";

type SeedRequirement =
  | string
  | {
      text: string;
      detail?: string;
    };

type SeedBadge = {
  id: string;
  level: GirlScoutLevel;
  category: string;
  name: string;
  description: string;
  icon_slug: string;
  /** Official Explorer slug; preferred for badge art when present. */
  slug?: string;
  sort_order: number;
  requirements: SeedRequirement[];
};

function resolveIconSlug(b: SeedBadge): string {
  if (b.slug && b.slug.includes("--")) return b.slug;
  if (b.icon_slug.includes("--")) return b.icon_slug;
  return b.icon_slug;
}

function normalizeRequirement(
  req: SeedRequirement,
  index: number,
  badgeId: string,
  badgeName: string,
) {
  const text = typeof req === "string" ? req : req.text;
  const detail =
    typeof req === "string"
      ? `For the ${badgeName} badge — complete this step in real life: “${text}”. Write exactly what you did, where you were, and what you noticed.`
      : req.detail?.trim() ||
        `For the ${badgeName} badge — complete this step in real life: “${text}”. Write exactly what you did, where you were, and what you noticed.`;
  return {
    id: `${badgeId}-req-${index + 1}`,
    text,
    detail,
    sortOrder: index + 1,
  };
}

const ALL_BADGES: Badge[] = (seed.badges as SeedBadge[]).map((b) => {
  const id = b.slug && b.slug.includes("--") ? b.slug : b.id;
  return {
    id,
    level: b.level,
    category: b.category,
    name: b.name,
    description: b.description,
    iconSlug: resolveIconSlug(b),
    sortOrder: b.sort_order,
    requirements: b.requirements.map((req, index) =>
      normalizeRequirement(req, index, id, b.name),
    ),
  };
});

export function getBadgesForLevel(level: GirlScoutLevel): Badge[] {
  return ALL_BADGES.filter((b) => b.level === level).sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );
}

export function getBadgeById(id: string): Badge | undefined {
  return ALL_BADGES.find((b) => b.id === id);
}

/** Prefer Eco Camper for mint demos (Junior outdoor badge judges recognize). */
export const DEMO_MINT_BADGE_ID = "junior--eco-camper";

export function getDemoMintBadge(): Badge {
  const eco = getBadgeById(DEMO_MINT_BADGE_ID);
  if (eco) return eco;
  return ALL_BADGES[0];
}

export function getAllBadges(): Badge[] {
  return ALL_BADGES;
}

export function groupBadgesByCategory(badges: Badge[]): {
  category: string;
  badges: Badge[];
}[] {
  const map = new Map<string, Badge[]>();
  for (const badge of badges) {
    const list = map.get(badge.category) ?? [];
    list.push(badge);
    map.set(badge.category, list);
  }
  return Array.from(map.entries())
    .map(([category, group]) => ({
      category,
      badges: group.sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a.category);
      const bi = CATEGORY_ORDER.indexOf(b.category);
      const ao = ai === -1 ? 999 : ai;
      const bo = bi === -1 ? 999 : bi;
      return ao - bo || a.category.localeCompare(b.category);
    });
}
