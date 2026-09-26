// Points calculation engine for WhoDroveBetter.
// Every drive earns 10 base points, with tier & activity bonuses stacked on top.

export const TIER_BONUS: Record<string, number> = {
  common: 0,
  enthusiast: 5,
  premium: 10,
  exotic: 20,
  unicorn: 50,
};

export const TIER_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  common:     { label: "Common",     emoji: "🟢", color: "tier-common" },
  enthusiast: { label: "Enthusiast", emoji: "🔵", color: "tier-enthusiast" },
  premium:    { label: "Premium",    emoji: "🟣", color: "tier-premium" },
  exotic:     { label: "Exotic",     emoji: "🟠", color: "tier-exotic" },
  unicorn:    { label: "Unicorn",    emoji: "🔴", color: "tier-unicorn" },
};

const BASE_POINTS = 10;
const PHOTO_BONUS = 3;
const REVIEW_BONUS = 2;
const MANUAL_BONUS = 5;
const FIRST_BONUS = 5;
const EXPLORER_BONUS = 5;
const STREAK_BONUS_PER_DAY = 3;

export interface PointsBreakdown {
  base: number;
  tierBonus: number;
  photoBonus: number;
  reviewBonus: number;
  manualBonus: number;
  firstBonus: number;
  explorerBonus: number;
  streakBonus: number;
  total: number;
}

interface CalculatePointsInput {
  carTier: string;
  hasPhoto: boolean;
  hasReview: boolean;     // rating or comment
  isManual: boolean;
  isFirstInGroup: boolean;
  isNewBrand: boolean;    // user has never driven this brand before
  streakDays: number;     // consecutive days with a logged drive (0 = no streak yet)
}

/** Calculate the total points for a single drive log. */
export function calculatePoints(input: CalculatePointsInput): PointsBreakdown {
  const tierBonus = TIER_BONUS[input.carTier] ?? 0;
  const photoBonus = input.hasPhoto ? PHOTO_BONUS : 0;
  const reviewBonus = input.hasReview ? REVIEW_BONUS : 0;
  const manualBonus = input.isManual ? MANUAL_BONUS : 0;
  const firstBonus = input.isFirstInGroup ? FIRST_BONUS : 0;
  const explorerBonus = input.isNewBrand ? EXPLORER_BONUS : 0;

  // Streak kicks in at 3+ consecutive days, bonus scales from there
  const streakBonus = input.streakDays >= 3 ? STREAK_BONUS_PER_DAY * (input.streakDays - 2) : 0;

  const total =
    BASE_POINTS +
    tierBonus +
    photoBonus +
    reviewBonus +
    manualBonus +
    firstBonus +
    explorerBonus +
    streakBonus;

  return {
    base: BASE_POINTS,
    tierBonus,
    photoBonus,
    reviewBonus,
    manualBonus,
    firstBonus,
    explorerBonus,
    streakBonus,
    total,
  };
}

// ──────────────── Badges ────────────────

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  check: (stats: UserStats) => boolean;
}

export interface UserStats {
  totalDrives: number;
  totalPoints: number;
  totalHorsepower: number;
  uniqueBrands: string[];
  countryBreakdown: Record<string, number>;
  tierBreakdown: Record<string, number>;
  manualCount: number;
  photoCount: number;
  longestStreak: number;
  topRating: number;
}

export const BADGES: Badge[] = [
  {
    id: "first_drive",
    name: "Ignition",
    emoji: "🔑",
    description: "Logged your first drive",
    check: (s) => s.totalDrives >= 1,
  },
  {
    id: "ten_drives",
    name: "Road Regular",
    emoji: "🛣️",
    description: "Logged 10 drives",
    check: (s) => s.totalDrives >= 10,
  },
  {
    id: "fifty_drives",
    name: "Road Warrior",
    emoji: "⚔️",
    description: "Logged 50 drives",
    check: (s) => s.totalDrives >= 50,
  },
  {
    id: "hundred_drives",
    name: "Century Club",
    emoji: "💯",
    description: "Logged 100 drives",
    check: (s) => s.totalDrives >= 100,
  },
  {
    id: "jdm_legend",
    name: "JDM Legend",
    emoji: "🔰",
    description: "Driven 5+ Japanese cars",
    check: (s) => (s.countryBreakdown["Japan"] ?? 0) >= 5,
  },
  {
    id: "autobahn_cruiser",
    name: "Autobahn Cruiser",
    emoji: "🇩🇪",
    description: "Driven 5+ German cars",
    check: (s) => (s.countryBreakdown["Germany"] ?? 0) >= 5,
  },
  {
    id: "american_muscle",
    name: "American Muscle",
    emoji: "🦅",
    description: "Driven 5+ American cars",
    check: (s) => (s.countryBreakdown["USA"] ?? 0) >= 5,
  },
  {
    id: "italian_stallion",
    name: "Italian Stallion",
    emoji: "🇮🇹",
    description: "Driven 3+ Italian cars",
    check: (s) => (s.countryBreakdown["Italy"] ?? 0) >= 3,
  },
  {
    id: "save_the_manuals",
    name: "Save the Manuals",
    emoji: "🕹️",
    description: "Driven 10+ manual cars",
    check: (s) => s.manualCount >= 10,
  },
  {
    id: "photographer",
    name: "Paparazzi",
    emoji: "📸",
    description: "Uploaded 10+ photos",
    check: (s) => s.photoCount >= 10,
  },
  {
    id: "brand_explorer",
    name: "Brand Explorer",
    emoji: "🌍",
    description: "Driven 10+ different brands",
    check: (s) => s.uniqueBrands.length >= 10,
  },
  {
    id: "hp_collector",
    name: "Horsepower Hoarder",
    emoji: "🐴",
    description: "Accumulated 5,000+ total HP",
    check: (s) => s.totalHorsepower >= 5000,
  },
  {
    id: "hp_monster",
    name: "HP Monster",
    emoji: "👹",
    description: "Accumulated 25,000+ total HP",
    check: (s) => s.totalHorsepower >= 25000,
  },
  {
    id: "exotic_taster",
    name: "Exotic Taster",
    emoji: "🍾",
    description: "Driven 3+ exotic-tier cars",
    check: (s) => (s.tierBreakdown["exotic"] ?? 0) >= 3,
  },
  {
    id: "unicorn_hunter",
    name: "Unicorn Hunter",
    emoji: "🦄",
    description: "Driven a unicorn-tier car",
    check: (s) => (s.tierBreakdown["unicorn"] ?? 0) >= 1,
  },
  {
    id: "streak_champion",
    name: "Streak Champion",
    emoji: "🔥",
    description: "Maintained a 7-day logging streak",
    check: (s) => s.longestStreak >= 7,
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    emoji: "⭐",
    description: "Gave a car a perfect 10/10 rating",
    check: (s) => s.topRating >= 10,
  },
];

/** Return all badges the user has earned. */
export function getEarnedBadges(stats: UserStats): Badge[] {
  return BADGES.filter((b) => b.check(stats));
}
