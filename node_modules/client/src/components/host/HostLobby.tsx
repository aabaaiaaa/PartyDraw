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
}

/**
 * Generates the room join URL based on the current hostname
 */
function getRoomUrl(roomCode: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}?room=${roomCode}`;
}

/**
 * Simple QR Code placeholder component
 * Will be replaced with actual QR code in TASK-030
 */
function QRCodePlaceholder({ url }: { url: string }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-lg inline-block">
      <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border-4 border-dashed border-gray-300">
        <div className="text-center p-4">
          <div className="text-4xl mb-2">📱</div>
          <p className="text-xs text-gray-500 break-all">{url}</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">Scan to join</p>
    </div>
  );
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
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
        style={{ backgroundColor: color }}
      >
        {initial}
      </div>
      {isReady && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
          <svg
            className="w-3 h-3 text-white"
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
 * Individual player card in the lobby
 */
function PlayerCard({ player }: { player: Player }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
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
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{player.name}</p>
        <p
          className={`text-sm ${
            player.isReady ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          {player.isReady ? 'Ready!' : 'Getting ready...'}
        </p>
      </div>
    </div>
  );
}

/**
 * Empty state shown when no players have joined yet
 */
function EmptyPlayerList() {
  return (
    <div className="text-center py-8">
      <div className="text-5xl mb-4">👋</div>
      <p className="text-gray-500 text-lg">Waiting for players to join...</p>
      <p className="text-gray-400 text-sm mt-2">
        Scan the QR code or enter the room code on your phone
      </p>
    </div>
  );
}

/**
 * Main HostLobby component
 */
function HostLobby({ roomCode, players, maxPlayers = 8 }: HostLobbyProps) {
  const roomUrl = useMemo(() => getRoomUrl(roomCode), [roomCode]);

  const readyCount = players.filter((p) => p.isReady).length;
  const allReady = players.length > 0 && readyCount === players.length;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Left side: QR Code and Room Code */}
      <div className="flex flex-col items-center text-center lg:w-1/3">
        <h2 className="text-2xl font-bold text-purple-800 mb-4">
          Join the Game!
        </h2>

        {/* QR Code */}
        <QRCodePlaceholder url={roomUrl} />

        {/* Room Code */}
        <div className="mt-6">
          <p className="text-gray-600 text-sm mb-1">Or enter this code:</p>
          <div className="bg-purple-100 rounded-xl px-6 py-3 border-2 border-purple-300">
            <p className="text-4xl font-bold tracking-[0.3em] text-purple-700">
              {roomCode}
            </p>
          </div>
        </div>

        {/* Join URL for copy */}
        <p className="text-xs text-gray-400 mt-4 max-w-[200px] break-all">
          {roomUrl}
        </p>
      </div>

      {/* Right side: Player List */}
      <div className="flex-1 w-full lg:w-2/3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-purple-800">
            Players ({players.length}/{maxPlayers})
          </h3>
          {players.length > 0 && (
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${
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

        {players.length === 0 ? (
          <EmptyPlayerList />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}

        {/* Status message */}
        {players.length > 0 && (
          <div className="mt-6 text-center">
            {allReady ? (
              <p className="text-green-600 font-medium text-lg">
                Everyone is ready! The host can start the game.
              </p>
            ) : (
              <p className="text-gray-500">
                Waiting for all players to press Ready...
              </p>
            )}
          </div>
        )}

        {/* Minimum players notice */}
        {players.length > 0 && players.length < 2 && (
          <p className="text-yellow-600 text-sm mt-2 text-center">
            At least 2 players are needed to start the game
          </p>
        )}
      </div>
    </div>
  );
}

export default HostLobby;
