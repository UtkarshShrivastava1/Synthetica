import { Server, Socket } from 'socket.io';
import { DialecticOrchestrator } from '../services/orchestrator';
import { DialecticSession, RawTurn, AgentReflection } from '../models';

export function registerDialecticSockets(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join a specific session room
    socket.on('session:join', async ({ sessionId }: { sessionId: string }) => {
      socket.join(sessionId);
      console.log(`[Socket.IO] Client ${socket.id} joined session room ${sessionId}`);

      // Send initial hydrated state
      try {
        const session = await DialecticSession.findById(sessionId);
        if (session) {
          const turns = await RawTurn.find({ sessionId }).sort({ turnIndex: 1 }).lean();
          const reflections = await AgentReflection.find({ sessionId }).sort({ turnIndex: 1 }).lean();

          socket.emit('session:synced', {
            session,
            turns,
            reflections: reflections.map((r) => ({
              reflectionId: r._id.toString(),
              sessionId: r.sessionId,
              agentId: r.agentId,
              turnIndex: r.turnIndex,
              insight: r.insight,
              deltaStance: r.deltaStance,
              convergenceScore: r.convergenceScore,
              createdAt: r.createdAt,
            })),
          });
        }
      } catch (err: any) {
        socket.emit('session:error', { sessionId, message: err.message });
      }
    });

    // Leave session room
    socket.on('session:leave', ({ sessionId }: { sessionId: string }) => {
      socket.leave(sessionId);
    });

    // Start session
    socket.on('session:start', async ({ sessionId }: { sessionId: string }) => {
      await DialecticOrchestrator.startSession(sessionId, io);
    });

    // Pause session
    socket.on('session:pause', async ({ sessionId }: { sessionId: string }) => {
      await DialecticOrchestrator.pauseSession(sessionId, io);
    });

    // Resume session
    socket.on('session:resume', async ({ sessionId }: { sessionId: string }) => {
      await DialecticOrchestrator.resumeSession(sessionId, io);
    });

    // Step session (one turn)
    socket.on('session:step', async ({ sessionId }: { sessionId: string }) => {
      await DialecticOrchestrator.stepSession(sessionId, io);
    });

    // Abort session
    socket.on('session:abort', async ({ sessionId }: { sessionId: string }) => {
      await DialecticOrchestrator.abortSession(sessionId, io);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
}
