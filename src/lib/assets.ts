/** Map badge icon slugs + categories to local HQ asset paths. */

const SLUG_TO_BADGE: Record<string, string> = {
  waterfall: "forest-explorer",
  leaf: "plant-keeper",
  cloud: "forest-explorer",
  sunprint: "art-maker",
  palette: "art-maker",
  animals: "animal-friend",
  bug: "animal-friend",
  kitchen: "baking-star",
  snack: "baking-star",
  robot: "little-inventor",
  code: "little-inventor",
  trail: "outdoor-adventurer",
  camp: "outdoor-adventurer",
  elfhouse: "outdoor-adventurer",
  shelter: "outdoor-adventurer",
  firstaid: "helper-hero",
  calm: "helper-hero",
  bridge: "little-inventor",
  circuit: "little-inventor",
};

const CATEGORY_TO_FILE: Record<string, string> = {
  Nature: "nature",
  Animals: "animals",
  Cooking: "cooking",
  "First Aid": "first-aid",
  STEM: "stem",
  Art: "art",
  Outdoors: "outdoors",
};

const ASSET_V = "20";

export function badgeImageSrc(iconSlug: string): string {
  const file = SLUG_TO_BADGE[iconSlug] ?? "forest-explorer";
  return `/assets/badges/${file}.png?v=${ASSET_V}`;
}

export function categoryImageSrc(category: string): string | null {
  const file = CATEGORY_TO_FILE[category];
  return file ? `/assets/categories/${file}.png?v=${ASSET_V}` : null;
}

export type DecorationName =
  | "empty-adventure"
  | "encouragement"
  | "tip-bird"
  | "celebration"
  | "notebook-paper"
  | "journey-card";

export function decorationSrc(name: DecorationName): string {
  return `/assets/decorations/${name}.png?v=${ASSET_V}`;
}

export type UiAssetName =
  | "nav-home"
  | "nav-notebook"
  | "nav-journal"
  | "nav-gallery"
  | "speak";

export function uiAssetSrc(name: UiAssetName): string {
  return `/assets/ui/${name}.png?v=${ASSET_V}`;
}

/** Featured badge art for non-home screens (how-it-works, empty accents). */
export const FEATURE_BADGES = {
  explorer: "/assets/badges/forest-explorer.png?v=" + ASSET_V,
  notebook: "/assets/badges/art-maker.png?v=" + ASSET_V,
  sparkle: "/assets/badges/helper-hero.png?v=" + ASSET_V,
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Nature: "#4F9B55",
  Animals: "#E89A3B",
  Cooking: "#D95C4B",
  "First Aid": "#D95757",
  STEM: "#4E86C5",
  Art: "#B56CC6",
  Outdoors: "#38A6A0",
};

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "#4E86C5";
}

export const CATEGORY_EMOJI: Record<string, string> = {
  Nature: "🌿",
  Animals: "🐾",
  Cooking: "🍳",
  "First Aid": "🩹",
  STEM: "🔬",
  Art: "🎨",
  Outdoors: "🏕️",
};
