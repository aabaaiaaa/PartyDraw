/**
 * Countdown - Animated countdown display for the host screen
 *
 * Displays an animated 3-2-1-GO! countdown sequence with:
 * - Large numbers that pulse and scale
 * - Color transitions for each step
 * - Optional sound effect hooks for audio integration (TASK-049)
 */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownProps {
  /** Current countdown value (3, 2, 1, 0) where 0 = GO! */
  count: number | null;
  /** Optional callback when countdown transitions */
  onTick?: (value: number) => void;
  /** Optional callback when countdown completes (shows GO!) */
  onComplete?: () => void;
}

/**
 * Returns the display text for the countdown value
 */
function getDisplayText(count: number | null): string {
  if (count === null) return '';
  if (count === 0) return 'GO!';
  return count.toString();
}

/**
 * Returns the color scheme for each countdown step
 */
function getColorScheme(count: number | null): {
  text: string;
  glow: string;
  ring: string;
} {
  switch (count) {
    case 3:
      return {
        text: 'text-red-500',
        glow: 'shadow-red-500/50',
        ring: 'ring-red-400',
      };
    case 2:
      return {
        text: 'text-yellow-400',
        glow: 'shadow-yellow-400/50',
        ring: 'ring-yellow-300',
      };
    case 1:
      return {
        text: 'text-green-400',
        glow: 'shadow-green-400/50',
        ring: 'ring-green-300',
      };
    case 0:
      return {
        text: 'text-purple-500',
        glow: 'shadow-purple-500/50',
        ring: 'ring-purple-400',
      };
    default:
      return {
        text: 'text-purple-600',
        glow: 'shadow-purple-500/50',
        ring: 'ring-purple-400',
      };
  }
}

/**
 * Countdown component with pulsing animation
 */
function Countdown({ count, onTick, onComplete }: CountdownProps) {
  const [animationKey, setAnimationKey] = useState(0);
  const previousCount = useRef<number | null>(null);

  // Trigger animation and callbacks when count changes
  useEffect(() => {
    if (count !== previousCount.current) {
      // Reset animation by changing key
      setAnimationKey((k) => k + 1);

      // Fire callbacks
      if (count !== null) {
        onTick?.(count);
        if (count === 0) {
          onComplete?.();
        }
      }

      previousCount.current = count;
    }
  }, [count, onTick, onComplete]);

  // Don't render if count is null
  if (count === null) {
    return null;
  }

  const displayText = getDisplayText(count);
  const colors = getColorScheme(count);

  // Animation variants for the countdown number
  const numberVariants = {
    initial: {
      scale: 0,
      rotate: -20,
      opacity: 0,
    },
    animate: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 15,
      },
    },
    exit: {
      scale: 2,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Animation variants for the container ring
  const containerVariants = {
    initial: {
      scale: 0.5,
      opacity: 0,
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 20,
      },
    },
  };

  // Pulse animation for the container
  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
  };

  // Expanding ring animation
  const ringVariants = {
    initial: {
      scale: 1,
      opacity: 0.6,
    },
    animate: {
      scale: 1.8,
      opacity: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      {/* "Get Ready!" header */}
      <motion.p
        key={`header-${count}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-purple-700 mb-8"
      >
        <motion.span
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {count > 0 ? 'Get Ready!' : 'Draw!'}
        </motion.span>
      </motion.p>

      {/* Main countdown container with pulse effect */}
      <motion.div
        key={`container-${animationKey}`}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="relative"
      >
        <motion.div
          variants={pulseVariants}
          animate="animate"
          className={`
            relative flex items-center justify-center
            w-64 h-64 rounded-full
            bg-white/50 backdrop-blur-sm
            ring-8 ${colors.ring}
            shadow-2xl ${colors.glow}
          `}
        >
          {/* Animated number */}
          <AnimatePresence mode="wait">
            <motion.span
              key={`number-${count}`}
              variants={numberVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`
                text-[10rem] font-black leading-none
                ${colors.text}
                drop-shadow-lg
              `}
              style={{
                textShadow: `0 0 60px currentColor, 0 0 100px currentColor`,
              }}
            >
              {displayText}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Decorative animated rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            key={`ring1-${animationKey}`}
            variants={ringVariants}
            initial="initial"
            animate="animate"
            className={`
              absolute w-72 h-72 rounded-full
              border-4 ${colors.ring.replace('ring-', 'border-')}
            `}
          />
          <motion.div
            key={`ring2-${animationKey}`}
            variants={ringVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.15 }}
            className={`
              absolute w-72 h-72 rounded-full
              border-4 ${colors.ring.replace('ring-', 'border-')}
            `}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default Countdown;
