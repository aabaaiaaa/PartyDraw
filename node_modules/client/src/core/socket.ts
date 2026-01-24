import { io, Socket } from 'socket.io-client';

// Server URL - default to localhost:3001 for development
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// Connection state types
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

// Listeners for connection state changes
type ConnectionStateListener = (state: ConnectionState) => void;
const connectionStateListeners: Set<ConnectionStateListener> = new Set();

// Current connection state
let currentConnectionState: ConnectionState = 'disconnected';

// Socket instance (singleton)
let socket: Socket | null = null;

/**
 * Get the current connection state
 */
export function getConnectionState(): ConnectionState {
  return currentConnectionState;
}

/**
 * Update connection state and notify listeners
 */
function setConnectionState(state: ConnectionState): void {
  if (currentConnectionState !== state) {
    currentConnectionState = state;
    connectionStateListeners.forEach((listener) => listener(state));
  }
}

/**
 * Subscribe to connection state changes
 * @returns Unsubscribe function
 */
export function onConnectionStateChange(listener: ConnectionStateListener): () => void {
  connectionStateListeners.add(listener);
  // Immediately notify of current state
  listener(currentConnectionState);

  return () => {
    connectionStateListeners.delete(listener);
  };
}

/**
 * Get or create the socket instance
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = createSocket();
  }
  return socket;
}

/**
 * Create and configure a new socket instance
 */
function createSocket(): Socket {
  setConnectionState('connecting');

  const newSocket = io(SERVER_URL, {
    // Reconnection settings
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,

    // Connection settings
    timeout: 20000,
    autoConnect: true,

    // Transport settings - try websocket first, fall back to polling
    transports: ['websocket', 'polling'],
  });

  // Connection event handlers
  newSocket.on('connect', () => {
    console.log('[Socket] Connected to server:', newSocket.id);
    setConnectionState('connected');
  });

  newSocket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
    if (reason === 'io server disconnect') {
      // Server initiated disconnect, won't auto-reconnect
      setConnectionState('disconnected');
    } else {
      // Client or network issue, will auto-reconnect
      setConnectionState('reconnecting');
    }
  });

  newSocket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message);
    if (currentConnectionState === 'connecting') {
      // Still in initial connection phase
      setConnectionState('connecting');
    }
  });

  newSocket.io.on('reconnect_attempt', (attemptNumber) => {
    console.log('[Socket] Reconnection attempt:', attemptNumber);
    setConnectionState('reconnecting');
  });

  newSocket.io.on('reconnect', (attemptNumber) => {
    console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
    setConnectionState('connected');
  });

  newSocket.io.on('reconnect_failed', () => {
    console.error('[Socket] Reconnection failed after all attempts');
    setConnectionState('disconnected');
  });

  return newSocket;
}

/**
 * Manually connect the socket if disconnected
 */
export function connect(): void {
  const sock = getSocket();
  if (!sock.connected) {
    setConnectionState('connecting');
    sock.connect();
  }
}

/**
 * Disconnect the socket
 */
export function disconnect(): void {
  if (socket) {
    socket.disconnect();
    setConnectionState('disconnected');
  }
}

/**
 * Check if socket is currently connected
 */
export function isConnected(): boolean {
  return socket?.connected ?? false;
}

// Export the socket getter as default
export default getSocket;
