import { useCallback, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import {
  getSocket,
  getConnectionState,
  onConnectionStateChange,
  connect,
  disconnect,
  isConnected,
  ConnectionState,
} from '../core/socket';

export interface UseSocketReturn {
  /** The socket instance */
  socket: Socket;
  /** Current connection state */
  connectionState: ConnectionState;
  /** Whether the socket is currently connected */
  connected: boolean;
  /** Manually connect to the server */
  connect: () => void;
  /** Disconnect from the server */
  disconnect: () => void;
  /** Emit an event to the server */
  emit: <T = unknown>(event: string, data?: T) => void;
  /** Emit an event and wait for acknowledgement */
  emitWithAck: <T = unknown, R = unknown>(
    event: string,
    data?: T,
    timeout?: number
  ) => Promise<R>;
}

/**
 * React hook that provides access to the Socket.IO client instance,
 * connection status, and methods to emit events.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { socket, connectionState, connected, emit } = useSocket();
 *
 *   useEffect(() => {
 *     socket.on('message', (data) => {
 *       console.log('Received message:', data);
 *     });
 *
 *     return () => {
 *       socket.off('message');
 *     };
 *   }, [socket]);
 *
 *   const sendMessage = () => {
 *     emit('message', { text: 'Hello!' });
 *   };
 *
 *   return (
 *     <div>
 *       <p>Status: {connectionState}</p>
 *       <button onClick={sendMessage} disabled={!connected}>
 *         Send Message
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSocket(): UseSocketReturn {
  // Get the singleton socket instance
  const socket = getSocket();

  // Track connection state
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    getConnectionState()
  );

  // Subscribe to connection state changes
  useEffect(() => {
    const unsubscribe = onConnectionStateChange((state) => {
      setConnectionState(state);
    });

    return unsubscribe;
  }, []);

  // Memoized emit function
  const emit = useCallback(
    <T = unknown>(event: string, data?: T): void => {
      if (!socket.connected) {
        console.warn(`[useSocket] Cannot emit '${event}': socket not connected`);
        return;
      }
      socket.emit(event, data);
    },
    [socket]
  );

  // Emit with acknowledgement (promise-based)
  const emitWithAck = useCallback(
    <T = unknown, R = unknown>(
      event: string,
      data?: T,
      timeout: number = 5000
    ): Promise<R> => {
      return new Promise((resolve, reject) => {
        if (!socket.connected) {
          reject(new Error(`Cannot emit '${event}': socket not connected`));
          return;
        }

        // Set up timeout
        const timeoutId = setTimeout(() => {
          reject(new Error(`Emit '${event}' timed out after ${timeout}ms`));
        }, timeout);

        // Emit with callback for acknowledgement
        socket.emit(event, data, (response: R) => {
          clearTimeout(timeoutId);
          resolve(response);
        });
      });
    },
    [socket]
  );

  // Memoized connect function
  const connectFn = useCallback(() => {
    connect();
  }, []);

  // Memoized disconnect function
  const disconnectFn = useCallback(() => {
    disconnect();
  }, []);

  return {
    socket,
    connectionState,
    connected: isConnected(),
    connect: connectFn,
    disconnect: disconnectFn,
    emit,
    emitWithAck,
  };
}

export default useSocket;
