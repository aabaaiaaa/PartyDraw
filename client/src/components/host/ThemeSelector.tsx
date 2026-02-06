/**
 * ThemeSelector - Component for host to select question themes
 *
 * Features:
 * - Age rating selection (radio buttons)
 * - Party pack selection (checkboxes)
 * - Genre selection (checkboxes)
 * - Question count preview
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ThemeSettings,
  AgeRating,
  PartyPack,
  GenreTheme,
  AGE_RATING_INFO,
  PARTY_PACK_INFO,
  GENRE_THEME_INFO,
  ALL_PARTY_PACKS,
  ALL_GENRE_THEMES,
  ALL_AGE_RATINGS,
} from '../../types/themes';

interface ThemeSelectorProps {
  /** Current theme settings */
  themes: ThemeSettings;
  /** Callback when themes change */
  onThemesChange: (themes: ThemeSettings) => void;
  /** Number of questions available for current settings */
  questionCount: number;
  /** Whether the selector is collapsed */
  collapsed?: boolean;
  /** Callback to toggle collapsed state */
  onToggleCollapsed?: () => void;
}

/**
 * Collapsible section header
 */
function SectionHeader({
  title,
  icon,
  isExpanded,
  onToggle,
}: {
  title: string;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="font-semibold text-gray-700">{title}</span>
      </div>
      <motion.span
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="text-gray-400"
      >
        ▼
      </motion.span>
    </button>
  );
}

/**
 * Age rating radio button
 */
function AgeRatingOption({
  rating,
  selected,
  onChange,
}: {
  rating: AgeRating;
  selected: boolean;
  onChange: (rating: AgeRating) => void;
}) {
  const info = AGE_RATING_INFO[rating];

  return (
    <label
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
        selected
          ? 'bg-purple-100 border-2 border-purple-400'
          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
      }`}
    >
      <input
        type="radio"
        name="ageRating"
        checked={selected}
        onChange={() => onChange(rating)}
        className="w-4 h-4 text-purple-600"
      />
      <span className="text-xl">{info.icon}</span>
      <div className="flex-1">
        <p className="font-medium text-gray-800">{info.name}</p>
        <p className="text-xs text-gray-500">{info.description}</p>
      </div>
    </label>
  );
}

/**
 * Theme checkbox for packs and genres
 */
function ThemeCheckbox({
  info,
  checked,
  onChange,
  disabled,
}: {
  info: { id: string; name: string; description: string; icon: string };
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : checked
          ? 'bg-purple-100 border-2 border-purple-400'
          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 text-purple-600 rounded"
      />
      <span className="text-lg">{info.icon}</span>
      <span className="font-medium text-sm text-gray-800">{info.name}</span>
    </label>
  );
}

/**
 * Question count display
 */
function QuestionCountBadge({ count }: { count: number }) {
  const isLow = count < 10;
  const isEmpty = count === 0;

  return (
    <motion.div
      key={count}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-2 px-3 py-1 rounded-full ${
        isEmpty
          ? 'bg-red-100 text-red-700'
          : isLow
          ? 'bg-yellow-100 text-yellow-700'
          : 'bg-green-100 text-green-700'
      }`}
    >
      <span className="text-sm font-medium">
        {count} question{count !== 1 ? 's' : ''}
      </span>
      {isEmpty && <span className="text-xs">(Select more themes)</span>}
    </motion.div>
  );
}

/**
 * Main ThemeSelector component
 */
function ThemeSelector({
  themes,
  onThemesChange,
  questionCount,
  collapsed = false,
  onToggleCollapsed,
}: ThemeSelectorProps) {
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

  // Handle age rating change
  const handleAgeRatingChange = useCallback(
    (rating: AgeRating) => {
      onThemesChange({
        ...themes,
        ageRating: rating,
      });
    },
    [themes, onThemesChange]
  );

  // Handle party pack toggle
  const handlePackToggle = useCallback(
    (pack: PartyPack, checked: boolean) => {
      let newPacks = [...themes.partyPacks];
      if (checked) {
        if (!newPacks.includes(pack)) {
          newPacks.push(pack);
        }
      } else {
        // Don't allow removing the last pack
        if (newPacks.length > 1) {
          newPacks = newPacks.filter((p) => p !== pack);
        }
      }
      onThemesChange({
        ...themes,
        partyPacks: newPacks,
      });
    },
    [themes, onThemesChange]
  );

  // Handle genre toggle
  const handleGenreToggle = useCallback(
    (genre: GenreTheme, checked: boolean) => {
      let newGenres = [...themes.genres];
      if (checked) {
        if (!newGenres.includes(genre)) {
          newGenres.push(genre);
        }
      } else {
        // Don't allow removing the last genre
        if (newGenres.length > 1) {
          newGenres = newGenres.filter((g) => g !== genre);
        }
      }
      onThemesChange({
        ...themes,
        genres: newGenres,
      });
    },
    [themes, onThemesChange]
  );

  // If collapsed, show a compact summary
  if (collapsed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-3"
      >
        <button
          onClick={onToggleCollapsed}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <div className="text-left">
              <span className="font-semibold text-gray-700 text-sm">Question Themes</span>
              <p className="text-xs text-gray-500">Customize what topics appear in the game</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <QuestionCountBadge count={questionCount} />
            <span className="text-purple-600 text-xs font-medium bg-purple-50 px-2 py-1 rounded">Customize</span>
          </div>
        </button>
        {/* Show selected themes as badges */}
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-xs text-gray-500 mr-1">Active:</span>
          {themes.partyPacks.slice(0, 3).map((pack) => (
            <span
              key={pack}
              className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
            >
              {PARTY_PACK_INFO[pack].icon} {PARTY_PACK_INFO[pack].name}
            </span>
          ))}
          {themes.partyPacks.length > 3 && (
            <span className="text-xs text-gray-500">+{themes.partyPacks.length - 3} more</span>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <span className="text-xl">🎯</span>
          <div>
            <h3 className="font-bold text-base">Question Themes</h3>
            <p className="text-white/80 text-xs">Choose topics for drawing prompts</p>
          </div>
        </div>
        <QuestionCountBadge count={questionCount} />
      </div>

      {/* Content area - no scroll on desktop (TV can't scroll) */}
      <div className="p-3 space-y-3 max-h-[50vh] lg:max-h-none lg:overflow-visible overflow-y-auto">
        {/* Age Rating Section */}
        <div className="border-b border-gray-100 pb-4">
          <SectionHeader
            title="Age Rating"
            icon="👥"
            isExpanded={expandedSections.age}
            onToggle={() => toggleSection('age')}
          />
          <AnimatePresence>
            {expandedSections.age && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 mt-2">
                  {ALL_AGE_RATINGS.map((rating) => (
                    <AgeRatingOption
                      key={rating}
                      rating={rating}
                      selected={themes.ageRating === rating}
                      onChange={handleAgeRatingChange}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Party Packs Section */}
        <div className="border-b border-gray-100 pb-4">
          <SectionHeader
            title="Party Packs"
            icon="🎉"
            isExpanded={expandedSections.packs}
            onToggle={() => toggleSection('packs')}
          />
          <AnimatePresence>
            {expandedSections.packs && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {ALL_PARTY_PACKS.map((pack) => (
                    <ThemeCheckbox
                      key={pack}
                      info={PARTY_PACK_INFO[pack]}
                      checked={themes.partyPacks.includes(pack)}
                      onChange={(checked) => handlePackToggle(pack, checked)}
                      disabled={
                        themes.partyPacks.length === 1 &&
                        themes.partyPacks.includes(pack)
                      }
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Genres Section */}
        <div>
          <SectionHeader
            title="Genres"
            icon="🎨"
            isExpanded={expandedSections.genres}
            onToggle={() => toggleSection('genres')}
          />
          <AnimatePresence>
            {expandedSections.genres && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {ALL_GENRE_THEMES.map((genre) => (
                    <ThemeCheckbox
                      key={genre}
                      info={GENRE_THEME_INFO[genre]}
                      checked={themes.genres.includes(genre)}
                      onChange={(checked) => handleGenreToggle(genre, checked)}
                      disabled={
                        themes.genres.length === 1 && themes.genres.includes(genre)
                      }
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse Button */}
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

export default ThemeSelector;
