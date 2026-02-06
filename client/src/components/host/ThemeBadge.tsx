/**
 * ThemeBadge - Displays active theme icons during gameplay
 *
 * Shows small badges with icons for the currently selected themes.
 * Used on the question display to indicate what theme pack/genre the question belongs to.
 */

import { PartyPack, GenreTheme, PARTY_PACK_INFO, GENRE_THEME_INFO } from '../../types/themes';

interface ThemeBadgeProps {
  /** Party packs to display (usually the active ones for the room) */
  packs?: PartyPack[];
  /** Genre themes to display (usually the active ones for the room) */
  genres?: GenreTheme[];
  /** Size of the badges */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show labels alongside icons */
  showLabels?: boolean;
}

function ThemeBadge({
  packs = [],
  genres = [],
  size = 'md',
  showLabels = false,
}: ThemeBadgeProps) {
  // Filter out 'general' as it's the default and not very interesting to show
  const displayPacks = packs.filter(p => p !== 'general');
  const displayGenres = genres.filter(g => g !== 'general');

  // If nothing special to show, return null
  if (displayPacks.length === 0 && displayGenres.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-0.5',
    md: 'text-sm px-2 py-1 gap-1',
    lg: 'text-base px-3 py-1.5 gap-1.5',
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {/* Party Pack badges */}
      {displayPacks.map((pack) => {
        const info = PARTY_PACK_INFO[pack];
        return (
          <span
            key={pack}
            className={`
              inline-flex items-center rounded-full bg-purple-100 text-purple-700
              font-medium shadow-sm
              ${sizeClasses[size]}
            `}
            title={info.description}
          >
            <span className={iconSizes[size]}>{info.icon}</span>
            {showLabels && <span className="ml-1">{info.name}</span>}
          </span>
        );
      })}

      {/* Genre badges */}
      {displayGenres.map((genre) => {
        const info = GENRE_THEME_INFO[genre];
        return (
          <span
            key={genre}
            className={`
              inline-flex items-center rounded-full bg-teal-100 text-teal-700
              font-medium shadow-sm
              ${sizeClasses[size]}
            `}
            title={info.description}
          >
            <span className={iconSizes[size]}>{info.icon}</span>
            {showLabels && <span className="ml-1">{info.name}</span>}
          </span>
        );
      })}
    </div>
  );
}

export default ThemeBadge;
