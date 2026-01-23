/**
 * TimerService
 * Manages server-authoritative timers for PartyDraw game phases.
 * Broadcasts timer ticks to all clients in a room via Socket.IO.
 */

import { Server as SocketIOServer } from 'socket.io';

/**
 * Timer types for different game phases
 */
export type TimerType = 'countdown' | 'drawing' | 'voting';

/**
 * Timer instance tracking
 */
interface TimerInstance {
  /** The interval ID for clearing */
  intervalId: NodeJS.Timeout;
  /** The timeout ID for completion callback */
  timeoutId: NodeJS.Timeout;
  /** Seconds remaining */
  secondsRemaining: number;
  /** Timer type */
  type: TimerType;
  /** Room ID this timer belongs to */
  roomId: string;
}

/**
 * Callback function type for timer expiration
 */
export type TimerExpiredCallback = (roomId: string, timerType: TimerType) => void;

/**
 * TimerService class
 * Singleton service that manages all game timers
 */
export class TimerService {
  /** Map of room IDs to their active timer */
  private timers: Map<string, TimerInstance> = new Map();

  /** Socket.IO server instance for broadcasting */
  private io: SocketIOServer | null = null;

  /** Callback for when a timer expires */
  private onExpiredCallback: TimerExpiredCallback | null = null;

  /**
   * Initializes the TimerService with a Socket.IO server instance
   * @param io - The Socket.IO server instance
   */
  initialize(io: SocketIOServer): void {
    this.io = io;
  }

  /**
   * Sets the callback function to be called when a timer expires
   * @param callback - The callback function
   */
  setOnExpiredCallback(callback: TimerExpiredCallback): void {
    this.onExpiredCallback = callback;
  }

  /**
   * Starts a countdown timer (3-2-1 GO!)
   * @param roomId - The room ID to start the countdown for
   * @param durationSeconds - Duration in seconds (default 3)
   * @returns True if the timer was started, false if a timer already exists
   */
  startCountdown(roomId: string, durationSeconds: number = 3): boolean {
    return this.startTimer(roomId, 'countdown', durationSeconds);
  }

  /**
   * Starts a drawing phase timer
   * @param roomId - The room ID to start the timer for
   * @param durationSeconds - Duration in seconds (from room settings)
   * @returns True if the timer was started, false if a timer already exists
   */
  startDrawingTimer(roomId: string, durationSeconds: number): boolean {
    return this.startTimer(roomId, 'drawing', durationSeconds);
  }

  /**
   * Starts a voting phase timer
   * @param roomId - The room ID to start the timer for
   * @param durationSeconds - Duration in seconds (from room settings)
   * @returns True if the timer was started, false if a timer already exists
   */
  startVotingTimer(roomId: string, durationSeconds: number): boolean {
    return this.startTimer(roomId, 'voting', durationSeconds);
  }

  /**
   * Clears any active timer for a room
   * @param roomId - The room ID to clear the timer for
   * @returns True if a timer was cleared, false if no timer existed
   */
  clearTimer(roomId: string): boolean {
    const timer = this.timers.get(roomId);

    if (!timer) {
      return false;
    }

    clearInterval(timer.intervalId);
    clearTimeout(timer.timeoutId);
    this.timers.delete(roomId);

    return true;
  }

  /**
   * Gets the remaining seconds for a room's timer
   * @param roomId - The room ID to check
   * @returns The remaining seconds, or null if no timer exists
   */
  getRemainingSeconds(roomId: string): number | null {
    const timer = this.timers.get(roomId);
    return timer ? timer.secondsRemaining : null;
  }

  /**
   * Checks if a room has an active timer
   * @param roomId - The room ID to check
   * @returns True if the room has an active timer
   */
  hasActiveTimer(roomId: string): boolean {
    return this.timers.has(roomId);
  }

  /**
   * Gets the type of the active timer for a room
   * @param roomId - The room ID to check
   * @returns The timer type, or null if no timer exists
   */
  getTimerType(roomId: string): TimerType | null {
    const timer = this.timers.get(roomId);
    return timer ? timer.type : null;
  }

  /**
   * Internal method to start a timer
   * @param roomId - The room ID
   * @param type - The type of timer
   * @param durationSeconds - Duration in seconds
   * @returns True if the timer was started
   */
  private startTimer(roomId: string, type: TimerType, durationSeconds: number): boolean {
    // Clear any existing timer for this room
    if (this.timers.has(roomId)) {
      this.clearTimer(roomId);
    }

    let secondsRemaining = durationSeconds;

    // Emit initial tick
    this.emitTick(roomId, type, secondsRemaining);

    // Set up interval for ticks every second
    const intervalId = setInterval(() => {
      secondsRemaining--;

      // Update the stored seconds
      const timer = this.timers.get(roomId);
      if (timer) {
        timer.secondsRemaining = secondsRemaining;
      }

      // Emit tick to all clients in the room
      this.emitTick(roomId, type, secondsRemaining);

      // Stop ticking at 0 (the timeout will handle expiration)
      if (secondsRemaining <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    // Set up timeout for when timer expires
    const timeoutId = setTimeout(() => {
      this.handleTimerExpired(roomId, type);
    }, durationSeconds * 1000);

    // Store the timer instance
    this.timers.set(roomId, {
      intervalId,
      timeoutId,
      secondsRemaining,
      type,
      roomId,
    });

    return true;
  }

  /**
   * Emits a timer tick event to all clients in a room
   * @param roomId - The room ID
   * @param type - The timer type
   * @param secondsRemaining - Seconds remaining
   */
  private emitTick(roomId: string, type: TimerType, secondsRemaining: number): void {
    if (!this.io) {
      console.warn('TimerService: Socket.IO not initialized, cannot emit tick');
      return;
    }

    // Emit to the room
    this.io.to(roomId).emit('timer:tick', {
      type,
      secondsRemaining,
      roomId,
    });
  }

  /**
   * Handles timer expiration
   * @param roomId - The room ID
   * @param type - The timer type that expired
   */
  private handleTimerExpired(roomId: string, type: TimerType): void {
    // Clean up the timer
    this.timers.delete(roomId);

    // Emit timer expired event
    if (this.io) {
      this.io.to(roomId).emit('timer:expired', {
        type,
        roomId,
      });
    }

    // Call the callback if set
    if (this.onExpiredCallback) {
      this.onExpiredCallback(roomId, type);
    }
  }

  /**
   * Clears all timers (useful for cleanup/shutdown)
   */
  clearAllTimers(): void {
    for (const roomId of this.timers.keys()) {
      this.clearTimer(roomId);
    }
  }

  /**
   * Gets the count of active timers
   * @returns Number of active timers
   */
  getActiveTimerCount(): number {
    return this.timers.size;
  }
}

// Export a singleton instance
export const timerService = new TimerService();
