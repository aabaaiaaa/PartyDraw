import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp, CORS_OPTIONS } from './app';
import { initializeSocketHandlers } from './socket';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Create Express app
const app = createApp();

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server with CORS configuration
const io = new Server(httpServer, {
  cors: CORS_OPTIONS,
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Initialize socket handlers
initializeSocketHandlers(io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`PartyDraw server running on http://localhost:${PORT}`);
  console.log(`Socket.IO enabled with CORS for: ${CORS_OPTIONS.origin.join(', ')}`);
});

// Export for testing and external access
export { app, io, httpServer };
