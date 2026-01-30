/**
 * PlayerAvatar - Colored circle with player initial or emoji
 *
 * Features:
 * - Displays player's first initial or custom emoji
 * - Configurable background color
 * - Optional ready status indicator (green checkmark badge)
 * - Responsive sizing
 * - Framer Motion animations for hover and status changes
 */

import { motion } from 'framer-motion';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface PlayerAvatarProps {
  /** Player name (first character will be used as initial) */
  name: string;
  /** Background color for the avatar */
  color: string;
  /** Size of the avatar */
  size?: AvatarSize;
  /** Whether to show the ready status badge */
  showReadyBadge?: boolean;
  /** Whether the player is ready */
  isReady?: boolean;
  /** Optional emoji to display instead of initial */
  emoji?: string;
  /** Custom class name */
  className?: string;
  /** Whether to animate on hover */
  animated?: boolean;
}

const sizeConfig: Record<AvatarSize, { container: string; text: string; badge: string; badgeIcon: string }> = {
  xs: {
    container: 'w-6 h-6',
    text: 'text-xs',
    badge: 'w-3 h-3 -bottom-0.5 -right-0.5',
    badgeIcon: 'w-2 h-2',
  },
  sm: {
    container: 'w-8 h-8',
    text: 'text-sm',
    badge: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
    badgeIcon: 'w-2 h-2',
  },
  md: {
    container: 'w-10 h-10 sm:w-12 sm:h-12',
    text: 'text-base sm:text-lg',
    badge: 'w-4 h-4 sm:w-5 sm:h-5 -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1',
    badgeIcon: 'w-2.5 h-2.5 sm:w-3 sm:h-3',
  },
  lg: {
    container: 'w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16',
    text: 'text-lg sm:text-xl lg:text-2xl',
    badge: 'w-5 h-5 sm:w-6 sm:h-6 -bottom-1 -right-1',
    badgeIcon: 'w-3 h-3 sm:w-4 sm:h-4',
  },
  xl: {
    container: 'w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24',
    text: 'text-xl sm:text-2xl lg:text-3xl',
    badge: 'w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5',
    badgeIcon: 'w-4 h-4 sm:w-5 sm:h-5',
  },
};

function PlayerAvatar({
  name,
  color,
  size = 'md',
  showReadyBadge = false,
  isReady = false,
  emoji,
  className = '',
  animated = true,
}: PlayerAvatarProps) {
  const config = sizeConfig[size];
  const displayContent = emoji || name.charAt(0).toUpperCase();

  const avatarContent = (
    <div className="relative">
      <div
        className={`
          ${config.container}
          rounded-full
          flex items-center justify-center
          text-white font-bold ${config.text}
          shadow-md
        `}
        style={{ backgroundColor: color }}
      >
        {displayContent}
      </div>

      {/* Ready status badge */}
      {showReadyBadge && isReady && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className={`
            absolute ${config.badge}
            bg-green-500 rounded-full
            flex items-center justify-center
            border-2 border-white
          `}
        >
          <svg
            className={`${config.badgeIcon} text-white`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={className}
      >
        {avatarContent}
      </motion.div>
    );
  }

  return <div className={className}>{avatarContent}</div>;
}

export default PlayerAvatar;
