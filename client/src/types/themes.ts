/**
 * Theme Types for PartyDraw Client
 * Mirrors the server-side theme definitions for type safety
 */

/**
 * Age-appropriate content ratings
 */
export type AgeRating = 'kids' | 'teen' | 'adult';

/**
 * Party pack themes for specific occasions
 */
export type PartyPack =
  | 'general'
  | 'kids_birthday'
  | 'office_party'
  | 'halloween'
  | 'christmas'
  | 'summer_bbq';

/**
 * Genre themes for content categories
 */
export type GenreTheme =
  | 'general'
  | 'pop_culture'
  | 'food_cooking'
  | 'sports'
  | 'fantasy'
  | 'scifi'
  | 'nature';

/**
 * Theme settings for a room
 */
export interface ThemeSettings {
  ageRating: AgeRating;
  partyPacks: PartyPack[];
  genres: GenreTheme[];
}

/**
 * Player's theme vote/preference in the lobby
 */
export interface ThemeVote {
  preferredPack: PartyPack | null;
  preferredGenre: GenreTheme | null;
  preferredAgeRating: AgeRating | null;
}

/**
 * Display metadata for themes in the UI
 */
export interface ThemeDisplayInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

/**
 * Aggregated theme votes from all players
 */
export interface ThemeVoteAggregation {
  packs: Record<string, number>;
  genres: Record<string, number>;
  ageRatings: Record<string, number>;
}

/**
 * Default theme settings
 */
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  ageRating: 'adult',
  partyPacks: ['general'],
  genres: ['general'],
};

/**
 * Age rating display metadata
 */
export const AGE_RATING_INFO: Record<AgeRating, ThemeDisplayInfo> = {
  kids: {
    id: 'kids',
    name: 'Kids',
    description: 'Family-friendly content for all ages',
    icon: '👶',
  },
  teen: {
    id: 'teen',
    name: 'Teen',
    description: 'Content suitable for teenagers and up',
    icon: '🧑',
  },
  adult: {
    id: 'adult',
    name: 'Adult',
    description: 'Sophisticated humor for grown-ups',
    icon: '🧔',
  },
};

/**
 * Party pack display metadata
 */
export const PARTY_PACK_INFO: Record<PartyPack, ThemeDisplayInfo> = {
  general: {
    id: 'general',
    name: 'General',
    description: 'Classic prompts for any occasion',
    icon: '🎉',
  },
  kids_birthday: {
    id: 'kids_birthday',
    name: 'Kids Birthday',
    description: 'Party scenarios, cake, and celebration fun',
    icon: '🎂',
  },
  office_party: {
    id: 'office_party',
    name: 'Office Party',
    description: 'Workplace humor and corporate chaos',
    icon: '💼',
  },
  halloween: {
    id: 'halloween',
    name: 'Halloween',
    description: 'Spooky but fun monsters and costumes',
    icon: '🎃',
  },
  christmas: {
    id: 'christmas',
    name: 'Christmas',
    description: 'Holiday cheer, Santa, and winter fun',
    icon: '🎄',
  },
  summer_bbq: {
    id: 'summer_bbq',
    name: 'Summer BBQ',
    description: 'Outdoor grilling and pool party vibes',
    icon: '☀️',
  },
};

/**
 * Genre theme display metadata
 */
export const GENRE_THEME_INFO: Record<GenreTheme, ThemeDisplayInfo> = {
  general: {
    id: 'general',
    name: 'General',
    description: 'Mixed content from all categories',
    icon: '🎨',
  },
  pop_culture: {
    id: 'pop_culture',
    name: 'Pop Culture',
    description: 'Movies, memes, and modern trends',
    icon: '🎬',
  },
  food_cooking: {
    id: 'food_cooking',
    name: 'Food & Cooking',
    description: 'Kitchen adventures and culinary chaos',
    icon: '🍳',
  },
  sports: {
    id: 'sports',
    name: 'Sports',
    description: 'Athletics, games, and competitions',
    icon: '⚽',
  },
  fantasy: {
    id: 'fantasy',
    name: 'Fantasy',
    description: 'Dragons, wizards, and magical quests',
    icon: '🐉',
  },
  scifi: {
    id: 'scifi',
    name: 'Sci-Fi',
    description: 'Space travel, robots, and the future',
    icon: '🚀',
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    description: 'Animals, plants, and the great outdoors',
    icon: '🌿',
  },
};

/**
 * All party packs as an array (useful for iteration)
 */
export const ALL_PARTY_PACKS: PartyPack[] = [
  'general',
  'kids_birthday',
  'office_party',
  'halloween',
  'christmas',
  'summer_bbq',
];

/**
 * All genre themes as an array (useful for iteration)
 */
export const ALL_GENRE_THEMES: GenreTheme[] = [
  'general',
  'pop_culture',
  'food_cooking',
  'sports',
  'fantasy',
  'scifi',
  'nature',
];

/**
 * All age ratings as an array
 */
export const ALL_AGE_RATINGS: AgeRating[] = ['kids', 'teen', 'adult'];

/**
 * Finds the winner from a vote aggregation record
 * Tie-breaker: alphabetically first option wins
 * @param votes - Record of option to vote count
 * @param defaultValue - Value to return if no votes
 * @returns The winning option
 */
function findWinningOption<T extends string>(votes: Record<string, number>, defaultValue: T): T {
  const entries = Object.entries(votes);
  if (entries.length === 0) {
    return defaultValue;
  }

  // Sort by vote count descending, then alphabetically for ties
  entries.sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1]; // Higher votes first
    }
    return a[0].localeCompare(b[0]); // Alphabetically for ties
  });

  return entries[0][0] as T;
}

/**
 * Calculates the winning theme settings from player votes (client-side)
 * @param aggregation - Aggregated vote counts from all players
 * @returns ThemeSettings with winning options
 */
export function calculateWinningThemesFromVotes(
  aggregation: ThemeVoteAggregation
): ThemeSettings {
  const winningPack = findWinningOption<PartyPack>(aggregation.packs, 'general');
  const winningGenre = findWinningOption<GenreTheme>(aggregation.genres, 'general');
  const winningAgeRating = findWinningOption<AgeRating>(aggregation.ageRatings, 'adult');

  return {
    ageRating: winningAgeRating,
    partyPacks: [winningPack],
    genres: [winningGenre],
  };
}
