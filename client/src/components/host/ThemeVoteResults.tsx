/**
 * ThemeVoteResults - Read-only display of player theme votes for the host
 *
 * Shows:
 * - Current winning theme for each category (pack, genre, age rating)
 * - Vote counts for each winning option
 * - Total question count for the winning combination
 * - Number of players who have voted
 * - "Waiting for votes..." message when no votes yet
 */

import {
  ThemeVoteAggregation,
  ThemeVote,
  PartyPack,
  GenreTheme,
  AgeRating,
  PARTY_PACK_INFO,
  GENRE_THEME_INFO,
  AGE_RATING_INFO,
} from '../../types/themes';

interface ThemeVoteResultsProps {
  /** Aggregated vote counts from all players */
  themeVoteAggregation: ThemeVoteAggregation;
  /** Map of player IDs to their votes (used for voter count) */
  playerThemeVotes: Map<string, ThemeVote>;
  /** Number of questions available for current winning themes */
  questionCount: number;
}

/**
 * Finds the winning option from a vote aggregation
 * Tie-breaker: alphabetically first option wins
 */
function findWinningOption<T extends string>(
  votes: Record<string, number>,
  defaultValue: T
): { winner: T; voteCount: number } {
  const entries = Object.entries(votes);
  if (entries.length === 0) {
    return { winner: defaultValue, voteCount: 0 };
  }

  // Sort by vote count descending, then alphabetically for ties
  entries.sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1]; // Higher votes first
    }
    return a[0].localeCompare(b[0]); // Alphabetically for ties
  });

  return { winner: entries[0][0] as T, voteCount: entries[0][1] };
}

/**
 * Badge displaying a winning theme with vote count
 */
function WinningBadge({
  icon,
  name,
  voteCount,
  hasVotes,
}: {
  icon: string;
  name: string;
  voteCount: number;
  hasVotes: boolean;
}) {
  return (
    <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
      <span className="text-lg">{icon}</span>
      <span className="font-medium text-purple-800">{name}</span>
      {hasVotes && (
        <span className="text-xs bg-purple-200 text-purple-700 px-1.5 py-0.5 rounded-full">
          {voteCount} vote{voteCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}

function ThemeVoteResults({
  themeVoteAggregation,
  playerThemeVotes,
  questionCount,
}: ThemeVoteResultsProps) {
  // Calculate winning options
  const packResult = findWinningOption<PartyPack>(
    themeVoteAggregation.packs,
    'general'
  );
  const genreResult = findWinningOption<GenreTheme>(
    themeVoteAggregation.genres,
    'general'
  );
  const ageRatingResult = findWinningOption<AgeRating>(
    themeVoteAggregation.ageRatings,
    'adult'
  );

  // Get display info for winning options
  const packInfo = PARTY_PACK_INFO[packResult.winner];
  const genreInfo = GENRE_THEME_INFO[genreResult.winner];
  const ageRatingInfo = AGE_RATING_INFO[ageRatingResult.winner];

  // Count total voters
  const voterCount = playerThemeVotes.size;
  const hasVotes = voterCount > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
      {/* Header - matches PlayerThemeVote styling */}
      <div className="bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-3">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="font-bold">Question Themes</span>
          </div>
          <span
            data-testid="question-count"
            className="text-sm bg-white/20 text-white px-2 py-1 rounded-full"
          >
            {questionCount} questions
          </span>
        </div>
        <p className="text-white/80 text-xs mt-1">
          {hasVotes
            ? `Based on ${voterCount} player${voterCount !== 1 ? 's\'' : '\'s'} votes`
            : 'Waiting for player votes...'}
        </p>
      </div>

      {/* Winning themes display */}
      <div className="p-4 space-y-3">
        {/* Age Rating */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">👥</span>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
              Age Rating
            </p>
          </div>
          <WinningBadge
            icon={ageRatingInfo.icon}
            name={ageRatingInfo.name}
            voteCount={ageRatingResult.voteCount}
            hasVotes={hasVotes}
          />
        </div>

        {/* Party Pack */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">🎉</span>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
              Party Pack
            </p>
          </div>
          <WinningBadge
            icon={packInfo.icon}
            name={packInfo.name}
            voteCount={packResult.voteCount}
            hasVotes={hasVotes}
          />
        </div>

        {/* Genre */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">🎨</span>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
              Genre
            </p>
          </div>
          <WinningBadge
            icon={genreInfo.icon}
            name={genreInfo.name}
            voteCount={genreResult.voteCount}
            hasVotes={hasVotes}
          />
        </div>

        {/* Defaults notice when no votes */}
        {!hasVotes && (
          <p className="pt-2 text-xs text-gray-400 text-center border-t border-gray-100">
            Defaults shown until players vote
          </p>
        )}
      </div>
    </div>
  );
}

export default ThemeVoteResults;
