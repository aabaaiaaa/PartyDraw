/**
 * LandingScreen - Entry point for users without URL parameters
 *
 * Provides two options:
 * - "Create Room" - Start hosting a game (shows HostScreen)
 * - "Join Room" - Join an existing game (shows PlayerScreen/JoinScreen)
 *
 * Features auto-create countdown: if no user interaction occurs within 10 seconds,
 * automatically creates a room (useful for non-interactive displays like TVs).
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

/** Auto-create countdown duration in seconds */
const AUTO_CREATE_COUNTDOWN_SECONDS = 10;

interface LandingScreenProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

function LandingScreen({ onCreateRoom, onJoinRoom }: LandingScreenProps) {
  const [countdown, setCountdown] = useState<number>(AUTO_CREATE_COUNTDOWN_SECONDS);
  const [countdownActive, setCountdownActive] = useState(true);

  // Stop countdown and proceed with action
  const handleCreateRoom = useCallback(() => {
    setCountdownActive(false);
    onCreateRoom();
  }, [onCreateRoom]);

  const handleJoinRoom = useCallback(() => {
    setCountdownActive(false);
    onJoinRoom();
  }, [onJoinRoom]);

  // Countdown timer effect
  useEffect(() => {
    if (!countdownActive) return;

    // Auto-create when countdown reaches 0
    if (countdown <= 0) {
      handleCreateRoom();
      return;
    }

    // Tick every second
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, countdownActive, handleCreateRoom]);

  // Calculate progress for circular indicator (0 to 1)
  const progress = countdown / AUTO_CREATE_COUNTDOWN_SECONDS;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-purple-600 via-pink-500 to-teal-500 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 max-w-lg w-full text-center">
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-teal-500 bg-clip-text text-transparent mb-2 sm:mb-3">
            PartyDraw
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-8 sm:mb-10">
            The multiplayer drawing party game
          </p>

          {/* Buttons */}
          <div className="space-y-4 sm:space-y-5">
            {/* Create Room Button - Host colors (purple/pink) with countdown */}
            <motion.button
              onClick={handleCreateRoom}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 sm:py-5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg sm:text-xl relative overflow-hidden"
            >
              {/* Countdown progress bar at bottom of button */}
              {countdownActive && (
                <div
                  className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-1000 ease-linear"
                  style={{ width: `${progress * 100}%` }}
                />
              )}
              <span className="flex items-center justify-center gap-3">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create Room
                {/* Countdown badge */}
                {countdownActive && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[1.75rem] h-7 px-1.5 bg-white/20 rounded-full text-sm font-bold">
                    {countdown}
                  </span>
                )}
              </span>
            </motion.button>

            {/* Join Room Button - Player colors (teal/cyan) */}
            <motion.button
              onClick={handleJoinRoom}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-4 sm:py-5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg sm:text-xl"
            >
              <span className="flex items-center justify-center gap-3">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Join Room
              </span>
            </motion.button>
          </div>

          {/* Help text */}
          <p className="text-gray-500 text-xs sm:text-sm mt-8 sm:mt-10">
            Create a room to host a game on the main screen, or join an existing game on your phone
          </p>

          {/* Auto-create hint */}
          {countdownActive && (
            <p className="text-gray-400 text-xs mt-2">
              Room will auto-create in {countdown}s for unattended displays
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-2 px-4 text-center text-white/60 text-xs sm:text-sm">
        PartyDraw - Draw, Vote, Laugh!
      </footer>
    </div>
  );
}

export default LandingScreen;
