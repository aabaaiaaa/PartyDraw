/**
 * Socket.IO Event Handlers
 * Handles room-related socket events for PartyDraw
 */

import { Server, Socket } from 'socket.io';
import { roomService, RoomError } from '../services/RoomService';
import {
  Room,
  updateRoomStatus,
  resetGameStateForNewRound,
  submitDrawing,
  haveAllPlayersSubmittedDrawings,
} from '../models/Room';
import { Player } from '../models/Player';
import { transitionToCountdown, transitionToDrawing, transitionToVoting } from '../models/Game';
import { timerService, TimerType } from '../services/TimerService';

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
 * Sets up player-related socket event handlers
 * @param io - The Socket.IO server instance
 * @param socket - The connected socket
 */
export function setupPlayerHandlers(io: Server, socket: Socket): void {
  /**
   * Handle player:ready event
   * Sets the player's ready status
   */
  socket.on(
    'player:ready',
    (data: { isReady: boolean }, callback?: (response: object) => void) => {
      const isReady = data?.isReady ?? true;

      console.log(`[player:ready] Socket ${socket.id} setting ready to ${isReady}`);

      const result = roomService.setPlayerReady(socket.id, isReady);

      if (!result.success) {
        emitRoomError(socket, result.error, result.message);
        if (callback) {
          callback({ success: false, error: result.error, message: result.message });
        }
        return;
      }

      const { room, player, allReady } = result.data;

      console.log(
        `[player:ready] Player "${player.name}" is now ${isReady ? 'ready' : 'not ready'} in room ${room.code}`
      );

      // Emit player:updated event to all players in the room
      io.to(room.id).emit('player:updated', {
        player: serializePlayer(player),
      });

      // If all players are ready, emit ready:all-ready event
      if (allReady) {
        console.log(`[player:ready] All players are ready in room ${room.code}`);
        io.to(room.id).emit('ready:all-ready', {
          playerCount: room.players.size,
        });
      }

      if (callback) {
        callback({
          success: true,
          player: serializePlayer(player),
          allReady,
        });
      }
    }
  );

  /**
   * Handle player:update-name event
   * Updates the player's display name
   */
  socket.on(
    'player:update-name',
    (data: { name: string }, callback?: (response: object) => void) => {
      const { name } = data;

      console.log(`[player:update-name] Socket ${socket.id} updating name to "${name}"`);

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        emitRoomError(socket, 'PLAYER_NOT_FOUND', 'Invalid name provided');
        if (callback) {
          callback({
            success: false,
            error: 'INVALID_NAME',
            message: 'Name must be a non-empty string',
          });
        }
        return;
      }

      const trimmedName = name.trim();

      // Limit name length to prevent abuse
      if (trimmedName.length > 30) {
        if (callback) {
          callback({
            success: false,
            error: 'INVALID_NAME',
            message: 'Name must be 30 characters or less',
          });
        }
        return;
      }

      const result = roomService.updatePlayerName(socket.id, trimmedName);

      if (!result.success) {
        emitRoomError(socket, result.error, result.message);
        if (callback) {
          callback({ success: false, error: result.error, message: result.message });
        }
        return;
      }

      const { room, player } = result.data;

      console.log(
        `[player:update-name] Player name updated to "${player.name}" in room ${room.code}`
      );

      // Emit player:updated event to all players in the room
      io.to(room.id).emit('player:updated', {
        player: serializePlayer(player),
      });

      if (callback) {
        callback({
          success: true,
          player: serializePlayer(player),
        });
      }
    }
  );
}

/**
 * Temporary placeholder questions for game rounds
 * TODO: Replace with questionBank.ts when TASK-016 is implemented
 */
const TEMP_QUESTIONS = [
  'A cat riding a bicycle',
  'A happy cloud',
  'A robot eating pizza',
  'A superhero penguin',
  'A dancing tree',
  'A spaceship made of cheese',
];

/**
 * Gets a random question from the temporary question bank
 */
function getRandomQuestion(): string {
  return TEMP_QUESTIONS[Math.floor(Math.random() * TEMP_QUESTIONS.length)];
}

/**
 * Sets up game-related socket event handlers
 * @param io - The Socket.IO server instance
 * @param socket - The connected socket
 */
export function setupGameHandlers(io: Server, socket: Socket): void {
  /**
   * Handle game:start event
   * Only the host can start the game
   * Transitions: lobby → countdown → drawing
   */
  socket.on('game:start', (callback?: (response: object) => void) => {
    console.log(`[game:start] Socket ${socket.id} attempting to start game`);

    // Get the room for this socket
    const roomInfo = roomService.getRoomBySocket(socket.id);

    if (!roomInfo) {
      emitRoomError(socket, 'ROOM_NOT_FOUND', 'You are not in a room');
      if (callback) {
        callback({
          success: false,
          error: 'ROOM_NOT_FOUND',
          message: 'You are not in a room',
        });
      }
      return;
    }

    const { room } = roomInfo;

    // Verify this socket is the host
    if (room.hostSocketId !== socket.id) {
      emitRoomError(socket, 'PLAYER_NOT_FOUND', 'Only the host can start the game');
      if (callback) {
        callback({
          success: false,
          error: 'NOT_HOST',
          message: 'Only the host can start the game',
        });
      }
      return;
    }

    // Validate transition to countdown
    try {
      transitionToCountdown(room);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start game';
      emitRoomError(socket, 'GAME_IN_PROGRESS', message);
      if (callback) {
        callback({
          success: false,
          error: 'TRANSITION_ERROR',
          message,
        });
      }
      return;
    }

    // Update room status to countdown
    let updatedRoom = updateRoomStatus(room, 'countdown');
    roomService.updateRoom(updatedRoom);

    console.log(`[game:start] Game starting in room ${room.code}, beginning countdown`);

    // Emit game:countdown event to all players in the room
    io.to(room.id).emit('game:countdown', {
      count: 3,
    });

    // Start the countdown timer (3 seconds)
    timerService.startCountdown(room.id, 3);

    if (callback) {
      callback({
        success: true,
        status: 'countdown',
      });
    }
  });
}

/**
 * Sets up drawing-related socket event handlers
 * @param io - The Socket.IO server instance
 * @param socket - The connected socket
 */
export function setupDrawingHandlers(io: Server, socket: Socket): void {
  /**
   * Handle drawing:submit event
   * Submits a player's drawing for the current round
   */
  socket.on(
    'drawing:submit',
    (data: { drawingData: string }, callback?: (response: object) => void) => {
      const { drawingData } = data;

      console.log(`[drawing:submit] Socket ${socket.id} submitting drawing`);

      // Validate drawing data
      if (!drawingData || typeof drawingData !== 'string') {
        emitRoomError(socket, 'PLAYER_NOT_FOUND', 'Invalid drawing data');
        if (callback) {
          callback({
            success: false,
            error: 'INVALID_DRAWING',
            message: 'Drawing data is required',
          });
        }
        return;
      }

      // Get the room for this socket
      const roomInfo = roomService.getRoomBySocket(socket.id);

      if (!roomInfo) {
        emitRoomError(socket, 'ROOM_NOT_FOUND', 'You are not in a room');
        if (callback) {
          callback({
            success: false,
            error: 'ROOM_NOT_FOUND',
            message: 'You are not in a room',
          });
        }
        return;
      }

      const { room, playerId } = roomInfo;

      // Verify game is in drawing phase
      if (room.status !== 'drawing') {
        emitRoomError(socket, 'GAME_IN_PROGRESS', 'Not in drawing phase');
        if (callback) {
          callback({
            success: false,
            error: 'WRONG_PHASE',
            message: 'Cannot submit drawing outside of drawing phase',
          });
        }
        return;
      }

      // Check if player already submitted
      if (room.gameState.drawings.has(playerId)) {
        if (callback) {
          callback({
            success: false,
            error: 'ALREADY_SUBMITTED',
            message: 'You have already submitted a drawing',
          });
        }
        return;
      }

      // Submit the drawing
      const updatedRoom = submitDrawing(room, playerId, drawingData);
      roomService.updateRoom(updatedRoom);

      const submittedCount = updatedRoom.gameState.drawings.size;
      const totalPlayers = updatedRoom.players.size;

      console.log(
        `[drawing:submit] Drawing submitted by player in room ${room.code} (${submittedCount}/${totalPlayers})`
      );

      // Emit drawing:submitted event to all players
      io.to(room.id).emit('drawing:submitted', {
        playerId,
        submittedCount,
        totalPlayers,
      });

      // Check if all players have submitted
      if (haveAllPlayersSubmittedDrawings(updatedRoom)) {
        console.log(
          `[drawing:submit] All players have submitted in room ${room.code}, transitioning to voting`
        );

        // Clear the drawing timer
        timerService.clearTimer(room.id);

        // Emit drawing:all-submitted event
        io.to(room.id).emit('drawing:all-submitted', {
          submittedCount,
        });

        // Transition to voting phase
        transitionToVotingPhase(io, updatedRoom);
      }

      if (callback) {
        callback({
          success: true,
          submittedCount,
          totalPlayers,
        });
      }
    }
  );
}

/**
 * Transitions the room to the voting phase
 * @param io - The Socket.IO server instance
 * @param room - The room to transition
 */
function transitionToVotingPhase(io: Server, room: Room): void {
  try {
    transitionToVoting(room);
  } catch (error) {
    console.error(`[transition] Failed to transition to voting:`, error);
    return;
  }

  // Update room status
  const now = Date.now();
  const updatedRoom: Room = {
    ...room,
    status: 'voting',
    gameState: {
      ...room.gameState,
      phaseStartTime: now,
      phaseEndTime: now + room.settings.votingTime * 1000,
    },
  };
  roomService.updateRoom(updatedRoom);

  // Prepare drawings for broadcast (convert Map to array)
  const drawings = Array.from(updatedRoom.gameState.drawings.entries()).map(
    ([playerId, drawingData]) => ({
      playerId,
      drawingData,
    })
  );

  console.log(
    `[transition] Starting voting phase in room ${room.code} with ${drawings.length} drawings`
  );

  // Emit round:voting-start event to all players
  io.to(room.id).emit('round:voting-start', {
    drawings,
    duration: room.settings.votingTime,
  });

  // Start the voting timer
  timerService.startVotingTimer(room.id, room.settings.votingTime);
}

/**
 * Auto-submits blank drawings for players who haven't submitted
 * Called when the drawing timer expires
 * @param io - The Socket.IO server instance
 * @param room - The room
 */
function autoSubmitRemainingDrawings(io: Server, room: Room): void {
  let updatedRoom = room;
  const blankDrawing = ''; // Empty string represents no drawing submitted

  // Find players who haven't submitted
  for (const player of room.players.values()) {
    if (player.isConnected && !room.gameState.drawings.has(player.id)) {
      console.log(
        `[auto-submit] Auto-submitting blank drawing for player "${player.name}" in room ${room.code}`
      );
      updatedRoom = submitDrawing(updatedRoom, player.id, blankDrawing);
    }
  }

  roomService.updateRoom(updatedRoom);

  const submittedCount = updatedRoom.gameState.drawings.size;

  // Emit drawing:all-submitted event
  io.to(room.id).emit('drawing:all-submitted', {
    submittedCount,
  });

  // Transition to voting phase
  transitionToVotingPhase(io, updatedRoom);
}

/**
 * Handles timer expiration events from the TimerService
 * @param io - The Socket.IO server instance
 * @param roomId - The room ID where the timer expired
 * @param timerType - The type of timer that expired
 */
function handleTimerExpired(io: Server, roomId: string, timerType: TimerType): void {
  const room = roomService.getRoom(roomId);

  if (!room) {
    console.error(`[timer:expired] Room ${roomId} not found`);
    return;
  }

  console.log(`[timer:expired] Timer ${timerType} expired in room ${room.code}`);

  if (timerType === 'countdown') {
    // Transition from countdown to drawing
    try {
      transitionToDrawing(room);
    } catch (error) {
      console.error(`[timer:expired] Failed to transition to drawing:`, error);
      return;
    }

    // Prepare for first round
    const currentRound = room.gameState.currentRound + 1;
    const question = getRandomQuestion();

    // Reset game state for new round
    const newGameState = resetGameStateForNewRound(room.gameState, currentRound, question);
    const now = Date.now();
    newGameState.phaseStartTime = now;
    newGameState.phaseEndTime = now + room.settings.drawingTime * 1000;

    // Update room
    const updatedRoom: Room = {
      ...room,
      status: 'drawing',
      gameState: newGameState,
    };
    roomService.updateRoom(updatedRoom);

    console.log(
      `[timer:expired] Starting round ${currentRound} in room ${room.code} with question: "${question}"`
    );

    // Emit round:start event to all players
    io.to(roomId).emit('round:start', {
      round: currentRound,
      totalRounds: room.settings.rounds,
      question,
      duration: room.settings.drawingTime,
    });

    // Start the drawing timer
    timerService.startDrawingTimer(roomId, room.settings.drawingTime);
  }

  if (timerType === 'drawing') {
    // Drawing timer expired - auto-submit remaining drawings
    console.log(`[timer:expired] Drawing timer expired in room ${room.code}`);

    // Emit timer:expired event to notify clients
    io.to(roomId).emit('round:drawing-phase-ended', {
      reason: 'timer_expired',
    });

    // Auto-submit blank drawings for players who haven't submitted
    autoSubmitRemainingDrawings(io, room);
  }

  // Note: voting timer expiration will be handled in TASK-022
}

/**
 * Initializes all socket handlers on the Socket.IO server
 * @param io - The Socket.IO server instance
 */
export function initializeSocketHandlers(io: Server): void {
  // Initialize the TimerService with the Socket.IO server
  timerService.initialize(io);

  // Set up timer expiration callback
  timerService.setOnExpiredCallback((roomId: string, timerType: TimerType) => {
    handleTimerExpired(io, roomId, timerType);
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Acknowledge connection
    socket.emit('connected', { socketId: socket.id });

    // Set up room handlers
    setupRoomHandlers(io, socket);

    // Set up player handlers
    setupPlayerHandlers(io, socket);

    // Set up game handlers
    setupGameHandlers(io, socket);

    // Set up drawing handlers
    setupDrawingHandlers(io, socket);

    // Log errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });
}
