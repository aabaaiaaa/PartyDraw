/**
 * DrawingGallery - Displays all submitted drawings during voting phase
 *
 * Shows on the host screen during the voting phase:
 * - All drawings in a responsive grid layout
 * - Player names under each drawing
 * - Voting timer with color changes as time runs low
 * - Vote progress indicator
 *
 * Uses horizontal layout on landscape to maximize drawing visibility.
 */

import { motion } from 'framer-motion';
import { Player, Drawing } from '../../hooks/useGameState';

interface DrawingGalleryProps {
  drawings: Drawing[];
  timerSeconds: number | null;
  players: Player[];
  votedCount: number;
  totalVoters: number;
}

function getTimerColorClasses(seconds: number | null): { text: string; ring: string; bg: string } {
  if (seconds === null) return { text: 'text-gray-400', ring: 'ring-gray-300', bg: 'bg-gray-50' };
  if (seconds <= 5) return { text: 'text-red-500', ring: 'ring-red-400', bg: 'bg-red-50' };
  if (seconds <= 10) return { text: 'text-orange-500', ring: 'ring-orange-400', bg: 'bg-orange-50' };
  return { text: 'text-teal-500', ring: 'ring-teal-400', bg: 'bg-teal-50' };
}

function getPlayerColor(player: Player | undefined): string {
  return player?.color || '#8B5CF6';
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

  const getPlayerName = (playerId: string): string => {
    const player = players.find((p) => p.id === playerId);
    return player?.name || 'Unknown Player';
  };

  const getPlayer = (playerId: string): Player | undefined => {
    return players.find((p) => p.id === playerId);
  };

  // Calculate optimal grid layout based on count and available space
  // For landscape, we want drawings to fit in height
  const getGridStyle = (count: number) => {
    if (count <= 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2 lg:grid-cols-4';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-row overflow-hidden gap-3 sm:gap-4"
    >
      {/* Left sidebar: Title, Timer, Progress - compact vertical strip */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 sm:w-32 lg:w-40">
        {/* Title */}
        <motion.h2
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-lg sm:text-2xl lg:text-3xl font-black text-purple-800 mb-2 sm:mb-3 text-center"
        >
          Vote Now!
        </motion.h2>

        {/* Timer */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`
            flex items-center justify-center
            w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full
            ${timerColors.bg} ring-2 sm:ring-4 ${timerColors.ring}
            shadow-lg mb-2 sm:mb-3
            ${isLowTime ? 'animate-pulse' : ''}
          `}
        >
          <span className={`text-2xl sm:text-4xl lg:text-5xl font-black ${timerColors.text}`}>
            {timerSeconds !== null ? timerSeconds : '--'}
          </span>
        </motion.div>

        {/* Voting progress */}
        <div className="text-center">
          <p className="text-xs sm:text-sm lg:text-base text-gray-600">
            {allVoted ? (
              <span className="text-green-600 font-bold">All voted!</span>
            ) : (
              <>
                <span className="text-purple-700 font-bold text-sm sm:text-lg">{votedCount}</span>
                <span className="text-gray-400">/</span>
                <span className="text-purple-700 font-bold text-sm sm:text-lg">{totalVoters}</span>
              </>
            )}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-400">voted</p>
        </div>

        {/* Active player count for e2e testing */}
        <span data-testid="active-player-count" className="sr-only">
          Active players: {totalVoters}
        </span>
      </div>

      {/* Main area: Drawings grid - fills remaining space */}
      <div className="flex-1 min-w-0 flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`grid ${getGridStyle(drawings.length)} gap-2 sm:gap-3 lg:gap-4 h-full w-full p-1`}
          style={{
            // Ensure grid items don't overflow - use max-height based on available space
            gridAutoRows: '1fr',
          }}
        >
          {drawings.map((drawing, index) => {
            const player = getPlayer(drawing.playerId);
            const playerColor = getPlayerColor(player);

            return (
              <motion.div
                key={drawing.playerId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center min-h-0 h-full"
              >
                {/* Drawing card - constrained to fit */}
                <div
                  className="flex-1 min-h-0 w-full flex items-center justify-center"
                >
                  <div
                    className="relative bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden border-2 sm:border-4 border-white h-full w-full max-w-full"
                    style={{
                      boxShadow: `0 4px 20px ${playerColor}40`,
                      aspectRatio: '1',
                      maxHeight: '100%',
                    }}
                  >
                    <img
                      src={drawing.drawingData}
                      alt={`Drawing by ${getPlayerName(drawing.playerId)}`}
                      className="w-full h-full object-contain bg-gray-50"
                      loading="lazy"
                    />
                    {/* Number badge */}
                    <div
                      className="absolute top-1 left-1 sm:top-2 sm:left-2 w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm lg:text-base shadow-md"
                      style={{ backgroundColor: playerColor }}
                    >
                      {index + 1}
                    </div>
                  </div>
                </div>

                {/* Player name - compact */}
                <div
                  className="mt-1 sm:mt-2 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-semibold text-[10px] sm:text-xs lg:text-sm text-white shadow-sm truncate max-w-full"
                  style={{ backgroundColor: playerColor }}
                >
                  {getPlayerName(drawing.playerId)}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty state */}
        {drawings.length === 0 && (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-base sm:text-lg">No drawings yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default DrawingGallery;
