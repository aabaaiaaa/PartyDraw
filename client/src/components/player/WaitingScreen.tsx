/**
 * WaitingScreen - Player waiting screen component
 *
 * Displays:
 * - "Waiting for host..." message with animated dots
 * - Ready status of all players in the room
 * - "Cancel Ready" option to unready and change name
 */

import { useState, useEffect } from 'react';
import { Player } from '../../hooks/useGameState';

interface WaitingScreenProps {
  players: Player[];
  currentPlayerId?: string;
  onCancelReady: () => void;
}

function WaitingScreen({ players, currentPlayerId, onCancelReady }: WaitingScreenProps) {
  // Animated dots state for "Waiting..." message
  const [dotCount, setDotCount] = useState(0);

  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Generate animated dots string
  const dots = '.'.repeat(dotCount);

  // Calculate ready count
  const readyCount = players.filter((p) => p.isReady).length;
  const totalPlayers = players.length;

  // Get initials for avatar
  const getInitials = (name: string): string => {
    const words = name.split(' ').filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="text-center">
      {/* Animated waiting message */}
      <div className="mb-4 sm:mb-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 relative">
          {/* Pulsing ring animation */}
          <div className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-25" />
          <div className="absolute inset-0 rounded-full bg-teal-500 animate-pulse opacity-50" />
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-teal-600 flex items-center justify-center">
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-teal-800 mb-1 sm:mb-2">
          Waiting for host{dots}
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          The game will start when the host begins
        </p>
      </div>

      {/* Ready status summary */}
      <div className="bg-teal-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-base sm:text-lg font-semibold text-teal-800">
            {readyCount}/{totalPlayers} Players Ready
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${totalPlayers > 0 ? (readyCount / totalPlayers) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Player list */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">
          Players in Room
        </h3>
        <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
          {players.map((player) => (
            <div
              key={player.id}
              className={`
                flex items-center justify-between p-2 sm:p-3 rounded-lg transition-all
                ${player.id === currentPlayerId
                  ? 'bg-teal-100 border-2 border-teal-300'
                  : 'bg-gray-50'
                }
              `}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Player avatar */}
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-md flex-shrink-0"
                  style={{ backgroundColor: player.color }}
                >
                  {getInitials(player.name)}
                </div>

                {/* Player name */}
                <span className="font-medium text-gray-800 text-sm sm:text-base truncate">
                  {player.name}
                  {player.id === currentPlayerId && (
                    <span className="text-teal-600 ml-1">(You)</span>
                  )}
                </span>
              </div>

              {/* Ready indicator */}
              {player.isReady ? (
                <div className="flex items-center gap-1 text-green-600 flex-shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-xs sm:text-sm font-medium">Ready</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-400 flex-shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-xs sm:text-sm hidden xs:inline">Waiting</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cancel Ready button */}
      <button
        onClick={onCancelReady}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all active:scale-[0.98] border border-gray-300 text-sm sm:text-base"
      >
        Cancel Ready
      </button>
      <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2">
        Tap to change your name or unready
      </p>
    </div>
  );
}

export default WaitingScreen;
