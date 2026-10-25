import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';
import { sessionRouter } from './routes/sessionRoutes';
import { registerDialecticSockets } from './sockets/dialecticHandler';
import { AiWorkerClient } from './services/aiWorkerClient';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = parseInt(process.env.PORT || '5000', 10);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/synthetica';

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Endpoint
app.get('/api/health', async (_req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const aiWorkerHealthy = await AiWorkerClient.checkHealth();

  res.json({
    status: 'healthy',
    service: 'Synthetica Express Gateway Orchestrator',
    mongodb: {
      status: mongoStatus,
      database: mongoose.connection.name || 'none',
    },
    ai_worker: {
      status: aiWorkerHealthy ? 'connected' : 'offline',
      url: process.env.AI_WORKER_URL || 'http://localhost:8000',
    },
  });
});

// REST Routes
app.use('/api/sessions', sessionRouter);

// Socket.IO Setup
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

registerDialecticSockets(io);

// Connect to MongoDB
async function startServer() {
  try {
    console.log(`[Database] Connecting to MongoDB...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB connected successfully to database: ${mongoose.connection.name}`);
  } catch (err: any) {
    console.warn(`[Database] Warning: MongoDB connection failed (${err.message}).`);
    console.warn(`[Database] Running in disconnected state until MongoDB is available or configured in .env.`);
  }

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Synthetica Gateway Orchestrator running on port ${PORT}`);
    console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
    console.log(`🌐 Health API: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

startServer();
