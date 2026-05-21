/**
 * Integration tests for the question-skip, game-reset, and player-reconnect
 * socket events. These flows aren't covered by the existing
 * SocketGameEvents tests.
 */

// Set short reconnection timeout for tests (must be before socket import)
process.env.RECONNECTION_TIMEOUT_MS = '100';

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { createServer, Server as HttpServer } from 'http';
import { AddressInfo } from 'net';
import { Server as SocketServer } from 'socket.io';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { initializeSocketHandlers } from '../socket';
import { timerService } from '../services/TimerService';

describe('Socket.IO Skip / Reset / Reconnect', () => {
  let httpServer: HttpServer;
  let io: SocketServer;
  let serverPort: number;
  let clientSockets: ClientSocket[] = [];

  function createClient(): Promise<{ socket: ClientSocket; socketId: string }> {
    return new Promise((resolve, reject) => {
      const socket = ioc(`http://localhost:${serverPort}`, {
        transports: ['websocket'],
        forceNew: true,
      });

      const timeoutId = setTimeout(() => {
        socket.disconnect();
        reject(new Error('Connection timeout'));
      }, 5000);

      socket.once('connected', (data: { socketId: string }) => {
        clearTimeout(timeoutId);
        clientSockets.push(socket);
        resolve({ socket, socketId: data.socketId });
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  function waitForEvent<T>(socket: ClientSocket, event: string, timeout = 15000): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for event: ${event}`));
      }, timeout);

      socket.once(event, (data: T) => {
        clearTimeout(timer);
        resolve(data);
      });
    });
  }

  async function createRoomWithHost(): Promise<{
    hostSocket: ClientSocket;
    roomCode: string;
    roomId: string;
    hostPlayerId: string;
  }> {
    const { socket: hostSocket } = await createClient();

    const roomCreated = await new Promise<{ success: boolean; room: { code: string; id: string } }>(
      (resolve) => {
        hostSocket.emit('room:create', resolve);
      }
    );

    const joinResponse = await new Promise<{ success: boolean; player: { id: string } }>((resolve) => {
      hostSocket.emit('room:join', { roomCode: roomCreated.room.code }, resolve);
    });

    await new Promise<{ success: boolean }>((resolve) => {
      hostSocket.emit('player:ready', { isReady: true }, resolve);
    });

    return {
      hostSocket,
      roomCode: roomCreated.room.code,
      roomId: roomCreated.room.id,
      hostPlayerId: joinResponse.player.id,
    };
  }

  async function joinAndReadyPlayer(
    roomCode: string,
    hostSocket: ClientSocket
  ): Promise<{ socket: ClientSocket; playerId: string; playerName: string }> {
    const { socket } = await createClient();

    const playerJoinedPromise = waitForEvent(hostSocket, 'room:player-joined');

    const joinResponse = await new Promise<{
      success: boolean;
      player: { id: string; name: string };
    }>((resolve) => {
      socket.emit('room:join', { roomCode }, resolve);
    });

    await new Promise<{ success: boolean }>((resolve) => {
      socket.emit('player:ready', { isReady: true }, resolve);
    });

    await playerJoinedPromise;

    return {
      socket,
      playerId: joinResponse.player.id,
      playerName: joinResponse.player.name,
    };
  }

  beforeAll(async () => {
    httpServer = createServer();
    io = new SocketServer(httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });
    initializeSocketHandlers(io);
    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const address = httpServer.address() as AddressInfo;
        serverPort = address.port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    for (const socket of clientSockets) {
      if (socket.connected) socket.disconnect();
    }
    clientSockets = [];
    await new Promise<void>((resolve) => {
      io.close(() => {
        httpServer.close(() => resolve());
      });
    });
  });

  afterEach(() => {
    for (const socket of clientSockets) {
      if (socket.connected) socket.disconnect();
    }
    clientSockets = [];
    timerService.clearAllTimers();
  });

  describe('question:vote-skip', () => {
    it('broadcasts skip-vote-received with current count and threshold', async () => {
      const { hostSocket, roomCode } = await createRoomWithHost();
      const player1 = await joinAndReadyPlayer(roomCode, hostSocket);

      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('game:start', resolve);
      });
      await waitForEvent(player1.socket, 'round:start');

      const hostReceivedPromise = waitForEvent<{
        playerId: string;
        skipVoteCount: number;
        totalActivePlayers: number;
        threshold: number;
      }>(hostSocket, 'question:skip-vote-received');

      const voteResponse = await new Promise<{
        success: boolean;
        skipVoteCount?: number;
        threshold?: number;
      }>((resolve) => {
        player1.socket.emit('question:vote-skip', resolve);
      });

      expect(voteResponse.success).toBe(true);
      expect(voteResponse.skipVoteCount).toBe(1);
      // 2 players → threshold = floor(2/2)+1 = 2
      expect(voteResponse.threshold).toBe(2);

      const broadcast = await hostReceivedPromise;
      expect(broadcast.skipVoteCount).toBe(1);
      expect(broadcast.threshold).toBe(2);
      expect(broadcast.totalActivePlayers).toBe(2);
    }, 20000);

    it('rejects duplicate skip vote from same player', async () => {
      const { hostSocket, roomCode } = await createRoomWithHost();
      const player1 = await joinAndReadyPlayer(roomCode, hostSocket);

      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('game:start', resolve);
      });
      await waitForEvent(player1.socket, 'round:start');

      const first = await new Promise<{ success: boolean }>((resolve) => {
        player1.socket.emit('question:vote-skip', resolve);
      });
      expect(first.success).toBe(true);

      const second = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        player1.socket.emit('question:vote-skip', resolve);
      });
      expect(second.success).toBe(false);
      expect(second.error).toBe('ALREADY_VOTED');
    }, 20000);

    it('replaces the active question once threshold reached', async () => {
      const { hostSocket, roomCode } = await createRoomWithHost();
      const player1 = await joinAndReadyPlayer(roomCode, hostSocket);

      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('game:start', resolve);
      });
      const firstRound = await waitForEvent<{ question: string }>(player1.socket, 'round:start');
      const originalQuestion = firstRound.question;

      // Listen for the question:skipped broadcast that fires once threshold is reached
      const replacedPromise = waitForEvent<{ newQuestion: string }>(
        hostSocket,
        'question:skipped'
      );

      // Both players vote to skip (2 votes = threshold for 2-player game)
      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('question:vote-skip', resolve);
      });
      await new Promise<{ success: boolean }>((resolve) => {
        player1.socket.emit('question:vote-skip', resolve);
      });

      const replaced = await replacedPromise;
      expect(replaced.newQuestion).toBeDefined();
      expect(replaced.newQuestion).not.toBe(originalQuestion);
    }, 20000);

    it('rejects skip vote outside of drawing phase', async () => {
      const { hostSocket } = await createRoomWithHost();

      // Still in lobby — skip vote should fail
      const response = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        hostSocket.emit('question:vote-skip', resolve);
      });
      expect(response.success).toBe(false);
      expect(response.error).toBe('WRONG_PHASE');
    }, 10000);
  });

  describe('game:reset', () => {
    it('rejects reset outside of final phase', async () => {
      const { hostSocket } = await createRoomWithHost();

      const response = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        hostSocket.emit('game:reset', resolve);
      });
      expect(response.success).toBe(false);
      expect(response.error).toBe('WRONG_PHASE');
    }, 10000);

    it('broadcasts reset and returns room to lobby with players preserved', async () => {
      const { hostSocket, roomCode, hostPlayerId } = await createRoomWithHost();
      const player1 = await joinAndReadyPlayer(roomCode, hostSocket);

      // Drive game through to game:end by submitting drawings and votes
      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('game:start', resolve);
      });
      await waitForEvent(player1.socket, 'round:start');

      const gameEndPromise = waitForEvent<{ standings: Array<{ playerId: string }> }>(
        hostSocket,
        'game:end',
        45000
      );

      // Play through all rounds (default = 3)
      // Helper to play one round: submit drawings, vote
      const playRound = async () => {
        const votingStartPromise = waitForEvent(player1.socket, 'round:voting-start');

        await new Promise<{ success: boolean }>((resolve) => {
          hostSocket.emit('drawing:submit', { drawingData: 'data:image/png;base64,h' }, resolve);
        });
        await new Promise<{ success: boolean }>((resolve) => {
          player1.socket.emit('drawing:submit', { drawingData: 'data:image/png;base64,p' }, resolve);
        });

        await votingStartPromise;

        await new Promise<{ success: boolean }>((resolve) => {
          hostSocket.emit('vote:cast', { votedForId: player1.playerId }, resolve);
        });
        await new Promise<{ success: boolean }>((resolve) => {
          player1.socket.emit('vote:cast', { votedForId: hostPlayerId }, resolve);
        });
      };

      // Play 3 rounds (default total)
      for (let r = 1; r <= 3; r++) {
        await playRound();
        if (r < 3) {
          await waitForEvent(player1.socket, 'round:start');
        }
      }

      await gameEndPromise;

      // Now reset the game
      const playerResetPromise = waitForEvent<{ room: { status: string; players: unknown[] } }>(
        player1.socket,
        'game:reset'
      );

      const resetResponse = await new Promise<{
        success: boolean;
        room?: { status: string; players: unknown[] };
      }>((resolve) => {
        hostSocket.emit('game:reset', resolve);
      });

      expect(resetResponse.success).toBe(true);
      expect(resetResponse.room?.status).toBe('lobby');
      expect(resetResponse.room?.players.length).toBe(2);

      // Player should also receive the broadcast
      const broadcast = await playerResetPromise;
      expect(broadcast.room.status).toBe('lobby');
      expect(broadcast.room.players.length).toBe(2);
    }, 60000);
  });

  describe('player:reconnect', () => {
    it('rejects reconnect with missing roomCode or playerId', async () => {
      const { socket } = await createClient();
      const response = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        socket.emit('player:reconnect', { roomCode: '', playerId: '' }, resolve);
      });
      expect(response.success).toBe(false);
      expect(response.error).toBe('INVALID_PARAMS');
    });

    it('rejects reconnect to nonexistent room', async () => {
      const { socket } = await createClient();
      const response = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        socket.emit('player:reconnect', { roomCode: 'XXXXXX', playerId: 'fake' }, resolve);
      });
      expect(response.success).toBe(false);
      expect(response.error).toBe('ROOM_NOT_FOUND');
    });

    it('rejects reconnect with unknown player id in valid room', async () => {
      const { roomCode } = await createRoomWithHost();
      const { socket } = await createClient();
      const response = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        socket.emit('player:reconnect', { roomCode, playerId: 'not-a-real-player' }, resolve);
      });
      expect(response.success).toBe(false);
      expect(response.error).toBe('PLAYER_NOT_FOUND');
    });

    it('reconnects an existing player with a new socket id and preserves them', async () => {
      const { hostSocket, roomCode } = await createRoomWithHost();
      const player1 = await joinAndReadyPlayer(roomCode, hostSocket);

      // Simulate the player dropping their old connection (the server keeps them
      // in the room until RECONNECTION_TIMEOUT_MS, which we set to 100ms — so we
      // immediately reconnect on a fresh socket).
      player1.socket.disconnect();

      const { socket: newSocket } = await createClient();
      const response = await new Promise<{
        success: boolean;
        player?: { id: string; name: string };
        room?: { players: Array<{ id: string }> };
      }>((resolve) => {
        newSocket.emit('player:reconnect', { roomCode, playerId: player1.playerId }, resolve);
      });

      expect(response.success).toBe(true);
      expect(response.player?.id).toBe(player1.playerId);
      expect(response.player?.name).toBe(player1.playerName);
      // Player should still be present in the room
      const stillThere = response.room?.players.some((p) => p.id === player1.playerId);
      expect(stillThere).toBe(true);
    });
  });
});
