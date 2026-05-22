import express, { Application } from 'express';
import cors from 'cors';

const CLIENT_URL = 'http://localhost:5175';
const TESTBOARDBED_URL = 'http://localhost:5174';

export function createApp(): Application {
  const app = express();

  // Configure CORS for Express
  app.use(cors({
    origin: [CLIENT_URL, TESTBOARDBED_URL],
    methods: ['GET', 'POST'],
    credentials: true,
  }));

  // Parse JSON bodies
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API info endpoint
  app.get('/api', (_req, res) => {
    res.json({
      name: 'PartyDraw API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        socket: 'ws://localhost:3200',
      },
    });
  });

  return app;
}

export const CORS_OPTIONS = {
  origin: [CLIENT_URL, TESTBOARDBED_URL],
  methods: ['GET', 'POST'],
  credentials: true,
};
