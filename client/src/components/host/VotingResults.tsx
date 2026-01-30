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
import { motion, AnimatePresence } from 'framer-motion';
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

  // Animation variants
  const winnerBounceVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 15,
      },
    },
    bounce: {
      y: [0, -20, 0],
      transition: {
        duration: 0.6,
        repeat: 2,
        ease: 'easeInOut' as const,
      },
    },
  };

  const sparkleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: [0, 1.2, 1],
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
    sparkle: {
      rotate: [0, 15, -15, 0],
      scale: [1, 1.2, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
      },
    },
  };

  const scorePopVariants = {
    initial: { scale: 0, opacity: 0, y: 20 },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 15,
      },
    },
  };

  const floatUpVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 150,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-start min-h-[400px] py-4"
    >
      {/* Round indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <span className="text-lg font-medium text-gray-500">
          Round {round} of {totalRounds}
        </span>
      </motion.div>

      {/* Header */}
      <AnimatePresence>
        {showWinner && (
          <motion.h2
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-4xl md:text-5xl font-black text-purple-800 mb-6"
          >
            {isTie ? "It's a Tie!" : 'Round Winner!'}
          </motion.h2>
        )}
      </AnimatePresence>

      {/* Winner section */}
      <AnimatePresence>
        {primaryWinner && showWinner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.2 }}
            className="flex flex-col items-center mb-8"
          >
            {/* Trophy animation */}
            <div className="relative mb-4">
              {/* Trophy icon with bounce */}
              <motion.div
                variants={winnerBounceVariants}
                initial="initial"
                animate={['animate', 'bounce']}
                className="text-7xl md:text-8xl"
              >
                🏆
              </motion.div>

              {/* Sparkle effects */}
              <motion.div
                variants={sparkleVariants}
                initial="initial"
                animate={['animate', 'sparkle']}
                transition={{ delay: 0.5 }}
                className="absolute -top-2 -left-4 text-2xl"
              >
                ✨
              </motion.div>
              <motion.div
                variants={sparkleVariants}
                initial="initial"
                animate={['animate', 'sparkle']}
                transition={{ delay: 0.7 }}
                className="absolute -top-2 -right-4 text-2xl"
              >
                ✨
              </motion.div>
            </div>

            {/* Winner name */}
            <div className="text-center mb-4">
              {isTie ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap justify-center gap-2"
                >
                  {winners.map((w, index) => (
                    <motion.span
                      key={w.playerId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="text-3xl md:text-4xl font-black px-4 py-2 rounded-full text-white shadow-lg"
                      style={{ backgroundColor: getPlayerColor(players, w.playerId) }}
                    >
                      {w.playerName}
                    </motion.span>
                  ))}
                </motion.div>
              ) : (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                  className="text-4xl md:text-5xl font-black px-6 py-3 rounded-full text-white shadow-lg inline-block"
                  style={{
                    backgroundColor: getPlayerColor(players, primaryWinner.playerId),
                    boxShadow: `0 8px 30px ${getPlayerColor(players, primaryWinner.playerId)}60`,
                  }}
                >
                  {primaryWinner.playerName}
                </motion.span>
              )}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-purple-600 mt-3 font-semibold"
              >
                {primaryWinner.votes} vote{primaryWinner.votes !== 1 ? 's' : ''}
              </motion.p>
            </div>

            {/* Winning drawing with glow effect */}
            {winnerDrawing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 150,
                  damping: 20,
                  delay: 0.4,
                }}
                className="relative"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      `0 0 20px ${getPlayerColor(players, primaryWinner.playerId)}50`,
                      `0 0 40px ${getPlayerColor(players, primaryWinner.playerId)}70`,
                      `0 0 20px ${getPlayerColor(players, primaryWinner.playerId)}50`,
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="
                    w-48 h-48 md:w-64 md:h-64
                    bg-white rounded-2xl shadow-2xl
                    overflow-hidden
                    border-4
                  "
                  style={{
                    borderColor: getPlayerColor(players, primaryWinner.playerId),
                  }}
                >
                  <img
                    src={winnerDrawing}
                    alt={`Winning drawing by ${primaryWinner.playerName}`}
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No winner state (everyone got 0 votes) */}
      <AnimatePresence>
        {!primaryWinner && voteResults.length > 0 && showWinner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center mb-8"
          >
            <p className="text-2xl text-gray-500">No votes were cast!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score breakdown */}
      <AnimatePresence>
        {showScores && (
          <motion.div
            variants={floatUpVariants}
            initial="initial"
            animate="animate"
            className="w-full max-w-lg"
          >
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-purple-700 mb-4 text-center"
            >
              Round Scores
            </motion.h3>

            <div className="space-y-2">
              {sortedResults.map((result, index) => {
                const isWinner = winners.some((w) => w.playerId === result.playerId);
                const playerColor = getPlayerColor(players, result.playerId);
                const isRevealed = index < revealedScores;

                return (
                  <AnimatePresence key={result.playerId}>
                    {isRevealed && (
                      <motion.div
                        initial={{ opacity: 0, x: -50, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                          delay: index * 0.1,
                        }}
                        className={`
                          flex items-center justify-between
                          px-4 py-3 rounded-xl
                          ${isWinner ? 'bg-yellow-50 ring-2 ring-yellow-400' : 'bg-white'}
                          shadow-md
                        `}
                      >
                        {/* Rank and name */}
                        <div className="flex items-center gap-3">
                          {/* Position badge */}
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 15,
                              delay: index * 0.1 + 0.1,
                            }}
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
                          </motion.div>

                          {/* Player name with color indicator */}
                          <div className="flex items-center gap-2">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.1 + 0.15 }}
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: playerColor }}
                            />
                            <span className="font-semibold text-gray-800">
                              {result.playerName}
                            </span>
                            {isWinner && (
                              <motion.span
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 400,
                                  damping: 10,
                                  delay: index * 0.1 + 0.2,
                                }}
                                className="text-yellow-500 text-lg"
                              >
                                👑
                              </motion.span>
                            )}
                          </div>
                        </div>

                        {/* Votes and points */}
                        <div className="flex items-center gap-4">
                          {/* Vote count */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            className="text-right"
                          >
                            <span className="text-sm text-gray-500">
                              {result.votes} vote{result.votes !== 1 ? 's' : ''}
                            </span>
                          </motion.div>

                          {/* Points earned - floating popup effect */}
                          <motion.div
                            variants={scorePopVariants}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: index * 0.1 + 0.3 }}
                            whileHover={{ scale: 1.1 }}
                            className="px-3 py-1 rounded-full font-bold text-white min-w-[80px] text-center"
                            style={{ backgroundColor: playerColor }}
                          >
                            +{result.pointsEarned}
                          </motion.div>
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

      {/* Empty state */}
      {voteResults.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 py-8"
        >
          <p className="text-xl">No results to display</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default VotingResults;
