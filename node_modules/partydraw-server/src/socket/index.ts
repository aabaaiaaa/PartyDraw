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
  castVote,
  haveAllPlayersVoted,
} from '../models/Room';
import { Player, updateHeartbeat } from '../models/Player';
import {
  transitionToCountdown,
  transitionToDrawing,
  transitionToVoting,
  transitionToResults,
  getNextStateAfterResults,
} from '../models/Game';
import { timerService, TimerType } from '../services/TimerService';

/** Reconnection timeout in milliseconds (10 seconds) */
const RECONNECTION_TIMEOUT_MS = 10000;

/** Map of player ID to their pending disconnect timeout */
const pendingDisconnects: Map<string, NodeJS.Timeout> = new Map();

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
    isSpectator: player.isSpectator,
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
   * If the game is in progress, the player joins as a spectator
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

      const { room, player, isSpectator } = result.data;

      // Join the socket to the Socket.IO room for broadcasting
      socket.join(room.id);

      if (isSpectator) {
        console.log(
          `[room:join] Player "${player.name}" joined room ${room.code} as SPECTATOR (${room.players.size} players)`
        );
      } else {
        console.log(
          `[room:join] Player "${player.name}" joined room ${room.code} (${room.players.size} players)`
        );
      }

      // Emit room:joined event to the joining player
      socket.emit('room:joined', {
        room: serializeRoom(room),
        player: serializePlayer(player),
        isSpectator,
      });

      // Emit room:player-joined event to all other players in the room
      socket.to(room.id).emit('room:player-joined', {
        player: serializePlayer(player),
        playerCount: room.players.size,
        isSpectator,
      });

      if (callback) {
        callback({
          success: true,
          room: serializeRoom(room),
          player: serializePlayer(player),
          isSpectator,
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
   * Mark player as disconnected and start reconnection timeout
   * After 10 seconds without reconnection, remove player from room
   */
  socket.on('disconnect', () => {
    console.log(`[disconnect] Socket ${socket.id} disconnected`);

    // Get room info before marking as disconnected
    const roomInfo = roomService.getRoomBySocket(socket.id);

    if (!roomInfo) {
      // Socket wasn't in a room
      return;
    }

    const { room: currentRoom, playerId } = roomInfo;
    const roomId = currentRoom.id;

    // Check if this is the host
    if (currentRoom.hostSocketId === socket.id) {
      // Host disconnected - close the room immediately
      const result = roomService.leaveRoom(socket.id);

      if (result.success) {
        io.to(roomId).emit('room:closed', {
          reason: 'Host disconnected',
        });
        // Remove all sockets from the room
        io.in(roomId).socketsLeave(roomId);

        // Cancel any pending disconnect timeouts for players in this room
        for (const player of currentRoom.players.values()) {
          const timeout = pendingDisconnects.get(player.id);
          if (timeout) {
            clearTimeout(timeout);
            pendingDisconnects.delete(player.id);
          }
        }

        console.log(`[disconnect] Host disconnected, room closed`);
      }
      return;
    }

    // Regular player disconnected - mark as disconnected and start timeout
    const markResult = roomService.markPlayerDisconnected(socket.id);

    if (!markResult.success) {
      console.error(`[disconnect] Error marking player disconnected: ${markResult.message}`);
      return;
    }

    const { room, player } = markResult.data;

    console.log(
      `[disconnect] Player "${player.name}" disconnected from room ${room.code}, starting ${RECONNECTION_TIMEOUT_MS / 1000}s reconnection timeout`
    );

    // Notify other players that this player is disconnected (but not removed yet)
    io.to(roomId).emit('player:disconnected', {
      playerId,
      playerName: player.name,
    });

    // Start reconnection timeout
    const timeoutId = setTimeout(() => {
      // After timeout, check if player is still disconnected
      const currentRoomInfo = roomService.getRoom(roomId);

      if (!currentRoomInfo) {
        // Room no longer exists
        pendingDisconnects.delete(playerId);
        return;
      }

      const currentPlayer = currentRoomInfo.players.get(playerId);

      if (!currentPlayer) {
        // Player was already removed
        pendingDisconnects.delete(playerId);
        return;
      }

      if (!currentPlayer.isConnected) {
        // Player is still disconnected - remove them
        console.log(
          `[disconnect] Player "${currentPlayer.name}" did not reconnect within ${RECONNECTION_TIMEOUT_MS / 1000}s, removing from room ${currentRoomInfo.code}`
        );

        const leaveResult = roomService.removePlayer(roomId, playerId);

        if (leaveResult.success) {
          const updatedRoom = leaveResult.data;

          // Emit room:player-left event to remaining players
          io.to(roomId).emit('room:player-left', {
            playerId,
            playerName: currentPlayer.name,
            playerCount: updatedRoom.players.size,
            reason: 'disconnect_timeout',
          });

          console.log(
            `[disconnect] Player "${currentPlayer.name}" removed from room ${currentRoomInfo.code} (${updatedRoom.players.size} players remaining)`
          );
        }
      }

      pendingDisconnects.delete(playerId);
    }, RECONNECTION_TIMEOUT_MS);

    pendingDisconnects.set(playerId, timeoutId);
  });
}

/**
 * Cancels a pending disconnect timeout for a player
 * @param playerId - The player ID whose timeout to cancel
 * @returns true if a timeout was cancelled, false otherwise
 */
function cancelPendingDisconnect(playerId: string): boolean {
  const timeout = pendingDisconnects.get(playerId);
  if (timeout) {
    clearTimeout(timeout);
    pendingDisconnects.delete(playerId);
    return true;
  }
  return false;
}

/**
 * Sets up player-related socket event handlers
 * @param io - The Socket.IO server instance
 * @param socket - The connected socket
 */
export function setupPlayerHandlers(io: Server, socket: Socket): void {
  /**
   * Handle player:reconnect event
   * Reconnects a player to a room they were previously in
   */
  socket.on(
    'player:reconnect',
    (
      data: { roomCode: string; playerId: string },
      callback?: (response: object) => void
    ) => {
      const { roomCode, playerId } = data;

      console.log(
        `[player:reconnect] Socket ${socket.id} attempting to reconnect as player ${playerId} to room ${roomCode}`
      );

      if (!roomCode || !playerId) {
        if (callback) {
          callback({
            success: false,
            error: 'INVALID_PARAMS',
            message: 'Room code and player ID are required',
          });
        }
        return;
      }

      // Find the room by code
      const room = roomService.getRoomByCode(roomCode);

      if (!room) {
        emitRoomError(socket, 'ROOM_NOT_FOUND', 'Room not found');
        if (callback) {
          callback({
            success: false,
            error: 'ROOM_NOT_FOUND',
            message: `Room with code "${roomCode}" not found`,
          });
        }
        return;
      }

      // Check if the player exists in the room
      const player = room.players.get(playerId);

      if (!player) {
        emitRoomError(socket, 'PLAYER_NOT_FOUND', 'Player not found in room');
        if (callback) {
          callback({
            success: false,
            error: 'PLAYER_NOT_FOUND',
            message: 'You are no longer in this room',
          });
        }
        return;
      }

      // Cancel any pending disconnect timeout
      const hadPendingTimeout = cancelPendingDisconnect(playerId);

      if (hadPendingTimeout) {
        console.log(
          `[player:reconnect] Cancelled pending disconnect timeout for player "${player.name}"`
        );
      }

      // Reconnect the player with the new socket ID
      const result = roomService.reconnectPlayer(room.id, playerId, socket.id);

      if (!result.success) {
        emitRoomError(socket, result.error, result.message);
        if (callback) {
          callback({
            success: false,
            error: result.error,
            message: result.message,
          });
        }
        return;
      }

      const { room: updatedRoom, player: updatedPlayer } = result.data;

      // Join the socket to the Socket.IO room
      socket.join(updatedRoom.id);

      console.log(
        `[player:reconnect] Player "${updatedPlayer.name}" reconnected to room ${updatedRoom.code}`
      );

      // Emit reconnection success to the player
      socket.emit('player:reconnected', {
        room: serializeRoom(updatedRoom),
        player: serializePlayer(updatedPlayer),
      });

      // Notify other players that this player has reconnected
      socket.to(updatedRoom.id).emit('player:returned', {
        player: serializePlayer(updatedPlayer),
        playerCount: updatedRoom.players.size,
      });

      if (callback) {
        callback({
          success: true,
          room: serializeRoom(updatedRoom),
          player: serializePlayer(updatedPlayer),
        });
      }
    }
  );

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
 * Calculates the vote count for each player
 * @param votes - Map of voter ID to voted-for player ID
 * @returns Map of player ID to vote count
 */
function calculateVoteCounts(votes: Map<string, string>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const votedForId of votes.values()) {
    counts.set(votedForId, (counts.get(votedForId) || 0) + 1);
  }
  return counts;
}

/**
 * Finds the winner(s) of the round based on vote counts
 * @param voteCounts - Map of player ID to vote count
 * @returns Array of player IDs with the highest vote count (may be multiple in case of tie)
 */
function findWinners(voteCounts: Map<string, number>): string[] {
  let maxVotes = 0;
  const winners: string[] = [];

  for (const [playerId, count] of voteCounts.entries()) {
    if (count > maxVotes) {
      maxVotes = count;
      winners.length = 0;
      winners.push(playerId);
    } else if (count === maxVotes) {
      winners.push(playerId);
    }
  }

  return winners;
}

/**
 * Updates player scores based on votes received
 * Each vote gives 100 points
 * @param room - The room to update
 * @param voteCounts - Map of player ID to vote count
 * @returns Updated room with new player scores
 */
function updatePlayerScores(room: Room, voteCounts: Map<string, number>): Room {
  const newPlayers = new Map(room.players);

  for (const [playerId, voteCount] of voteCounts.entries()) {
    const player = newPlayers.get(playerId);
    if (player) {
      const pointsEarned = voteCount * 100;
      newPlayers.set(playerId, {
        ...player,
        score: player.score + pointsEarned,
      });
    }
  }

  return {
    ...room,
    players: newPlayers,
  };
}

/**
 * Gets player scores sorted by score descending
 * @param room - The room
 * @returns Array of player scores sorted by score
 */
function getSortedScores(room: Room): Array<{ playerId: string; playerName: string; score: number }> {
  const scores: Array<{ playerId: string; playerName: string; score: number }> = [];

  for (const player of room.players.values()) {
    scores.push({
      playerId: player.id,
      playerName: player.name,
      score: player.score,
    });
  }

  return scores.sort((a, b) => b.score - a.score);
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
 * Auto-submits blank drawings for active (non-spectator) players who haven't submitted
 * Called when the drawing timer expires
 * @param io - The Socket.IO server instance
 * @param room - The room
 */
function autoSubmitRemainingDrawings(io: Server, room: Room): void {
  let updatedRoom = room;
  const blankDrawing = ''; // Empty string represents no drawing submitted

  // Find active players who haven't submitted (spectators are excluded)
  for (const player of room.players.values()) {
    if (player.isConnected && !player.isSpectator && !room.gameState.drawings.has(player.id)) {
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
 * Transitions the room to the results phase and calculates scores
 * @param io - The Socket.IO server instance
 * @param room - The room to transition
 */
function transitionToResultsPhase(io: Server, room: Room): void {
  try {
    transitionToResults(room);
  } catch (error) {
    console.error(`[transition] Failed to transition to results:`, error);
    return;
  }

  // Calculate vote counts
  const voteCounts = calculateVoteCounts(room.gameState.votes);

  // Update player scores
  let updatedRoom = updatePlayerScores(room, voteCounts);

  // Update room status to results
  updatedRoom = {
    ...updatedRoom,
    status: 'results',
  };
  roomService.updateRoom(updatedRoom);

  // Find winner(s)
  const winners = findWinners(voteCounts);

  // Prepare vote results for each player
  const voteResults = Array.from(voteCounts.entries()).map(([playerId, count]) => {
    const player = updatedRoom.players.get(playerId);
    return {
      playerId,
      playerName: player?.name || 'Unknown',
      votes: count,
      pointsEarned: count * 100,
    };
  });

  // Get player info for winners
  const winnerInfo = winners.map((winnerId) => {
    const player = updatedRoom.players.get(winnerId);
    return {
      playerId: winnerId,
      playerName: player?.name || 'Unknown',
      votes: voteCounts.get(winnerId) || 0,
    };
  });

  console.log(
    `[transition] Round ${room.gameState.currentRound} results in room ${room.code}: ` +
      `Winner(s): ${winnerInfo.map((w) => w.playerName).join(', ')}`
  );

  // Emit round:results event to all players
  io.to(room.id).emit('round:results', {
    round: room.gameState.currentRound,
    winners: winnerInfo,
    voteResults,
    scores: getSortedScores(updatedRoom),
  });

  // Determine next phase: another round or final
  const nextState = getNextStateAfterResults(updatedRoom);

  // Set a short delay before transitioning to next phase (allow results to be shown)
  setTimeout(() => {
    if (nextState === 'final') {
      // Game is over - transition to final and emit game:end
      transitionToFinalPhase(io, updatedRoom);
    } else {
      // More rounds - start next round
      startNextRound(io, updatedRoom);
    }
  }, 5000); // 5 second delay to show results
}

/**
 * Transitions to the final phase and emits game end event
 * @param io - The Socket.IO server instance
 * @param room - The room to transition
 */
function transitionToFinalPhase(io: Server, room: Room): void {
  // Get fresh room state in case it was updated
  const currentRoom = roomService.getRoom(room.id);
  if (!currentRoom) {
    console.error(`[transition] Room ${room.id} not found for final transition`);
    return;
  }

  // Update room status to final
  const updatedRoom: Room = {
    ...currentRoom,
    status: 'final',
  };
  roomService.updateRoom(updatedRoom);

  // Get final standings sorted by score
  const finalStandings = getSortedScores(updatedRoom);

  console.log(
    `[transition] Game ended in room ${currentRoom.code}. ` +
      `Winner: ${finalStandings[0]?.playerName || 'No winner'} with ${finalStandings[0]?.score || 0} points`
  );

  // Emit game:end event to all players
  io.to(room.id).emit('game:end', {
    standings: finalStandings,
    winner: finalStandings[0] || null,
    totalRounds: currentRoom.settings.rounds,
  });
}

/**
 * Starts the next round of the game
 * @param io - The Socket.IO server instance
 * @param room - The room
 */
function startNextRound(io: Server, room: Room): void {
  // Get fresh room state
  let currentRoom = roomService.getRoom(room.id);
  if (!currentRoom) {
    console.error(`[transition] Room ${room.id} not found for next round`);
    return;
  }

  // Promote any spectators to active players at the start of a new round
  const promoteResult = roomService.promoteSpectators(room.id);
  if (promoteResult.success && promoteResult.data.promotedPlayerIds.length > 0) {
    currentRoom = promoteResult.data.room;
    console.log(
      `[transition] Promoted ${promoteResult.data.promotedPlayerIds.length} spectator(s) to active players in room ${currentRoom.code}`
    );

    // Notify all clients about the promoted players
    for (const playerId of promoteResult.data.promotedPlayerIds) {
      const player = currentRoom.players.get(playerId);
      if (player) {
        io.to(room.id).emit('player:promoted', {
          player: serializePlayer(player),
        });
      }
    }
  }

  // Prepare for next round
  const nextRound = currentRoom.gameState.currentRound + 1;
  const question = getRandomQuestion();

  // Reset game state for new round
  const newGameState = resetGameStateForNewRound(currentRoom.gameState, nextRound, question);
  const now = Date.now();
  newGameState.phaseStartTime = now;
  newGameState.phaseEndTime = now + currentRoom.settings.drawingTime * 1000;

  // Update room
  const updatedRoom: Room = {
    ...currentRoom,
    status: 'drawing',
    gameState: newGameState,
  };
  roomService.updateRoom(updatedRoom);

  console.log(
    `[transition] Starting round ${nextRound} in room ${currentRoom.code} with question: "${question}"`
  );

  // Emit round:start event to all players
  io.to(room.id).emit('round:start', {
    round: nextRound,
    totalRounds: currentRoom.settings.rounds,
    question,
    duration: currentRoom.settings.drawingTime,
  });

  // Start the drawing timer
  timerService.startDrawingTimer(room.id, currentRoom.settings.drawingTime);
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
    // This allows clients to auto-submit their current canvas state
    io.to(roomId).emit('round:drawing-phase-ended', {
      reason: 'timer_expired',
    });

    // Give clients a brief moment to submit their drawings before server fallback
    // This delay allows the client's auto-submit (with actual drawing) to arrive
    // before we fall back to blank drawings for missing submissions
    setTimeout(() => {
      // Get fresh room state in case drawings were submitted during the delay
      const currentRoom = roomService.getRoom(roomId);
      if (currentRoom && currentRoom.status === 'drawing') {
        autoSubmitRemainingDrawings(io, currentRoom);
      }
    }, 500); // 500ms grace period for client auto-submit
  }

  if (timerType === 'voting') {
    // Voting timer expired - transition to results
    console.log(`[timer:expired] Voting timer expired in room ${room.code}`);

    // Emit voting phase ended event
    io.to(roomId).emit('round:voting-phase-ended', {
      reason: 'timer_expired',
    });

    // Transition to results phase
    transitionToResultsPhase(io, room);
  }
}

/**
 * Sets up voting-related socket event handlers
 * @param io - The Socket.IO server instance
 * @param socket - The connected socket
 */
export function setupVotingHandlers(io: Server, socket: Socket): void {
  /**
   * Handle vote:cast event
   * Casts a vote for a player's drawing
   */
  socket.on(
    'vote:cast',
    (data: { votedForId: string }, callback?: (response: object) => void) => {
      const { votedForId } = data;

      console.log(`[vote:cast] Socket ${socket.id} voting for player ${votedForId}`);

      // Validate voted player ID
      if (!votedForId || typeof votedForId !== 'string') {
        emitRoomError(socket, 'PLAYER_NOT_FOUND', 'Invalid vote target');
        if (callback) {
          callback({
            success: false,
            error: 'INVALID_VOTE',
            message: 'Vote target is required',
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

      // Verify game is in voting phase
      if (room.status !== 'voting') {
        emitRoomError(socket, 'GAME_IN_PROGRESS', 'Not in voting phase');
        if (callback) {
          callback({
            success: false,
            error: 'WRONG_PHASE',
            message: 'Cannot vote outside of voting phase',
          });
        }
        return;
      }

      // Prevent voting for own drawing
      if (votedForId === playerId) {
        if (callback) {
          callback({
            success: false,
            error: 'CANNOT_VOTE_SELF',
            message: 'You cannot vote for your own drawing',
          });
        }
        return;
      }

      // Verify voted player exists and has a drawing
      if (!room.gameState.drawings.has(votedForId)) {
        if (callback) {
          callback({
            success: false,
            error: 'INVALID_VOTE',
            message: 'Cannot vote for a player without a drawing',
          });
        }
        return;
      }

      // Check if player already voted
      if (room.gameState.votes.has(playerId)) {
        if (callback) {
          callback({
            success: false,
            error: 'ALREADY_VOTED',
            message: 'You have already voted',
          });
        }
        return;
      }

      // Cast the vote
      const updatedRoom = castVote(room, playerId, votedForId);
      roomService.updateRoom(updatedRoom);

      const votedCount = updatedRoom.gameState.votes.size;
      const totalPlayers = updatedRoom.players.size;

      console.log(
        `[vote:cast] Vote cast in room ${room.code} (${votedCount}/${totalPlayers})`
      );

      // Emit vote:received event to all players
      io.to(room.id).emit('vote:received', {
        voterId: playerId,
        votedCount,
        totalPlayers,
      });

      // Check if all players have voted
      if (haveAllPlayersVoted(updatedRoom)) {
        console.log(
          `[vote:cast] All players have voted in room ${room.code}, transitioning to results`
        );

        // Clear the voting timer
        timerService.clearTimer(room.id);

        // Emit voting:all-voted event
        io.to(room.id).emit('voting:all-voted', {
          votedCount,
        });

        // Transition to results phase
        transitionToResultsPhase(io, updatedRoom);
      }

      if (callback) {
        callback({
          success: true,
          votedCount,
          totalPlayers,
        });
      }
    }
  );
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

    // Set up voting handlers
    setupVotingHandlers(io, socket);

    // Log errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });
}
