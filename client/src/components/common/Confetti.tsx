/**
 * Confetti - Celebratory confetti particle animation component
 *
 * Displays colorful confetti particles that fall from the top of the screen.
 * Used on the final leaderboard and round winner screens to celebrate victories.
 *
 * Features:
 * - Configurable number of particles
 * - Customizable color palette
 * - Variable particle sizes and fall speeds
 * - Staggered animation delays for natural effect
 * - Pure CSS animations for performance
 */

import { useEffect, useState } from 'react';

/** Individual confetti piece configuration */
interface ConfettiPiece {
  /** Unique identifier */
  id: number;
  /** Horizontal position (0-100%) */
  x: number;
  /** Color of the particle */
  color: string;
  /** Animation delay in seconds */
  delay: number;
  /** Animation duration in seconds */
  duration: number;
  /** Initial rotation angle in degrees */
  rotation: number;
  /** Size of the particle in pixels */
  size: number;
  /** Shape of the particle */
  shape: 'square' | 'rectangle' | 'circle';
}

interface ConfettiProps {
  /** Whether the confetti animation is active */
  active: boolean;
  /** Number of confetti pieces to generate (default: 100) */
  pieceCount?: number;
  /** Custom color palette (defaults to party colors) */
  colors?: string[];
  /** Minimum animation duration in seconds (default: 2) */
  minDuration?: number;
  /** Maximum animation duration in seconds (default: 4) */
  maxDuration?: number;
  /** Maximum animation delay in seconds (default: 2) */
  maxDelay?: number;
  /** Minimum particle size in pixels (default: 6) */
  minSize?: number;
  /** Maximum particle size in pixels (default: 14) */
  maxSize?: number;
  /** CSS z-index for the confetti container (default: 10) */
  zIndex?: number;
}

/** Default party color palette */
const DEFAULT_COLORS = [
  '#a855f7', // purple
  '#ec4899', // pink
  '#facc15', // yellow
  '#14b8a6', // teal
  '#f97316', // orange
  '#3b82f6', // blue
  '#22c55e', // green
  '#ef4444', // red
];

/** Available confetti shapes */
const SHAPES: Array<'square' | 'rectangle' | 'circle'> = ['square', 'rectangle', 'circle'];

/**
 * Get style object for a confetti piece based on its shape
 */
function getShapeStyle(shape: ConfettiPiece['shape'], size: number): React.CSSProperties {
  switch (shape) {
    case 'rectangle':
      return {
        width: `${size}px`,
        height: `${size * 0.4}px`,
        borderRadius: '1px',
      };
    case 'circle':
      return {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
      };
    case 'square':
    default:
      return {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '2px',
      };
  }
}

/**
 * Confetti component that renders falling confetti particles
 */
function Confetti({
  active,
  pieceCount = 100,
  colors = DEFAULT_COLORS,
  minDuration = 2,
  maxDuration = 4,
  maxDelay = 2,
  minSize = 6,
  maxSize = 14,
  zIndex = 10,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < pieceCount; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * maxDelay,
        duration: minDuration + Math.random() * (maxDuration - minDuration),
        rotation: Math.random() * 360,
        size: minSize + Math.random() * (maxSize - minSize),
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      });
    }
    setPieces(newPieces);
  }, [active, pieceCount, colors, minDuration, maxDuration, maxDelay, minSize, maxSize]);

  if (!active || pieces.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex }}
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece absolute"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            ...getShapeStyle(piece.shape, piece.size),
          }}
        />
      ))}
    </div>
  );
}

export default Confetti;
