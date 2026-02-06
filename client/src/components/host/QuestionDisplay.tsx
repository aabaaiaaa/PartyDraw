/**
 * QuestionDisplay - Shows the current drawing question and timer on the host screen
 *
 * Displays during the drawing phase:
 * - Current round indicator
 * - Active theme badges (packs and genres)
 * - The drawing prompt/question prominently
 * - Large countdown timer with color changes as time runs low
 * - Submission progress (e.g., "3/5 players submitted")
 *
 * Uses horizontal layout to fit on landscape screens.
 */

import ThemeBadge from './ThemeBadge';
import { ThemeSettings } from '../../types/themes';

interface QuestionDisplayProps {
  question: string;
  timerSeconds: number | null;
  submittedCount: number;
  totalPlayers: number;
  round: number;
  totalRounds: number;
  skipVoteCount?: number;
  skipVoteThreshold?: number;
  /** Active theme settings to display as badges */
  themes?: ThemeSettings;
}

function getTimerColorClasses(seconds: number | null): { text: string; ring: string; bg: string } {
  if (seconds === null) return { text: 'text-gray-400', ring: 'ring-gray-300', bg: 'bg-gray-50' };
  if (seconds <= 5) return { text: 'text-red-500', ring: 'ring-red-400', bg: 'bg-red-50' };
  if (seconds <= 10) return { text: 'text-orange-500', ring: 'ring-orange-400', bg: 'bg-orange-50' };
  return { text: 'text-teal-500', ring: 'ring-teal-400', bg: 'bg-teal-50' };
}

function getProgressColor(submitted: number, total: number): string {
  if (total === 0) return 'bg-gray-300';
  const percentage = (submitted / total) * 100;
  if (percentage === 100) return 'bg-green-500';
  if (percentage >= 50) return 'bg-yellow-400';
  return 'bg-purple-500';
}

function QuestionDisplay({
  question,
  timerSeconds,
  submittedCount,
  totalPlayers,
  round,
  totalRounds,
  skipVoteCount = 0,
  skipVoteThreshold = 0,
  themes,
}: QuestionDisplayProps) {
  const timerColors = getTimerColorClasses(timerSeconds);
  const progressColor = getProgressColor(submittedCount, totalPlayers);
  const progressPercentage = totalPlayers > 0 ? (submittedCount / totalPlayers) * 100 : 0;
  const isLowTime = timerSeconds !== null && timerSeconds <= 5;
  const allSubmitted = submittedCount === totalPlayers && totalPlayers > 0;

  return (
    <div className="h-full flex flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 px-2">
      {/* Left side: Question */}
      <div className="flex-1 flex flex-col items-center justify-center text-center min-w-0">
        {/* Round indicator */}
        <span className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm lg:text-base font-semibold mb-2 sm:mb-3">
          Round {round} of {totalRounds}
        </span>

        {/* Theme badges - show active packs and genres */}
        {themes && (
          <div className="mb-2 sm:mb-3">
            <ThemeBadge
              packs={themes.partyPacks}
              genres={themes.genres}
              size="sm"
            />
          </div>
        )}

        {/* Question prompt */}
        <p className="text-sm sm:text-base lg:text-lg text-gray-500 mb-1">Draw:</p>
        <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-purple-800 tracking-tight leading-tight">
          {question || 'Loading...'}
        </h2>

        {/* Skip vote progress indicator */}
        {skipVoteCount > 0 && skipVoteThreshold > 0 && (
          <p className="text-xs sm:text-sm text-orange-500 mt-2 animate-pulse">
            Skip votes: {skipVoteCount}/{skipVoteThreshold} needed
          </p>
        )}
      </div>

      {/* Right side: Timer and Progress */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center">
        {/* Circular timer - sized to fit */}
        <div
          className={`
            relative flex items-center justify-center
            w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full
            ${timerColors.bg}
            ring-3 sm:ring-4 lg:ring-6 ${timerColors.ring}
            shadow-xl
            ${isLowTime ? 'animate-pulse' : ''}
          `}
        >
          <span
            className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-none ${timerColors.text}`}
            style={{ textShadow: isLowTime ? '0 0 30px currentColor' : 'none' }}
          >
            {timerSeconds !== null ? timerSeconds : '--'}
          </span>
          <span className="absolute bottom-2 sm:bottom-3 lg:bottom-4 text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500">
            seconds
          </span>
        </div>

        {/* Submission progress - compact */}
        <div className="mt-3 sm:mt-4 w-full max-w-[180px] sm:max-w-[220px]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-600">
              {allSubmitted ? (
                <span className="text-green-600">Done!</span>
              ) : (
                'Drawing...'
              )}
            </span>
            <span className="text-xs sm:text-sm lg:text-base font-bold text-purple-700">
              {submittedCount}/{totalPlayers}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full ${progressColor} transition-all duration-500 ease-out rounded-full`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Player dots */}
          <div className="flex justify-center gap-1 sm:gap-1.5 mt-2">
            {Array.from({ length: totalPlayers }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                  index < submittedCount ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Active player count for e2e testing */}
          <span data-testid="active-player-count" className="sr-only">
            Active players: {totalPlayers}
          </span>
        </div>
      </div>
    </div>
  );
}

export default QuestionDisplay;
