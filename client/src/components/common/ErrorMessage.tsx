/**
 * ErrorMessage - Friendly error message display component
 *
 * Provides user-friendly error messages for common error scenarios:
 * - Room not found
 * - Room full
 * - Connection lost
 * - Generic errors
 *
 * Features animated appearance and dismissible design.
 */

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorMessageProps {
  /** The error message or error code */
  error: string | null;
  /** Callback to dismiss the error */
  onDismiss?: () => void;
  /** Whether the error can be dismissed (default: true) */
  dismissible?: boolean;
}

interface ErrorConfig {
  title: string;
  message: string;
  icon: 'not-found' | 'full' | 'connection' | 'generic';
}

/**
 * Maps error messages/codes to user-friendly messages
 */
function getErrorConfig(error: string): ErrorConfig {
  const lowerError = error.toLowerCase();

  // Room not found
  if (
    lowerError.includes('room not found') ||
    lowerError.includes('invalid room') ||
    lowerError.includes('no room') ||
    lowerError.includes('does not exist')
  ) {
    return {
      title: 'Room Not Found',
      message: 'This room code doesn\'t exist. Please check the code and try again.',
      icon: 'not-found',
    };
  }

  // Room full
  if (
    lowerError.includes('room full') ||
    lowerError.includes('room is full') ||
    lowerError.includes('maximum players') ||
    lowerError.includes('max players')
  ) {
    return {
      title: 'Room is Full',
      message: 'This room has reached the maximum number of players. Try another room.',
      icon: 'full',
    };
  }

  // Connection errors
  if (
    lowerError.includes('connection') ||
    lowerError.includes('network') ||
    lowerError.includes('disconnected') ||
    lowerError.includes('timeout') ||
    lowerError.includes('not connected')
  ) {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      icon: 'connection',
    };
  }

  // Game in progress
  if (
    lowerError.includes('game in progress') ||
    lowerError.includes('already started') ||
    lowerError.includes('game has started')
  ) {
    return {
      title: 'Game In Progress',
      message: 'This game has already started. You can join the next round.',
      icon: 'generic',
    };
  }

  // Room closed
  if (
    lowerError.includes('room closed') ||
    lowerError.includes('host left') ||
    lowerError.includes('host disconnected')
  ) {
    return {
      title: 'Room Closed',
      message: 'The host has closed this room. Please join another game.',
      icon: 'not-found',
    };
  }

  // Generic error - use the original message
  return {
    title: 'Oops!',
    message: error,
    icon: 'generic',
  };
}

const icons = {
  'not-found': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  full: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  connection: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a5 5 0 01-7.072-7.072m7.072 7.072l-2.829-2.829M3 3l18 18"
      />
    </svg>
  ),
  generic: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
};

function ErrorMessage({ error, onDismiss, dismissible = true }: ErrorMessageProps) {
  const config = useMemo(() => (error ? getErrorConfig(error) : null), [error]);

  return (
    <AnimatePresence>
      {error && config && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4"
          role="alert"
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 text-red-500">
              {icons[config.icon]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-red-800">
                {config.title}
              </h3>
              <p className="text-xs sm:text-sm text-red-600 mt-0.5">
                {config.message}
              </p>
            </div>

            {/* Dismiss button */}
            {dismissible && onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors p-1 -m-1"
                aria-label="Dismiss error"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ErrorMessage;
