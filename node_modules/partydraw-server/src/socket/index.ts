/**
 * Socket.IO Event Handlers
 * Handles room-related socket events for PartyDraw
 */

import { Server, Socket } from 'socket.io';
import { roomService, RoomError } from '../services/RoomService';
import { Room } from '../models/Room';
import { Player } from '../models/Player';

/**
 * Serializes a Room for transmission over Socket.IO
 * (Maps are not serializable, so we convert them to arrays)
 */
function serializeRoom(room: Room): object {
  return {
    id: room.id,
    code: room.code,
    hostSocketId: room.hostSocketId,
    players: Array.from(room.players.values()),
    status: room.status,
    gameState: {
      currentRound: room.gameState.currentRound,
      question: room.gameState.question,
      drawings: Array.from(room.gameState.drawings.entries()),
      votes: Array.from(room.gameState.votes.entries()),
      phaseStartTime: room.gameState.phaseStartTime,
      phaseEndTime: room.gameState.phaseEndTime,
    },
    settings: room.settings,
    createdAt: room.createdAt,
  };
}

/**
 * Serializes a Player for transmission over Socket.IO
 */
function serializePlayer(player: Player): object {
  return {
    id: player.id,
    name: player.name,
    color: player.color,
    socketId: player.socketId,
    isReady: player.isReady,
    isConnected: player.isConnected,
    score: player.score,
  };
}

/**
 * Emits a room error to the socket
 */
function emitRoomError(socket: Socket, error: RoomError, message: string): void {
  socket.emit('room:error', { error, message });
}

/**
 * Sets up room-related socket event handlers
 * @param io - The Socket.IO server instance
 * @param socket - The connected socket
 */
export function setupRoomHandlers(io: Server, socket: Socket): void {
  /**
   * Handle room:create event
   * Creates a new room with the socket as the host
   */
  socket.on('room:create', (callback?: (response: object) => void) => {
    console.log(`[room:create] Socket ${socket.id} creating room`);

    const result = roomService.createRoom(socket.id);

    if (!result.success) {
      emitRoomError(socket, result.error, result.message);
      if (callback) {
        callback({ success: false, error: result.error, message: result.message });
      }
      return;
    }

    const room = result.data;

    // Join the socket to the Socket.IO room for broadcasting
    socket.join(room.id);

    console.log(`[room:create] Room created with code: ${room.code}`);

    // Emit room:created event to the host
    socket.emit('room:created', {
      room: serializeRoom(room),
    });

    if (callback) {
      callback({ success: true, room: serializeRoom(room) });
    }
  });

  /**
   * Handle room:join event
   * Joins a player to an existing room by room code
   */
  socket.on(
    'room:join',
    (
      data: { roomCode: string; playerName?: string },
      callback?: (response: object) => void
    ) => {
      const { roomCode, playerName } = data;

      console.log(
        `[room:join] Socket ${socket.id} joining room ${roomCode}${
          playerName ? ` as "${playerName}"` : ''
        }`
      );

      if (!roomCode || typeof roomCode !== 'string') {
        emitRoomError(socket, 'INVALID_ROOM_CODE', 'Room code is required');
        if (callback) {
          callback({
            success: false,
            error: 'INVALID_ROOM_CODE',
            message: 'Room code is required',
          });
        }
        return;
      }

      const result = roomService.joinRoom(roomCode, socket.id, playerName);

      if (!result.success) {
        emitRoomError(socket, result.error, result.message);
        if (callback) {
          callback({ success: false, error: result.error, message: result.message });
        }
        return;
      }

      const { room, player } = result.data;

      // Join the socket to the Socket.IO room for broadcasting
      socket.join(room.id);

      console.log(
        `[room:join] Player "${player.name}" joined room ${room.code} (${room.players.size} players)`
      );

      // Emit room:joined event to the joining player
      socket.emit('room:joined', {
        room: serializeRoom(room),
        player: serializePlayer(player),
      });

      // Emit room:player-joined event to all other players in the room
      socket.to(room.id).emit('room:player-joined', {
        player: serializePlayer(player),
        playerCount: room.players.size,
      });

      if (callback) {
        callback({
          success: true,
          room: serializeRoom(room),
          player: serializePlayer(player),
        });
      }
    }
  );

  /**
   * Handle room:leave event
   * Removes a player from a room
   */
  socket.on('room:leave', (callback?: (response: object) => void) => {
    console.log(`[room:leave] Socket ${socket.id} leaving room`);

    const result = roomService.leaveRoom(socket.id);

    if (!result.success) {
      emitRoomError(socket, result.error, result.message);
      if (callback) {
        callback({ success: false, error: result.error, message: result.message });
      }
      return;
    }

    const { room, playerId } = result.data;

    if (room === null) {
      // Host left - room was closed
      // Notify all clients in the room that it's closed
      // We need to get the room ID from somewhere - use the socket's rooms
      const socketRooms = Array.from(socket.rooms);
      // Filter out the socket's own ID (sockets auto-join a room with their ID)
      const roomIds = socketRooms.filter((id) => id !== socket.id);

      if (roomIds.length > 0) {
        const roomId = roomIds[0];
        io.to(roomId).emit('room:closed', {
          reason: 'Host left the room',
        });
        // Remove all sockets from the room
        io.in(roomId).socketsLeave(roomId);
      }

      console.log(`[room:leave] Host left, room closed`);
    } else {
      // Regular player left
      // Leave the Socket.IO room
      socket.leave(room.id);

      // Emit room:player-left event to remaining players
      io.to(room.id).emit('room:player-left', {
        playerId,
        playerCount: room.players.size,
      });

      console.log(
        `[room:leave] Player left room ${room.code} (${room.players.size} players remaining)`
      );
    }

    if (callback) {
      callback({ success: true });
    }
  });

  /**
   * Handle disconnect event
   * Clean up when a socket disconnects
   */
  socket.on('disconnect', () => {
    console.log(`[disconnect] Socket ${socket.id} disconnected, cleaning up room membership`);

    // Get room info before leaving
    const roomInfo = roomService.getRoomBySocket(socket.id);

    if (!roomInfo) {
      // Socket wasn't in a room
      return;
    }

    const { room: currentRoom, playerId } = roomInfo;
    const roomId = currentRoom.id;

    // Leave the room
    const result = roomService.leaveRoom(socket.id);

    if (!result.success) {
      console.error(`[disconnect] Error leaving room: ${result.message}`);
      return;
    }

    const { room } = result.data;

    if (room === null) {
      // Host disconnected - room was closed
      io.to(roomId).emit('room:closed', {
        reason: 'Host disconnected',
      });
      // Remove all sockets from the room
      io.in(roomId).socketsLeave(roomId);
      console.log(`[disconnect] Host disconnected, room closed`);
    } else {
      // Regular player disconnected
      io.to(roomId).emit('room:player-left', {
        playerId,
        playerCount: room.players.size,
      });
      console.log(
        `[disconnect] Player disconnected from room ${room.code} (${room.players.size} players remaining)`
      );
    }
  });
}

/**
 * Initializes all socket handlers on the Socket.IO server
 * @param io - The Socket.IO server instance
 */
export function initializeSocketHandlers(io: Server): void {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Acknowledge connection
    socket.emit('connected', { socketId: socket.id });

    // Set up room handlers
    setupRoomHandlers(io, socket);

    // Log errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });
}
