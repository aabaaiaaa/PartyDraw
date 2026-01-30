/**
 * Console Capture for TestBoardBed Integration
 *
 * This module intercepts console.log, console.warn, and console.error calls
 * and forwards them to the parent window via postMessage. This allows
 * TestBoardBed to display console output from embedded iframes.
 *
 * The messages are sent in a structured format that TestBoardBed can parse
 * to display logs with appropriate styling (normal, warning, error).
 */

/** Message type sent to parent window */
export interface ConsoleMessage {
  type: 'console';
  level: 'log' | 'warn' | 'error' | 'info' | 'debug';
  args: unknown[];
  timestamp: number;
  source: string;
}

/** Configuration options for console capture */
export interface ConsoleCaptureOptions {
  /** Whether to still call the original console methods (default: true) */
  passThrough?: boolean;
  /** Target origin for postMessage (default: '*') */
  targetOrigin?: string;
  /** Source identifier to include in messages (default: 'PartyDraw') */
  source?: string;
  /** Console levels to capture (default: all) */
  levels?: Array<'log' | 'warn' | 'error' | 'info' | 'debug'>;
}

// Store original console methods
const originalConsole = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  info: console.info.bind(console),
  debug: console.debug.bind(console),
};

// Track if capture is initialized
let isInitialized = false;

/**
 * Serializes arguments for postMessage.
 * Handles objects, errors, and circular references safely.
 */
function serializeArgs(args: unknown[]): unknown[] {
  return args.map((arg) => {
    if (arg === undefined) {
      return 'undefined';
    }
    if (arg === null) {
      return null;
    }
    if (arg instanceof Error) {
      return {
        __type: 'Error',
        name: arg.name,
        message: arg.message,
        stack: arg.stack,
      };
    }
    if (typeof arg === 'function') {
      return `[Function: ${arg.name || 'anonymous'}]`;
    }
    if (typeof arg === 'symbol') {
      return arg.toString();
    }
    if (typeof arg === 'object') {
      try {
        // Handle circular references
        const seen = new WeakSet();
        return JSON.parse(
          JSON.stringify(arg, (_key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) {
                return '[Circular]';
              }
              seen.add(value);
            }
            return value;
          })
        );
      } catch {
        return String(arg);
      }
    }
    return arg;
  });
}

/**
 * Sends a console message to the parent window.
 */
function sendToParent(
  level: ConsoleMessage['level'],
  args: unknown[],
  options: Required<ConsoleCaptureOptions>
): void {
  // Only send if we're in an iframe
  if (window.parent === window) {
    return;
  }

  const message: ConsoleMessage = {
    type: 'console',
    level,
    args: serializeArgs(args),
    timestamp: Date.now(),
    source: options.source,
  };

  try {
    window.parent.postMessage(message, options.targetOrigin);
  } catch {
    // Silently fail if postMessage fails
  }
}

/**
 * Creates a wrapped console method.
 */
function createWrapper(
  level: ConsoleMessage['level'],
  options: Required<ConsoleCaptureOptions>
): (...args: unknown[]) => void {
  return (...args: unknown[]): void => {
    // Send to parent window
    sendToParent(level, args, options);

    // Call original method if passThrough is enabled
    if (options.passThrough) {
      originalConsole[level](...args);
    }
  };
}

/**
 * Initializes console capture.
 * Intercepts console methods and forwards them to the parent window.
 *
 * @param options - Configuration options
 *
 * @example
 * // Basic usage in App.tsx
 * useEffect(() => {
 *   initConsoleCapture();
 * }, []);
 *
 * @example
 * // With custom options
 * initConsoleCapture({
 *   passThrough: true,
 *   source: 'MyApp',
 *   levels: ['log', 'error'],
 * });
 */
export function initConsoleCapture(options: ConsoleCaptureOptions = {}): void {
  // Prevent double initialization
  if (isInitialized) {
    originalConsole.warn('[ConsoleCapture] Already initialized, skipping...');
    return;
  }

  const resolvedOptions: Required<ConsoleCaptureOptions> = {
    passThrough: options.passThrough ?? true,
    targetOrigin: options.targetOrigin ?? '*',
    source: options.source ?? 'PartyDraw',
    levels: options.levels ?? ['log', 'warn', 'error', 'info', 'debug'],
  };

  // Replace console methods
  for (const level of resolvedOptions.levels) {
    console[level] = createWrapper(level, resolvedOptions);
  }

  isInitialized = true;

  // Log initialization (this will be captured and sent to parent)
  console.log(`[ConsoleCapture] Initialized with source: ${resolvedOptions.source}`);
}

/**
 * Restores original console methods.
 * Useful for cleanup or testing.
 */
export function restoreConsole(): void {
  if (!isInitialized) {
    return;
  }

  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;

  isInitialized = false;
}

/**
 * Checks if console capture is currently active.
 */
export function isCapturing(): boolean {
  return isInitialized;
}

/**
 * Gets the original console object.
 * Useful when you need to bypass capture for specific logs.
 */
export function getOriginalConsole(): typeof originalConsole {
  return originalConsole;
}
