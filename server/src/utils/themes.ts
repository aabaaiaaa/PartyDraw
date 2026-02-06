/**
 * Theme System
 * Defines age ratings, party packs, and genre themes for categorizing questions.
 * Questions can have multiple tags allowing flexible filtering.
 */

/**
 * Age-appropriate content ratings
 * - kids: Family-friendly content suitable for all ages
 * - teen: Content suitable for teenagers and up
 * - adult: Sophisticated humor for adults (clean but mature themes)
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
  /** Maximum age rating to include (kids includes only kids, teen includes kids+teen, adult includes all) */
  ageRating: AgeRating;
  /** Party packs to include (questions matching ANY selected pack are included) */
  partyPacks: PartyPack[];
  /** Genre themes to include (questions matching ANY selected genre are included) */
  genres: GenreTheme[];
}

/**
 * Player's theme vote/preference in the lobby
 */
export interface ThemeVote {
  /** Player's preferred party pack */
  preferredPack: PartyPack | null;
  /** Player's preferred genre */
  preferredGenre: GenreTheme | null;
  /** Player's preferred age rating */
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
 * Default theme settings for new rooms
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
 * All age ratings as an array, ordered from most to least restrictive
 */
export const ALL_AGE_RATINGS: AgeRating[] = ['kids', 'teen', 'adult'];

/**
 * Gets the numeric level of an age rating (for comparison)
 * kids = 0, teen = 1, adult = 2
 */
export function getAgeRatingLevel(rating: AgeRating): number {
  switch (rating) {
    case 'kids':
      return 0;
    case 'teen':
      return 1;
    case 'adult':
      return 2;
    default:
      return 0;
  }
}

/**
 * Checks if a question's age rating is allowed given the room's max age rating
 * @param questionRating - The question's age rating
 * @param maxRating - The room's maximum allowed age rating
 * @returns true if the question is allowed
 */
export function isAgeRatingAllowed(questionRating: AgeRating, maxRating: AgeRating): boolean {
  return getAgeRatingLevel(questionRating) <= getAgeRatingLevel(maxRating);
}

/**
 * Validates theme settings and returns sanitized version
 * Ensures at least one pack and one genre are selected
 */
export function validateThemeSettings(settings: Partial<ThemeSettings>): ThemeSettings {
  const validated: ThemeSettings = {
    ageRating: settings.ageRating && ALL_AGE_RATINGS.includes(settings.ageRating)
      ? settings.ageRating
      : DEFAULT_THEME_SETTINGS.ageRating,
    partyPacks: settings.partyPacks?.filter(p => ALL_PARTY_PACKS.includes(p)) || [],
    genres: settings.genres?.filter(g => ALL_GENRE_THEMES.includes(g)) || [],
  };

  // Ensure at least one pack and genre are selected
  if (validated.partyPacks.length === 0) {
    validated.partyPacks = ['general'];
  }
  if (validated.genres.length === 0) {
    validated.genres = ['general'];
  }

  return validated;
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
 * Calculates the winning theme settings from player votes
 * @param aggregation - Aggregated vote counts from all players
 * @param defaults - Default values to use when no votes for a category
 * @returns ThemeSettings with winning options
 */
export function calculateWinningThemesFromVotes(
  aggregation: ThemeVoteAggregation,
  defaults: { pack: PartyPack; genre: GenreTheme; ageRating: AgeRating } = {
    pack: 'general',
    genre: 'general',
    ageRating: 'adult',
  }
): ThemeSettings {
  const winningPack = findWinningOption(aggregation.packs, defaults.pack);
  const winningGenre = findWinningOption(aggregation.genres, defaults.genre);
  const winningAgeRating = findWinningOption(aggregation.ageRatings, defaults.ageRating);

  return {
    ageRating: winningAgeRating,
    partyPacks: [winningPack],
    genres: [winningGenre],
  };
}
