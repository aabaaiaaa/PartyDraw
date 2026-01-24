/**
 * QuestionDisplay - Shows the current drawing question and timer on the host screen
 *
 * Displays during the drawing phase:
 * - Current round indicator
 * - The drawing prompt/question prominently
 * - Large countdown timer with color changes as time runs low
 * - Submission progress (e.g., "3/5 players submitted")
 */

interface QuestionDisplayProps {
  /** The current drawing question/prompt */
  question: string;
  /** Seconds remaining in the drawing phase */
  timerSeconds: number | null;
  /** Number of players who have submitted their drawing */
  submittedCount: number;
  /** Total number of players in the game */
  totalPlayers: number;
  /** Current round number */
  round: number;
  /** Total number of rounds */
  totalRounds: number;
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
 * Returns progress bar color based on completion percentage
 */
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
}: QuestionDisplayProps) {
  const timerColors = getTimerColorClasses(timerSeconds);
  const progressColor = getProgressColor(submittedCount, totalPlayers);
  const progressPercentage = totalPlayers > 0 ? (submittedCount / totalPlayers) * 100 : 0;
  const isLowTime = timerSeconds !== null && timerSeconds <= 5;
  const allSubmitted = submittedCount === totalPlayers && totalPlayers > 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-8">
      {/* Round indicator */}
      <div className="mb-4">
        <span className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-lg font-semibold">
          Round {round} of {totalRounds}
        </span>
      </div>

      {/* Question prompt */}
      <div className="text-center mb-8">
        <p className="text-xl text-gray-500 mb-2">Draw:</p>
        <h2 className="text-5xl md:text-6xl font-black text-purple-800 tracking-tight">
          {question || 'Loading...'}
        </h2>
      </div>

      {/* Large circular timer */}
      <div
        className={`
          relative flex items-center justify-center
          w-48 h-48 md:w-56 md:h-56 rounded-full
          ${timerColors.bg}
          ring-8 ${timerColors.ring}
          shadow-xl
          transition-all duration-300
          ${isLowTime ? 'animate-pulse' : ''}
        `}
      >
        <span
          className={`
            text-7xl md:text-8xl font-black leading-none
            ${timerColors.text}
            transition-colors duration-300
          `}
          style={{
            textShadow: isLowTime ? '0 0 30px currentColor' : 'none',
          }}
        >
          {timerSeconds !== null ? timerSeconds : '--'}
        </span>

        {/* Seconds label */}
        <span className="absolute bottom-4 text-sm font-medium text-gray-500">
          seconds
        </span>
      </div>

      {/* Submission progress */}
      <div className="mt-8 w-full max-w-md">
        {/* Progress text */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-medium text-gray-600">
            {allSubmitted ? (
              <span className="text-green-600">All drawings submitted!</span>
            ) : (
              'Players drawing...'
            )}
          </span>
          <span className="text-xl font-bold text-purple-700">
            {submittedCount} / {totalPlayers}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full ${progressColor} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Individual player indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPlayers }).map((_, index) => (
            <div
              key={index}
              className={`
                w-4 h-4 rounded-full transition-all duration-300
                ${index < submittedCount
                  ? 'bg-green-500 scale-100'
                  : 'bg-gray-300 scale-90'}
              `}
              title={index < submittedCount ? 'Submitted' : 'Drawing...'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuestionDisplay;
