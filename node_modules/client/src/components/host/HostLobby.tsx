/**
 * HostLobby - Lobby screen displayed on the host/shared device
 *
 * Shows:
 * - Large QR code with room URL for players to scan
 * - Room code text for manual entry
 * - Player list with colored avatars and ready status indicators
 * - "Waiting for players" message when lobby is empty
 */

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCodeDisplay from './QRCodeDisplay';

interface Player {
  id: string;
  name: string;
  color: string;
  isReady: boolean;
}

interface HostLobbyProps {
  /** The room code for players to join */
  roomCode: string;
  /** List of players currently in the room */
  players: Player[];
  /** Maximum number of players allowed (default: 8) */
  maxPlayers?: number;
  /** Callback when the host clicks "Start Game" */
  onStartGame?: () => void;
}

/**
 * Generates the room join URL based on the current hostname
 */
function getRoomUrl(roomCode: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}?room=${roomCode}`;
}


/**
 * Player avatar showing the first letter of their name
 */
function PlayerAvatar({
  name,
  color,
  isReady,
}: {
  name: string;
  color: string;
  isReady: boolean;
}) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="relative">
      <div
        className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg lg:text-xl shadow-md"
        style={{ backgroundColor: color }}
      >
        {initial}
      </div>
      {isReady && (
        <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
          <svg
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

/**
 * Individual player card in the lobby with slide-in animation
 */
function PlayerCard({ player, index }: { player: Player; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.8 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: index * 0.1,
      }}
      layout
      className={`flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-4 rounded-lg sm:rounded-xl transition-colors duration-300 ${
        player.isReady
          ? 'bg-green-50 border-2 border-green-400 shadow-md shadow-green-100'
          : 'bg-gray-50 border-2 border-gray-200'
      }`}
    >
      <PlayerAvatar
        name={player.name}
        color={player.color}
        isReady={player.isReady}
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg truncate">{player.name}</p>
        <motion.p
          initial={false}
          animate={player.isReady ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={`text-xs sm:text-sm lg:text-base ${
            player.isReady ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          {player.isReady ? 'Ready!' : 'Getting ready...'}
        </motion.p>
      </div>
      {player.isReady && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className="text-green-500 text-lg sm:text-xl lg:text-2xl"
        >
          ✓
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Empty state shown when no players have joined yet
 */
function EmptyPlayerList() {
  return (
    <div className="text-center py-6 sm:py-8 lg:py-12">
      <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">👋</div>
      <p className="text-gray-500 text-base sm:text-lg lg:text-xl">Waiting for players to join...</p>
      <p className="text-gray-400 text-xs sm:text-sm lg:text-base mt-2">
        Scan the QR code or enter the room code on your phone
      </p>
    </div>
  );
}

/**
 * Main HostLobby component
 */
function HostLobby({ roomCode, players, maxPlayers = 8, onStartGame }: HostLobbyProps) {
  const roomUrl = useMemo(() => getRoomUrl(roomCode), [roomCode]);

  const readyCount = players.filter((p) => p.isReady).length;
  const allReady = players.length > 0 && readyCount === players.length;
  const canStart = allReady && players.length >= 2;

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-12 items-start h-full">
      {/* Left side: QR Code and Room Code - scales for larger screens */}
      <div className="flex flex-col items-center text-center w-full lg:w-1/3 xl:w-2/5">
        <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-purple-800 mb-2 sm:mb-4">
          Join the Game!
        </h2>

        {/* QR Code */}
        <QRCodeDisplay url={roomUrl} />

        {/* Room Code - larger on big screens */}
        <div className="mt-4 sm:mt-6 lg:mt-8">
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base mb-1">Or enter this code:</p>
          <div className="bg-purple-100 rounded-lg sm:rounded-xl px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 border-2 border-purple-300">
            <p className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-[0.2em] sm:tracking-[0.3em] text-purple-700">
              {roomCode}
            </p>
          </div>
        </div>

        {/* Join URL for copy - hidden on smaller screens */}
        <p className="hidden sm:block text-xs text-gray-400 mt-4 max-w-[200px] lg:max-w-[280px] break-all">
          {roomUrl}
        </p>
      </div>

      {/* Right side: Player List */}
      <div className="flex-1 w-full lg:w-2/3 xl:w-3/5">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-800">
            Players ({players.length}/{maxPlayers})
          </h3>
          {players.length > 0 && (
            <span
              className={`text-xs sm:text-sm lg:text-base font-medium px-2 py-0.5 sm:px-3 sm:py-1 rounded-full ${
                allReady
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {allReady
                ? 'All ready!'
                : `${readyCount}/${players.length} ready`}
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {players.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EmptyPlayerList />
            </motion.div>
          ) : (
            <motion.div
              key="player-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 lg:gap-4"
            >
              <AnimatePresence>
                {players.map((player, index) => (
                  <PlayerCard key={player.id} player={player} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status message and Start Game button */}
        <AnimatePresence>
          {players.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="mt-4 sm:mt-6 lg:mt-8 text-center"
            >
              {canStart ? (
                <>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-600 font-medium text-base sm:text-lg lg:text-xl mb-3 sm:mb-4"
                  >
                    Everyone is ready!
                  </motion.p>
                  <motion.button
                    onClick={onStartGame}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 lg:py-5 lg:px-10 rounded-lg sm:rounded-xl text-lg sm:text-xl lg:text-2xl shadow-lg hover:shadow-xl"
                  >
                    🎮 Start Game!
                  </motion.button>
                </>
              ) : allReady ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-yellow-600 font-medium text-base sm:text-lg lg:text-xl"
                >
                  Need at least 2 players to start
                </motion.p>
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-500 text-sm sm:text-base lg:text-lg"
                >
                  Waiting for all players to press Ready...
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimum players notice */}
        {players.length > 0 && players.length < 2 && !canStart && (
          <p className="text-yellow-600 text-xs sm:text-sm lg:text-base mt-2 text-center">
            At least 2 players are needed to start the game
          </p>
        )}
      </div>
    </div>
  );
}

export default HostLobby;
