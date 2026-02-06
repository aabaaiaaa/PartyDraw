/**
 * Room Model
 * Represents a game room in PartyDraw
 */

import { Player } from './Player';
import { ThemeSettings, ThemeVote, DEFAULT_THEME_SETTINGS } from '../utils/themes';

/**
 * A drawing entry preserved across rounds for the final leaderboard
 */
export interface DrawingHistoryEntry {
  playerId: string;
  drawingData: string;
  round: number;
  question: string;
  votes: number;
}

/**
 * Room status representing the current state of the room
 */
export type RoomStatus =
  | 'lobby'      // Waiting for players to join and ready up
  | 'countdown'  // Game is about to start (3-2-1)
  | 'drawing'    // Players are drawing
  | 'voting'     // Players are voting on drawings
  | 'results'    // Showing round results
  | 'final';     // Game is over, showing final standings

/**
 * Game state tracking for the current round
 */
export interface GameState {
  /** Current round number (1-based) */
  currentRound: number;
  /** The current question/prompt for drawing */
  question: string | null;
  /** Map of player IDs to their submitted drawing (base64 image data) */
  drawings: Map<string, string>;
  /** Map of voter player IDs to the player ID they voted for */
  votes: Map<string, string>;
  /** Timestamp when the current phase started */
  phaseStartTime: number | null;
  /** Timestamp when the current phase ends */
  phaseEndTime: number | null;
  /** Set of question IDs that have been used in the current game session (to prevent repeats) */
  usedQuestionIds: Set<string>;
  /** Set of player IDs who have voted to skip the current question */
  skipVotes: Set<string>;
  /** Map of player IDs to their theme votes/preferences (for lobby voting) */
  playerThemeVotes: Map<string, ThemeVote>;
  /** Accumulated drawing history across all rounds (for final leaderboard) */
  drawingHistory: DrawingHistoryEntry[];
}

/**
 * Room settings configuration
 */
export interface RoomSettings {
  /** Maximum number of players allowed in the room */
  maxPlayers: number;
  /** Number of rounds to play */
  rounds: number;
  /** Time allowed for drawing in seconds */
  drawingTime: number;
  /** Time allowed for voting in seconds */
  votingTime: number;
  /** Theme settings for question filtering */
  themes: ThemeSettings;
}

/**
 * Default room settings
 */
export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  maxPlayers: 8,
  rounds: 3,
  drawingTime: 20,
  votingTime: 15,
  themes: DEFAULT_THEME_SETTINGS,
};

/**
 * Room interface defining the structure of a game room
 */
export interface Room {
  /** Unique identifier for the room (UUID) */
  id: string;
  /** 6-character alphanumeric room code for joining (e.g., "PARTY7") */
  code: string;
  /** Socket.IO socket ID of the host */
  hostSocketId: string;
  /** Map of player IDs to Player objects */
  players: Map<string, Player>;
  /** Current status of the room */
  status: RoomStatus;
  /** Current game state */
  gameState: GameState;
  /** Room configuration settings */
  settings: RoomSettings;
  /** Timestamp when the room was created */
  createdAt: number;
}

/**
 * Creates a new Room object with default values
 * @param id - Unique identifier for the room
 * @param code - Room code for joining
 * @param hostSocketId - Socket ID of the host
 * @param settings - Optional custom settings (uses defaults if not provided)
 * @returns A new Room object
 */
export function createRoom(
  id: string,
  code: string,
  hostSocketId: string,
  settings?: Partial<RoomSettings>
): Room {
  return {
    id,
    code,
    hostSocketId,
    players: new Map(),
    status: 'lobby',
    gameState: createInitialGameState(),
    settings: {
      ...DEFAULT_ROOM_SETTINGS,
      ...settings,
    },
    createdAt: Date.now(),
  };
}

/**
 * Creates an initial game state with default values
 * @returns A new GameState object
 */
export function createInitialGameState(): GameState {
  return {
    currentRound: 0,
    question: null,
    drawings: new Map(),
    votes: new Map(),
    phaseStartTime: null,
    phaseEndTime: null,
    usedQuestionIds: new Set(),
    skipVotes: new Set(),
    playerThemeVotes: new Map(),
    drawingHistory: [],
  };
}

/**
 * Resets the game state for a new round
 * @param gameState - The current game state
 * @param round - The new round number
 * @param question - The question/prompt for the new round
 * @returns A new GameState object for the new round
 */
export function resetGameStateForNewRound(
  gameState: GameState,
  round: number,
  question: string
): GameState {
  return {
    ...gameState,
    currentRound: round,
    question,
    drawings: new Map(),
    votes: new Map(),
    phaseStartTime: null,
    phaseEndTime: null,
    skipVotes: new Set(),
    // Preserve usedQuestionIds across rounds in the same game
  };
}

/**
 * Adds a player to the room
 * @param room - The room to add the player to
 * @param player - The player to add
 * @returns A new Room object with the player added
 */
export function addPlayerToRoom(room: Room, player: Player): Room {
  const newPlayers = new Map(room.players);
  newPlayers.set(player.id, player);
  return {
    ...room,
    players: newPlayers,
  };
}

/**
 * Removes a player from the room
 * @param room - The room to remove the player from
 * @param playerId - The ID of the player to remove
 * @returns A new Room object with the player removed
 */
export function removePlayerFromRoom(room: Room, playerId: string): Room {
  const newPlayers = new Map(room.players);
  newPlayers.delete(playerId);
  return {
    ...room,
    players: newPlayers,
  };
}

/**
 * Updates the room status
 * @param room - The room to update
 * @param status - The new status
 * @returns A new Room object with the updated status
 */
export function updateRoomStatus(room: Room, status: RoomStatus): Room {
  return {
    ...room,
    status,
  };
}

/**
 * Checks if the room is full
 * @param room - The room to check
 * @returns True if the room has reached max players
 */
export function isRoomFull(room: Room): boolean {
  return room.players.size >= room.settings.maxPlayers;
}

/**
 * Checks if all players in the room are ready
 * @param room - The room to check
 * @returns True if all players are ready
 */
export function areAllPlayersReady(room: Room): boolean {
  if (room.players.size === 0) return false;
  for (const player of room.players.values()) {
    if (!player.isReady) return false;
  }
  return true;
}

/**
 * Gets the number of connected players in the room
 * @param room - The room to check
 * @returns The count of connected players
 */
export function getConnectedPlayerCount(room: Room): number {
  let count = 0;
  for (const player of room.players.values()) {
    if (player.isConnected) count++;
  }
  return count;
}

/**
 * Submits a drawing for a player in the current round
 * @param room - The room
 * @param playerId - The player ID
 * @param drawingData - The base64 image data
 * @returns A new Room object with the drawing submitted
 */
export function submitDrawing(room: Room, playerId: string, drawingData: string): Room {
  const newDrawings = new Map(room.gameState.drawings);
  newDrawings.set(playerId, drawingData);
  return {
    ...room,
    gameState: {
      ...room.gameState,
      drawings: newDrawings,
    },
  };
}

/**
 * Casts a vote for a player
 * @param room - The room
 * @param voterId - The ID of the player casting the vote
 * @param votedForId - The ID of the player being voted for
 * @returns A new Room object with the vote recorded
 */
export function castVote(room: Room, voterId: string, votedForId: string): Room {
  const newVotes = new Map(room.gameState.votes);
  newVotes.set(voterId, votedForId);
  return {
    ...room,
    gameState: {
      ...room.gameState,
      votes: newVotes,
    },
  };
}

/**
 * Checks if all connected active (non-spectator) players have submitted their drawings
 * @param room - The room to check
 * @returns True if all connected active players have submitted
 */
export function haveAllPlayersSubmittedDrawings(room: Room): boolean {
  for (const player of room.players.values()) {
    // Spectators don't need to submit drawings
    if (player.isConnected && !player.isSpectator && !room.gameState.drawings.has(player.id)) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if all connected active (non-spectator) players have voted
 * @param room - The room to check
 * @returns True if all connected active players have voted
 */
export function haveAllPlayersVoted(room: Room): boolean {
  for (const player of room.players.values()) {
    // Spectators don't need to vote
    if (player.isConnected && !player.isSpectator && !room.gameState.votes.has(player.id)) {
      return false;
    }
  }
  return true;
}

/**
 * Gets the count of active (non-spectator) connected players in the room
 * @param room - The room to check
 * @returns The count of active connected players
 */
export function getActivePlayerCount(room: Room): number {
  let count = 0;
  for (const player of room.players.values()) {
    if (player.isConnected && !player.isSpectator) count++;
  }
  return count;
}

// Re-export theme types for convenience
export type { ThemeSettings, ThemeVote } from '../utils/themes';
