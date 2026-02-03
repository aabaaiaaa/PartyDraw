/**
 * RoomService
 * Manages room lifecycle and player interactions for PartyDraw game rooms
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Room,
  createRoom as createRoomModel,
  addPlayerToRoom,
  removePlayerFromRoom,
  isRoomFull,
  RoomSettings,
} from '../models/Room';
import { Player, createPlayer, getColorForPlayerIndex } from '../models/Player';
import { generateUniqueRoomCode } from '../utils/roomCodeGenerator';
import { generateUniquePlayerName } from '../utils/nameGenerator';

/**
 * Error types for room operations
 */
export type RoomError =
  | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL'
  | 'PLAYER_NOT_FOUND'
  | 'INVALID_ROOM_CODE'
  | 'GAME_IN_PROGRESS';

/**
 * Result type for room operations that may fail
 */
export type RoomResult<T> =
  | { success: true; data: T }
  | { success: false; error: RoomError; message: string };

/**
 * RoomService class
 * Singleton service that manages all game rooms
 */
export class RoomService {
  /** Map of room IDs to Room objects */
  private rooms: Map<string, Room> = new Map();

  /** Map of room codes to room IDs for quick lookup */
  private roomCodeToId: Map<string, string> = new Map();

  /** Map of socket IDs to player info (roomId, playerId) for quick lookup */
  private socketToPlayer: Map<string, { roomId: string; playerId: string }> = new Map();

  /**
   * Creates a new room with a unique code
   * @param hostSocketId - Socket ID of the host creating the room
   * @param settings - Optional custom room settings
   * @returns Result containing the created room or an error
   */
  createRoom(
    hostSocketId: string,
    settings?: Partial<RoomSettings>
  ): RoomResult<Room> {
    const existingCodes = new Set(this.roomCodeToId.keys());
    const code = generateUniqueRoomCode(existingCodes);
    const id = uuidv4();

    const room = createRoomModel(id, code, hostSocketId, settings);

    this.rooms.set(id, room);
    this.roomCodeToId.set(code, id);

    return { success: true, data: room };
  }

  /**
   * Joins a player to a room by room code
   * If the game is in progress, the player joins as a spectator and will
   * participate starting from the next round.
   * @param roomCode - The 6-character room code
   * @param socketId - Socket ID of the joining player
   * @param playerName - Optional custom player name (will generate if not provided)
   * @returns Result containing the updated room and new player, or an error
   */
  joinRoom(
    roomCode: string,
    socketId: string,
    playerName?: string
  ): RoomResult<{ room: Room; player: Player; isSpectator: boolean }> {
    const roomId = this.roomCodeToId.get(roomCode.toUpperCase());

    if (!roomId) {
      return {
        success: false,
        error: 'ROOM_NOT_FOUND',
        message: `Room with code "${roomCode}" not found`,
      };
    }

    const room = this.rooms.get(roomId);

    if (!room) {
      return {
        success: false,
        error: 'ROOM_NOT_FOUND',
        message: `Room with code "${roomCode}" not found`,
      };
    }

    if (isRoomFull(room)) {
      return {
        success: false,
        error: 'ROOM_FULL',
        message: `Room "${roomCode}" is full (${room.settings.maxPlayers} players max)`,
      };
    }

    // Don't allow joining during the final phase (game is over)
    if (room.status === 'final') {
      return {
        success: false,
        error: 'GAME_IN_PROGRESS',
        message: 'Cannot join room - game has ended',
      };
    }

    // Determine if player should be a spectator (joining mid-game)
    const isSpectator = room.status !== 'lobby';

    // Generate unique player name if not provided
    const existingNames = new Set(
      Array.from(room.players.values()).map((p) => p.name)
    );
    const name = playerName || generateUniquePlayerName(existingNames);

    // Get color based on player index
    const color = getColorForPlayerIndex(room.players.size);

    // Create the player (as spectator if joining mid-game)
    const playerId = uuidv4();
    const player = createPlayer(playerId, name, socketId, color, isSpectator);

    // Add player to room
    const updatedRoom = addPlayerToRoom(room, player);
    this.rooms.set(roomId, updatedRoom);

    // Track socket to player mapping
    this.socketToPlayer.set(socketId, { roomId, playerId });

    return { success: true, data: { room: updatedRoom, player, isSpectator } };
  }

  /**
   * Removes a player from a room when they leave
   * @param socketId - Socket ID of the leaving player
   * @returns Result containing the updated room (or null if room was closed), or an error
   */
  leaveRoom(socketId: string): RoomResult<{ room: Room | null; playerId: string }> {
    const playerInfo = this.socketToPlayer.get(socketId);

    if (!playerInfo) {
      return {
        success: false,
        error: 'PLAYER_NOT_FOUND',
        message: 'Player not found for this socket',
      };
    }

    const { roomId, playerId } = playerInfo;
    const room = this.rooms.get(roomId);

    if (!room) {
      // Clean up the socket mapping even if room is gone
      this.socketToPlayer.delete(socketId);
      return {
        success: false,
        error: 'ROOM_NOT_FOUND',
        message: 'Room no longer exists',
      };
    }

    // Check if leaving player is the host
    if (room.hostSocketId === socketId) {
      // Host left - close the room
      this.closeRoom(roomId);
      this.socketToPlayer.delete(socketId);
      return { success: true, data: { room: null, playerId } };
    }

    // Remove player from room
    const updatedRoom = removePlayerFromRoom(room, playerId);
    this.rooms.set(roomId, updatedRoom);
    this.socketToPlayer.delete(socketId);

    return { success: true, data: { room: updatedRoom, playerId } };
  }

  /**
   * Gets a room by its ID
   * @param roomId - The room's unique ID
   * @returns The room if found, undefined otherwise
   */
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Gets a room by its code
   * @param roomCode - The 6-character room code
   * @returns The room if found, undefined otherwise
   */
  getRoomByCode(roomCode: string): Room | undefined {
    const roomId = this.roomCodeToId.get(roomCode.toUpperCase());
    if (!roomId) return undefined;
    return this.rooms.get(roomId);
  }

  /**
   * Gets the room and player info for a socket
   * @param socketId - The socket ID to look up
   * @returns Room and player info if found (playerId is 'host' for host sockets)
   */
  getRoomBySocket(socketId: string): { room: Room; playerId: string } | undefined {
    // First check if this socket is a player
    const playerInfo = this.socketToPlayer.get(socketId);
    if (playerInfo) {
      const room = this.rooms.get(playerInfo.roomId);
      if (room) {
        return { room, playerId: playerInfo.playerId };
      }
    }

    // Check if this socket is a host
    for (const room of this.rooms.values()) {
      if (room.hostSocketId === socketId) {
        return { room, playerId: 'host' };
      }
    }

    return undefined;
  }

  /**
   * Removes a specific player from a room (admin/host action)
   * @param roomId - The room's unique ID
   * @param playerId - The ID of the player to remove
   * @returns Result containing the updated room or an error
   */
  removePlayer(roomId: string, playerId: string): RoomResult<Room> {
    const room = this.rooms.get(roomId);

    if (!room) {
      return {
        success: false,
        error: 'ROOM_NOT_FOUND',
        message: 'Room not found',
      };
    }

    const player = room.players.get(playerId);

    if (!player) {
      return {
        success: false,
        error: 'PLAYER_NOT_FOUND',
        message: 'Player not found in this room',
      };
    }

    // Remove socket mapping
    this.socketToPlayer.delete(player.socketId);

    // Remove player from room
    const updatedRoom = removePlayerFromRoom(room, playerId);
    this.rooms.set(roomId, updatedRoom);

    return { success: true, data: updatedRoom };
  }

  /**
   * Closes a room and removes all players
   * @param roomId - The room's unique ID
   * @returns True if the room was closed, false if not found
   */
  closeRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);

    if (!room) {
      return false;
    }

    // Remove all socket mappings for players in this room
    for (const player of room.players.values()) {
      this.socketToPlayer.delete(player.socketId);
    }

    // Remove the room
    this.rooms.delete(roomId);
    this.roomCodeToId.delete(room.code);

    return true;
  }

  /**
   * Updates a room in the service (used after external modifications)
   * @param room - The updated room object
   */
  updateRoom(room: Room): void {
    this.rooms.set(room.id, room);
  }

  /**
   * Sets a player's ready status
   * @param socketId - Socket ID of the player
   * @param isReady - Whether the player is ready
   * @returns Result containing the updated room and player, or an error
   */
  setPlayerReady(
    socketId: string,
    isReady: boolean
  ): RoomResult<{ room: Room; player: Player; allReady: boolean }> {
    const playerInfo = this.socketToPlayer.get(socketId);

    if (!playerInfo) {
      return {
        success: false,
        error: 'PLAYER_NOT_FOUND',
        message: 'Player not found for this socket',
      };
    }

    const { roomId, playerId } = playerInfo;
    const room = this.rooms.get(roomId);

    if (!room) {
      return {
        success: false,
        error: 'ROOM_NOT_FOUND',
        message: 'Room not found',
      };
    }

    const player = room.players.get(playerId);

    if (!player) {
      return {
        success: false,
        error: 'PLAYER_NOT_FOUND',
        message: 'Player not found in room',
      };
    }

    // Update player's ready status
    const updatedPlayer: Player = {
      ...player,
      isReady,
    };

    // Update the room's player map
    const newPlayers = new Map(room.players);
    newPlayers.set(playerId, updatedPlayer);
    const updatedRoom: Room = {
      ...room,
      players: newPlayers,
    };

    this.rooms.set(roomId, updatedRoom);

    // Check if all players are ready
    let allReady = updatedRoom.players.size > 0;
    for (const p of updatedRoom.players.values()) {
      if (!p.isReady) {
        allReady = false;
        break;
      }
    }

    return { success: true, data: { room: updatedRoom, player: updatedPlayer, allReady } };
  }

  /**
   * Updates a player's name
   * @param socketId - Socket ID of the player
   * @param newName - The new name for the player
   * @returns Result containing the updated room and player, or an error
   */
  updatePlayerName(
    socketId: string,
    newName: string
  ): RoomResult<{ room: Room; player: Player }> {
    const playerInfo = this.socketToPlayer.get(socketId);

    if (!playerInfo) {
      return {
        success: false,
        error: 'PLAYER_NOT_FOUND',
        message: 'Player not found for this socket',
      };
    }

    const { roomId, playerId } = playerInfo;
    const room = this.rooms.get(roomId);

    if (!room) {
      return {
        success: false,
        error: 'ROOM_NOT_FOUND',
        message: 'Room not found',
      };
    }

    const player = room.players.get(playerId);

    if (!player) {
      return {
        success: false,
        error: 'PLAYER_NOT_FOUND',
        message: 'Player not found in room',
      };
    }

    // Update player's name
    const updatedPlayer: Player = {
      ...player,
      name: newName,
    };

    // Update the room's player map
    const newPlayers = new Map(room.players);
    newPlayers.set(playerId, updatedPlayer);
    const updatedRoom: Room = {
      ...room,
      players: newPlayers,
    };

    this.rooms.set(roomId, updatedRoom);

    return { success: true, data: { room: updatedRoom, player: updatedPlayer } };
  }

  /**
   * Marks a player as disconnected without removing them from the room
   * @param socketId - Socket ID of the disconnected player
   * @returns Result containing the room and player info, or an error
   */
  markPlayerDisconnected(
    socketId: string
  ): RoomResult<{ room: Room; playerId: string; player: Player }> {
    const playerInfo = this.socketToPlayer.get(socketId);

    if (!playerInfo) {
      return {
        success: false,
        error: 'PLAYER_NOT_FOUND',
        message: 'Player not found for this socket',
      };
    }

    const { roomId, playerId } = playerInfo;
    const room = this.rooms.get(roomId);

    if (!room) {
      this.socketToPlayer.delete(socketId);
      return {
        success: false,
        error: 'ROOM_NOT_FOUND',
        message: 'Room not found',
      };
    }

    const player = room.players.get(playerId);

    if (!player) {
      this.socketToPlayer.delete(socketId);
      return {
        success: false,
        error: 'PLAYER_NOT_FOUND',
        message: 'Player not found in room',
      };
    }

    // Mark player as disconnected
    const updatedPlayer: Player = {
      ...player,
      isConnected: false,
    };

    // Update the room's player map
    const newPlayers = new Map(room.players);
    newPlayers.set(playerId, updatedPlayer);
    const updatedRoom: Room = {
      ...room,
      players: newPlayers,
    };

    this.rooms.set(roomId, updatedRoom);

    return {
      success: true,
      data: { room: updatedRoom, playerId, player: updatedPlayer },
    };
  }

  /**
   * Handles player reconnection by updating their socket ID and marking them as connected
   * @param oldSocketId - The original socket ID
   * @param newSocketId - The new socket ID after reconnection
   * @returns Result containing the room and player info, or an error
   */
  reconnectPlayer(
    roomId: string,
    playerId: string,
    newSocketId: string
  ): RoomResult<{ room: Room; player: Player }> {
    const room = this.rooms.get(roomId);

    if (!room) {
      return {
        success: false,
        error: 'ROOM_NOT_FOUND',
        message: 'Room not found',
      };
    }

    const player = room.players.get(playerId);

    if (!player) {
      return {
        success: false,
        error: 'PLAYER_NOT_FOUND',
        message: 'Player not found in room',
      };
    }

    // Update player with new socket ID and mark as connected
    const updatedPlayer: Player = {
      ...player,
      socketId: newSocketId,
      isConnected: true,
      lastHeartbeat: Date.now(),
    };

    // Update the room's player map
    const newPlayers = new Map(room.players);
    newPlayers.set(playerId, updatedPlayer);
    const updatedRoom: Room = {
      ...room,
      players: newPlayers,
    };

    this.rooms.set(roomId, updatedRoom);

    // Update socket-to-player mapping
    this.socketToPlayer.set(newSocketId, { roomId, playerId });

    return {
      success: true,
      data: { room: updatedRoom, player: updatedPlayer },
    };
  }

  /**
   * Promotes all spectators in a room to active players
   * Called at the start of a new round so spectators can participate
   * @param roomId - The room's unique ID
   * @returns Result containing the updated room and list of promoted player IDs, or an error
   */
  promoteSpectators(
    roomId: string
  ): RoomResult<{ room: Room; promotedPlayerIds: string[] }> {
    const room = this.rooms.get(roomId);

    if (!room) {
      return {
        success: false,
        error: 'ROOM_NOT_FOUND',
        message: 'Room not found',
      };
    }

    const promotedPlayerIds: string[] = [];
    const newPlayers = new Map(room.players);

    for (const [playerId, player] of room.players.entries()) {
      if (player.isSpectator && player.isConnected) {
        promotedPlayerIds.push(playerId);
        newPlayers.set(playerId, {
          ...player,
          isSpectator: false,
          isReady: true, // Auto-ready since game is already in progress
        });
      }
    }

    const updatedRoom: Room = {
      ...room,
      players: newPlayers,
    };

    this.rooms.set(roomId, updatedRoom);

    return {
      success: true,
      data: { room: updatedRoom, promotedPlayerIds },
    };
  }

  /**
   * Gets the count of active (non-spectator) players in a room
   * @param roomId - The room's unique ID
   * @returns Number of active players, or 0 if room not found
   */
  getActivePlayerCount(roomId: string): number {
    const room = this.rooms.get(roomId);
    if (!room) return 0;

    let count = 0;
    for (const player of room.players.values()) {
      if (player.isConnected && !player.isSpectator) {
        count++;
      }
    }
    return count;
  }

  /**
   * Resets a room for a new game while keeping the same room code and players.
   * Used for "Play Again" functionality so players don't need to rejoin.
   * @param roomId - The room's unique ID
   * @returns Result containing the reset room or an error
   */
  resetRoom(roomId: string): RoomResult<Room> {
    const room = this.rooms.get(roomId);

    if (!room) {
      return {
        success: false,
        error: 'ROOM_NOT_FOUND',
        message: 'Room not found',
      };
    }

    // Reset all players: isReady=false, score=0, isSpectator=false
    const newPlayers = new Map(room.players);
    for (const [playerId, player] of room.players.entries()) {
      newPlayers.set(playerId, {
        ...player,
        isReady: false,
        score: 0,
        isSpectator: false,
      });
    }

    // Reset the room to lobby state with cleared game state
    const resetRoom: Room = {
      ...room,
      status: 'lobby',
      players: newPlayers,
      gameState: {
        currentRound: 0,
        question: null,
        drawings: new Map(),
        votes: new Map(),
        phaseStartTime: null,
        phaseEndTime: null,
      },
    };

    this.rooms.set(roomId, resetRoom);

    return { success: true, data: resetRoom };
  }

  /**
   * Gets all active rooms (for debugging/admin)
   * @returns Array of all active rooms
   */
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  /**
   * Gets the count of active rooms
   * @returns Number of active rooms
   */
  getRoomCount(): number {
    return this.rooms.size;
  }
}

// Export a singleton instance
export const roomService = new RoomService();
