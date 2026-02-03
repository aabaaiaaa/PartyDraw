import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TimerService, TimerType, TimerExpiredCallback } from '../services/TimerService';

describe('TimerService', () => {
  let timerService: TimerService;
  let mockIo: {
    to: ReturnType<typeof vi.fn>;
    emit: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Use fake timers for all tests
    vi.useFakeTimers();

    // Create a fresh TimerService instance for each test
    timerService = new TimerService();

    // Create mock Socket.IO server
    mockIo = {
      emit: vi.fn(),
      to: vi.fn().mockReturnThis(),
    };

    // Initialize with mock IO
    timerService.initialize(mockIo as any);
  });

  afterEach(() => {
    // Clean up timers
    timerService.clearAllTimers();
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize without Socket.IO server', () => {
      const uninitializedService = new TimerService();
      expect(uninitializedService.hasActiveTimer('room1')).toBe(false);
    });

    it('should accept a Socket.IO server instance', () => {
      const service = new TimerService();
      service.initialize(mockIo as any);
      expect(service.hasActiveTimer('room1')).toBe(false);
    });
  });

  describe('startCountdown', () => {
    it('should start a countdown timer with default duration of 3 seconds', () => {
      const result = timerService.startCountdown('room1');

      expect(result).toBe(true);
      expect(timerService.hasActiveTimer('room1')).toBe(true);
      expect(timerService.getTimerType('room1')).toBe('countdown');
      expect(timerService.getRemainingSeconds('room1')).toBe(3);
    });

    it('should start a countdown timer with custom duration', () => {
      timerService.startCountdown('room1', 5);

      expect(timerService.getRemainingSeconds('room1')).toBe(5);
    });

    it('should emit initial tick immediately', () => {
      timerService.startCountdown('room1', 3);

      expect(mockIo.to).toHaveBeenCalledWith('room1');
      expect(mockIo.emit).toHaveBeenCalledWith('timer:tick', {
        type: 'countdown',
        secondsRemaining: 3,
        roomId: 'room1',
      });
    });

    it('should emit correct ticks each second during countdown', () => {
      timerService.startCountdown('room1', 3);

      // Initial tick (3)
      expect(mockIo.emit).toHaveBeenCalledWith('timer:tick', {
        type: 'countdown',
        secondsRemaining: 3,
        roomId: 'room1',
      });

      // After 1 second (2)
      vi.advanceTimersByTime(1000);
      expect(mockIo.emit).toHaveBeenCalledWith('timer:tick', {
        type: 'countdown',
        secondsRemaining: 2,
        roomId: 'room1',
      });

      // After 2 seconds (1)
      vi.advanceTimersByTime(1000);
      expect(mockIo.emit).toHaveBeenCalledWith('timer:tick', {
        type: 'countdown',
        secondsRemaining: 1,
        roomId: 'room1',
      });

      // After 3 seconds (0)
      vi.advanceTimersByTime(1000);
      expect(mockIo.emit).toHaveBeenCalledWith('timer:tick', {
        type: 'countdown',
        secondsRemaining: 0,
        roomId: 'room1',
      });
    });

    it('should replace existing timer for the same room', () => {
      timerService.startCountdown('room1', 5);
      expect(timerService.getRemainingSeconds('room1')).toBe(5);

      timerService.startCountdown('room1', 10);
      expect(timerService.getRemainingSeconds('room1')).toBe(10);
      expect(timerService.getActiveTimerCount()).toBe(1);
    });
  });

  describe('startDrawingTimer', () => {
    it('should start a drawing timer with specified duration', () => {
      const result = timerService.startDrawingTimer('room1', 20);

      expect(result).toBe(true);
      expect(timerService.hasActiveTimer('room1')).toBe(true);
      expect(timerService.getTimerType('room1')).toBe('drawing');
      expect(timerService.getRemainingSeconds('room1')).toBe(20);
    });

    it('should emit drawing timer ticks', () => {
      timerService.startDrawingTimer('room1', 20);

      expect(mockIo.emit).toHaveBeenCalledWith('timer:tick', {
        type: 'drawing',
        secondsRemaining: 20,
        roomId: 'room1',
      });
    });
  });

  describe('startVotingTimer', () => {
    it('should start a voting timer with specified duration', () => {
      const result = timerService.startVotingTimer('room1', 15);

      expect(result).toBe(true);
      expect(timerService.hasActiveTimer('room1')).toBe(true);
      expect(timerService.getTimerType('room1')).toBe('voting');
      expect(timerService.getRemainingSeconds('room1')).toBe(15);
    });

    it('should emit voting timer ticks', () => {
      timerService.startVotingTimer('room1', 15);

      expect(mockIo.emit).toHaveBeenCalledWith('timer:tick', {
        type: 'voting',
        secondsRemaining: 15,
        roomId: 'room1',
      });
    });
  });

  describe('clearTimer', () => {
    it('should clear an active timer', () => {
      timerService.startCountdown('room1', 5);
      expect(timerService.hasActiveTimer('room1')).toBe(true);

      const result = timerService.clearTimer('room1');

      expect(result).toBe(true);
      expect(timerService.hasActiveTimer('room1')).toBe(false);
      expect(timerService.getRemainingSeconds('room1')).toBeNull();
    });

    it('should return false when no timer exists', () => {
      const result = timerService.clearTimer('nonexistent');

      expect(result).toBe(false);
    });

    it('should stop ticks after clearing', () => {
      timerService.startCountdown('room1', 5);

      // Clear emit call tracking
      mockIo.emit.mockClear();

      timerService.clearTimer('room1');

      // Advance time - no more ticks should be emitted
      vi.advanceTimersByTime(2000);

      // No more tick emissions after clearing
      const tickCalls = (mockIo.emit.mock.calls as [string, unknown][]).filter(
        (call) => call[0] === 'timer:tick'
      );
      expect(tickCalls.length).toBe(0);
    });

    it('should prevent expiration callback from firing after clearing', () => {
      const callback = vi.fn();
      timerService.setOnExpiredCallback(callback);

      timerService.startCountdown('room1', 3);
      timerService.clearTimer('room1');

      // Advance past when timer would have expired
      vi.advanceTimersByTime(5000);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('timer expiration', () => {
    it('should trigger expiration callback when timer completes', () => {
      const callback = vi.fn();
      timerService.setOnExpiredCallback(callback);

      timerService.startCountdown('room1', 3);

      // Advance time to trigger expiration
      vi.advanceTimersByTime(3000);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('room1', 'countdown');
    });

    it('should emit timer:expired event when timer completes', () => {
      timerService.startCountdown('room1', 3);

      vi.advanceTimersByTime(3000);

      expect(mockIo.emit).toHaveBeenCalledWith('timer:expired', {
        type: 'countdown',
        roomId: 'room1',
      });
    });

    it('should clean up timer after expiration', () => {
      timerService.startCountdown('room1', 3);

      vi.advanceTimersByTime(3000);

      expect(timerService.hasActiveTimer('room1')).toBe(false);
    });

    it('should trigger correct callback for drawing timer expiration', () => {
      const callback = vi.fn();
      timerService.setOnExpiredCallback(callback);

      timerService.startDrawingTimer('room1', 20);

      vi.advanceTimersByTime(20000);

      expect(callback).toHaveBeenCalledWith('room1', 'drawing');
    });

    it('should trigger correct callback for voting timer expiration', () => {
      const callback = vi.fn();
      timerService.setOnExpiredCallback(callback);

      timerService.startVotingTimer('room1', 15);

      vi.advanceTimersByTime(15000);

      expect(callback).toHaveBeenCalledWith('room1', 'voting');
    });
  });

  describe('multiple rooms - timers should not interfere', () => {
    it('should track separate timers for different rooms', () => {
      timerService.startCountdown('room1', 3);
      timerService.startDrawingTimer('room2', 20);
      timerService.startVotingTimer('room3', 15);

      expect(timerService.getActiveTimerCount()).toBe(3);
      expect(timerService.getTimerType('room1')).toBe('countdown');
      expect(timerService.getTimerType('room2')).toBe('drawing');
      expect(timerService.getTimerType('room3')).toBe('voting');
    });

    it('should emit ticks to correct rooms independently', () => {
      timerService.startCountdown('room1', 3);
      timerService.startCountdown('room2', 5);

      // Initial ticks
      expect(mockIo.to).toHaveBeenCalledWith('room1');
      expect(mockIo.to).toHaveBeenCalledWith('room2');

      mockIo.to.mockClear();
      mockIo.emit.mockClear();

      // Advance 1 second
      vi.advanceTimersByTime(1000);

      // Both rooms should receive ticks
      expect(mockIo.to).toHaveBeenCalledWith('room1');
      expect(mockIo.to).toHaveBeenCalledWith('room2');
    });

    it('should have different remaining times for different rooms', () => {
      timerService.startCountdown('room1', 10);
      timerService.startCountdown('room2', 20);

      vi.advanceTimersByTime(5000);

      expect(timerService.getRemainingSeconds('room1')).toBe(5);
      expect(timerService.getRemainingSeconds('room2')).toBe(15);
    });

    it('should clear only the specified room timer', () => {
      timerService.startCountdown('room1', 5);
      timerService.startCountdown('room2', 5);
      timerService.startCountdown('room3', 5);

      timerService.clearTimer('room2');

      expect(timerService.hasActiveTimer('room1')).toBe(true);
      expect(timerService.hasActiveTimer('room2')).toBe(false);
      expect(timerService.hasActiveTimer('room3')).toBe(true);
    });

    it('should trigger expiration callbacks for the correct room', () => {
      const callback = vi.fn();
      timerService.setOnExpiredCallback(callback);

      timerService.startCountdown('room1', 3);
      timerService.startCountdown('room2', 5);

      // Room 1 expires first
      vi.advanceTimersByTime(3000);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('room1', 'countdown');

      // Room 2 expires later
      vi.advanceTimersByTime(2000);
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith('room2', 'countdown');
    });

    it('should handle rooms with different timer types simultaneously', () => {
      const callback = vi.fn();
      timerService.setOnExpiredCallback(callback);

      timerService.startCountdown('room1', 3);
      timerService.startDrawingTimer('room2', 5);
      timerService.startVotingTimer('room3', 4);

      // Room 1 countdown expires at 3s
      vi.advanceTimersByTime(3000);
      expect(callback).toHaveBeenCalledWith('room1', 'countdown');

      // Room 3 voting expires at 4s
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledWith('room3', 'voting');

      // Room 2 drawing expires at 5s
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledWith('room2', 'drawing');

      expect(callback).toHaveBeenCalledTimes(3);
    });
  });

  describe('clearAllTimers', () => {
    it('should clear all active timers', () => {
      timerService.startCountdown('room1', 5);
      timerService.startDrawingTimer('room2', 20);
      timerService.startVotingTimer('room3', 15);

      expect(timerService.getActiveTimerCount()).toBe(3);

      timerService.clearAllTimers();

      expect(timerService.getActiveTimerCount()).toBe(0);
      expect(timerService.hasActiveTimer('room1')).toBe(false);
      expect(timerService.hasActiveTimer('room2')).toBe(false);
      expect(timerService.hasActiveTimer('room3')).toBe(false);
    });

    it('should prevent all expiration callbacks after clearing all', () => {
      const callback = vi.fn();
      timerService.setOnExpiredCallback(callback);

      timerService.startCountdown('room1', 3);
      timerService.startCountdown('room2', 5);

      timerService.clearAllTimers();

      vi.advanceTimersByTime(10000);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getRemainingSeconds', () => {
    it('should return null for non-existent timer', () => {
      expect(timerService.getRemainingSeconds('nonexistent')).toBeNull();
    });

    it('should track remaining seconds correctly', () => {
      timerService.startCountdown('room1', 10);

      expect(timerService.getRemainingSeconds('room1')).toBe(10);

      vi.advanceTimersByTime(3000);
      expect(timerService.getRemainingSeconds('room1')).toBe(7);

      vi.advanceTimersByTime(5000);
      expect(timerService.getRemainingSeconds('room1')).toBe(2);
    });
  });

  describe('getTimerType', () => {
    it('should return null for non-existent timer', () => {
      expect(timerService.getTimerType('nonexistent')).toBeNull();
    });

    it('should return correct timer type', () => {
      timerService.startCountdown('room1', 3);
      timerService.startDrawingTimer('room2', 20);
      timerService.startVotingTimer('room3', 15);

      expect(timerService.getTimerType('room1')).toBe('countdown');
      expect(timerService.getTimerType('room2')).toBe('drawing');
      expect(timerService.getTimerType('room3')).toBe('voting');
    });
  });

  describe('without Socket.IO initialized', () => {
    it('should not crash when emitting ticks without io', () => {
      const serviceWithoutIo = new TimerService();

      // Should not throw
      expect(() => serviceWithoutIo.startCountdown('room1', 3)).not.toThrow();
    });

    it('should still track timer state without io', () => {
      const serviceWithoutIo = new TimerService();
      serviceWithoutIo.startCountdown('room1', 5);

      expect(serviceWithoutIo.hasActiveTimer('room1')).toBe(true);
      expect(serviceWithoutIo.getRemainingSeconds('room1')).toBe(5);
    });

    it('should still call expiration callback without io', () => {
      const serviceWithoutIo = new TimerService();
      const callback = vi.fn();
      serviceWithoutIo.setOnExpiredCallback(callback);

      serviceWithoutIo.startCountdown('room1', 3);
      vi.advanceTimersByTime(3000);

      expect(callback).toHaveBeenCalledWith('room1', 'countdown');
    });
  });

  describe('edge cases', () => {
    it('should handle zero-second timer', () => {
      const callback = vi.fn();
      timerService.setOnExpiredCallback(callback);

      timerService.startCountdown('room1', 0);

      // Immediately expires
      vi.advanceTimersByTime(0);
      expect(callback).toHaveBeenCalledWith('room1', 'countdown');
    });

    it('should handle very short timers (1 second)', () => {
      const callback = vi.fn();
      timerService.setOnExpiredCallback(callback);

      timerService.startCountdown('room1', 1);

      expect(timerService.getRemainingSeconds('room1')).toBe(1);

      vi.advanceTimersByTime(1000);

      expect(callback).toHaveBeenCalledWith('room1', 'countdown');
    });

    it('should handle setting callback after starting timer', () => {
      timerService.startCountdown('room1', 3);

      const callback = vi.fn();
      timerService.setOnExpiredCallback(callback);

      vi.advanceTimersByTime(3000);

      expect(callback).toHaveBeenCalledWith('room1', 'countdown');
    });

    it('should handle replacing callback', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      timerService.setOnExpiredCallback(callback1);
      timerService.startCountdown('room1', 3);

      timerService.setOnExpiredCallback(callback2);

      vi.advanceTimersByTime(3000);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith('room1', 'countdown');
    });
  });
});
