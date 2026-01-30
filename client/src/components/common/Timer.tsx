/**
 * Timer - Circular countdown timer component
 *
 * Features:
 * - Circular SVG progress ring that depletes as time runs out
 * - Color transitions: teal (normal) -> orange (warning) -> red (critical)
 * - Pulsing animation when time is low
 * - Responsive sizing
 * - Optional "seconds" label
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';

type TimerSize = 'sm' | 'md' | 'lg' | 'xl';

interface TimerProps {
  /** Seconds remaining */
  seconds: number | null;
  /** Total seconds for the timer (used to calculate progress) */
  totalSeconds?: number;
  /** Size of the timer */
  size?: TimerSize;
  /** Whether to show the "seconds" label */
  showLabel?: boolean;
  /** Custom class name */
  className?: string;
}

interface TimerColors {
  text: string;
  ring: string;
  bg: string;
  stroke: string;
}

const sizeConfig: Record<TimerSize, { container: string; text: string; label: string; strokeWidth: number; radius: number }> = {
  sm: {
    container: 'w-16 h-16',
    text: 'text-xl',
    label: 'text-[8px]',
    strokeWidth: 4,
    radius: 28,
  },
  md: {
    container: 'w-24 h-24 sm:w-28 sm:h-28',
    text: 'text-2xl sm:text-3xl',
    label: 'text-[9px] sm:text-[10px]',
    strokeWidth: 5,
    radius: 42,
  },
  lg: {
    container: 'w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48',
    text: 'text-4xl sm:text-5xl md:text-6xl',
    label: 'text-xs sm:text-sm',
    strokeWidth: 6,
    radius: 60,
  },
  xl: {
    container: 'w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64',
    text: 'text-5xl sm:text-7xl md:text-8xl lg:text-9xl',
    label: 'text-xs sm:text-sm lg:text-base',
    strokeWidth: 8,
    radius: 80,
  },
};

/**
 * Returns timer colors based on time remaining
 */
function getTimerColors(seconds: number | null): TimerColors {
  if (seconds === null) {
    return {
      text: 'text-gray-400',
      ring: 'ring-gray-300',
      bg: 'bg-gray-50',
      stroke: '#d1d5db',
    };
  }

  if (seconds <= 5) {
    return {
      text: 'text-red-500',
      ring: 'ring-red-400',
      bg: 'bg-red-50',
      stroke: '#f87171',
    };
  }

  if (seconds <= 10) {
    return {
      text: 'text-orange-500',
      ring: 'ring-orange-400',
      bg: 'bg-orange-50',
      stroke: '#fb923c',
    };
  }

  return {
    text: 'text-teal-500',
    ring: 'ring-teal-400',
    bg: 'bg-teal-50',
    stroke: '#2dd4bf',
  };
}

function Timer({
  seconds,
  totalSeconds,
  size = 'lg',
  showLabel = true,
  className = '',
}: TimerProps) {
  const colors = getTimerColors(seconds);
  const config = sizeConfig[size];
  const isLowTime = seconds !== null && seconds <= 5;

  // Calculate SVG progress
  const progress = useMemo(() => {
    if (seconds === null || !totalSeconds || totalSeconds <= 0) {
      return 1;
    }
    return Math.max(0, Math.min(1, seconds / totalSeconds));
  }, [seconds, totalSeconds]);

  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference * (1 - progress);

  // SVG viewBox based on radius + padding for stroke
  const viewBoxSize = (config.radius + config.strokeWidth) * 2;

  return (
    <div
      className={`
        relative flex items-center justify-center
        ${config.container}
        rounded-full
        ${colors.bg}
        ring-4 sm:ring-6 lg:ring-8 ${colors.ring}
        shadow-xl
        transition-all duration-300
        ${isLowTime ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {/* SVG Progress Ring */}
      {totalSeconds && (
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        >
          {/* Background track */}
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={config.radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={config.strokeWidth}
          />
          {/* Progress arc */}
          <motion.circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={config.radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.3, ease: 'linear' }}
          />
        </svg>
      )}

      {/* Timer text */}
      <span
        className={`
          ${config.text} font-black leading-none
          ${colors.text}
          transition-colors duration-300
          z-10
        `}
        style={{
          textShadow: isLowTime ? '0 0 20px currentColor' : 'none',
        }}
      >
        {seconds !== null ? seconds : '--'}
      </span>

      {/* Seconds label */}
      {showLabel && (
        <span className={`absolute bottom-2 sm:bottom-3 lg:bottom-4 ${config.label} font-medium text-gray-500 z-10`}>
          seconds
        </span>
      )}
    </div>
  );
}

export default Timer;
