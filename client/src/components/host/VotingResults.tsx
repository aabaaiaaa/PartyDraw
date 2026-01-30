/**
 * VotingResults - Displays round results with winner highlight and score breakdown
 *
 * Shows on the host screen after voting phase completes:
 * - Winning drawing prominently highlighted with trophy animation
 * - Vote counts for each player
 * - Points earned breakdown with animated entrance
 * - Round number indicator
 */

import { useEffect, useState } from 'react';
import { VoteResult, Winner, Drawing, Player } from '../../hooks/useGameState';

interface VotingResultsProps {
  /** Round winners (can have ties) */
  winners: Winner[];
  /** Vote results for all players */
  voteResults: VoteResult[];
  /** Current round number */
  round: number;
  /** Total number of rounds */
  totalRounds: number;
  /** All drawings from this round */
  drawings: Drawing[];
  /** All players in the game */
  players: Player[];
}

/**
 * Get player's color by ID
 */
function getPlayerColor(players: Player[], playerId: string): string {
  const player = players.find((p) => p.id === playerId);
  return player?.color || '#8B5CF6';
}

/**
 * Get the winning drawing data
 */
function getWinnerDrawing(
  drawings: Drawing[],
  winnerId: string
): string | null {
  const drawing = drawings.find((d) => d.playerId === winnerId);
  return drawing?.drawingData || null;
}

function VotingResults({
  winners,
  voteResults,
  round,
  totalRounds,
  drawings,
  players,
}: VotingResultsProps) {
  // Animation states
  const [showWinner, setShowWinner] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [revealedScores, setRevealedScores] = useState<number>(0);

  // Stagger animations on mount
  useEffect(() => {
    // Show winner after short delay
    const winnerTimer = setTimeout(() => setShowWinner(true), 300);

    // Show scores after winner animation
    const scoresTimer = setTimeout(() => setShowScores(true), 1000);

    return () => {
      clearTimeout(winnerTimer);
      clearTimeout(scoresTimer);
    };
  }, []);

  // Reveal scores one by one
  useEffect(() => {
    if (!showScores) return;

    const sortedResults = [...voteResults].sort((a, b) => b.votes - a.votes);
    if (revealedScores >= sortedResults.length) return;

    const timer = setTimeout(() => {
      setRevealedScores((prev) => prev + 1);
    }, 150);

    return () => clearTimeout(timer);
  }, [showScores, revealedScores, voteResults]);

  // Sort results by votes (highest first)
  const sortedResults = [...voteResults].sort((a, b) => b.votes - a.votes);

  // Get primary winner (first winner in case of ties)
  const primaryWinner = winners[0] || null;
  const winnerDrawing = primaryWinner
    ? getWinnerDrawing(drawings, primaryWinner.playerId)
    : null;
  const isTie = winners.length > 1;

  return (
    <div className="flex flex-col items-center justify-start min-h-[400px] py-4">
      {/* Round indicator */}
      <div className="mb-4">
        <span className="text-lg font-medium text-gray-500">
          Round {round} of {totalRounds}
        </span>
      </div>

      {/* Header */}
      <h2
        className={`
          text-4xl md:text-5xl font-black text-purple-800 mb-6
          transition-all duration-500
          ${showWinner ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
        `}
      >
        {isTie ? "It's a Tie!" : 'Round Winner!'}
      </h2>

      {/* Winner section */}
      {primaryWinner && (
        <div
          className={`
            flex flex-col items-center mb-8
            transition-all duration-700 ease-out
            ${showWinner ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
          `}
        >
          {/* Trophy animation */}
          <div className="relative mb-4">
            {/* Trophy icon */}
            <div
              className={`
                text-7xl md:text-8xl
                transition-transform duration-500
                ${showWinner ? 'animate-bounce' : ''}
              `}
              style={{ animationDuration: '1.5s', animationIterationCount: '2' }}
            >
              🏆
            </div>

            {/* Sparkle effects */}
            <div
              className={`
                absolute -top-2 -left-4
                text-2xl
                transition-all duration-300 delay-500
                ${showWinner ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
              `}
            >
              ✨
            </div>
            <div
              className={`
                absolute -top-2 -right-4
                text-2xl
                transition-all duration-300 delay-700
                ${showWinner ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
              `}
            >
              ✨
            </div>
          </div>

          {/* Winner name */}
          <div className="text-center mb-4">
            {isTie ? (
              <div className="flex flex-wrap justify-center gap-2">
                {winners.map((w) => (
                  <span
                    key={w.playerId}
                    className="text-3xl md:text-4xl font-black px-4 py-2 rounded-full text-white shadow-lg"
                    style={{ backgroundColor: getPlayerColor(players, w.playerId) }}
                  >
                    {w.playerName}
                  </span>
                ))}
              </div>
            ) : (
              <span
                className="text-4xl md:text-5xl font-black px-6 py-3 rounded-full text-white shadow-lg inline-block"
                style={{
                  backgroundColor: getPlayerColor(players, primaryWinner.playerId),
                  boxShadow: `0 8px 30px ${getPlayerColor(players, primaryWinner.playerId)}60`,
                }}
              >
                {primaryWinner.playerName}
              </span>
            )}
            <p className="text-xl text-purple-600 mt-3 font-semibold">
              {primaryWinner.votes} vote{primaryWinner.votes !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Winning drawing */}
          {winnerDrawing && (
            <div
              className={`
                relative
                transition-all duration-500 delay-300
                ${showWinner ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
              `}
            >
              <div
                className="
                  w-48 h-48 md:w-64 md:h-64
                  bg-white rounded-2xl shadow-2xl
                  overflow-hidden
                  border-4
                  winner-glow
                "
                style={{
                  borderColor: getPlayerColor(players, primaryWinner.playerId),
                  boxShadow: `0 0 40px ${getPlayerColor(players, primaryWinner.playerId)}50`,
                }}
              >
                <img
                  src={winnerDrawing}
                  alt={`Winning drawing by ${primaryWinner.playerName}`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* No winner state (everyone got 0 votes) */}
      {!primaryWinner && voteResults.length > 0 && (
        <div
          className={`
            text-center mb-8
            transition-all duration-500
            ${showWinner ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <p className="text-2xl text-gray-500">No votes were cast!</p>
        </div>
      )}

      {/* Score breakdown */}
      <div
        className={`
          w-full max-w-lg
          transition-all duration-500 delay-500
          ${showScores ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        <h3 className="text-xl font-bold text-purple-700 mb-4 text-center">
          Round Scores
        </h3>

        <div className="space-y-2">
          {sortedResults.map((result, index) => {
            const isWinner = winners.some((w) => w.playerId === result.playerId);
            const playerColor = getPlayerColor(players, result.playerId);
            const isRevealed = index < revealedScores;

            return (
              <div
                key={result.playerId}
                className={`
                  flex items-center justify-between
                  px-4 py-3 rounded-xl
                  transition-all duration-300
                  ${isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
                  ${isWinner ? 'bg-yellow-50 ring-2 ring-yellow-400' : 'bg-white'}
                  shadow-md
                `}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                {/* Rank and name */}
                <div className="flex items-center gap-3">
                  {/* Position badge */}
                  <div
                    className={`
                      w-8 h-8 rounded-full
                      flex items-center justify-center
                      text-white font-bold text-sm
                      ${index === 0 ? 'bg-yellow-500' : ''}
                      ${index === 1 ? 'bg-gray-400' : ''}
                      ${index === 2 ? 'bg-orange-400' : ''}
                      ${index > 2 ? 'bg-gray-300' : ''}
                    `}
                  >
                    {index + 1}
                  </div>

                  {/* Player name with color indicator */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: playerColor }}
                    />
                    <span className="font-semibold text-gray-800">
                      {result.playerName}
                    </span>
                    {isWinner && (
                      <span className="text-yellow-500 text-lg">👑</span>
                    )}
                  </div>
                </div>

                {/* Votes and points */}
                <div className="flex items-center gap-4">
                  {/* Vote count */}
                  <div className="text-right">
                    <span className="text-sm text-gray-500">
                      {result.votes} vote{result.votes !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Points earned */}
                  <div
                    className={`
                      px-3 py-1 rounded-full
                      font-bold text-white
                      min-w-[80px] text-center
                      score-pop
                    `}
                    style={{
                      backgroundColor: playerColor,
                      animationDelay: `${index * 100 + 200}ms`,
                    }}
                  >
                    +{result.pointsEarned}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {voteResults.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p className="text-xl">No results to display</p>
        </div>
      )}
    </div>
  );
}

export default VotingResults;
