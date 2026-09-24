export type GirlScoutLevel =
  | "Daisy"
  | "Brownie"
  | "Junior"
  | "Cadette"
  | "Senior"
  | "Ambassador";

export type OnboardingDraft = {
  language: string;
  childName: string;
  grade: number | null;
  level: GirlScoutLevel | null;
  parentName: string;
  parentEmail: string;
  botCheckPassed: boolean;
};

export type Profile = {
  language: string;
  childName: string;
  grade: number;
  level: GirlScoutLevel;
  parentName: string;
  parentEmail: string;
  createdAt: string;
  seenHowItWorks: boolean;
};

export const EMPTY_ONBOARDING: OnboardingDraft = {
  language: "en",
  childName: "",
  grade: null,
  level: null,
  parentName: "",
  parentEmail: "",
  botCheckPassed: false,
};

export type BadgeRequirement = {
  id: string;
  /** Short step title shown in the list */
  text: string;
  /** Clear how-to shown when the step is opened */
  detail: string;
  sortOrder: number;
};

export type Badge = {
  id: string;
  level: GirlScoutLevel;
  category: string;
  name: string;
  description: string;
  iconSlug: string;
  sortOrder: number;
  requirements: BadgeRequirement[];
};

export type RequirementProgress = {
  note: string;
  photoName?: string;
  /** Compressed JPEG/PNG data URL kept in local progress (optional). */
  photoDataUrl?: string;
  completedAt: string;
};

export type BadgeProgressMap = Record<string, RequirementProgress>;

export type EarnedBadgeRecord = {
  badgeId: string;
  earnedAt: string;
  mintStatus: "pending" | "minted" | "failed";
  /** On-chain mint transaction signature. */
  mintAddress?: string;
  /** Solana wallet (Swig or paste) that received the cNFT. */
  mintOwner?: string;
};

export type ProgressState = {
  /** requirementId -> progress */
  requirements: BadgeProgressMap;
  earned: Record<string, EarnedBadgeRecord>;
};

export const EMPTY_PROGRESS: ProgressState = {
  requirements: {},
  earned: {},
};

export type NotebookPage = {
  id: string;
  body: string;
};

export type NotebookEntry = {
  id: string;
  entryDate: string; // YYYY-MM-DD
  title: string;
  pages: NotebookPage[];
  updatedAt: string;
};
