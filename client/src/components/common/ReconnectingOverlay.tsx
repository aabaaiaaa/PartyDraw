/**
 * ReconnectingOverlay - Full-screen overlay shown when connection is lost
 *
 * Features:
 * - Semi-transparent dark overlay that blocks interaction
 * - Animated spinner/icon during reconnection attempts
 * - "Reconnecting..." message with attempt count
 * - Manual retry button after connection fails
 * - Clean dismiss when connection is restored
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectionState } from '../../core/socket';

interface ReconnectingOverlayProps {
  /** Current connection state */
  connectionState: ConnectionState;
  /** Callback to manually retry connection */
  onRetry: () => void;
  /** Number of reconnection attempts (optional, for display) */
  reconnectAttempts?: number;
  /** Maximum attempts before showing retry button (default: 5) */
  maxAutoAttempts?: number;
}

function ReconnectingOverlay({
  connectionState,
  onRetry,
  reconnectAttempts = 0,
  maxAutoAttempts = 5,
}: ReconnectingOverlayProps) {
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [localAttempts, setLocalAttempts] = useState(0);

  // Track reconnection attempts locally if not provided
  useEffect(() => {
    if (connectionState === 'reconnecting') {
      setLocalAttempts((prev) => prev + 1);
    } else if (connectionState === 'connected') {
      setLocalAttempts(0);
      setShowRetryButton(false);
    }
  }, [connectionState]);

  // Show retry button after max attempts or on disconnected state
  useEffect(() => {
    const attempts = reconnectAttempts || localAttempts;
    if (connectionState === 'disconnected' || attempts >= maxAutoAttempts) {
      setShowRetryButton(true);
    }
  }, [connectionState, reconnectAttempts, localAttempts, maxAutoAttempts]);

  const handleRetry = useCallback(() => {
    setShowRetryButton(false);
    setLocalAttempts(0);
    onRetry();
  }, [onRetry]);

  // Only show overlay for reconnecting or disconnected states
  const shouldShow = connectionState === 'reconnecting' || connectionState === 'disconnected';

  const attempts = reconnectAttempts || localAttempts;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full mx-4 text-center"
          >
            {/* Icon/Animation */}
            {connectionState === 'reconnecting' && !showRetryButton ? (
              <div className="mb-4">
                {/* Animated connection icon */}
                <div className="relative w-16 h-16 mx-auto">
                  {/* Outer spinning ring */}
                  <div className="absolute inset-0 border-4 border-orange-200 rounded-full" />
                  <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin" />

                  {/* Center WiFi-like icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                {/* Disconnected icon */}
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a5 5 0 01-7.072-7.072m7.072 7.072l-2.829-2.829M3 3l18 18"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {connectionState === 'disconnected' || showRetryButton
                ? 'Connection Lost'
                : 'Reconnecting...'}
            </h2>

            {/* Message */}
            <p className="text-gray-600 mb-4">
              {connectionState === 'disconnected' || showRetryButton ? (
                <>Unable to connect to the server. Please check your internet connection.</>
              ) : (
                <>
                  Trying to restore your connection
                  {attempts > 0 && (
                    <span className="text-gray-400 block text-sm mt-1">
                      Attempt {attempts}...
                    </span>
                  )}
                </>
              )}
            </p>

            {/* Retry button */}
            {showRetryButton && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleRetry}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Retry Connection
              </motion.button>
            )}

            {/* Auto-reconnecting indicator */}
            {!showRetryButton && connectionState === 'reconnecting' && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Auto-reconnecting</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ReconnectingOverlay;
