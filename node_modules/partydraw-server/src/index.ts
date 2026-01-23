import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp, CORS_OPTIONS } from './app';

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

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Acknowledge connection
  socket.emit('connected', { socketId: socket.id });

  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
  });

  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`PartyDraw server running on http://localhost:${PORT}`);
  console.log(`Socket.IO enabled with CORS for: ${CORS_OPTIONS.origin.join(', ')}`);
});

// Export for testing and external access
export { app, io, httpServer };
