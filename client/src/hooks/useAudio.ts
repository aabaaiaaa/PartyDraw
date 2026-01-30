import { useCallback, useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';

/**
 * Sound effect identifiers for the game
 */
export type SoundEffect =
  | 'countdownTick'
  | 'roundStart'
  | 'drawingSubmit'
  | 'voteCast'
  | 'roundWinner'
  | 'gameWinner';

/**
 * Configuration for each sound effect
 */
interface SoundConfig {
  src: string[];
  volume?: number;
  loop?: boolean;
  /** Fallback synthesis configuration when audio file is not available */
  fallback?: {
    frequency: number;
    duration: number;
    type: OscillatorType;
    /** Additional notes for chords/melodies */
    notes?: Array<{ frequency: number; delay: number; duration: number }>;
  };
}

/**
 * Sound configurations with paths to audio files
 * Using Web Audio API compatible formats (mp3, ogg, wav)
 * Includes fallback synthesizer configurations for when files are missing
 */
const SOUND_CONFIGS: Record<SoundEffect, SoundConfig> = {
  countdownTick: {
    src: ['/sounds/countdown-tick.mp3', '/sounds/countdown-tick.ogg'],
    volume: 0.6,
    fallback: {
      frequency: 800,
      duration: 0.1,
      type: 'sine',
    },
  },
  roundStart: {
    src: ['/sounds/round-start.mp3', '/sounds/round-start.ogg'],
    volume: 0.8,
    fallback: {
      frequency: 523.25, // C5
      duration: 0.15,
      type: 'square',
      notes: [
        { frequency: 659.25, delay: 0.15, duration: 0.15 }, // E5
        { frequency: 783.99, delay: 0.3, duration: 0.3 }, // G5
      ],
    },
  },
  drawingSubmit: {
    src: ['/sounds/drawing-submit.mp3', '/sounds/drawing-submit.ogg'],
    volume: 0.5,
    fallback: {
      frequency: 600,
      duration: 0.08,
      type: 'sine',
      notes: [{ frequency: 900, delay: 0.08, duration: 0.1 }],
    },
  },
  voteCast: {
    src: ['/sounds/vote-cast.mp3', '/sounds/vote-cast.ogg'],
    volume: 0.5,
    fallback: {
      frequency: 440,
      duration: 0.05,
      type: 'sine',
    },
  },
  roundWinner: {
    src: ['/sounds/round-winner.mp3', '/sounds/round-winner.ogg'],
    volume: 0.7,
    fallback: {
      frequency: 523.25, // C5
      duration: 0.2,
      type: 'square',
      notes: [
        { frequency: 659.25, delay: 0.2, duration: 0.2 }, // E5
        { frequency: 783.99, delay: 0.4, duration: 0.2 }, // G5
        { frequency: 1046.5, delay: 0.6, duration: 0.4 }, // C6
      ],
    },
  },
  gameWinner: {
    src: ['/sounds/game-winner.mp3', '/sounds/game-winner.ogg'],
    volume: 0.9,
    fallback: {
      frequency: 261.63, // C4
      duration: 0.25,
      type: 'square',
      notes: [
        { frequency: 329.63, delay: 0.25, duration: 0.25 }, // E4
        { frequency: 392.0, delay: 0.5, duration: 0.25 }, // G4
        { frequency: 523.25, delay: 0.75, duration: 0.25 }, // C5
        { frequency: 659.25, delay: 1.0, duration: 0.25 }, // E5
        { frequency: 783.99, delay: 1.25, duration: 0.5 }, // G5
        { frequency: 1046.5, delay: 1.75, duration: 0.75 }, // C6
      ],
    },
  },
};

/**
 * Singleton cache for preloaded Howl instances
 */
const soundCache: Map<SoundEffect, Howl> = new Map();

/**
 * Track which sounds failed to load and need fallback synthesis
 */
const failedSounds: Set<SoundEffect> = new Set();

let isPreloaded = false;

/**
 * Audio context for fallback synthesis (lazy initialized)
 */
let audioContext: AudioContext | null = null;

/**
 * Get or create the audio context for synthesis
 */
function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    } catch {
      console.warn('[useAudio] Web Audio API not available for fallback sounds');
      return null;
    }
  }
  return audioContext;
}

/**
 * Play a synthesized fallback sound using Web Audio API
 */
function playSynthesizedSound(effect: SoundEffect, volume: number): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const config = SOUND_CONFIGS[effect];
  if (!config.fallback) return;

  // Resume context if suspended (required by browsers)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const { fallback } = config;
  const masterGain = ctx.createGain();
  masterGain.gain.value = volume * (config.volume ?? 1.0);
  masterGain.connect(ctx.destination);

  // Play the main note
  playNote(ctx, masterGain, fallback.frequency, 0, fallback.duration, fallback.type);

  // Play additional notes if defined
  if (fallback.notes) {
    fallback.notes.forEach((note) => {
      playNote(ctx, masterGain, note.frequency, note.delay, note.duration, fallback.type);
    });
  }
}

/**
 * Play a single synthesized note
 */
function playNote(
  ctx: AudioContext,
  destination: AudioNode,
  frequency: number,
  delay: number,
  duration: number,
  type: OscillatorType
): void {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  // Apply envelope for smoother sound
  const startTime = ctx.currentTime + delay;
  const endTime = startTime + duration;

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
  gainNode.gain.linearRampToValueAtTime(0.2, startTime + duration * 0.3);
  gainNode.gain.linearRampToValueAtTime(0, endTime);

  oscillator.connect(gainNode);
  gainNode.connect(destination);

  oscillator.start(startTime);
  oscillator.stop(endTime + 0.1);
}

/**
 * Preload all sound effects to avoid delays during gameplay
 */
function preloadSounds(): void {
  if (isPreloaded) return;

  Object.entries(SOUND_CONFIGS).forEach(([key, config]) => {
    const soundKey = key as SoundEffect;
    if (!soundCache.has(soundKey)) {
      const howl = new Howl({
        src: config.src,
        volume: config.volume ?? 1.0,
        loop: config.loop ?? false,
        preload: true,
        html5: false, // Use Web Audio API for better performance
        onloaderror: (_id, _error) => {
          // Mark this sound as needing fallback synthesis
          failedSounds.add(soundKey);
          // Don't log warning since fallback will be used
        },
      });
      soundCache.set(soundKey, howl);
    }
  });

  isPreloaded = true;
}

/**
 * Get or create a Howl instance for the given sound effect
 */
function getSound(effect: SoundEffect): Howl | null {
  // Ensure sounds are preloaded
  if (!isPreloaded) {
    preloadSounds();
  }

  const howl = soundCache.get(effect);
  if (!howl) {
    return null;
  }

  return howl;
}

/**
 * Check if a sound needs fallback synthesis
 */
function needsFallback(effect: SoundEffect): boolean {
  return failedSounds.has(effect);
}

export interface UseAudioReturn {
  /** Play a sound effect */
  play: (effect: SoundEffect) => void;
  /** Stop a specific sound effect */
  stop: (effect: SoundEffect) => void;
  /** Stop all currently playing sounds */
  stopAll: () => void;
  /** Set the global volume (0.0 to 1.0) */
  setVolume: (volume: number) => void;
  /** Get the current global volume */
  getVolume: () => number;
  /** Mute all sounds */
  mute: () => void;
  /** Unmute all sounds */
  unmute: () => void;
  /** Check if sounds are currently muted */
  isMuted: () => boolean;
  /** Preload all sound effects */
  preload: () => void;
}

/**
 * React hook for managing game sound effects using Howler.js
 *
 * @example
 * ```tsx
 * function GameComponent() {
 *   const { play, setVolume, mute, unmute } = useAudio();
 *
 *   // Play countdown tick
 *   const handleTick = () => {
 *     play('countdownTick');
 *   };
 *
 *   // Play when player submits drawing
 *   const handleSubmit = () => {
 *     play('drawingSubmit');
 *   };
 *
 *   // Celebrate round winner
 *   const handleRoundEnd = () => {
 *     play('roundWinner');
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={() => setVolume(0.5)}>50% Volume</button>
 *       <button onClick={mute}>Mute</button>
 *       <button onClick={unmute}>Unmute</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAudio(): UseAudioReturn {
  const isMutedRef = useRef(false);

  // Preload sounds on mount
  useEffect(() => {
    preloadSounds();
  }, []);

  /**
   * Play a sound effect
   */
  const play = useCallback((effect: SoundEffect): void => {
    if (isMutedRef.current) return;

    // Check if we need to use fallback synthesis
    if (needsFallback(effect)) {
      playSynthesizedSound(effect, Howler.volume());
      return;
    }

    const sound = getSound(effect);
    if (sound) {
      // Stop any existing instance of this sound before playing again
      sound.stop();
      sound.play();
    }
  }, []);

  /**
   * Stop a specific sound effect
   */
  const stop = useCallback((effect: SoundEffect): void => {
    const sound = getSound(effect);
    if (sound) {
      sound.stop();
    }
  }, []);

  /**
   * Stop all currently playing sounds
   */
  const stopAll = useCallback((): void => {
    Howler.stop();
  }, []);

  /**
   * Set global volume (0.0 to 1.0)
   */
  const setVolume = useCallback((volume: number): void => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(clampedVolume);
  }, []);

  /**
   * Get current global volume
   */
  const getVolume = useCallback((): number => {
    return Howler.volume();
  }, []);

  /**
   * Mute all sounds
   */
  const mute = useCallback((): void => {
    isMutedRef.current = true;
    Howler.mute(true);
  }, []);

  /**
   * Unmute all sounds
   */
  const unmute = useCallback((): void => {
    isMutedRef.current = false;
    Howler.mute(false);
  }, []);

  /**
   * Check if sounds are muted
   */
  const isMuted = useCallback((): boolean => {
    return isMutedRef.current;
  }, []);

  /**
   * Preload all sounds
   */
  const preload = useCallback((): void => {
    preloadSounds();
  }, []);

  return {
    play,
    stop,
    stopAll,
    setVolume,
    getVolume,
    mute,
    unmute,
    isMuted,
    preload,
  };
}

export default useAudio;
