/**
 * VotingInterface - Component for players to vote on drawings
 *
 * Features:
 * - Displays all drawings in a scrollable grid
 * - Tap to vote with visual feedback
 * - Disables voting for own drawing
 * - Shows confirmation after voting
 * - Timer countdown display
 */

import { useState } from 'react';
import { Drawing, Player } from '../../hooks/useGameState';

interface VotingInterfaceProps {
  drawings: Drawing[];
  players: Player[];
  currentPlayerId: string | undefined;
  timerSeconds: number | null;
  onVote: (votedForId: string) => void;
  hasVoted: boolean;
}

function VotingInterface({
  drawings,
  players,
  currentPlayerId,
  timerSeconds,
  onVote,
  hasVoted,
}: VotingInterfaceProps) {
  const [selectedDrawing, setSelectedDrawing] = useState<string | null>(null);
  const [confirmingVote, setConfirmingVote] = useState(false);

  /**
   * Get player name by ID
   */
  const getPlayerName = (playerId: string): string => {
    const player = players.find((p) => p.id === playerId);
    return player?.name || 'Unknown';
  };

  /**
   * Get player color by ID
   */
  const getPlayerColor = (playerId: string): string => {
    const player = players.find((p) => p.id === playerId);
    return player?.color || '#888888';
  };

  /**
   * Handle drawing tap - show selection or confirm vote
   */
  const handleDrawingTap = (playerId: string) => {
    // Don't allow voting for own drawing
    if (playerId === currentPlayerId) return;
    if (hasVoted) return;

    if (selectedDrawing === playerId) {
      // Second tap - confirm vote
      setConfirmingVote(true);
      onVote(playerId);
    } else {
      // First tap - select drawing
      setSelectedDrawing(playerId);
    }
  };

  /**
   * Handle quick vote (single tap with confirmation)
   */
  const handleConfirmVote = () => {
    if (selectedDrawing && !hasVoted) {
      setConfirmingVote(true);
      onVote(selectedDrawing);
    }
  };

  // Show confirmation after voting
  if (hasVoted) {
    return (
      <div className="text-center py-4 sm:py-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <svg
            className="w-8 h-8 sm:w-10 sm:h-10 text-green-600"
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
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-green-600 mb-1 sm:mb-2">Vote Cast!</h2>
        <p className="text-sm sm:text-base text-gray-600">Waiting for other players to vote...</p>

        {/* Animated dots */}
        <div className="flex justify-center gap-1 mt-3 sm:mt-4">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header - compact for phones */}
      <div className="text-center mb-2 sm:mb-3 flex-shrink-0">
        <h2 className="text-base sm:text-xl font-bold text-teal-800">Vote for your favorite!</h2>
        <p className="text-xs sm:text-sm text-gray-600">Tap a drawing to select, tap again to vote</p>

        {/* Timer */}
        {timerSeconds !== null && (
          <div
            className={`text-xl sm:text-2xl font-mono font-bold mt-1 sm:mt-2 ${
              timerSeconds <= 5
                ? 'text-red-500 animate-pulse'
                : timerSeconds <= 10
                ? 'text-orange-500'
                : 'text-teal-600'
            }`}
          >
            {timerSeconds}s
          </div>
        )}
      </div>

      {/* Drawings Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto -mx-1 sm:-mx-2 px-1 sm:px-2 min-h-0">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 pb-2 sm:pb-3">
          {drawings.map((drawing) => {
            const isOwnDrawing = drawing.playerId === currentPlayerId;
            const isSelected = selectedDrawing === drawing.playerId;
            const playerName = getPlayerName(drawing.playerId);
            const playerColor = getPlayerColor(drawing.playerId);

            return (
              <button
                key={drawing.playerId}
                onClick={() => handleDrawingTap(drawing.playerId)}
                disabled={isOwnDrawing}
                className={`relative border-2 rounded-lg sm:rounded-xl p-1.5 sm:p-2 transition-all duration-200 ${
                  isOwnDrawing
                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'border-teal-500 bg-teal-50 shadow-lg scale-[1.02] ring-2 ring-teal-300'
                    : 'border-gray-200 bg-white hover:border-teal-300 hover:shadow-md active:scale-[0.98]'
                }`}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-teal-500 rounded-full flex items-center justify-center shadow-md z-10">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-white"
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
                  </div>
                )}

                {/* Own drawing badge */}
                {isOwnDrawing && (
                  <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-gray-400 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full">
                    You
                  </div>
                )}

                {/* Drawing Preview */}
                <div className="bg-white rounded sm:rounded-lg aspect-square mb-1 sm:mb-2 flex items-center justify-center overflow-hidden border border-gray-100">
                  {drawing.drawingData.startsWith('data:image') ? (
                    <img
                      src={drawing.drawingData}
                      alt={`Drawing by ${playerName}`}
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  ) : (
                    <div className="text-gray-300 text-2xl sm:text-4xl">🎨</div>
                  )}
                </div>

                {/* Player Info */}
                <div className="flex items-center gap-1 sm:gap-2 justify-center">
                  <div
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-xs text-white font-bold flex-shrink-0"
                    style={{ backgroundColor: playerColor }}
                  >
                    {playerName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-700 truncate font-medium">
                    {playerName}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirm Vote Button */}
      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={handleConfirmVote}
          disabled={!selectedDrawing}
          className={`w-full font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base ${
            selectedDrawing
              ? 'bg-teal-600 hover:bg-teal-700 text-white active:scale-[0.98] shadow-md'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {selectedDrawing ? (
            <>
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
              <span className="truncate">Vote for {getPlayerName(selectedDrawing)}</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
              Select a drawing
            </>
          )}
        </button>

        {/* Help text */}
        <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2">
          {selectedDrawing
            ? 'Tap drawing again or press button to confirm'
            : "You can't vote for your own drawing"}
        </p>
      </div>
    </div>
  );
}

export default VotingInterface;
