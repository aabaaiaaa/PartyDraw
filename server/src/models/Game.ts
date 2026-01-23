/**
 * Game State Machine
 * Manages the game flow and state transitions for PartyDraw
 *
 * State flow: lobby → countdown → drawing → voting → results → (drawing | final)
 */

import { Room, RoomStatus, GameState, areAllPlayersReady } from './Room';

/**
 * Valid state transitions in the game
 */
export const VALID_TRANSITIONS: Record<RoomStatus, RoomStatus[]> = {
  lobby: ['countdown'],
  countdown: ['drawing'],
  drawing: ['voting'],
  voting: ['results'],
  results: ['drawing', 'final'],
  final: ['lobby'], // Can restart game
};

/**
 * Error thrown when an invalid state transition is attempted
 */
export class InvalidTransitionError extends Error {
  constructor(from: RoomStatus, to: RoomStatus) {
    super(`Invalid state transition from '${from}' to '${to}'`);
    this.name = 'InvalidTransitionError';
  }
}

/**
 * Error thrown when a transition condition is not met
 */
export class TransitionConditionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransitionConditionError';
  }
}

/**
 * Checks if a state transition is valid
 * @param from - Current state
 * @param to - Target state
 * @returns True if the transition is valid
 */
export function isValidTransition(from: RoomStatus, to: RoomStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Gets the allowed transitions from the current state
 * @param currentState - The current game state
 * @returns Array of valid next states
 */
export function getAllowedTransitions(currentState: RoomStatus): RoomStatus[] {
  return VALID_TRANSITIONS[currentState] ?? [];
}

/**
 * Validates and performs state transition from lobby to countdown
 * Requires all players to be ready and at least 2 players in the room
 * @param room - The room to transition
 * @returns The new room status
 * @throws TransitionConditionError if conditions are not met
 * @throws InvalidTransitionError if transition is not valid
 */
export function transitionToCountdown(room: Room): RoomStatus {
  if (!isValidTransition(room.status, 'countdown')) {
    throw new InvalidTransitionError(room.status, 'countdown');
  }

  if (room.players.size < 2) {
    throw new TransitionConditionError('At least 2 players are required to start the game');
  }

  if (!areAllPlayersReady(room)) {
    throw new TransitionConditionError('All players must be ready to start the game');
  }

  return 'countdown';
}

/**
 * Validates and performs state transition from countdown to drawing
 * @param room - The room to transition
 * @returns The new room status
 * @throws InvalidTransitionError if transition is not valid
 */
export function transitionToDrawing(room: Room): RoomStatus {
  if (!isValidTransition(room.status, 'drawing')) {
    throw new InvalidTransitionError(room.status, 'drawing');
  }

  return 'drawing';
}

/**
 * Validates and performs state transition from drawing to voting
 * Can be triggered when all players have submitted or timer expires
 * @param room - The room to transition
 * @returns The new room status
 * @throws InvalidTransitionError if transition is not valid
 */
export function transitionToVoting(room: Room): RoomStatus {
  if (!isValidTransition(room.status, 'voting')) {
    throw new InvalidTransitionError(room.status, 'voting');
  }

  return 'voting';
}

/**
 * Validates and performs state transition from voting to results
 * Can be triggered when all players have voted or timer expires
 * @param room - The room to transition
 * @returns The new room status
 * @throws InvalidTransitionError if transition is not valid
 */
export function transitionToResults(room: Room): RoomStatus {
  if (!isValidTransition(room.status, 'results')) {
    throw new InvalidTransitionError(room.status, 'results');
  }

  return 'results';
}

/**
 * Validates and performs state transition from results to next round (drawing)
 * @param room - The room to transition
 * @returns The new room status
 * @throws InvalidTransitionError if transition is not valid
 * @throws TransitionConditionError if no more rounds are available
 */
export function transitionToNextRound(room: Room): RoomStatus {
  if (!isValidTransition(room.status, 'drawing')) {
    throw new InvalidTransitionError(room.status, 'drawing');
  }

  if (room.gameState.currentRound >= room.settings.rounds) {
    throw new TransitionConditionError('No more rounds available, should transition to final');
  }

  return 'drawing';
}

/**
 * Validates and performs state transition from results to final
 * @param room - The room to transition
 * @returns The new room status
 * @throws InvalidTransitionError if transition is not valid
 */
export function transitionToFinal(room: Room): RoomStatus {
  if (!isValidTransition(room.status, 'final')) {
    throw new InvalidTransitionError(room.status, 'final');
  }

  return 'final';
}

/**
 * Validates and performs state transition from final back to lobby (restart game)
 * @param room - The room to transition
 * @returns The new room status
 * @throws InvalidTransitionError if transition is not valid
 */
export function transitionToLobby(room: Room): RoomStatus {
  if (!isValidTransition(room.status, 'lobby')) {
    throw new InvalidTransitionError(room.status, 'lobby');
  }

  return 'lobby';
}

/**
 * Determines the next state after showing results
 * @param room - The room to check
 * @returns 'drawing' if more rounds remain, 'final' if game is complete
 */
export function getNextStateAfterResults(room: Room): 'drawing' | 'final' {
  return room.gameState.currentRound >= room.settings.rounds ? 'final' : 'drawing';
}

/**
 * Checks if the current round is the final round
 * @param room - The room to check
 * @returns True if this is the last round
 */
export function isFinalRound(room: Room): boolean {
  return room.gameState.currentRound >= room.settings.rounds;
}

/**
 * Gets a summary of the current game state
 * @param room - The room to get state summary for
 * @returns Object with current game state information
 */
export function getGameStateSummary(room: Room): {
  status: RoomStatus;
  currentRound: number;
  totalRounds: number;
  question: string | null;
  drawingsSubmitted: number;
  votesSubmitted: number;
  totalPlayers: number;
  allowedTransitions: RoomStatus[];
} {
  return {
    status: room.status,
    currentRound: room.gameState.currentRound,
    totalRounds: room.settings.rounds,
    question: room.gameState.question,
    drawingsSubmitted: room.gameState.drawings.size,
    votesSubmitted: room.gameState.votes.size,
    totalPlayers: room.players.size,
    allowedTransitions: getAllowedTransitions(room.status),
  };
}

/**
 * Game class providing a stateful wrapper around the game state machine
 * This class manages the complete game lifecycle
 */
export class Game {
  private _room: Room;

  constructor(room: Room) {
    this._room = room;
  }

  /** Gets the current room state */
  get room(): Room {
    return this._room;
  }

  /** Gets the current game status */
  get status(): RoomStatus {
    return this._room.status;
  }

  /** Gets the current round number */
  get currentRound(): number {
    return this._room.gameState.currentRound;
  }

  /** Gets the total number of rounds */
  get totalRounds(): number {
    return this._room.settings.rounds;
  }

  /** Gets the current question */
  get question(): string | null {
    return this._room.gameState.question;
  }

  /** Gets the map of player drawings */
  get drawings(): Map<string, string> {
    return this._room.gameState.drawings;
  }

  /** Gets the map of player votes */
  get votes(): Map<string, string> {
    return this._room.gameState.votes;
  }

  /** Gets allowed transitions from current state */
  get allowedTransitions(): RoomStatus[] {
    return getAllowedTransitions(this._room.status);
  }

  /**
   * Updates the room reference
   * @param room - The updated room
   */
  updateRoom(room: Room): void {
    this._room = room;
  }

  /**
   * Checks if a transition to the target state is valid
   * @param targetState - The state to transition to
   * @returns True if the transition is valid
   */
  canTransitionTo(targetState: RoomStatus): boolean {
    return isValidTransition(this._room.status, targetState);
  }

  /**
   * Attempts to start the game (lobby → countdown)
   * @throws TransitionConditionError if conditions are not met
   * @throws InvalidTransitionError if transition is not valid
   */
  startGame(): void {
    transitionToCountdown(this._room);
  }

  /**
   * Gets the next state after showing results
   * @returns 'drawing' or 'final'
   */
  getNextStateAfterResults(): 'drawing' | 'final' {
    return getNextStateAfterResults(this._room);
  }

  /**
   * Checks if this is the final round
   * @returns True if this is the last round
   */
  isFinalRound(): boolean {
    return isFinalRound(this._room);
  }

  /**
   * Gets a summary of the current game state
   */
  getStateSummary(): ReturnType<typeof getGameStateSummary> {
    return getGameStateSummary(this._room);
  }
}
