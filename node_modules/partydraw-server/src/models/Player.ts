/**
 * Player Model
 * Represents a player in a PartyDraw game session
 */

/**
 * Player interface defining the structure of a player in the game
 */
export interface Player {
  /** Unique identifier for the player (UUID) */
  id: string;
  /** Display name for the player (e.g., "Dancing Panda") */
  name: string;
  /** Color assigned to the player for avatar display (hex color code) */
  color: string;
  /** Socket.IO socket ID for the player's connection */
  socketId: string;
  /** Whether the player has marked themselves as ready in the lobby */
  isReady: boolean;
  /** Whether the player is currently connected to the game */
  isConnected: boolean;
  /** Player's current score in the game */
  score: number;
  /** Timestamp of the last heartbeat received from the player */
  lastHeartbeat: number;
  /** Whether the player is a spectator (joined mid-game, waiting for next round) */
  isSpectator: boolean;
}

/** Available player colors for avatar display */
export const PLAYER_COLORS = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Teal
  '#45B7D1', // Sky Blue
  '#96CEB4', // Sage Green
  '#FFEAA7', // Soft Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Golden Yellow
  '#BB8FCE', // Light Purple
  '#85C1E9', // Light Blue
];

/**
 * Creates a new Player object with the given properties
 * @param id - Unique identifier for the player
 * @param name - Display name for the player
 * @param socketId - Socket.IO socket ID
 * @param color - Optional color override (will use random color if not provided)
 * @returns A new Player object with default values
 */
export function createPlayer(
  id: string,
  name: string,
  socketId: string,
  color?: string,
  isSpectator: boolean = false
): Player {
  return {
    id,
    name,
    color: color ?? PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)],
    socketId,
    isReady: false,
    isConnected: true,
    score: 0,
    lastHeartbeat: Date.now(),
    isSpectator,
  };
}

/**
 * Gets a color for a player based on their index in the room
 * @param playerIndex - The player's index in the room (0-based)
 * @returns A hex color code
 */
export function getColorForPlayerIndex(playerIndex: number): string {
  return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
}

/**
 * Updates the player's heartbeat timestamp to the current time
 * @param player - The player to update
 * @returns A new Player object with updated lastHeartbeat
 */
export function updateHeartbeat(player: Player): Player {
  return {
    ...player,
    lastHeartbeat: Date.now(),
  };
}

/**
 * Checks if a player's connection has timed out based on their last heartbeat
 * @param player - The player to check
 * @param timeoutMs - Timeout threshold in milliseconds (default: 10000ms / 10 seconds)
 * @returns True if the player has timed out
 */
export function hasTimedOut(player: Player, timeoutMs: number = 10000): boolean {
  return Date.now() - player.lastHeartbeat > timeoutMs;
}
