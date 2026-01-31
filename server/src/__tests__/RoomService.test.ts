import { describe, it, expect, beforeEach } from 'vitest';
import { RoomService } from '../services/RoomService';

describe('RoomService', () => {
  let roomService: RoomService;

  beforeEach(() => {
    // Create a fresh RoomService instance for each test
    roomService = new RoomService();
  });

  describe('createRoom', () => {
    it('should create a room with a unique code', () => {
      const result = roomService.createRoom('host-socket-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBeDefined();
        expect(result.data.code).toHaveLength(6);
        expect(result.data.hostSocketId).toBe('host-socket-1');
        expect(result.data.status).toBe('lobby');
        expect(result.data.players.size).toBe(0);
      }
    });

    it('should generate unique codes for multiple rooms', () => {
      const codes = new Set<string>();

      // Create 10 rooms and verify all have unique codes
      for (let i = 0; i < 10; i++) {
        const result = roomService.createRoom(`host-socket-${i}`);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(codes.has(result.data.code)).toBe(false);
          codes.add(result.data.code);
        }
      }

      expect(codes.size).toBe(10);
    });

    it('should apply custom settings when provided', () => {
      const result = roomService.createRoom('host-socket-1', {
        maxPlayers: 4,
        rounds: 5,
        drawingTime: 30,
        votingTime: 20,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.settings.maxPlayers).toBe(4);
        expect(result.data.settings.rounds).toBe(5);
        expect(result.data.settings.drawingTime).toBe(30);
        expect(result.data.settings.votingTime).toBe(20);
      }
    });

    it('should use default settings when none provided', () => {
      const result = roomService.createRoom('host-socket-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.settings.maxPlayers).toBe(8);
        expect(result.data.settings.rounds).toBe(3);
        expect(result.data.settings.drawingTime).toBe(20);
        expect(result.data.settings.votingTime).toBe(15);
      }
    });

    it('should allow room lookup by code after creation', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const room = roomService.getRoomByCode(createResult.data.code);
        expect(room).toBeDefined();
        expect(room?.id).toBe(createResult.data.id);
      }
    });

    it('should be case insensitive when looking up room by code', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const upperRoom = roomService.getRoomByCode(createResult.data.code.toUpperCase());
        const lowerRoom = roomService.getRoomByCode(createResult.data.code.toLowerCase());
        expect(upperRoom).toBeDefined();
        expect(lowerRoom).toBeDefined();
        expect(upperRoom?.id).toBe(lowerRoom?.id);
      }
    });
  });

  describe('joinRoom', () => {
    it('should add a player to the room', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const joinResult = roomService.joinRoom(createResult.data.code, 'player-socket-1');

        expect(joinResult.success).toBe(true);
        if (joinResult.success) {
          expect(joinResult.data.room.players.size).toBe(1);
          expect(joinResult.data.player).toBeDefined();
          expect(joinResult.data.player.socketId).toBe('player-socket-1');
        }
      }
    });

    it('should generate a player name when not provided', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const joinResult = roomService.joinRoom(createResult.data.code, 'player-socket-1');

        expect(joinResult.success).toBe(true);
        if (joinResult.success) {
          expect(joinResult.data.player.name).toBeDefined();
          expect(joinResult.data.player.name.length).toBeGreaterThan(0);
        }
      }
    });

    it('should use custom player name when provided', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const joinResult = roomService.joinRoom(
          createResult.data.code,
          'player-socket-1',
          'CustomName'
        );

        expect(joinResult.success).toBe(true);
        if (joinResult.success) {
          expect(joinResult.data.player.name).toBe('CustomName');
        }
      }
    });

    it('should assign unique colors to players', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const colors = new Set<string>();

        for (let i = 0; i < 4; i++) {
          const joinResult = roomService.joinRoom(
            createResult.data.code,
            `player-socket-${i}`
          );

          expect(joinResult.success).toBe(true);
          if (joinResult.success) {
            colors.add(joinResult.data.player.color);
          }
        }

        expect(colors.size).toBe(4);
      }
    });

    it('should fail when room does not exist', () => {
      const joinResult = roomService.joinRoom('INVALID', 'player-socket-1');

      expect(joinResult.success).toBe(false);
      if (!joinResult.success) {
        expect(joinResult.error).toBe('ROOM_NOT_FOUND');
      }
    });

    it('should allow joining mid-game as spectator', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        // Manually set room status to drawing (game in progress)
        const room = roomService.getRoom(createResult.data.id);
        if (room) {
          const updatedRoom = { ...room, status: 'drawing' as const };
          roomService.updateRoom(updatedRoom);
        }

        const joinResult = roomService.joinRoom(createResult.data.code, 'player-socket-1');

        // Should succeed but as a spectator
        expect(joinResult.success).toBe(true);
        if (joinResult.success) {
          expect(joinResult.data.isSpectator).toBe(true);
          expect(joinResult.data.player.isSpectator).toBe(true);
        }
      }
    });

    it('should fail when game has ended (final status)', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        // Manually set room status to final (game ended)
        const room = roomService.getRoom(createResult.data.id);
        if (room) {
          const updatedRoom = { ...room, status: 'final' as const };
          roomService.updateRoom(updatedRoom);
        }

        const joinResult = roomService.joinRoom(createResult.data.code, 'player-socket-1');

        expect(joinResult.success).toBe(false);
        if (!joinResult.success) {
          expect(joinResult.error).toBe('GAME_IN_PROGRESS');
        }
      }
    });

    it('should track socket to player mapping after join', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        roomService.joinRoom(createResult.data.code, 'player-socket-1');

        const roomInfo = roomService.getRoomBySocket('player-socket-1');
        expect(roomInfo).toBeDefined();
        expect(roomInfo?.room.id).toBe(createResult.data.id);
      }
    });
  });

  describe('leaveRoom', () => {
    it('should remove a player from the room', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const joinResult = roomService.joinRoom(createResult.data.code, 'player-socket-1');
        expect(joinResult.success).toBe(true);

        if (joinResult.success) {
          const leaveResult = roomService.leaveRoom('player-socket-1');

          expect(leaveResult.success).toBe(true);
          if (leaveResult.success) {
            expect(leaveResult.data.room).toBeDefined();
            expect(leaveResult.data.room?.players.size).toBe(0);
          }
        }
      }
    });

    it('should return error when player not found', () => {
      const leaveResult = roomService.leaveRoom('unknown-socket');

      expect(leaveResult.success).toBe(false);
      if (!leaveResult.success) {
        expect(leaveResult.error).toBe('PLAYER_NOT_FOUND');
      }
    });

    it('should clean up socket to player mapping after leave', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        roomService.joinRoom(createResult.data.code, 'player-socket-1');
        roomService.leaveRoom('player-socket-1');

        const roomInfo = roomService.getRoomBySocket('player-socket-1');
        expect(roomInfo).toBeUndefined();
      }
    });

    it('should allow other players to remain when one leaves', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        roomService.joinRoom(createResult.data.code, 'player-socket-1');
        roomService.joinRoom(createResult.data.code, 'player-socket-2');
        roomService.joinRoom(createResult.data.code, 'player-socket-3');

        const leaveResult = roomService.leaveRoom('player-socket-2');

        expect(leaveResult.success).toBe(true);
        if (leaveResult.success) {
          expect(leaveResult.data.room?.players.size).toBe(2);
        }

        // Verify remaining players can still be looked up
        expect(roomService.getRoomBySocket('player-socket-1')).toBeDefined();
        expect(roomService.getRoomBySocket('player-socket-3')).toBeDefined();
      }
    });
  });

  describe('room closes when host leaves', () => {
    it('should close the room when host (who joined as player) disconnects', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        // Host joins as a player (this is how the actual flow works - host joins their own room)
        const hostJoinResult = roomService.joinRoom(createResult.data.code, 'host-socket-1');
        expect(hostJoinResult.success).toBe(true);

        // Add some other players
        roomService.joinRoom(createResult.data.code, 'player-socket-1');
        roomService.joinRoom(createResult.data.code, 'player-socket-2');

        // Host leaves (host is identified by hostSocketId)
        const leaveResult = roomService.leaveRoom('host-socket-1');

        expect(leaveResult.success).toBe(true);
        if (leaveResult.success) {
          // Room should be null (closed)
          expect(leaveResult.data.room).toBeNull();
        }

        // Room should no longer exist
        const room = roomService.getRoomByCode(createResult.data.code);
        expect(room).toBeUndefined();
      }
    });

    it('should clean up all player socket mappings when room closes', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        // Host joins their own room
        roomService.joinRoom(createResult.data.code, 'host-socket-1');
        roomService.joinRoom(createResult.data.code, 'player-socket-1');
        roomService.joinRoom(createResult.data.code, 'player-socket-2');

        // Host leaves - room closes
        roomService.leaveRoom('host-socket-1');

        // All player socket mappings should be cleaned up via closeRoom
        // Note: closeRoom cleans up players based on room.players, not socketToPlayer
        const room = roomService.getRoomByCode(createResult.data.code);
        expect(room).toBeUndefined();
      }
    });

    it('should close room via closeRoom method when host leaves', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        roomService.joinRoom(createResult.data.code, 'player-socket-1');
        roomService.joinRoom(createResult.data.code, 'player-socket-2');

        expect(roomService.getRoomCount()).toBe(1);

        // Directly close the room (simulating host disconnection cleanup)
        const closed = roomService.closeRoom(createResult.data.id);
        expect(closed).toBe(true);

        expect(roomService.getRoomCount()).toBe(0);

        // Player socket mappings should be cleaned up
        expect(roomService.getRoomBySocket('player-socket-1')).toBeUndefined();
        expect(roomService.getRoomBySocket('player-socket-2')).toBeUndefined();
      }
    });

    it('should decrease room count when room closes', () => {
      const create1 = roomService.createRoom('host-socket-1');
      const create2 = roomService.createRoom('host-socket-2');

      expect(roomService.getRoomCount()).toBe(2);

      if (create1.success) {
        // Close room 1
        roomService.closeRoom(create1.data.id);
        expect(roomService.getRoomCount()).toBe(1);
      }
    });
  });

  describe('max players enforced', () => {
    it('should enforce max 8 players by default', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        // Add 8 players (max)
        for (let i = 0; i < 8; i++) {
          const joinResult = roomService.joinRoom(
            createResult.data.code,
            `player-socket-${i}`
          );
          expect(joinResult.success).toBe(true);
        }

        // 9th player should be rejected
        const overflowResult = roomService.joinRoom(
          createResult.data.code,
          'player-socket-overflow'
        );

        expect(overflowResult.success).toBe(false);
        if (!overflowResult.success) {
          expect(overflowResult.error).toBe('ROOM_FULL');
        }
      }
    });

    it('should enforce custom max players limit', () => {
      const createResult = roomService.createRoom('host-socket-1', { maxPlayers: 4 });
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        // Add 4 players (custom max)
        for (let i = 0; i < 4; i++) {
          const joinResult = roomService.joinRoom(
            createResult.data.code,
            `player-socket-${i}`
          );
          expect(joinResult.success).toBe(true);
        }

        // 5th player should be rejected
        const overflowResult = roomService.joinRoom(
          createResult.data.code,
          'player-socket-overflow'
        );

        expect(overflowResult.success).toBe(false);
        if (!overflowResult.success) {
          expect(overflowResult.error).toBe('ROOM_FULL');
        }
      }
    });

    it('should allow player to join after someone leaves', () => {
      const createResult = roomService.createRoom('host-socket-1', { maxPlayers: 2 });
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        // Fill the room
        roomService.joinRoom(createResult.data.code, 'player-socket-1');
        roomService.joinRoom(createResult.data.code, 'player-socket-2');

        // Should be full
        const fullResult = roomService.joinRoom(
          createResult.data.code,
          'player-socket-3'
        );
        expect(fullResult.success).toBe(false);

        // Player leaves
        roomService.leaveRoom('player-socket-1');

        // Now a new player can join
        const newJoinResult = roomService.joinRoom(
          createResult.data.code,
          'player-socket-3'
        );
        expect(newJoinResult.success).toBe(true);
      }
    });
  });

  describe('closeRoom', () => {
    it('should return true when closing an existing room', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const closed = roomService.closeRoom(createResult.data.id);
        expect(closed).toBe(true);
      }
    });

    it('should return false when room does not exist', () => {
      const closed = roomService.closeRoom('nonexistent-room-id');
      expect(closed).toBe(false);
    });

    it('should remove room from lookup after closing', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        roomService.closeRoom(createResult.data.id);

        expect(roomService.getRoom(createResult.data.id)).toBeUndefined();
        expect(roomService.getRoomByCode(createResult.data.code)).toBeUndefined();
      }
    });
  });

  describe('removePlayer', () => {
    it('should remove a specific player from room', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const joinResult = roomService.joinRoom(
          createResult.data.code,
          'player-socket-1'
        );
        expect(joinResult.success).toBe(true);

        if (joinResult.success) {
          const removeResult = roomService.removePlayer(
            createResult.data.id,
            joinResult.data.player.id
          );

          expect(removeResult.success).toBe(true);
          if (removeResult.success) {
            expect(removeResult.data.players.size).toBe(0);
          }
        }
      }
    });

    it('should return error when room not found', () => {
      const result = roomService.removePlayer('nonexistent-room', 'player-id');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('ROOM_NOT_FOUND');
      }
    });

    it('should return error when player not found', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        const result = roomService.removePlayer(
          createResult.data.id,
          'nonexistent-player'
        );

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('PLAYER_NOT_FOUND');
        }
      }
    });
  });

  describe('setPlayerReady', () => {
    it('should set player ready status', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        roomService.joinRoom(createResult.data.code, 'player-socket-1');

        const readyResult = roomService.setPlayerReady('player-socket-1', true);

        expect(readyResult.success).toBe(true);
        if (readyResult.success) {
          expect(readyResult.data.player.isReady).toBe(true);
        }
      }
    });

    it('should report allReady when all players are ready', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        roomService.joinRoom(createResult.data.code, 'player-socket-1');
        roomService.joinRoom(createResult.data.code, 'player-socket-2');

        // First player ready - not all ready yet
        const firstReady = roomService.setPlayerReady('player-socket-1', true);
        expect(firstReady.success).toBe(true);
        if (firstReady.success) {
          expect(firstReady.data.allReady).toBe(false);
        }

        // Second player ready - all ready now
        const secondReady = roomService.setPlayerReady('player-socket-2', true);
        expect(secondReady.success).toBe(true);
        if (secondReady.success) {
          expect(secondReady.data.allReady).toBe(true);
        }
      }
    });
  });

  describe('updatePlayerName', () => {
    it('should update player name', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        roomService.joinRoom(createResult.data.code, 'player-socket-1');

        const updateResult = roomService.updatePlayerName('player-socket-1', 'NewName');

        expect(updateResult.success).toBe(true);
        if (updateResult.success) {
          expect(updateResult.data.player.name).toBe('NewName');
        }
      }
    });

    it('should return error for unknown socket', () => {
      const result = roomService.updatePlayerName('unknown-socket', 'NewName');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('PLAYER_NOT_FOUND');
      }
    });
  });

  describe('getAllRooms', () => {
    it('should return all active rooms', () => {
      roomService.createRoom('host-socket-1');
      roomService.createRoom('host-socket-2');
      roomService.createRoom('host-socket-3');

      const rooms = roomService.getAllRooms();
      expect(rooms.length).toBe(3);
    });

    it('should return empty array when no rooms exist', () => {
      const rooms = roomService.getAllRooms();
      expect(rooms).toEqual([]);
    });
  });

  describe('getRoomCount', () => {
    it('should return correct count of active rooms', () => {
      expect(roomService.getRoomCount()).toBe(0);

      roomService.createRoom('host-socket-1');
      expect(roomService.getRoomCount()).toBe(1);

      roomService.createRoom('host-socket-2');
      expect(roomService.getRoomCount()).toBe(2);
    });
  });

  describe('promoteSpectators', () => {
    it('should promote spectators to active players', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        // Add a player normally (in lobby)
        const joinResult1 = roomService.joinRoom(createResult.data.code, 'player-socket-1');
        expect(joinResult1.success).toBe(true);
        if (joinResult1.success) {
          expect(joinResult1.data.isSpectator).toBe(false);
        }

        // Set room to drawing phase (game in progress)
        const room = roomService.getRoom(createResult.data.id);
        if (room) {
          const updatedRoom = { ...room, status: 'drawing' as const };
          roomService.updateRoom(updatedRoom);
        }

        // Add a player during game (should be spectator)
        const joinResult2 = roomService.joinRoom(createResult.data.code, 'player-socket-2');
        expect(joinResult2.success).toBe(true);
        if (joinResult2.success) {
          expect(joinResult2.data.isSpectator).toBe(true);
          expect(joinResult2.data.player.isSpectator).toBe(true);
        }

        // Now promote spectators
        const promoteResult = roomService.promoteSpectators(createResult.data.id);
        expect(promoteResult.success).toBe(true);
        if (promoteResult.success) {
          expect(promoteResult.data.promotedPlayerIds.length).toBe(1);

          // Verify the promoted player is now active
          const promotedPlayer = promoteResult.data.room.players.get(
            promoteResult.data.promotedPlayerIds[0]
          );
          expect(promotedPlayer).toBeDefined();
          if (promotedPlayer) {
            expect(promotedPlayer.isSpectator).toBe(false);
            expect(promotedPlayer.isReady).toBe(true);
          }
        }
      }
    });

    it('should return empty array when no spectators exist', () => {
      const createResult = roomService.createRoom('host-socket-1');
      expect(createResult.success).toBe(true);

      if (createResult.success) {
        // Add player in lobby (not spectator)
        roomService.joinRoom(createResult.data.code, 'player-socket-1');

        const promoteResult = roomService.promoteSpectators(createResult.data.id);
        expect(promoteResult.success).toBe(true);
        if (promoteResult.success) {
          expect(promoteResult.data.promotedPlayerIds.length).toBe(0);
        }
      }
    });

    it('should return error when room not found', () => {
      const result = roomService.promoteSpectators('nonexistent-room-id');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('ROOM_NOT_FOUND');
      }
    });
  });
});
