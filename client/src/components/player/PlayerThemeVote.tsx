/**
 * PlayerThemeVote - Component for players to vote on their preferred themes
 *
 * Shows a simple picker for pack and genre preferences in the lobby.
 * Players can suggest one pack and one genre preference to help the host.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ThemeVote,
  PartyPack,
  GenreTheme,
  AgeRating,
  PARTY_PACK_INFO,
  GENRE_THEME_INFO,
  AGE_RATING_INFO,
  ALL_PARTY_PACKS,
  ALL_GENRE_THEMES,
  ALL_AGE_RATINGS,
  ThemeVoteAggregation,
} from '../../types/themes';

interface PlayerThemeVoteProps {
  /** Current player's theme vote */
  currentVote: ThemeVote | null;
  /** Callback when player votes */
  onVote: (vote: ThemeVote) => void;
  /** Aggregated votes from all players */
  aggregation?: ThemeVoteAggregation;
  /** Whether voting is collapsed */
  collapsed?: boolean;
  /** Toggle collapsed state */
  onToggleCollapsed?: () => void;
}

/**
 * Theme option button
 */
function ThemeOption({
  info,
  selected,
  voteCount,
  onClick,
}: {
  info: { id: string; name: string; icon: string };
  selected: boolean;
  voteCount?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        selected
          ? 'bg-purple-100 border-2 border-purple-500 shadow-md'
          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
      }`}
    >
      <span className="text-lg">{info.icon}</span>
      <span className="font-medium text-sm text-gray-800 flex-1 text-left">
        {info.name}
      </span>
      {voteCount !== undefined && voteCount > 0 && (
        <span className="text-xs bg-purple-200 text-purple-700 px-1.5 py-0.5 rounded-full">
          {voteCount}
        </span>
      )}
    </button>
  );
}

/**
 * Section header with toggle
 */
function VoteSection({
  title,
  icon,
  children,
  isExpanded,
  onToggle,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-semibold text-gray-700 text-sm">{title}</span>
        </div>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400 text-sm"
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Main PlayerThemeVote component
 */
function PlayerThemeVote({
  currentVote,
  onVote,
  aggregation,
  collapsed = false,
  onToggleCollapsed,
}: PlayerThemeVoteProps) {
  const [expandedSections, setExpandedSections] = useState({
    age: true,
    packs: true,
    genres: true,
  });

  const toggleSection = (section: 'age' | 'packs' | 'genres') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAgeSelect = useCallback(
    (age: AgeRating) => {
      const newAge = currentVote?.preferredAgeRating === age ? null : age;
      onVote({
        preferredPack: currentVote?.preferredPack || null,
        preferredGenre: currentVote?.preferredGenre || null,
        preferredAgeRating: newAge,
      });
    },
    [currentVote, onVote]
  );

  const handlePackSelect = useCallback(
    (pack: PartyPack) => {
      const newPack = currentVote?.preferredPack === pack ? null : pack;
      onVote({
        preferredPack: newPack,
        preferredGenre: currentVote?.preferredGenre || null,
        preferredAgeRating: currentVote?.preferredAgeRating || null,
      });
    },
    [currentVote, onVote]
  );

  const handleGenreSelect = useCallback(
    (genre: GenreTheme) => {
      const newGenre = currentVote?.preferredGenre === genre ? null : genre;
      onVote({
        preferredPack: currentVote?.preferredPack || null,
        preferredGenre: newGenre,
        preferredAgeRating: currentVote?.preferredAgeRating || null,
      });
    },
    [currentVote, onVote]
  );

  // Collapsed view
  if (collapsed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-50 rounded-lg p-3"
      >
        <button
          onClick={onToggleCollapsed}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span className="text-sm font-medium text-gray-700">Theme Preferences</span>
          </div>
          <span className="text-purple-600 text-sm">Edit</span>
        </button>
        {(currentVote?.preferredPack || currentVote?.preferredGenre || currentVote?.preferredAgeRating) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {currentVote.preferredAgeRating && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {AGE_RATING_INFO[currentVote.preferredAgeRating].icon}{' '}
                {AGE_RATING_INFO[currentVote.preferredAgeRating].name}
              </span>
            )}
            {currentVote.preferredPack && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                {PARTY_PACK_INFO[currentVote.preferredPack].icon}{' '}
                {PARTY_PACK_INFO[currentVote.preferredPack].name}
              </span>
            )}
            {currentVote.preferredGenre && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {GENRE_THEME_INFO[currentVote.preferredGenre].icon}{' '}
                {GENRE_THEME_INFO[currentVote.preferredGenre].name}
              </span>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-3">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="font-bold">Vote for Themes</span>
          </div>
        </div>
        <p className="text-white/80 text-xs mt-1">
          Help the host choose by voting for your favorites!
        </p>
      </div>

      <div className="p-3 space-y-2">
        {/* Age Rating */}
        <VoteSection
          title="Age Rating"
          icon="👥"
          isExpanded={expandedSections.age}
          onToggle={() => toggleSection('age')}
        >
          <div className="grid grid-cols-3 gap-2 mt-2">
            {ALL_AGE_RATINGS.map((age) => (
              <ThemeOption
                key={age}
                info={AGE_RATING_INFO[age]}
                selected={currentVote?.preferredAgeRating === age}
                voteCount={aggregation?.ageRatings[age]}
                onClick={() => handleAgeSelect(age)}
              />
            ))}
          </div>
        </VoteSection>

        {/* Party Packs */}
        <VoteSection
          title="Party Pack"
          icon="🎉"
          isExpanded={expandedSections.packs}
          onToggle={() => toggleSection('packs')}
        >
          <div className="grid grid-cols-2 gap-2 mt-2">
            {ALL_PARTY_PACKS.map((pack) => (
              <ThemeOption
                key={pack}
                info={PARTY_PACK_INFO[pack]}
                selected={currentVote?.preferredPack === pack}
                voteCount={aggregation?.packs[pack]}
                onClick={() => handlePackSelect(pack)}
              />
            ))}
          </div>
        </VoteSection>

        {/* Genres */}
        <VoteSection
          title="Genre"
          icon="🎨"
          isExpanded={expandedSections.genres}
          onToggle={() => toggleSection('genres')}
        >
          <div className="grid grid-cols-2 gap-2 mt-2">
            {ALL_GENRE_THEMES.map((genre) => (
              <ThemeOption
                key={genre}
                info={GENRE_THEME_INFO[genre]}
                selected={currentVote?.preferredGenre === genre}
                voteCount={aggregation?.genres[genre]}
                onClick={() => handleGenreSelect(genre)}
              />
            ))}
          </div>
        </VoteSection>
      </div>

      {/* Collapse button */}
      {onToggleCollapsed && (
        <button
          onClick={onToggleCollapsed}
          className="w-full py-2 text-center text-sm text-purple-600 hover:bg-purple-50 transition-colors border-t border-gray-100"
        >
          Collapse
        </button>
      )}
    </motion.div>
  );
}

export default PlayerThemeVote;
