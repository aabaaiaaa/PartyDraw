/**
 * DrawingGallery - Displays all submitted drawings in a responsive grid during voting phase
 *
 * Shows on the host screen during the voting phase:
 * - All drawings in a responsive grid layout
 * - Player names under each drawing
 * - Voting timer with color changes as time runs low
 * - Vote progress indicator
 */

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

  return (
    <div className="flex flex-col items-center justify-start min-h-[400px] py-4">
      {/* Header with timer */}
      <div className="text-center mb-6">
        <h2 className="text-4xl md:text-5xl font-black text-purple-800 mb-2">
          Vote Now!
        </h2>
        <p className="text-lg text-gray-600">
          Pick your favorite drawing
        </p>
      </div>

      {/* Timer */}
      <div
        className={`
          flex items-center justify-center
          w-24 h-24 md:w-28 md:h-28 rounded-full
          ${timerColors.bg}
          ring-4 ${timerColors.ring}
          shadow-lg mb-6
          transition-all duration-300
          ${isLowTime ? 'animate-pulse' : ''}
        `}
      >
        <span
          className={`
            text-4xl md:text-5xl font-black leading-none
            ${timerColors.text}
            transition-colors duration-300
          `}
        >
          {timerSeconds !== null ? timerSeconds : '--'}
        </span>
      </div>

      {/* Voting progress */}
      <div className="mb-6 text-center">
        <span className="text-lg font-medium text-gray-600">
          {allVoted ? (
            <span className="text-green-600">All votes in!</span>
          ) : (
            <>
              <span className="text-purple-700 font-bold">{votedCount}</span>
              <span className="text-gray-500"> of </span>
              <span className="text-purple-700 font-bold">{totalVoters}</span>
              <span className="text-gray-500"> voted</span>
            </>
          )}
        </span>
      </div>

      {/* Drawings grid */}
      <div className={`grid ${gridClasses} gap-4 md:gap-6 w-full max-w-5xl px-2`}>
        {drawings.map((drawing, index) => {
          const player = getPlayer(drawing.playerId);
          const playerColor = getPlayerColor(player);

          return (
            <div
              key={drawing.playerId}
              className="flex flex-col items-center group"
            >
              {/* Drawing card */}
              <div
                className="
                  relative w-full aspect-square
                  bg-white rounded-xl shadow-lg
                  overflow-hidden
                  border-4 border-white
                  transition-all duration-300
                  group-hover:shadow-xl group-hover:scale-[1.02]
                "
                style={{
                  boxShadow: `0 4px 20px ${playerColor}40`,
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
                <div
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
                </div>
              </div>

              {/* Player name */}
              <div
                className="
                  mt-3 px-4 py-2 rounded-full
                  font-semibold text-lg
                  text-white
                  shadow-md
                  transition-transform duration-200
                  group-hover:scale-105
                "
                style={{ backgroundColor: playerColor }}
              >
                {getPlayerName(drawing.playerId)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {drawings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg
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
          </svg>
          <p className="text-xl">No drawings yet</p>
        </div>
      )}
    </div>
  );
}

export default DrawingGallery;
