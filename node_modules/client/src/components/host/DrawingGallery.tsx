/**
 * DrawingGallery - Displays all submitted drawings in a responsive grid during voting phase
 *
 * Shows on the host screen during the voting phase:
 * - All drawings in a responsive grid layout
 * - Player names under each drawing
 * - Voting timer with color changes as time runs low
 * - Vote progress indicator
 */

import { motion } from 'framer-motion';
import { Player, Drawing } from '../../hooks/useGameState';

interface DrawingGalleryProps {
  /** Array of drawings with player IDs and image data */
  drawings: Drawing[];
  /** Seconds remaining in the voting phase */
  timerSeconds: number | null;
  /** All players in the game */
  players: Player[];
  /** Number of players who have voted */
  votedCount: number;
  /** Total number of players who can vote */
  totalVoters: number;
}

/**
 * Returns timer color classes based on time remaining
 */
function getTimerColorClasses(seconds: number | null): {
  text: string;
  ring: string;
  bg: string;
} {
  if (seconds === null) {
    return {
      text: 'text-gray-400',
      ring: 'ring-gray-300',
      bg: 'bg-gray-50',
    };
  }

  if (seconds <= 5) {
    // Critical - red, pulsing
    return {
      text: 'text-red-500',
      ring: 'ring-red-400',
      bg: 'bg-red-50',
    };
  }

  if (seconds <= 10) {
    // Warning - orange
    return {
      text: 'text-orange-500',
      ring: 'ring-orange-400',
      bg: 'bg-orange-50',
    };
  }

  // Normal - teal/green
  return {
    text: 'text-teal-500',
    ring: 'ring-teal-400',
    bg: 'bg-teal-50',
  };
}

/**
 * Get responsive grid columns based on number of drawings
 */
function getGridClasses(drawingCount: number): string {
  if (drawingCount <= 2) {
    return 'grid-cols-1 sm:grid-cols-2';
  }
  if (drawingCount <= 4) {
    return 'grid-cols-2 md:grid-cols-2 lg:grid-cols-4';
  }
  if (drawingCount <= 6) {
    return 'grid-cols-2 md:grid-cols-3';
  }
  // 7-8 drawings
  return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
}

/**
 * Get player's color for styling their card
 */
function getPlayerColor(player: Player | undefined): string {
  if (!player?.color) return '#8B5CF6'; // default purple
  return player.color;
}

function DrawingGallery({
  drawings,
  timerSeconds,
  players,
  votedCount,
  totalVoters,
}: DrawingGalleryProps) {
  const timerColors = getTimerColorClasses(timerSeconds);
  const isLowTime = timerSeconds !== null && timerSeconds <= 5;
  const allVoted = votedCount === totalVoters && totalVoters > 0;
  const gridClasses = getGridClasses(drawings.length);

  /**
   * Get player name by ID
   */
  const getPlayerName = (playerId: string): string => {
    const player = players.find((p) => p.id === playerId);
    return player?.name || 'Unknown Player';
  };

  /**
   * Get player by ID
   */
  const getPlayer = (playerId: string): Player | undefined => {
    return players.find((p) => p.id === playerId);
  };

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  // Animation variants for each drawing card
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.8,
      rotateY: -15,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateY: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 20,
      },
    },
  };

  // Timer pulse animation
  const timerPulseVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
      },
    },
    normal: {
      scale: 1,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-start min-h-[400px] py-4"
    >
      {/* Header with timer */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        <motion.h2
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="text-4xl md:text-5xl font-black text-purple-800 mb-2"
        >
          Vote Now!
        </motion.h2>
        <p className="text-lg text-gray-600">
          Pick your favorite drawing
        </p>
      </motion.div>

      {/* Timer */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        variants={timerPulseVariants}
        whileInView={isLowTime ? 'pulse' : 'normal'}
        className={`
          flex items-center justify-center
          w-24 h-24 md:w-28 md:h-28 rounded-full
          ${timerColors.bg}
          ring-4 ${timerColors.ring}
          shadow-lg mb-6
          transition-colors duration-300
        `}
      >
        <motion.span
          key={timerSeconds}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={`
            text-4xl md:text-5xl font-black leading-none
            ${timerColors.text}
          `}
        >
          {timerSeconds !== null ? timerSeconds : '--'}
        </motion.span>
      </motion.div>

      {/* Voting progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-6 text-center"
      >
        <span className="text-lg font-medium text-gray-600">
          {allVoted ? (
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-green-600"
            >
              All votes in!
            </motion.span>
          ) : (
            <>
              <motion.span
                key={votedCount}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="text-purple-700 font-bold"
              >
                {votedCount}
              </motion.span>
              <span className="text-gray-500"> of </span>
              <span className="text-purple-700 font-bold">{totalVoters}</span>
              <span className="text-gray-500"> voted</span>
            </>
          )}
        </span>
      </motion.div>

      {/* Drawings grid with staggered reveal animation */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`grid ${gridClasses} gap-4 md:gap-6 w-full max-w-5xl px-2`}
      >
        {drawings.map((drawing, index) => {
          const player = getPlayer(drawing.playerId);
          const playerColor = getPlayerColor(player);

          return (
            <motion.div
              key={drawing.playerId}
              variants={cardVariants}
              className="flex flex-col items-center group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {/* Drawing card */}
              <motion.div
                initial={{ rotateY: -90 }}
                animate={{ rotateY: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 150,
                  damping: 20,
                  delay: index * 0.15,
                }}
                className="
                  relative w-full aspect-square
                  bg-white rounded-xl shadow-lg
                  overflow-hidden
                  border-4 border-white
                "
                style={{
                  boxShadow: `0 4px 20px ${playerColor}40`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Drawing image */}
                <img
                  src={drawing.drawingData}
                  alt={`Drawing by ${getPlayerName(drawing.playerId)}`}
                  className="w-full h-full object-contain bg-gray-50"
                  loading="lazy"
                />

                {/* Number badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 15,
                    delay: index * 0.15 + 0.3,
                  }}
                  className="
                    absolute top-2 left-2
                    w-8 h-8 rounded-full
                    flex items-center justify-center
                    text-white font-bold text-lg
                    shadow-md
                  "
                  style={{ backgroundColor: playerColor }}
                >
                  {index + 1}
                </motion.div>
              </motion.div>

              {/* Player name */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.15 + 0.2,
                }}
                whileHover={{ scale: 1.05 }}
                className="
                  mt-3 px-4 py-2 rounded-full
                  font-semibold text-lg
                  text-white
                  shadow-md
                "
                style={{ backgroundColor: playerColor }}
              >
                {getPlayerName(drawing.playerId)}
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty state */}
      {drawings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 text-gray-500"
        >
          <motion.svg
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </motion.svg>
          <p className="text-xl">No drawings yet</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default DrawingGallery;
