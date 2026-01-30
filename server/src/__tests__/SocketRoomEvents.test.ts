/**
 * Integration tests for Socket.IO room events
 * Tests the full socket flow: create room, join room, player-joined/player-left events
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { createServer, Server as HttpServer } from 'http';
import { AddressInfo } from 'net';
import { Server as SocketServer } from 'socket.io';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { initializeSocketHandlers } from '../socket';

describe('Socket.IO Room Events Integration', () => {
  let httpServer: HttpServer;
  let io: SocketServer;
  let serverPort: number;
  let clientSockets: ClientSocket[] = [];

  // Helper to create a connected client socket that also waits for the 'connected' acknowledgment
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

      // Listen for the 'connected' event from the server
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
  function waitForEvent<T>(socket: ClientSocket, event: string, timeout = 3000): Promise<T> {
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

    // Initialize socket handlers (this sets up the event listeners)
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
  });

  describe('room:create', () => {
    it('should create a room and receive a room code', async () => {
      const { socket: client, socketId } = await createClient();

      expect(socketId).toBeDefined();

      // Create room and wait for response
      const roomCreatedPromise = waitForEvent<{ room: { code: string; id: string } }>(
        client,
        'room:created'
      );

      client.emit('room:create');

      const roomCreated = await roomCreatedPromise;

      expect(roomCreated.room).toBeDefined();
      expect(roomCreated.room.code).toBeDefined();
      expect(roomCreated.room.code).toHaveLength(6);
      expect(roomCreated.room.id).toBeDefined();
    });

    it('should receive room code via callback', async () => {
      const { socket: client } = await createClient();

      // Create room with callback
      const response = await new Promise<{ success: boolean; room?: { code: string } }>(
        (resolve) => {
          client.emit('room:create', (response: { success: boolean; room?: { code: string } }) => {
            resolve(response);
          });
        }
      );

      expect(response.success).toBe(true);
      expect(response.room?.code).toBeDefined();
      expect(response.room?.code).toHaveLength(6);
    });
  });

  describe('room:join', () => {
    it('should allow a second client to join an existing room', async () => {
      // Create host client and room
      const { socket: hostClient } = await createClient();

      const roomCreated = await new Promise<{ success: boolean; room: { code: string; id: string } }>(
        (resolve) => {
          hostClient.emit('room:create', resolve);
        }
      );

      expect(roomCreated.success).toBe(true);
      const roomCode = roomCreated.room.code;

      // Create player client
      const { socket: playerClient } = await createClient();

      // Join the room
      const joinResponse = await new Promise<{
        success: boolean;
        room?: { code: string; players: Array<{ id: string; name: string }> };
        player?: { id: string; name: string };
      }>((resolve) => {
        playerClient.emit('room:join', { roomCode }, resolve);
      });

      expect(joinResponse.success).toBe(true);
      expect(joinResponse.room?.code).toBe(roomCode);
      expect(joinResponse.player).toBeDefined();
      expect(joinResponse.player?.name).toBeDefined();
    });

    it('should fail to join a non-existent room', async () => {
      const { socket: client } = await createClient();

      const joinResponse = await new Promise<{ success: boolean; error?: string }>(
        (resolve) => {
          client.emit('room:join', { roomCode: 'INVALID' }, resolve);
        }
      );

      expect(joinResponse.success).toBe(false);
      expect(joinResponse.error).toBe('ROOM_NOT_FOUND');
    });
  });

  describe('room:player-joined event', () => {
    it('should notify host when a player joins', async () => {
      // Create host client and room
      const { socket: hostClient } = await createClient();

      const roomCreated = await new Promise<{ success: boolean; room: { code: string } }>(
        (resolve) => {
          hostClient.emit('room:create', resolve);
        }
      );

      const roomCode = roomCreated.room.code;

      // Set up listener for player-joined on host before player joins
      const playerJoinedPromise = waitForEvent<{
        player: { id: string; name: string };
        playerCount: number;
      }>(hostClient, 'room:player-joined');

      // Create player client and join
      const { socket: playerClient } = await createClient();

      // Player receives room:joined, host receives room:player-joined
      const joinResponse = await new Promise<{
        success: boolean;
        player?: { id: string; name: string };
      }>((resolve) => {
        playerClient.emit('room:join', { roomCode }, resolve);
      });

      expect(joinResponse.success).toBe(true);

      // Wait for host to receive player-joined event
      const playerJoined = await playerJoinedPromise;

      expect(playerJoined.player).toBeDefined();
      expect(playerJoined.player.id).toBe(joinResponse.player?.id);
      expect(playerJoined.player.name).toBe(joinResponse.player?.name);
      expect(playerJoined.playerCount).toBe(1);
    });

    it('should update player count as more players join', async () => {
      // Create host client and room
      const { socket: hostClient } = await createClient();

      const roomCreated = await new Promise<{ success: boolean; room: { code: string } }>(
        (resolve) => {
          hostClient.emit('room:create', resolve);
        }
      );

      const roomCode = roomCreated.room.code;

      // First player joins
      const { socket: player1Client } = await createClient();

      const player1JoinedOnHostPromise = waitForEvent<{ playerCount: number }>(
        hostClient,
        'room:player-joined'
      );

      await new Promise((resolve) => {
        player1Client.emit('room:join', { roomCode }, resolve);
      });

      const player1JoinedOnHost = await player1JoinedOnHostPromise;
      expect(player1JoinedOnHost.playerCount).toBe(1);

      // Second player joins - both host and player1 should receive the event
      const { socket: player2Client } = await createClient();

      const player2JoinedOnHostPromise = waitForEvent<{ playerCount: number }>(
        hostClient,
        'room:player-joined'
      );
      const player2JoinedOnPlayer1Promise = waitForEvent<{ playerCount: number }>(
        player1Client,
        'room:player-joined'
      );

      await new Promise((resolve) => {
        player2Client.emit('room:join', { roomCode }, resolve);
      });

      const player2JoinedOnHost = await player2JoinedOnHostPromise;
      const player2JoinedOnPlayer1 = await player2JoinedOnPlayer1Promise;

      expect(player2JoinedOnHost.playerCount).toBe(2);
      expect(player2JoinedOnPlayer1.playerCount).toBe(2);
    });
  });

  describe('room:player-left event', () => {
    it('should notify host when a player leaves via room:leave', async () => {
      // Create host client and room
      const { socket: hostClient } = await createClient();

      const roomCreated = await new Promise<{ success: boolean; room: { code: string } }>(
        (resolve) => {
          hostClient.emit('room:create', resolve);
        }
      );

      const roomCode = roomCreated.room.code;

      // Player joins
      const { socket: playerClient } = await createClient();

      const joinResponse = await new Promise<{ success: boolean; player?: { id: string } }>(
        (resolve) => {
          playerClient.emit('room:join', { roomCode }, resolve);
        }
      );

      expect(joinResponse.success).toBe(true);

      // Wait for host to receive player-joined first
      await waitForEvent(hostClient, 'room:player-joined');

      // Set up listener for player-left on host
      const playerLeftPromise = waitForEvent<{
        playerId: string;
        playerCount: number;
      }>(hostClient, 'room:player-left');

      // Player leaves
      await new Promise((resolve) => {
        playerClient.emit('room:leave', resolve);
      });

      // Wait for host to receive player-left event
      const playerLeft = await playerLeftPromise;

      expect(playerLeft.playerId).toBe(joinResponse.player?.id);
      expect(playerLeft.playerCount).toBe(0);
    });

    it('should notify host when a player disconnects', async () => {
      // Create host client and room
      const { socket: hostClient } = await createClient();

      const roomCreated = await new Promise<{ success: boolean; room: { code: string } }>(
        (resolve) => {
          hostClient.emit('room:create', resolve);
        }
      );

      const roomCode = roomCreated.room.code;

      // Player joins
      const { socket: playerClient } = await createClient();

      const joinResponse = await new Promise<{ success: boolean; player?: { id: string } }>(
        (resolve) => {
          playerClient.emit('room:join', { roomCode }, resolve);
        }
      );

      expect(joinResponse.success).toBe(true);

      // Wait for host to receive player-joined first
      await waitForEvent(hostClient, 'room:player-joined');

      // Set up listener for player-left on host
      const playerLeftPromise = waitForEvent<{
        playerId: string;
        playerCount: number;
      }>(hostClient, 'room:player-left');

      // Player disconnects (simulating browser close/network issue)
      // Remove from tracked sockets first to avoid afterEach disconnect
      const playerIndex = clientSockets.indexOf(playerClient);
      if (playerIndex > -1) {
        clientSockets.splice(playerIndex, 1);
      }
      playerClient.disconnect();

      // Wait for host to receive player-left event
      const playerLeft = await playerLeftPromise;

      expect(playerLeft.playerId).toBe(joinResponse.player?.id);
      expect(playerLeft.playerCount).toBe(0);
    });

    it('should update player count correctly when multiple players leave', async () => {
      // Create host client and room
      const { socket: hostClient } = await createClient();

      const roomCreated = await new Promise<{ success: boolean; room: { code: string } }>(
        (resolve) => {
          hostClient.emit('room:create', resolve);
        }
      );

      const roomCode = roomCreated.room.code;

      // Player 1 joins
      const { socket: player1Client } = await createClient();

      await new Promise((resolve) => {
        player1Client.emit('room:join', { roomCode }, resolve);
      });
      await waitForEvent(hostClient, 'room:player-joined');

      // Player 2 joins
      const { socket: player2Client } = await createClient();

      await new Promise((resolve) => {
        player2Client.emit('room:join', { roomCode }, resolve);
      });
      await waitForEvent(hostClient, 'room:player-joined');

      // Player 2 leaves
      const player2LeftPromise = waitForEvent<{ playerCount: number }>(
        hostClient,
        'room:player-left'
      );

      await new Promise((resolve) => {
        player2Client.emit('room:leave', resolve);
      });

      const player2Left = await player2LeftPromise;
      expect(player2Left.playerCount).toBe(1); // Player 1 still in room

      // Player 1 leaves
      const player1LeftPromise = waitForEvent<{ playerCount: number }>(
        hostClient,
        'room:player-left'
      );

      await new Promise((resolve) => {
        player1Client.emit('room:leave', resolve);
      });

      const player1Left = await player1LeftPromise;
      expect(player1Left.playerCount).toBe(0);
    });
  });

  describe('room:closed event', () => {
    it('should notify all players when host disconnects', async () => {
      // Create host client and room
      const { socket: hostClient } = await createClient();

      const roomCreated = await new Promise<{ success: boolean; room: { code: string } }>(
        (resolve) => {
          hostClient.emit('room:create', resolve);
        }
      );

      const roomCode = roomCreated.room.code;

      // Host also joins their own room as a player (this is how the real game works)
      // The host device needs to be tracked as a player for disconnect handling
      await new Promise((resolve) => {
        hostClient.emit('room:join', { roomCode }, resolve);
      });

      // Player joins
      const { socket: playerClient } = await createClient();

      // Set up listener for player-joined on host before player joins
      const playerJoinedPromise = waitForEvent(hostClient, 'room:player-joined');

      await new Promise((resolve) => {
        playerClient.emit('room:join', { roomCode }, resolve);
      });

      // Wait for join to complete
      await playerJoinedPromise;

      // Set up listener for room:closed on player
      const roomClosedPromise = waitForEvent<{ reason: string }>(
        playerClient,
        'room:closed'
      );

      // Host disconnects
      // Remove host from tracked sockets first
      const hostIndex = clientSockets.indexOf(hostClient);
      if (hostIndex > -1) {
        clientSockets.splice(hostIndex, 1);
      }
      hostClient.disconnect();

      // Player should receive room:closed event
      const roomClosed = await roomClosedPromise;

      expect(roomClosed.reason).toBeDefined();
      expect(roomClosed.reason).toContain('disconnect');
    });
  });
});
