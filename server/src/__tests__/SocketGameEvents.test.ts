/**
 * Integration tests for Socket.IO game events
 * Tests the game flow: game:start, round:start, drawing:submit, vote:cast, game:end
 *
 * These tests verify the Socket.IO game event flow with real timers.
 * The countdown is 3 seconds, so tests involving game start take longer.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { createServer, Server as HttpServer } from 'http';
import { AddressInfo } from 'net';
import { Server as SocketServer } from 'socket.io';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { initializeSocketHandlers } from '../socket';
import { timerService } from '../services/TimerService';

describe('Socket.IO Game Events Integration', () => {
  let httpServer: HttpServer;
  let io: SocketServer;
  let serverPort: number;
  let clientSockets: ClientSocket[] = [];

  // Helper to create a connected client socket
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

  // Helper to wait for an event with a timeout
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

  // Helper to create a room with host as a player
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

    // Host joins as a player
    const joinResponse = await new Promise<{ success: boolean; player: { id: string } }>((resolve) => {
      hostSocket.emit('room:join', { roomCode: roomCreated.room.code }, resolve);
    });

    // Host marks ready
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

  // Helper to join a player to a room and mark them ready
  // Also waits for host to receive the player-joined event
  async function joinAndReadyPlayer(
    roomCode: string,
    hostSocket: ClientSocket
  ): Promise<{ socket: ClientSocket; playerId: string; playerName: string }> {
    const { socket } = await createClient();

    // Set up listener BEFORE joining to avoid race condition
    const playerJoinedPromise = waitForEvent(hostSocket, 'room:player-joined');

    const joinResponse = await new Promise<{
      success: boolean;
      player: { id: string; name: string };
    }>((resolve) => {
      socket.emit('room:join', { roomCode }, resolve);
    });

    // Mark as ready
    await new Promise<{ success: boolean }>((resolve) => {
      socket.emit('player:ready', { isReady: true }, resolve);
    });

    // Wait for host to receive the event
    await playerJoinedPromise;

    return {
      socket,
      playerId: joinResponse.player.id,
      playerName: joinResponse.player.name,
    };
  }

  beforeAll(async () => {
    // Create HTTP server
    httpServer = createServer();

    // Create Socket.IO server
    io = new SocketServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // Initialize socket handlers
    initializeSocketHandlers(io);

    // Start listening on a random available port
    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const address = httpServer.address() as AddressInfo;
        serverPort = address.port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    // Disconnect all clients
    for (const socket of clientSockets) {
      if (socket.connected) {
        socket.disconnect();
      }
    }
    clientSockets = [];

    // Close Socket.IO and HTTP server
    await new Promise<void>((resolve) => {
      io.close(() => {
        httpServer.close(() => {
          resolve();
        });
      });
    });
  });

  afterEach(() => {
    // Disconnect any client sockets created during the test
    for (const socket of clientSockets) {
      if (socket.connected) {
        socket.disconnect();
      }
    }
    clientSockets = [];

    // Clear all timers
    timerService.clearAllTimers();
  });

  describe('game:start', () => {
    it('should start game and trigger countdown when host calls game:start', async () => {
      const { hostSocket, roomCode } = await createRoomWithHost();

      const { socket: player1Socket } = await joinAndReadyPlayer(roomCode, hostSocket);

      // Set up listeners for countdown event BEFORE calling game:start
      const countdownPromise = waitForEvent<{ count: number }>(hostSocket, 'game:countdown');
      const playerCountdownPromise = waitForEvent<{ count: number }>(player1Socket, 'game:countdown');

      // Host starts the game
      const startResponse = await new Promise<{ success: boolean; status?: string }>((resolve) => {
        hostSocket.emit('game:start', resolve);
      });

      expect(startResponse.success).toBe(true);
      expect(startResponse.status).toBe('countdown');

      // Both host and player should receive countdown event
      const hostCountdown = await countdownPromise;
      const playerCountdown = await playerCountdownPromise;

      expect(hostCountdown.count).toBe(3);
      expect(playerCountdown.count).toBe(3);
    }, 15000);

    it('should fail if non-host tries to start game', async () => {
      const { hostSocket, roomCode } = await createRoomWithHost();

      const { socket: playerSocket } = await joinAndReadyPlayer(roomCode, hostSocket);

      // Player tries to start game (should fail)
      const startResponse = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        playerSocket.emit('game:start', resolve);
      });

      expect(startResponse.success).toBe(false);
      expect(startResponse.error).toBe('NOT_HOST');
    }, 15000);
  });

  describe('round:start', () => {
    it('should emit round:start with question after countdown expires', async () => {
      const { hostSocket, roomCode } = await createRoomWithHost();

      const { socket: player1Socket } = await joinAndReadyPlayer(roomCode, hostSocket);

      // Set up listener for round:start BEFORE starting the game
      const roundStartPromise = waitForEvent<{
        round: number;
        totalRounds: number;
        question: string;
        duration: number;
      }>(player1Socket, 'round:start');

      // Host starts the game
      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('game:start', resolve);
      });

      // Wait for round:start event (arrives after 3 second countdown)
      const roundStart = await roundStartPromise;

      expect(roundStart.round).toBe(1);
      expect(roundStart.totalRounds).toBeGreaterThan(0);
      expect(roundStart.question).toBeDefined();
      expect(typeof roundStart.question).toBe('string');
      expect(roundStart.question.length).toBeGreaterThan(0);
      expect(roundStart.duration).toBeGreaterThan(0);
    }, 20000);
  });

  describe('drawing:submit', () => {
    it('should update submission count when player submits drawing', async () => {
      const { hostSocket, roomCode } = await createRoomWithHost();

      const player1 = await joinAndReadyPlayer(roomCode, hostSocket);
      const player2 = await joinAndReadyPlayer(roomCode, hostSocket);

      // Start the game
      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('game:start', resolve);
      });

      // Wait for round:start
      await waitForEvent(player1.socket, 'round:start');

      // Player 1 submits a drawing
      const submitResponse = await new Promise<{
        success: boolean;
        submittedCount?: number;
        totalPlayers?: number;
      }>((resolve) => {
        player1.socket.emit('drawing:submit', { drawingData: 'data:image/png;base64,fake' }, resolve);
      });

      expect(submitResponse.success).toBe(true);
      expect(submitResponse.submittedCount).toBe(1);
      expect(submitResponse.totalPlayers).toBe(3); // host + 2 players
    }, 20000);

    it('should emit drawing:all-submitted when all players submit', async () => {
      const { hostSocket, roomCode } = await createRoomWithHost();

      const player1 = await joinAndReadyPlayer(roomCode, hostSocket);
      const player2 = await joinAndReadyPlayer(roomCode, hostSocket);

      // Start the game
      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('game:start', resolve);
      });

      // Wait for round to start
      await waitForEvent(player1.socket, 'round:start');

      // Set up listener for all-submitted event
      const allSubmittedPromise = waitForEvent<{ submittedCount: number }>(
        hostSocket,
        'drawing:all-submitted'
      );

      // All players submit drawings
      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('drawing:submit', { drawingData: 'data:image/png;base64,hostdrawing' }, resolve);
      });

      await new Promise<{ success: boolean }>((resolve) => {
        player1.socket.emit('drawing:submit', { drawingData: 'data:image/png;base64,drawing1' }, resolve);
      });

      await new Promise<{ success: boolean }>((resolve) => {
        player2.socket.emit('drawing:submit', { drawingData: 'data:image/png;base64,drawing2' }, resolve);
      });

      const allSubmitted = await allSubmittedPromise;
      expect(allSubmitted.submittedCount).toBe(3);
    }, 20000);

    it('should not allow duplicate submissions', async () => {
      const { hostSocket, roomCode } = await createRoomWithHost();

      const player1 = await joinAndReadyPlayer(roomCode, hostSocket);

      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('game:start', resolve);
      });

      await waitForEvent(player1.socket, 'round:start');

      // First submission should succeed
      const firstSubmit = await new Promise<{ success: boolean }>((resolve) => {
        player1.socket.emit('drawing:submit', { drawingData: 'data:image/png;base64,first' }, resolve);
      });
      expect(firstSubmit.success).toBe(true);

      // Second submission should fail
      const secondSubmit = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        player1.socket.emit('drawing:submit', { drawingData: 'data:image/png;base64,second' }, resolve);
      });
      expect(secondSubmit.success).toBe(false);
      expect(secondSubmit.error).toBe('ALREADY_SUBMITTED');
    }, 20000);
  });

  describe('vote:cast', () => {
    it('should record votes and calculate results correctly', async () => {
      const { hostSocket, roomCode, hostPlayerId } = await createRoomWithHost();

      const player1 = await joinAndReadyPlayer(roomCode, hostSocket);
      const player2 = await joinAndReadyPlayer(roomCode, hostSocket);

      // Start the game
      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('game:start', resolve);
      });

      // Wait for round to start
      await waitForEvent(player1.socket, 'round:start');

      // Set up listener for voting-start BEFORE submitting drawings
      const votingStartPromise = waitForEvent(player1.socket, 'round:voting-start');

      // All players submit drawings
      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('drawing:submit', { drawingData: 'data:image/png;base64,hostdrawing' }, resolve);
      });

      await new Promise<{ success: boolean }>((resolve) => {
        player1.socket.emit('drawing:submit', { drawingData: 'data:image/png;base64,drawing1' }, resolve);
      });

      await new Promise<{ success: boolean }>((resolve) => {
        player2.socket.emit('drawing:submit', { drawingData: 'data:image/png;base64,drawing2' }, resolve);
      });

      // Wait for voting to start (triggered when all submit)
      await votingStartPromise;

      // Player 1 votes for Player 2
      const voteResponse = await new Promise<{
        success: boolean;
        votedCount?: number;
        totalPlayers?: number;
      }>((resolve) => {
        player1.socket.emit('vote:cast', { votedForId: player2.playerId }, resolve);
      });

      expect(voteResponse.success).toBe(true);
      expect(voteResponse.votedCount).toBe(1);
      expect(voteResponse.totalPlayers).toBe(3);
    }, 25000);

    it('should not allow voting for own drawing', async () => {
      const { hostSocket, roomCode } = await createRoomWithHost();

      const player1 = await joinAndReadyPlayer(roomCode, hostSocket);
      const player2 = await joinAndReadyPlayer(roomCode, hostSocket);

      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('game:start', resolve);
      });

      await waitForEvent(player1.socket, 'round:start');

      // Set up listener for voting-start BEFORE submitting drawings
      const votingStartPromise = waitForEvent(player1.socket, 'round:voting-start');

      // All submit drawings
      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('drawing:submit', { drawingData: 'data:image/png;base64,hostdrawing' }, resolve);
      });
      await new Promise<{ success: boolean }>((resolve) => {
        player1.socket.emit('drawing:submit', { drawingData: 'data:image/png;base64,drawing1' }, resolve);
      });
      await new Promise<{ success: boolean }>((resolve) => {
        player2.socket.emit('drawing:submit', { drawingData: 'data:image/png;base64,drawing2' }, resolve);
      });

      await votingStartPromise;

      // Player 1 tries to vote for themselves (should fail)
      const voteResponse = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        player1.socket.emit('vote:cast', { votedForId: player1.playerId }, resolve);
      });

      expect(voteResponse.success).toBe(false);
      expect(voteResponse.error).toBe('CANNOT_VOTE_SELF');
    }, 25000);

    it('should emit round:results when all players vote', async () => {
      const { hostSocket, roomCode, hostPlayerId } = await createRoomWithHost();

      const player1 = await joinAndReadyPlayer(roomCode, hostSocket);
      const player2 = await joinAndReadyPlayer(roomCode, hostSocket);

      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('game:start', resolve);
      });

      await waitForEvent(player1.socket, 'round:start');

      // Set up listener for voting-start BEFORE submitting drawings
      const votingStartPromise = waitForEvent(player1.socket, 'round:voting-start');

      // All submit drawings
      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('drawing:submit', { drawingData: 'data:image/png;base64,hostdrawing' }, resolve);
      });
      await new Promise<{ success: boolean }>((resolve) => {
        player1.socket.emit('drawing:submit', { drawingData: 'data:image/png;base64,drawing1' }, resolve);
      });
      await new Promise<{ success: boolean }>((resolve) => {
        player2.socket.emit('drawing:submit', { drawingData: 'data:image/png;base64,drawing2' }, resolve);
      });

      await votingStartPromise;

      // Set up listener for round:results
      const resultsPromise = waitForEvent<{
        round: number;
        winners: Array<{ playerId: string; playerName: string; votes: number }>;
        voteResults: Array<{ playerId: string; votes: number; pointsEarned: number }>;
        scores: Array<{ playerId: string; playerName: string; score: number }>;
      }>(hostSocket, 'round:results');

      // All vote (host->p1, p1->p2, p2->host)
      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('vote:cast', { votedForId: player1.playerId }, resolve);
      });

      await new Promise<{ success: boolean }>((resolve) => {
        player1.socket.emit('vote:cast', { votedForId: player2.playerId }, resolve);
      });

      await new Promise<{ success: boolean }>((resolve) => {
        player2.socket.emit('vote:cast', { votedForId: hostPlayerId }, resolve);
      });

      const results = await resultsPromise;

      expect(results.round).toBe(1);
      expect(results.winners).toBeDefined();
      expect(results.winners.length).toBeGreaterThan(0);
      expect(results.voteResults).toBeDefined();
      expect(results.scores).toBeDefined();

      // Each player should have 1 vote = 100 points
      const hostScore = results.scores.find((s) => s.playerId === hostPlayerId);
      const player1Score = results.scores.find((s) => s.playerId === player1.playerId);
      const player2Score = results.scores.find((s) => s.playerId === player2.playerId);

      expect(hostScore?.score).toBe(100);
      expect(player1Score?.score).toBe(100);
      expect(player2Score?.score).toBe(100);
    }, 30000);
  });

  describe('game:end', () => {
    it('should emit game:end with final standings after all rounds complete', async () => {
      const { hostSocket, roomCode, hostPlayerId } = await createRoomWithHost();

      const player1 = await joinAndReadyPlayer(roomCode, hostSocket);
      const player2 = await joinAndReadyPlayer(roomCode, hostSocket);

      // Set up game:end listener before starting
      const gameEndPromise = waitForEvent<{
        standings: Array<{ playerId: string; playerName: string; score: number }>;
        winner: { playerId: string; playerName: string; score: number };
        totalRounds: number;
      }>(hostSocket, 'game:end', 120000);

      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('game:start', resolve);
      });

      // Play through all rounds (default is 3)
      for (let round = 1; round <= 3; round++) {
        await waitForEvent(player1.socket, 'round:start');

        // Set up listener for voting-start BEFORE submitting drawings
        const votingStartPromise = waitForEvent(player1.socket, 'round:voting-start');

        // All submit drawings
        await new Promise<{ success: boolean }>((resolve) => {
          hostSocket.emit('drawing:submit', { drawingData: `round${round}host` }, resolve);
        });
        await new Promise<{ success: boolean }>((resolve) => {
          player1.socket.emit('drawing:submit', { drawingData: `round${round}p1` }, resolve);
        });
        await new Promise<{ success: boolean }>((resolve) => {
          player2.socket.emit('drawing:submit', { drawingData: `round${round}p2` }, resolve);
        });

        await votingStartPromise;

        // Set up listener for round:results BEFORE voting (for rounds 1-2)
        const resultsPromise = round < 3 ? waitForEvent(hostSocket, 'round:results') : null;

        // All vote (circular: host->p1, p1->p2, p2->host)
        await new Promise<{ success: boolean }>((resolve) => {
          hostSocket.emit('vote:cast', { votedForId: player1.playerId }, resolve);
        });
        await new Promise<{ success: boolean }>((resolve) => {
          player1.socket.emit('vote:cast', { votedForId: player2.playerId }, resolve);
        });
        await new Promise<{ success: boolean }>((resolve) => {
          player2.socket.emit('vote:cast', { votedForId: hostPlayerId }, resolve);
        });

        // Wait for results (needed for round 1-2 to know when next round starts)
        if (resultsPromise) {
          await resultsPromise;
        }
      }

      // Wait for game:end
      const gameEnd = await gameEndPromise;

      expect(gameEnd.standings).toBeDefined();
      expect(gameEnd.standings.length).toBe(3);
      expect(gameEnd.winner).toBeDefined();
      expect(gameEnd.totalRounds).toBe(3);

      // Scores should be 300 each (3 rounds * 1 vote * 100 points)
      expect(gameEnd.standings[0].score).toBe(300);
      expect(gameEnd.standings[1].score).toBe(300);
      expect(gameEnd.standings[2].score).toBe(300);
    }, 150000);

    it('should correctly rank players by score in final standings', async () => {
      const { hostSocket, roomCode, hostPlayerId } = await createRoomWithHost();

      const player1 = await joinAndReadyPlayer(roomCode, hostSocket);
      const player2 = await joinAndReadyPlayer(roomCode, hostSocket);

      const gameEndPromise = waitForEvent<{
        standings: Array<{ playerId: string; playerName: string; score: number }>;
        winner: { playerId: string; playerName: string; score: number };
      }>(hostSocket, 'game:end', 120000);

      await new Promise<{ success: boolean }>((resolve) => {
        hostSocket.emit('game:start', resolve);
      });

      // Play through all rounds
      for (let round = 1; round <= 3; round++) {
        await waitForEvent(player1.socket, 'round:start');

        // Set up listener for voting-start BEFORE submitting drawings
        const votingStartPromise = waitForEvent(player1.socket, 'round:voting-start');

        // All submit drawings
        await new Promise<{ success: boolean }>((resolve) => {
          hostSocket.emit('drawing:submit', { drawingData: `r${round}host` }, resolve);
        });
        await new Promise<{ success: boolean }>((resolve) => {
          player1.socket.emit('drawing:submit', { drawingData: `r${round}p1` }, resolve);
        });
        await new Promise<{ success: boolean }>((resolve) => {
          player2.socket.emit('drawing:submit', { drawingData: `r${round}p2` }, resolve);
        });

        await votingStartPromise;

        // Set up listener for round:results BEFORE voting (for rounds 1-2)
        const resultsPromise = round < 3 ? waitForEvent(hostSocket, 'round:results') : null;

        // Player 2 gets 2 votes (from host and player1)
        // Player 1 gets 1 vote (from player2)
        // Host gets 0 votes
        await new Promise<{ success: boolean }>((resolve) => {
          hostSocket.emit('vote:cast', { votedForId: player2.playerId }, resolve);
        });
        await new Promise<{ success: boolean }>((resolve) => {
          player1.socket.emit('vote:cast', { votedForId: player2.playerId }, resolve);
        });
        await new Promise<{ success: boolean }>((resolve) => {
          player2.socket.emit('vote:cast', { votedForId: player1.playerId }, resolve);
        });

        if (resultsPromise) {
          await resultsPromise;
        }
      }

      const gameEnd = await gameEndPromise;

      // Player 2 should be winner with 600 points (2 votes * 100 * 3 rounds)
      expect(gameEnd.winner.playerId).toBe(player2.playerId);
      expect(gameEnd.winner.score).toBe(600);

      // Standings should be sorted by score descending
      expect(gameEnd.standings[0].playerId).toBe(player2.playerId);
      expect(gameEnd.standings[0].score).toBe(600);

      expect(gameEnd.standings[1].playerId).toBe(player1.playerId);
      expect(gameEnd.standings[1].score).toBe(300);

      expect(gameEnd.standings[2].playerId).toBe(hostPlayerId);
      expect(gameEnd.standings[2].score).toBe(0);
    }, 150000);
  });
});
