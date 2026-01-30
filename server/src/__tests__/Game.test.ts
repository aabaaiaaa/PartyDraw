import { describe, it, expect } from 'vitest';
import {
  VALID_TRANSITIONS,
  InvalidTransitionError,
  TransitionConditionError,
  isValidTransition,
  getAllowedTransitions,
  transitionToCountdown,
  transitionToDrawing,
  transitionToVoting,
  transitionToResults,
  transitionToNextRound,
  transitionToFinal,
  transitionToLobby,
  getNextStateAfterResults,
  isFinalRound,
  getGameStateSummary,
  Game,
} from '../models/Game';
import { Room, RoomStatus, createRoom, createInitialGameState } from '../models/Room';
import { Player, createPlayer } from '../models/Player';

/**
 * Helper to create a test room with specified number of players
 */
function createTestRoom(
  status: RoomStatus = 'lobby',
  numPlayers: number = 2,
  allReady: boolean = false,
  currentRound: number = 0,
  totalRounds: number = 3
): Room {
  const room = createRoom('test-room-id', 'TEST01', 'host-socket-1', { rounds: totalRounds });
  room.status = status;
  room.gameState.currentRound = currentRound;

  for (let i = 0; i < numPlayers; i++) {
    const player = createPlayer(`player-${i}`, `Player ${i}`, `socket-${i}`, '#FF0000');
    player.isReady = allReady;
    room.players.set(player.id, player);
  }

  return room;
}

describe('Game State Machine', () => {
  describe('VALID_TRANSITIONS', () => {
    it('should define valid transitions for each state', () => {
      expect(VALID_TRANSITIONS.lobby).toEqual(['countdown']);
      expect(VALID_TRANSITIONS.countdown).toEqual(['drawing']);
      expect(VALID_TRANSITIONS.drawing).toEqual(['voting']);
      expect(VALID_TRANSITIONS.voting).toEqual(['results']);
      expect(VALID_TRANSITIONS.results).toEqual(['drawing', 'final']);
      expect(VALID_TRANSITIONS.final).toEqual(['lobby']);
    });
  });

  describe('isValidTransition', () => {
    it('should return true for valid transitions', () => {
      expect(isValidTransition('lobby', 'countdown')).toBe(true);
      expect(isValidTransition('countdown', 'drawing')).toBe(true);
      expect(isValidTransition('drawing', 'voting')).toBe(true);
      expect(isValidTransition('voting', 'results')).toBe(true);
      expect(isValidTransition('results', 'drawing')).toBe(true);
      expect(isValidTransition('results', 'final')).toBe(true);
      expect(isValidTransition('final', 'lobby')).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      expect(isValidTransition('lobby', 'drawing')).toBe(false);
      expect(isValidTransition('lobby', 'voting')).toBe(false);
      expect(isValidTransition('drawing', 'lobby')).toBe(false);
      expect(isValidTransition('voting', 'countdown')).toBe(false);
      expect(isValidTransition('results', 'countdown')).toBe(false);
    });
  });

  describe('getAllowedTransitions', () => {
    it('should return allowed transitions for each state', () => {
      expect(getAllowedTransitions('lobby')).toEqual(['countdown']);
      expect(getAllowedTransitions('countdown')).toEqual(['drawing']);
      expect(getAllowedTransitions('results')).toEqual(['drawing', 'final']);
    });

    it('should return empty array for unknown state', () => {
      expect(getAllowedTransitions('unknown' as RoomStatus)).toEqual([]);
    });
  });

  describe('transitionToCountdown (lobby → countdown)', () => {
    it('should transition from lobby to countdown when all players are ready', () => {
      const room = createTestRoom('lobby', 2, true);

      const result = transitionToCountdown(room);

      expect(result).toBe('countdown');
    });

    it('should throw TransitionConditionError when not all players are ready', () => {
      const room = createTestRoom('lobby', 2, false);

      expect(() => transitionToCountdown(room)).toThrow(TransitionConditionError);
      expect(() => transitionToCountdown(room)).toThrow('All players must be ready to start the game');
    });

    it('should throw TransitionConditionError when some players are not ready', () => {
      const room = createTestRoom('lobby', 3, true);
      // Set one player to not ready
      const players = Array.from(room.players.values());
      players[1].isReady = false;

      expect(() => transitionToCountdown(room)).toThrow(TransitionConditionError);
    });

    it('should throw TransitionConditionError when less than 2 players', () => {
      const room = createTestRoom('lobby', 1, true);

      expect(() => transitionToCountdown(room)).toThrow(TransitionConditionError);
      expect(() => transitionToCountdown(room)).toThrow('At least 2 players are required to start the game');
    });

    it('should throw TransitionConditionError when no players in room', () => {
      const room = createTestRoom('lobby', 0, true);

      expect(() => transitionToCountdown(room)).toThrow(TransitionConditionError);
    });

    it('should throw InvalidTransitionError when not in lobby state', () => {
      const room = createTestRoom('drawing', 2, true);

      expect(() => transitionToCountdown(room)).toThrow(InvalidTransitionError);
    });

    it('should work with exactly 2 ready players', () => {
      const room = createTestRoom('lobby', 2, true);

      const result = transitionToCountdown(room);

      expect(result).toBe('countdown');
    });

    it('should work with more than 2 ready players', () => {
      const room = createTestRoom('lobby', 5, true);

      const result = transitionToCountdown(room);

      expect(result).toBe('countdown');
    });
  });

  describe('transitionToDrawing (countdown → drawing)', () => {
    it('should transition from countdown to drawing', () => {
      const room = createTestRoom('countdown', 2);

      const result = transitionToDrawing(room);

      expect(result).toBe('drawing');
    });

    it('should throw InvalidTransitionError when not in countdown state', () => {
      const room = createTestRoom('lobby', 2);

      expect(() => transitionToDrawing(room)).toThrow(InvalidTransitionError);
    });
  });

  describe('transitionToVoting (drawing → voting)', () => {
    it('should transition from drawing to voting', () => {
      const room = createTestRoom('drawing', 2);

      const result = transitionToVoting(room);

      expect(result).toBe('voting');
    });

    it('should throw InvalidTransitionError when not in drawing state', () => {
      const room = createTestRoom('lobby', 2);

      expect(() => transitionToVoting(room)).toThrow(InvalidTransitionError);
    });

    it('should allow transition even if not all players have submitted (timer expired case)', () => {
      const room = createTestRoom('drawing', 3);
      // Only one player has submitted a drawing
      room.gameState.drawings.set('player-0', 'data:image/png;base64,test');

      const result = transitionToVoting(room);

      expect(result).toBe('voting');
    });

    it('should allow transition when all players have submitted', () => {
      const room = createTestRoom('drawing', 2);
      room.gameState.drawings.set('player-0', 'data:image/png;base64,test1');
      room.gameState.drawings.set('player-1', 'data:image/png;base64,test2');

      const result = transitionToVoting(room);

      expect(result).toBe('voting');
    });
  });

  describe('transitionToResults (voting → results)', () => {
    it('should transition from voting to results', () => {
      const room = createTestRoom('voting', 2);

      const result = transitionToResults(room);

      expect(result).toBe('results');
    });

    it('should throw InvalidTransitionError when not in voting state', () => {
      const room = createTestRoom('drawing', 2);

      expect(() => transitionToResults(room)).toThrow(InvalidTransitionError);
    });

    it('should allow transition even if not all players have voted (timer expired case)', () => {
      const room = createTestRoom('voting', 3);
      // Only one player has voted
      room.gameState.votes.set('player-0', 'player-1');

      const result = transitionToResults(room);

      expect(result).toBe('results');
    });

    it('should allow transition when all players have voted', () => {
      const room = createTestRoom('voting', 2);
      room.gameState.votes.set('player-0', 'player-1');
      room.gameState.votes.set('player-1', 'player-0');

      const result = transitionToResults(room);

      expect(result).toBe('results');
    });
  });

  describe('transitionToNextRound (results → drawing)', () => {
    it('should transition from results to drawing when more rounds remain', () => {
      const room = createTestRoom('results', 2, false, 1, 3); // Round 1 of 3

      const result = transitionToNextRound(room);

      expect(result).toBe('drawing');
    });

    it('should transition when on round 2 of 3', () => {
      const room = createTestRoom('results', 2, false, 2, 3); // Round 2 of 3

      const result = transitionToNextRound(room);

      expect(result).toBe('drawing');
    });

    it('should throw TransitionConditionError when on final round', () => {
      const room = createTestRoom('results', 2, false, 3, 3); // Round 3 of 3 (final)

      expect(() => transitionToNextRound(room)).toThrow(TransitionConditionError);
      expect(() => transitionToNextRound(room)).toThrow('No more rounds available, should transition to final');
    });

    it('should throw TransitionConditionError when currentRound exceeds totalRounds', () => {
      const room = createTestRoom('results', 2, false, 4, 3); // Beyond final round

      expect(() => transitionToNextRound(room)).toThrow(TransitionConditionError);
    });

    it('should throw InvalidTransitionError when not in results state', () => {
      const room = createTestRoom('voting', 2, false, 1, 3);

      expect(() => transitionToNextRound(room)).toThrow(InvalidTransitionError);
    });
  });

  describe('transitionToFinal (results → final)', () => {
    it('should transition from results to final', () => {
      const room = createTestRoom('results', 2, false, 3, 3);

      const result = transitionToFinal(room);

      expect(result).toBe('final');
    });

    it('should throw InvalidTransitionError when not in results state', () => {
      const room = createTestRoom('voting', 2);

      expect(() => transitionToFinal(room)).toThrow(InvalidTransitionError);
    });
  });

  describe('transitionToLobby (final → lobby for restart)', () => {
    it('should transition from final to lobby for game restart', () => {
      const room = createTestRoom('final', 2);

      const result = transitionToLobby(room);

      expect(result).toBe('lobby');
    });

    it('should throw InvalidTransitionError when not in final state', () => {
      const room = createTestRoom('results', 2);

      expect(() => transitionToLobby(room)).toThrow(InvalidTransitionError);
    });
  });

  describe('getNextStateAfterResults', () => {
    it('should return drawing when more rounds remain', () => {
      const room = createTestRoom('results', 2, false, 1, 3);

      expect(getNextStateAfterResults(room)).toBe('drawing');
    });

    it('should return drawing when on round 2 of 3', () => {
      const room = createTestRoom('results', 2, false, 2, 3);

      expect(getNextStateAfterResults(room)).toBe('drawing');
    });

    it('should return final when on last round', () => {
      const room = createTestRoom('results', 2, false, 3, 3);

      expect(getNextStateAfterResults(room)).toBe('final');
    });

    it('should return final when currentRound exceeds totalRounds', () => {
      const room = createTestRoom('results', 2, false, 5, 3);

      expect(getNextStateAfterResults(room)).toBe('final');
    });

    it('should handle single round game', () => {
      const room = createTestRoom('results', 2, false, 1, 1);

      expect(getNextStateAfterResults(room)).toBe('final');
    });
  });

  describe('isFinalRound', () => {
    it('should return false when on round 1 of 3', () => {
      const room = createTestRoom('drawing', 2, false, 1, 3);

      expect(isFinalRound(room)).toBe(false);
    });

    it('should return false when on round 2 of 3', () => {
      const room = createTestRoom('drawing', 2, false, 2, 3);

      expect(isFinalRound(room)).toBe(false);
    });

    it('should return true when on final round', () => {
      const room = createTestRoom('drawing', 2, false, 3, 3);

      expect(isFinalRound(room)).toBe(true);
    });

    it('should return true when currentRound exceeds totalRounds', () => {
      const room = createTestRoom('drawing', 2, false, 4, 3);

      expect(isFinalRound(room)).toBe(true);
    });
  });

  describe('getGameStateSummary', () => {
    it('should return correct summary for lobby state', () => {
      const room = createTestRoom('lobby', 3);
      room.gameState.question = null;

      const summary = getGameStateSummary(room);

      expect(summary).toEqual({
        status: 'lobby',
        currentRound: 0,
        totalRounds: 3,
        question: null,
        drawingsSubmitted: 0,
        votesSubmitted: 0,
        totalPlayers: 3,
        allowedTransitions: ['countdown'],
      });
    });

    it('should return correct summary during drawing phase', () => {
      const room = createTestRoom('drawing', 2, false, 1, 3);
      room.gameState.question = 'Draw a cat';
      room.gameState.drawings.set('player-0', 'data:image/png;base64,test');

      const summary = getGameStateSummary(room);

      expect(summary).toEqual({
        status: 'drawing',
        currentRound: 1,
        totalRounds: 3,
        question: 'Draw a cat',
        drawingsSubmitted: 1,
        votesSubmitted: 0,
        totalPlayers: 2,
        allowedTransitions: ['voting'],
      });
    });

    it('should return correct summary during voting phase', () => {
      const room = createTestRoom('voting', 3, false, 2, 3);
      room.gameState.question = 'Draw a dog';
      room.gameState.drawings.set('player-0', 'data:image/png;base64,test1');
      room.gameState.drawings.set('player-1', 'data:image/png;base64,test2');
      room.gameState.drawings.set('player-2', 'data:image/png;base64,test3');
      room.gameState.votes.set('player-0', 'player-1');
      room.gameState.votes.set('player-2', 'player-1');

      const summary = getGameStateSummary(room);

      expect(summary).toEqual({
        status: 'voting',
        currentRound: 2,
        totalRounds: 3,
        question: 'Draw a dog',
        drawingsSubmitted: 3,
        votesSubmitted: 2,
        totalPlayers: 3,
        allowedTransitions: ['results'],
      });
    });
  });

  describe('Game class', () => {
    it('should wrap a room and provide access to game state', () => {
      const room = createTestRoom('lobby', 3, true);
      const game = new Game(room);

      expect(game.room).toBe(room);
      expect(game.status).toBe('lobby');
      expect(game.currentRound).toBe(0);
      expect(game.totalRounds).toBe(3);
    });

    it('should expose allowed transitions', () => {
      const room = createTestRoom('results', 2);
      const game = new Game(room);

      expect(game.allowedTransitions).toEqual(['drawing', 'final']);
    });

    it('should check if transition is valid', () => {
      const room = createTestRoom('lobby', 2);
      const game = new Game(room);

      expect(game.canTransitionTo('countdown')).toBe(true);
      expect(game.canTransitionTo('drawing')).toBe(false);
    });

    it('should start game when conditions are met', () => {
      const room = createTestRoom('lobby', 2, true);
      const game = new Game(room);

      expect(() => game.startGame()).not.toThrow();
    });

    it('should throw when starting game with conditions not met', () => {
      const room = createTestRoom('lobby', 2, false);
      const game = new Game(room);

      expect(() => game.startGame()).toThrow(TransitionConditionError);
    });

    it('should determine next state after results correctly', () => {
      const room1 = createTestRoom('results', 2, false, 1, 3);
      const game1 = new Game(room1);
      expect(game1.getNextStateAfterResults()).toBe('drawing');

      const room2 = createTestRoom('results', 2, false, 3, 3);
      const game2 = new Game(room2);
      expect(game2.getNextStateAfterResults()).toBe('final');
    });

    it('should check if final round correctly', () => {
      const room1 = createTestRoom('drawing', 2, false, 2, 3);
      const game1 = new Game(room1);
      expect(game1.isFinalRound()).toBe(false);

      const room2 = createTestRoom('drawing', 2, false, 3, 3);
      const game2 = new Game(room2);
      expect(game2.isFinalRound()).toBe(true);
    });

    it('should get state summary', () => {
      const room = createTestRoom('drawing', 2, false, 1, 3);
      room.gameState.question = 'Draw a house';
      const game = new Game(room);

      const summary = game.getStateSummary();

      expect(summary.status).toBe('drawing');
      expect(summary.question).toBe('Draw a house');
      expect(summary.currentRound).toBe(1);
    });

    it('should update room reference', () => {
      const room1 = createTestRoom('lobby', 2);
      const room2 = createTestRoom('drawing', 2, false, 1, 3);
      const game = new Game(room1);

      expect(game.status).toBe('lobby');

      game.updateRoom(room2);

      expect(game.status).toBe('drawing');
      expect(game.room).toBe(room2);
    });

    it('should expose drawings map', () => {
      const room = createTestRoom('voting', 2, false, 1, 3);
      room.gameState.drawings.set('player-0', 'drawing1');
      room.gameState.drawings.set('player-1', 'drawing2');
      const game = new Game(room);

      expect(game.drawings.size).toBe(2);
      expect(game.drawings.get('player-0')).toBe('drawing1');
    });

    it('should expose votes map', () => {
      const room = createTestRoom('voting', 2, false, 1, 3);
      room.gameState.votes.set('player-0', 'player-1');
      const game = new Game(room);

      expect(game.votes.size).toBe(1);
      expect(game.votes.get('player-0')).toBe('player-1');
    });

    it('should expose question', () => {
      const room = createTestRoom('drawing', 2, false, 1, 3);
      room.gameState.question = 'Test question';
      const game = new Game(room);

      expect(game.question).toBe('Test question');
    });
  });

  describe('InvalidTransitionError', () => {
    it('should include from and to states in error message', () => {
      const error = new InvalidTransitionError('lobby', 'voting');

      expect(error.message).toBe("Invalid state transition from 'lobby' to 'voting'");
      expect(error.name).toBe('InvalidTransitionError');
    });
  });

  describe('TransitionConditionError', () => {
    it('should include custom message', () => {
      const error = new TransitionConditionError('Custom error message');

      expect(error.message).toBe('Custom error message');
      expect(error.name).toBe('TransitionConditionError');
    });
  });

  describe('Complete game flow transitions', () => {
    it('should support full game flow: lobby → countdown → drawing → voting → results → drawing (next round)', () => {
      const room = createTestRoom('lobby', 3, true, 0, 3);

      // Lobby to countdown
      expect(transitionToCountdown(room)).toBe('countdown');
      room.status = 'countdown';

      // Countdown to drawing
      expect(transitionToDrawing(room)).toBe('drawing');
      room.status = 'drawing';
      room.gameState.currentRound = 1;

      // Drawing to voting
      expect(transitionToVoting(room)).toBe('voting');
      room.status = 'voting';

      // Voting to results
      expect(transitionToResults(room)).toBe('results');
      room.status = 'results';

      // Results to next round (drawing)
      expect(getNextStateAfterResults(room)).toBe('drawing');
      expect(transitionToNextRound(room)).toBe('drawing');
    });

    it('should support full game flow through final round: results → final → lobby', () => {
      const room = createTestRoom('results', 3, false, 3, 3); // Final round

      // Results to final
      expect(getNextStateAfterResults(room)).toBe('final');
      expect(transitionToFinal(room)).toBe('final');
      room.status = 'final';

      // Final to lobby (restart game)
      expect(transitionToLobby(room)).toBe('lobby');
    });

    it('should enforce state machine order - cannot skip states', () => {
      const room = createTestRoom('lobby', 2, true);

      // Cannot go directly from lobby to drawing
      expect(() => transitionToDrawing(room)).toThrow(InvalidTransitionError);

      // Cannot go directly from lobby to voting
      expect(() => transitionToVoting(room)).toThrow(InvalidTransitionError);

      // Cannot go directly from lobby to results
      expect(() => transitionToResults(room)).toThrow(InvalidTransitionError);

      // Cannot go directly from lobby to final
      expect(() => transitionToFinal(room)).toThrow(InvalidTransitionError);
    });
  });
});
