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
 * Podium display for top 3 players
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
      height: 'h-24',
      delay: 'delay-300',
      medal: '🥈',
      bgClass: 'bg-gray-300',
      order: 'order-1',
    },
    {
      position: 1,
      player: first,
      height: 'h-36',
      delay: 'delay-500',
      medal: '🥇',
      bgClass: 'bg-yellow-400',
      order: 'order-2',
    },
    {
      position: 3,
      player: third,
      height: 'h-16',
      delay: 'delay-100',
      medal: '🥉',
      bgClass: 'bg-orange-400',
      order: 'order-3',
    },
  ];

  return (
    <div className="flex items-end justify-center gap-4 md:gap-6 mb-8">
      {podiumData.map(({ position, player, height, delay, medal, bgClass, order }) => (
        <div
          key={position}
          className={`flex flex-col items-center ${order}`}
        >
          {/* Player info */}
          {player && (
            <div
              className={`
                flex flex-col items-center mb-3
                transition-all duration-700 ease-out ${delay}
                ${showPodium ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}
              `}
            >
              {/* Medal and crown for winner */}
              <div className="relative">
                {position === 1 && (
                  <div
                    className={`
                      absolute -top-8 left-1/2 -translate-x-1/2
                      text-4xl
                      transition-all duration-500 ${delay}
                      ${showPodium ? 'opacity-100 scale-100 animate-bounce' : 'opacity-0 scale-0'}
                    `}
                    style={{ animationDuration: '1.5s', animationIterationCount: '3' }}
                  >
                    👑
                  </div>
                )}
                <span className="text-4xl md:text-5xl">{medal}</span>
              </div>

              {/* Player name badge */}
              <div
                className="px-4 py-2 rounded-full text-white font-bold shadow-lg mt-2 text-center"
                style={{
                  backgroundColor: getPlayerColor(players, player.playerId),
                  boxShadow: `0 4px 20px ${getPlayerColor(players, player.playerId)}60`,
                }}
              >
                <span className="text-sm md:text-lg truncate max-w-[100px] md:max-w-[120px] block">
                  {player.playerName}
                </span>
              </div>

              {/* Score */}
              <div
                className={`
                  mt-2 font-bold text-purple-700
                  transition-all duration-500 delay-700
                  ${showPodium ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
                `}
              >
                <span className="text-lg md:text-2xl">{player.score}</span>
                <span className="text-xs md:text-sm text-purple-500 ml-1">pts</span>
              </div>
            </div>
          )}

          {/* Podium block */}
          <div
            className={`
              w-20 md:w-28 ${height} ${bgClass} rounded-t-lg
              flex items-center justify-center
              shadow-lg
              transition-all duration-700 ease-out ${delay}
              ${showPodium ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}
              podium-rise
            `}
            style={{ transitionDelay: position === 1 ? '500ms' : position === 2 ? '300ms' : '100ms' }}
          >
            <span className="text-2xl md:text-4xl font-black text-white/80">{position}</span>
          </div>
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
    <div className="relative flex flex-col items-center justify-start min-h-[500px] py-4">
      {/* Confetti effect */}
      <Confetti active={showConfetti} />

      {/* Title */}
      <h2
        className={`
          text-4xl md:text-6xl font-black text-purple-800 mb-2
          text-center
          transition-all duration-700
          ${showTitle ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-8 scale-90'}
        `}
      >
        Final Results!
      </h2>

      {/* Winner announcement */}
      {winner && (
        <p
          className={`
            text-xl md:text-2xl text-purple-600 mb-8 font-semibold
            transition-all duration-500 delay-300
            ${showTitle ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <span className="text-2xl md:text-3xl">🎉</span> {winner.playerName} wins!{' '}
          <span className="text-2xl md:text-3xl">🎉</span>
        </p>
      )}

      {/* Podium for top 3 */}
      {standings.length > 0 && (
        <Podium standings={standings} players={players} showPodium={showPodium} />
      )}

      {/* Remaining standings (4th place and beyond) */}
      {remainingStandings.length > 0 && (
        <div
          className={`
            w-full max-w-md mt-4
            transition-all duration-500
            ${showStandings ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <h3 className="text-lg font-bold text-purple-700 mb-3 text-center">
            Full Standings
          </h3>

          <div className="space-y-2">
            {remainingStandings.map((entry, index) => {
              const position = index + 4;
              const playerColor = getPlayerColor(players, entry.playerId);
              const isRevealed = index < revealedRows;

              return (
                <div
                  key={entry.playerId}
                  className={`
                    flex items-center justify-between
                    px-4 py-3 rounded-xl bg-white shadow-md
                    transition-all duration-300
                    ${isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
                  `}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Position and name */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                      {position}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: playerColor }}
                      />
                      <span className="font-semibold text-gray-800">
                        {entry.playerName}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div
                    className="px-3 py-1 rounded-full text-white font-bold"
                    style={{ backgroundColor: playerColor }}
                  >
                    {entry.score} pts
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {standings.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p className="text-xl">No players to display</p>
        </div>
      )}

      {/* Play Again button */}
      <button
        onClick={handlePlayAgain}
        className={`
          mt-8 px-8 py-4 rounded-full
          bg-gradient-to-r from-purple-600 to-pink-600
          text-white text-xl font-bold
          shadow-lg hover:shadow-xl
          transform hover:scale-105
          transition-all duration-300
          ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        🎮 Play Again!
      </button>

      {/* High Scores Section */}
      {highScores.length > 0 && (
        <div
          className={`
            w-full max-w-md mt-8 mb-4
            transition-all duration-500
            ${showHighScores ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🏆</span>
            <h3 className="text-xl font-bold text-purple-800">All-Time High Scores</h3>
            <span className="text-2xl">🏆</span>
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
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
