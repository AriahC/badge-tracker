/** Map badge icon slugs + categories to local asset paths. */

const ASSET_V = "28";

/**
 * Official GS badge art from the user pack:
 * /assets/badges/<level>/<slug>.png  (slug like daisy--outdoor-art-maker)
 */
export function badgeImageSrc(iconSlug: string): string {
  if (iconSlug.includes("--")) {
    const level = iconSlug.split("--")[0] || "daisy";
    return `/assets/badges/${level}/${iconSlug}.png?v=${ASSET_V}`;
  }
  return `/assets/badges/${iconSlug}.png?v=${ASSET_V}`;
}

const CATEGORY_TO_FILE: Record<string, string> = {
  "Animals and Nature": "nature",
  "Art and Imagination": "art",
  "Outdoor Adventure": "outdoors",
  "Technology and Innovation": "stem",
  "Sports and Recreation": "outdoors",
  "Your World Near and Far": "animals",
  "Balanced Living": "first-aid",
  "Leadership and Your Future": "stem",
  Journeys: "nature",
  Petals: "art",
  Awards: "outdoors",
  "Highest Awards": "outdoors",
  "Highest Award Prerequisite": "outdoors",
  "Leadership Awards": "stem",
  Pins: "cooking",
};

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
  | "speak"
  | "ladybug";

export function uiAssetSrc(name: UiAssetName): string {
  return `/assets/ui/${name}.png?v=${ASSET_V}`;
}

/** Featured badge art for non-home screens. */
export const FEATURE_BADGES = {
  explorer: "/assets/badges/daisy/daisy--outdoor-art-maker.png?v=" + ASSET_V,
  notebook: "/assets/badges/daisy/daisy--create-and-innovate.png?v=" + ASSET_V,
  sparkle: "/assets/badges/daisy/daisy--friendly-and-helpful.png?v=" + ASSET_V,
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Petals: "#1496D4",
  Journeys: "#5C1F8B",
  Awards: "#F7BE00",
  "Highest Awards": "#FF830C",
  "Highest Award Prerequisite": "#A67C52",
  "Leadership Awards": "#EE3124",
  Pins: "#E89A3B",
  "Animals and Nature": "#4F9B55",
  "Art and Imagination": "#B56CC6",
  "Balanced Living": "#D95757",
  "Leadership and Your Future": "#4E86C5",
  "Outdoor Adventure": "#38A6A0",
  "Sports and Recreation": "#2F8F6B",
  "Technology and Innovation": "#3D7CC9",
  "Your World Near and Far": "#C46B3A",
};

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "#4E86C5";
}

export const CATEGORY_EMOJI: Record<string, string> = {
  Petals: "🌼",
  Journeys: "📖",
  Awards: "🏆",
  "Highest Awards": "⭐",
  "Highest Award Prerequisite": "🔖",
  "Leadership Awards": "🎖️",
  Pins: "📌",
  "Animals and Nature": "🌿",
  "Art and Imagination": "🎨",
  "Balanced Living": "💚",
  "Leadership and Your Future": "🚀",
  "Outdoor Adventure": "🏕️",
  "Sports and Recreation": "⚽",
  "Technology and Innovation": "🔬",
  "Your World Near and Far": "🌍",
};

/** Display order for home category clumps. */
export const CATEGORY_ORDER: string[] = [
  "Petals",
  "Animals and Nature",
  "Art and Imagination",
  "Balanced Living",
  "Outdoor Adventure",
  "Sports and Recreation",
  "Technology and Innovation",
  "Your World Near and Far",
  "Leadership and Your Future",
  "Journeys",
  "Leadership Awards",
  "Highest Award Prerequisite",
  "Highest Awards",
  "Awards",
  "Pins",
];
