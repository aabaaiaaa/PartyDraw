/**
 * Leaderboard - Final standings display with podium and celebration effects
 *
 * Shows on the host screen after all rounds are complete:
 * - Podium animation for top 3 players (1st, 2nd, 3rd)
 * - Confetti particle celebration effect
 * - Full score standings list
 * - "Play Again" button to restart game
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoreEntry, Player } from '../../hooks/useGameState';
import {
  getHighScores,
  saveGameScores,
  formatScoreDate,
  HighScoreEntry,
} from '../../utils/leaderboard';

interface LeaderboardProps {
  /** Final standings sorted by score (highest first) */
  standings: ScoreEntry[];
  /** Overall winner */
  winner: ScoreEntry | null;
  /** All players in the game (for color data) */
  players: Player[];
  /** Callback when Play Again is clicked */
  onPlayAgain?: () => void;
}

/**
 * Get player's color by ID
 */
function getPlayerColor(players: Player[], playerId: string): string {
  const player = players.find((p) => p.id === playerId);
  return player?.color || '#8B5CF6';
}

/**
 * Confetti particle component
 */
interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
  size: number;
}

function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) return;

    const colors = [
      '#a855f7', // purple
      '#ec4899', // pink
      '#facc15', // yellow
      '#14b8a6', // teal
      '#f97316', // orange
      '#3b82f6', // blue
      '#22c55e', // green
      '#ef4444', // red
    ];

    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 100; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
        rotation: Math.random() * 360,
        size: 6 + Math.random() * 8,
      });
    }
    setPieces(newPieces);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece absolute"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Podium display for top 3 players with Framer Motion animations
 */
function Podium({
  standings,
  players,
  showPodium,
}: {
  standings: ScoreEntry[];
  players: Player[];
  showPodium: boolean;
}) {
  const first = standings[0];
  const second = standings[1];
  const third = standings[2];

  const podiumData = [
    {
      position: 2,
      player: second,
      height: 96, // h-24 = 6rem = 96px
      delay: 0.3,
      medal: '🥈',
      bgClass: 'bg-gray-300',
      order: 'order-1',
    },
    {
      position: 1,
      player: first,
      height: 144, // h-36 = 9rem = 144px
      delay: 0.5,
      medal: '🥇',
      bgClass: 'bg-yellow-400',
      order: 'order-2',
    },
    {
      position: 3,
      player: third,
      height: 64, // h-16 = 4rem = 64px
      delay: 0.1,
      medal: '🥉',
      bgClass: 'bg-orange-400',
      order: 'order-3',
    },
  ];

  // Animation variants for podium block rising
  const podiumRiseVariants = {
    hidden: {
      height: 0,
      opacity: 0,
    },
    visible: (height: number) => ({
      height,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
        mass: 1,
      },
    }),
  };

  // Animation variants for player info dropping in
  const playerInfoVariants = {
    hidden: {
      opacity: 0,
      y: -30,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 15,
      },
    },
  };

  // Crown bounce animation
  const crownVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 10,
      },
    },
    bounce: {
      y: [0, -10, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 0.5,
      },
    },
  };

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 mb-4 sm:mb-8">
      {podiumData.map(({ position, player, height, delay, medal, bgClass, order }) => (
        <div
          key={position}
          className={`flex flex-col items-center ${order}`}
        >
          {/* Player info */}
          <AnimatePresence>
            {player && showPodium && (
              <motion.div
                variants={playerInfoVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: delay + 0.3 }}
                className="flex flex-col items-center mb-2 sm:mb-3"
              >
                {/* Medal and crown for winner */}
                <div className="relative">
                  {position === 1 && (
                    <motion.div
                      variants={crownVariants}
                      initial="hidden"
                      animate={['visible', 'bounce']}
                      transition={{ delay: delay + 0.5 }}
                      className="absolute -top-5 sm:-top-8 lg:-top-10 left-1/2 -translate-x-1/2 text-2xl sm:text-4xl lg:text-5xl"
                    >
                      👑
                    </motion.div>
                  )}
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 10,
                      delay: delay + 0.4,
                    }}
                    className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl block"
                  >
                    {medal}
                  </motion.span>
                </div>

                {/* Player name badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 15,
                    delay: delay + 0.5,
                  }}
                  whileHover={{ scale: 1.05 }}
                  className="px-2 py-1 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 rounded-full text-white font-bold shadow-lg mt-1 sm:mt-2 text-center"
                  style={{
                    backgroundColor: getPlayerColor(players, player.playerId),
                    boxShadow: `0 4px 20px ${getPlayerColor(players, player.playerId)}60`,
                  }}
                >
                  <span className="text-xs sm:text-sm md:text-lg lg:text-xl truncate max-w-[70px] sm:max-w-[100px] md:max-w-[120px] lg:max-w-[150px] block">
                    {player.playerName}
                  </span>
                </motion.div>

                {/* Score with pop animation */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 15,
                    delay: delay + 0.7,
                  }}
                  className="mt-1 sm:mt-2 font-bold text-purple-700"
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay + 0.8 }}
                    className="text-sm sm:text-lg md:text-2xl lg:text-3xl"
                  >
                    {player.score}
                  </motion.span>
                  <span className="text-xs sm:text-sm lg:text-base text-purple-500 ml-1">pts</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Podium block with rising animation */}
          <motion.div
            variants={podiumRiseVariants}
            initial="hidden"
            animate={showPodium ? 'visible' : 'hidden'}
            custom={height}
            transition={{ delay }}
            className={`w-16 sm:w-20 md:w-28 lg:w-32 ${bgClass} rounded-t-lg flex items-center justify-center shadow-lg overflow-hidden`}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.8, scale: 1 }}
              transition={{ delay: delay + 0.3 }}
              className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-white"
            >
              {position}
            </motion.span>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

function Leaderboard({ standings, winner, players, onPlayAgain }: LeaderboardProps) {
  // Animation states
  const [showTitle, setShowTitle] = useState(false);
  const [showPodium, setShowPodium] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStandings, setShowStandings] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [revealedRows, setRevealedRows] = useState(0);

  // High scores state
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
  const [showHighScores, setShowHighScores] = useState(false);
  const [newHighScoreCount, setNewHighScoreCount] = useState(0);

  // Save high scores and load on mount
  useEffect(() => {
    // Save game scores to localStorage
    if (standings.length > 0) {
      const savedCount = saveGameScores(standings);
      setNewHighScoreCount(savedCount);
    }

    // Load high scores
    setHighScores(getHighScores());
  }, [standings]);

  // Stagger animations on mount
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Title appears first
    timers.push(setTimeout(() => setShowTitle(true), 200));

    // Confetti starts early
    timers.push(setTimeout(() => setShowConfetti(true), 400));

    // Podium rises
    timers.push(setTimeout(() => setShowPodium(true), 600));

    // Full standings list
    timers.push(setTimeout(() => setShowStandings(true), 1500));

    // Play again button
    timers.push(setTimeout(() => setShowButton(true), 2500));

    // High scores section
    timers.push(setTimeout(() => setShowHighScores(true), 3000));

    return () => timers.forEach(clearTimeout);
  }, []);

  // Reveal standings rows one by one
  useEffect(() => {
    if (!showStandings) return;

    // Skip first 3 as they're on podium
    const remainingStandings = standings.slice(3);
    if (revealedRows >= remainingStandings.length) return;

    const timer = setTimeout(() => {
      setRevealedRows((prev) => prev + 1);
    }, 100);

    return () => clearTimeout(timer);
  }, [showStandings, revealedRows, standings]);

  const handlePlayAgain = useCallback(() => {
    if (onPlayAgain) {
      onPlayAgain();
    }
  }, [onPlayAgain]);

  // Standings below podium (4th place and beyond)
  const remainingStandings = standings.slice(3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex flex-col items-center justify-start min-h-[400px] sm:min-h-[500px] lg:min-h-[550px] py-2 sm:py-4"
    >
      {/* Confetti effect */}
      <Confetti active={showConfetti} />

      {/* Title with dramatic entrance */}
      <AnimatePresence>
        {showTitle && (
          <motion.h2
            initial={{ opacity: 0, y: -50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-purple-800 mb-1 sm:mb-2 text-center"
          >
            Final Results!
          </motion.h2>
        )}
      </AnimatePresence>

      {/* Winner announcement */}
      <AnimatePresence>
        {winner && showTitle && (
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="text-base sm:text-xl md:text-2xl lg:text-3xl text-purple-600 mb-4 sm:mb-8 font-semibold"
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              className="inline-block text-xl sm:text-2xl md:text-3xl lg:text-4xl"
            >
              🎉
            </motion.span>{' '}
            {winner.playerName} wins!{' '}
            <motion.span
              animate={{ rotate: [0, -15, 15, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              className="inline-block text-xl sm:text-2xl md:text-3xl lg:text-4xl"
            >
              🎉
            </motion.span>
          </motion.p>
        )}
      </AnimatePresence>

      {/* Podium for top 3 */}
      {standings.length > 0 && (
        <Podium standings={standings} players={players} showPodium={showPodium} />
      )}

      {/* Remaining standings (4th place and beyond) */}
      <AnimatePresence>
        {remainingStandings.length > 0 && showStandings && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mt-4"
          >
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-purple-700 mb-3 text-center"
            >
              Full Standings
            </motion.h3>

            <div className="space-y-2">
              {remainingStandings.map((entry, index) => {
                const position = index + 4;
                const playerColor = getPlayerColor(players, entry.playerId);
                const isRevealed = index < revealedRows;

                return (
                  <AnimatePresence key={entry.playerId}>
                    {isRevealed && (
                      <motion.div
                        initial={{ opacity: 0, x: -50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                          delay: index * 0.1,
                        }}
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-white shadow-md"
                      >
                        {/* Position and name */}
                        <div className="flex items-center gap-3">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.1 }}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
                          >
                            {position}
                          </motion.div>
                          <div className="flex items-center gap-2">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.1 + 0.15 }}
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: playerColor }}
                            />
                            <span className="font-semibold text-gray-800">
                              {entry.playerName}
                            </span>
                          </div>
                        </div>

                        {/* Score */}
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 15,
                            delay: index * 0.1 + 0.2,
                          }}
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-1 rounded-full text-white font-bold"
                          style={{ backgroundColor: playerColor }}
                        >
                          {entry.score} pts
                        </motion.div>
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
      {standings.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 py-8"
        >
          <p className="text-xl">No players to display</p>
        </motion.div>
      )}

      {/* Play Again button */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            onClick={handlePlayAgain}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 15,
            }}
            className="mt-4 sm:mt-8 px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg sm:text-xl lg:text-2xl font-bold shadow-lg hover:shadow-xl"
          >
            🎮 Play Again!
          </motion.button>
        )}
      </AnimatePresence>

      {/* High Scores Section */}
      <AnimatePresence>
        {highScores.length > 0 && showHighScores && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm sm:max-w-md lg:max-w-lg mt-4 sm:mt-8 mb-2 sm:mb-4 px-2"
          >
          <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
            <span className="text-xl sm:text-2xl lg:text-3xl">🏆</span>
            <h3 className="text-base sm:text-xl lg:text-2xl font-bold text-purple-800">All-Time High Scores</h3>
            <span className="text-xl sm:text-2xl lg:text-3xl">🏆</span>
          </div>

          {newHighScoreCount > 0 && (
            <p className="text-center text-pink-600 font-semibold mb-3 animate-pulse">
              {newHighScoreCount} new high score{newHighScoreCount > 1 ? 's' : ''}!
            </p>
          )}

          <div className="bg-white/80 rounded-2xl shadow-lg p-4 backdrop-blur-sm">
            <div className="space-y-2">
              {highScores.map((entry, index) => {
                const position = index + 1;
                const medal =
                  position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : null;
                const isNewScore =
                  standings.some(
                    (s) => s.playerName === entry.playerName && s.score === entry.score
                  );

                return (
                  <div
                    key={`${entry.playerName}-${entry.date}-${index}`}
                    className={`
                      flex items-center justify-between px-3 py-2 rounded-lg
                      ${isNewScore ? 'bg-yellow-100 border border-yellow-300' : 'bg-gray-50'}
                      ${position <= 3 ? 'font-semibold' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          w-7 h-7 rounded-full flex items-center justify-center text-sm
                          ${position <= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}
                        `}
                      >
                        {medal || position}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`
                            ${position <= 3 ? 'text-purple-800' : 'text-gray-700'}
                            ${isNewScore ? 'text-yellow-700' : ''}
                          `}
                        >
                          {entry.playerName}
                          {isNewScore && <span className="ml-2 text-xs text-yellow-600">NEW!</span>}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatScoreDate(entry.date)}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`
                        px-3 py-1 rounded-full text-sm font-bold
                        ${position <= 3
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                        }
                      `}
                    >
                      {entry.score} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Leaderboard;
