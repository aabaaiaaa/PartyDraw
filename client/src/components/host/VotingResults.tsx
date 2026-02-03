/**
 * VotingResults - Displays round results with winner highlight and score breakdown
 *
 * Shows on the host screen after voting phase completes:
 * - Winning drawing prominently highlighted with trophy animation
 * - Vote counts for each player
 * - Points earned breakdown with animated entrance
 * - Round number indicator
 *
 * Uses horizontal layout to fit on landscape screens without scrolling.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoteResult, Winner, Drawing, Player } from '../../hooks/useGameState';
import Confetti from '../common/Confetti';

interface VotingResultsProps {
  winners: Winner[];
  voteResults: VoteResult[];
  round: number;
  totalRounds: number;
  drawings: Drawing[];
  players: Player[];
}

function getPlayerColor(players: Player[], playerId: string): string {
  const player = players.find((p) => p.id === playerId);
  return player?.color || '#8B5CF6';
}

function getWinnerDrawing(drawings: Drawing[], winnerId: string): string | null {
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
  const [showWinner, setShowWinner] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [revealedScores, setRevealedScores] = useState<number>(0);

  useEffect(() => {
    const winnerTimer = setTimeout(() => setShowWinner(true), 300);
    const confettiTimer = setTimeout(() => setShowConfetti(true), 500);
    const scoresTimer = setTimeout(() => setShowScores(true), 800);
    return () => {
      clearTimeout(winnerTimer);
      clearTimeout(confettiTimer);
      clearTimeout(scoresTimer);
    };
  }, []);

  useEffect(() => {
    if (!showScores) return;
    const sortedResults = [...voteResults].sort((a, b) => b.votes - a.votes);
    if (revealedScores >= sortedResults.length) return;
    const timer = setTimeout(() => setRevealedScores((prev) => prev + 1), 100);
    return () => clearTimeout(timer);
  }, [showScores, revealedScores, voteResults]);

  const sortedResults = [...voteResults].sort((a, b) => b.votes - a.votes);
  const primaryWinner = winners[0] || null;
  const winnerDrawing = primaryWinner ? getWinnerDrawing(drawings, primaryWinner.playerId) : null;
  const isTie = winners.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-full flex flex-col overflow-hidden"
    >
      <Confetti active={showConfetti && !!primaryWinner} pieceCount={60} maxDelay={1} />

      {/* Header - Compact */}
      <div className="flex-shrink-0 text-center mb-2 sm:mb-3">
        <span className="text-xs sm:text-sm lg:text-base text-gray-500">
          Round {round} of {totalRounds}
        </span>
        <AnimatePresence>
          {showWinner && (
            <motion.h2
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="text-xl sm:text-3xl lg:text-4xl font-black text-purple-800"
            >
              {isTie ? "It's a Tie!" : 'Round Winner!'}
            </motion.h2>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content - Horizontal Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 min-h-0 overflow-hidden">
        {/* Left: Winner Section */}
        <div className="lg:w-1/2 flex flex-col items-center justify-center flex-shrink-0">
          <AnimatePresence>
            {primaryWinner && showWinner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                {/* Trophy */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0, y: [0, -10, 0] }}
                  transition={{ y: { repeat: 2, duration: 0.5 } }}
                  className="text-4xl sm:text-6xl lg:text-7xl mb-2"
                >
                  🏆
                </motion.div>

                {/* Winner name(s) */}
                <div className="text-center mb-2">
                  {isTie ? (
                    <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                      {winners.map((w) => (
                        <span
                          key={w.playerId}
                          className="text-base sm:text-xl lg:text-2xl font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-white shadow-md"
                          style={{ backgroundColor: getPlayerColor(players, w.playerId) }}
                        >
                          {w.playerName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="text-xl sm:text-3xl lg:text-4xl font-black px-3 py-1 sm:px-4 sm:py-2 rounded-full text-white shadow-lg inline-block"
                      style={{ backgroundColor: getPlayerColor(players, primaryWinner.playerId) }}
                    >
                      {primaryWinner.playerName}
                    </motion.span>
                  )}
                  <p className="text-sm sm:text-lg lg:text-xl text-purple-600 mt-1 font-semibold">
                    {primaryWinner.votes} vote{primaryWinner.votes !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Winning drawing */}
                {winnerDrawing && (
                  <motion.div
                    initial={{ opacity: 0, rotateY: -90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-28 h-28 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-white rounded-xl shadow-xl overflow-hidden border-4"
                    style={{ borderColor: getPlayerColor(players, primaryWinner.playerId) }}
                  >
                    <img
                      src={winnerDrawing}
                      alt={`Winning drawing by ${primaryWinner.playerName}`}
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* No winner state */}
          {!primaryWinner && voteResults.length > 0 && showWinner && (
            <p className="text-lg sm:text-xl text-gray-500">No votes were cast!</p>
          )}
        </div>

        {/* Right: Score Breakdown */}
        <AnimatePresence>
          {showScores && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-1/2 flex flex-col min-h-0"
            >
              <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-purple-700 mb-2 flex-shrink-0 text-center lg:text-left">
                Round Scores
              </h3>

              <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 sm:space-y-2 pr-1">
                {sortedResults.map((result, index) => {
                  const isWinner = winners.some((w) => w.playerId === result.playerId);
                  const playerColor = getPlayerColor(players, result.playerId);
                  const isRevealed = index < revealedScores;

                  return (
                    <AnimatePresence key={result.playerId}>
                      {isRevealed && (
                        <motion.div
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center justify-between px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg ${
                            isWinner ? 'bg-yellow-50 ring-2 ring-yellow-400' : 'bg-white'
                          } shadow-sm`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                              }`}
                            >
                              {index + 1}
                            </span>
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: playerColor }} />
                            <span className="font-medium text-gray-800 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px]">
                              {result.playerName}
                            </span>
                            {isWinner && <span className="text-yellow-500 text-sm">👑</span>}
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-[10px] sm:text-xs text-gray-500">
                              {result.votes} vote{result.votes !== 1 ? 's' : ''}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-full font-bold text-white text-xs sm:text-sm"
                              style={{ backgroundColor: playerColor }}
                            >
                              +{result.pointsEarned}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {voteResults.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p className="text-xl">No results to display</p>
        </div>
      )}
    </motion.div>
  );
}

export default VotingResults;
