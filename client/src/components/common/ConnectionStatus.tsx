/**
 * ConnectionStatus - Visual indicator for WebSocket connection state
 *
 * Shows a small, unobtrusive indicator in the corner of the screen
 * displaying the current connection status:
 * - Connected: Green dot (hidden by default, shown briefly on connect)
 * - Connecting: Yellow pulsing dot with "Connecting..." text
 * - Reconnecting: Orange pulsing dot with "Reconnecting..." text
 * - Disconnected: Red dot with "Disconnected" text
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectionState } from '../../core/socket';

interface ConnectionStatusProps {
  /** Current connection state */
  connectionState: ConnectionState;
  /** Whether to show the indicator when connected (default: false, hides after brief show) */
  alwaysShowWhenConnected?: boolean;
  /** Position of the indicator */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const statusConfig: Record<ConnectionState, { color: string; bgColor: string; text: string; pulse: boolean }> = {
  connected: {
    color: 'bg-green-500',
    bgColor: 'bg-green-100',
    text: 'Connected',
    pulse: false,
  },
  connecting: {
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-100',
    text: 'Connecting...',
    pulse: true,
  },
  reconnecting: {
    color: 'bg-orange-500',
    bgColor: 'bg-orange-100',
    text: 'Reconnecting...',
    pulse: true,
  },
  disconnected: {
    color: 'bg-red-500',
    bgColor: 'bg-red-100',
    text: 'Disconnected',
    pulse: false,
  },
};

const positionClasses: Record<string, string> = {
  'top-left': 'top-2 left-2',
  'top-right': 'top-2 right-2',
  'bottom-left': 'bottom-2 left-2',
  'bottom-right': 'bottom-2 right-2',
};

function ConnectionStatus({
  connectionState,
  alwaysShowWhenConnected = false,
  position = 'top-right',
}: ConnectionStatusProps) {
  const [showConnected, setShowConnected] = useState(false);
  const [wasDisconnected, setWasDisconnected] = useState(false);

  // Track when we transition from disconnected/reconnecting to connected
  useEffect(() => {
    if (connectionState === 'disconnected' || connectionState === 'reconnecting') {
      setWasDisconnected(true);
    }

    if (connectionState === 'connected' && wasDisconnected) {
      setShowConnected(true);
      setWasDisconnected(false);
      // Hide the "Connected" indicator after 2 seconds
      const timer = setTimeout(() => {
        setShowConnected(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [connectionState, wasDisconnected]);

  const config = statusConfig[connectionState];

  // Determine if we should show the indicator
  const shouldShow =
    connectionState !== 'connected' ||
    alwaysShowWhenConnected ||
    showConnected;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className={`fixed ${positionClasses[position]} z-50`}
        >
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg ${config.bgColor} backdrop-blur-sm`}
          >
            {/* Status dot */}
            <div className="relative">
              <div
                className={`w-2.5 h-2.5 rounded-full ${config.color}`}
              />
              {config.pulse && (
                <div
                  className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${config.color} animate-ping opacity-75`}
                />
              )}
            </div>

            {/* Status text */}
            <span className="text-xs font-medium text-gray-700">
              {config.text}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ConnectionStatus;
