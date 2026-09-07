import seed from "../../data/badges.seed.json";
import type { Badge, GirlScoutLevel } from "./types";

export { categoryColor, CATEGORY_COLORS } from "./assets";

type SeedBadge = {
  id: string;
  level: GirlScoutLevel;
  category: string;
  name: string;
  description: string;
  icon_slug: string;
  sort_order: number;
  requirements: string[];
};

const ALL_BADGES: Badge[] = (seed.badges as SeedBadge[]).map((b) => ({
  id: b.id,
  level: b.level,
  category: b.category,
  name: b.name,
  description: b.description,
  iconSlug: b.icon_slug,
  sortOrder: b.sort_order,
  requirements: b.requirements.map((text, index) => ({
    id: `${b.id}-req-${index + 1}`,
    text,
    sortOrder: index + 1,
  })),
}));

export function getBadgesForLevel(level: GirlScoutLevel): Badge[] {
  return ALL_BADGES.filter((b) => b.level === level).sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );
}

export function getBadgeById(id: string): Badge | undefined {
  return ALL_BADGES.find((b) => b.id === id);
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
  return Array.from(map.entries()).map(([category, group]) => ({
    category,
    badges: group.sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}
