/**
 * Leaderboard - Final standings display with podium and celebration effects
 *
 * Shows on the host screen after all rounds are complete:
 * - Podium animation for top 3 players (1st, 2nd, 3rd)
 * - Confetti particle celebration effect
 * - Full score standings list
 * - "Play Again" button to restart game
 *
 * Uses horizontal layout to fit everything on landscape screens without scrolling.
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
import Confetti from '../common/Confetti';

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
 * Compact Podium display for horizontal layout
 */
function CompactPodium({
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
    { position: 2, player: second, height: 60, delay: 0.3, medal: '🥈', bgClass: 'bg-gray-300', order: 'order-1' },
    { position: 1, player: first, height: 90, delay: 0.5, medal: '🥇', bgClass: 'bg-yellow-400', order: 'order-2' },
    { position: 3, player: third, height: 40, delay: 0.1, medal: '🥉', bgClass: 'bg-orange-400', order: 'order-3' },
  ];

  const podiumRiseVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: (height: number) => ({
      height,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15, mass: 1 },
    }),
  };

  const playerInfoVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 200, damping: 15 },
    },
  };

  return (
    <div className="flex items-end justify-center gap-1 sm:gap-2 lg:gap-3">
      {podiumData.map(({ position, player, height, delay, medal, bgClass, order }) => (
        <div key={position} className={`flex flex-col items-center ${order}`}>
          <AnimatePresence>
            {player && showPodium && (
              <motion.div
                variants={playerInfoVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: delay + 0.3 }}
                className="flex flex-col items-center mb-1"
              >
                {position === 1 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, y: [0, -5, 0] }}
                    transition={{ delay: delay + 0.5, y: { repeat: Infinity, duration: 1 } }}
                    className="text-lg sm:text-2xl lg:text-3xl"
                  >
                    👑
                  </motion.div>
                )}
                <span className="text-lg sm:text-2xl lg:text-3xl">{medal}</span>
                <motion.div
                  className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-white font-bold shadow-md text-center"
                  style={{ backgroundColor: getPlayerColor(players, player.playerId) }}
                >
                  <span className="text-[10px] sm:text-xs lg:text-sm truncate max-w-[50px] sm:max-w-[80px] lg:max-w-[100px] block">
                    {player.playerName}
                  </span>
                </motion.div>
                <span className="text-xs sm:text-sm lg:text-base font-bold text-purple-700 mt-0.5">
                  {player.score} pts
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            variants={podiumRiseVariants}
            initial="hidden"
            animate={showPodium ? 'visible' : 'hidden'}
            custom={height}
            transition={{ delay }}
            className={`w-12 sm:w-16 lg:w-20 ${bgClass} rounded-t-lg flex items-center justify-center shadow-lg`}
          >
            <span className="text-lg sm:text-xl lg:text-2xl font-black text-white/80">{position}</span>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

function Leaderboard({ standings, winner, players, onPlayAgain }: LeaderboardProps) {
  const [showTitle, setShowTitle] = useState(false);
  const [showPodium, setShowPodium] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStandings, setShowStandings] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [revealedRows, setRevealedRows] = useState(0);

  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
  const [showHighScores, setShowHighScores] = useState(false);
  const [newHighScoreCount, setNewHighScoreCount] = useState(0);

  useEffect(() => {
    if (standings.length > 0) {
      const savedCount = saveGameScores(standings);
      setNewHighScoreCount(savedCount);
    }
    setHighScores(getHighScores());
  }, [standings]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setShowTitle(true), 200));
    timers.push(setTimeout(() => setShowConfetti(true), 400));
    timers.push(setTimeout(() => setShowPodium(true), 600));
    timers.push(setTimeout(() => setShowStandings(true), 1200));
    timers.push(setTimeout(() => setShowButton(true), 1800));
    timers.push(setTimeout(() => setShowHighScores(true), 2200));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!showStandings) return;
    const remainingStandings = standings.slice(3);
    if (revealedRows >= remainingStandings.length) return;
    const timer = setTimeout(() => setRevealedRows((prev) => prev + 1), 80);
    return () => clearTimeout(timer);
  }, [showStandings, revealedRows, standings]);

  const handlePlayAgain = useCallback(() => {
    if (onPlayAgain) onPlayAgain();
  }, [onPlayAgain]);

  const remainingStandings = standings.slice(3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-full flex flex-col overflow-hidden"
    >
      <Confetti active={showConfetti} />

      {/* Title Row - Compact */}
      <div className="flex-shrink-0 text-center mb-2 sm:mb-3">
        <AnimatePresence>
          {showTitle && (
            <motion.h2
              initial={{ opacity: 0, y: -30, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-purple-800"
            >
              🎉 {winner?.playerName || 'Game'} Wins! 🎉
            </motion.h2>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content - Horizontal Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 min-h-0 overflow-hidden">
        {/* Left: Podium + Play Again */}
        <div className="lg:w-2/5 flex flex-col items-center justify-center flex-shrink-0">
          {standings.length > 0 && (
            <CompactPodium standings={standings} players={players} showPodium={showPodium} />
          )}

          <AnimatePresence>
            {showButton && (
              <motion.button
                onClick={handlePlayAgain}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-3 sm:mt-4 px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm sm:text-lg lg:text-xl font-bold shadow-lg"
              >
                🎮 Play Again!
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Standings + High Scores - Scrollable */}
        <div className="lg:w-3/5 flex flex-col lg:flex-row gap-3 min-h-0 overflow-hidden">
          {/* Current Game Standings (4th+) */}
          <AnimatePresence>
            {remainingStandings.length > 0 && showStandings && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 min-h-0 flex flex-col"
              >
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-purple-700 mb-1 sm:mb-2 flex-shrink-0">
                  Full Standings
                </h3>
                <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1">
                  {remainingStandings.map((entry, index) => {
                    const position = index + 4;
                    const playerColor = getPlayerColor(players, entry.playerId);
                    const isRevealed = index < revealedRows;
                    return (
                      <AnimatePresence key={entry.playerId}>
                        {isRevealed && (
                          <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-white shadow-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs sm:text-sm">
                                {position}
                              </span>
                              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: playerColor }} />
                              <span className="font-medium text-gray-800 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[100px]">
                                {entry.playerName}
                              </span>
                            </div>
                            <span
                              className="px-2 py-0.5 rounded-full text-white font-bold text-xs sm:text-sm"
                              style={{ backgroundColor: playerColor }}
                            >
                              {entry.score}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* High Scores */}
          <AnimatePresence>
            {highScores.length > 0 && showHighScores && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 min-h-0 flex flex-col"
              >
                <div className="flex items-center gap-1 mb-1 sm:mb-2 flex-shrink-0">
                  <span className="text-base sm:text-lg">🏆</span>
                  <h3 className="text-sm sm:text-base lg:text-lg font-bold text-purple-800">High Scores</h3>
                </div>
                {newHighScoreCount > 0 && (
                  <p className="text-xs text-pink-600 font-semibold mb-1 animate-pulse flex-shrink-0">
                    {newHighScoreCount} new!
                  </p>
                )}
                <div className="flex-1 min-h-0 overflow-y-auto bg-white/60 rounded-lg p-2 space-y-1">
                  {highScores.slice(0, 10).map((entry, index) => {
                    const position = index + 1;
                    const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : null;
                    const isNewScore = standings.some(
                      (s) => s.playerName === entry.playerName && s.score === entry.score
                    );
                    return (
                      <div
                        key={`${entry.playerName}-${entry.date}-${index}`}
                        className={`flex items-center justify-between px-2 py-1 rounded text-xs sm:text-sm ${
                          isNewScore ? 'bg-yellow-100 border border-yellow-300' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${
                            position <= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {medal || position}
                          </span>
                          <div className="flex flex-col">
                            <span className={`font-medium ${isNewScore ? 'text-yellow-700' : position <= 3 ? 'text-purple-800' : 'text-gray-700'}`}>
                              {entry.playerName}
                              {isNewScore && <span className="ml-1 text-[10px] text-yellow-600">NEW</span>}
                            </span>
                            <span className="text-[10px] text-gray-400">{formatScoreDate(entry.date)}</span>
                          </div>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold ${
                          position <= 3 ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {entry.score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Empty state */}
      {standings.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p className="text-xl">No players to display</p>
        </div>
      )}
    </motion.div>
  );
}

export default Leaderboard;
