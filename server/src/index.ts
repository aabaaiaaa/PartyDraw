import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const PORT = 3001;
const CLIENT_URL = 'http://localhost:5175';

const app = express();

// Configure CORS for Express
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5174'], // Allow client and TestBoardBed
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const httpServer = createServer(app);

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5174'], // Allow client and TestBoardBed
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO connection handler (placeholder for future implementation)
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`PartyDraw server running on http://localhost:${PORT}`);
  console.log(`CORS enabled for: ${CLIENT_URL}, http://localhost:5174`);
});

export { app, io };
