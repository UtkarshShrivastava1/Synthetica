import { Server as SocketIOServer } from 'socket.io';
import { DialecticSession, IDialecticSession, RawTurn, AgentReflection } from '../models';
import { AiWorkerClient } from './aiWorkerClient';
import { VectorStoreService } from './vectorStore';

const CONVERGENCE_THRESHOLD = parseFloat(process.env.CONVERGENCE_THRESHOLD || '0.85');
const CONSECUTIVE_CONVERGENCE_TURNS = parseInt(process.env.CONSECUTIVE_CONVERGENCE_TURNS || '2', 10);
const TURN_DELAY_MS = parseInt(process.env.TURN_DELAY_MS || '2500', 10);

export class DialecticOrchestrator {
  private static activeTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private static isProcessingTurn: Map<string, boolean> = new Map();

  /**
   * Start or restart a dialectic session
   */
  static async startSession(sessionId: string, io: SocketIOServer): Promise<IDialecticSession | null> {
    const session = await DialecticSession.findById(sessionId);
    if (!session) return null;

    this.clearSessionTimeout(sessionId);
    session.status = 'RUNNING';
    await session.save();

    io.to(sessionId).emit('session:status', {
      sessionId,
      status: session.status,
      currentTurn: session.currentTurn,
    });

    // Begin turn loop
    this.scheduleNextTurn(sessionId, io, 500);
    return session;
  }

  /**
   * Pause turn progression
   */
  static async pauseSession(sessionId: string, io: SocketIOServer): Promise<IDialecticSession | null> {
    this.clearSessionTimeout(sessionId);
    const session = await DialecticSession.findByIdAndUpdate(
      sessionId,
      { status: 'PAUSED' },
      { new: true }
    );
    if (session) {
      io.to(sessionId).emit('session:status', {
        sessionId,
        status: 'PAUSED',
        currentTurn: session.currentTurn,
      });
    }
    return session;
  }

  /**
   * Resume paused session
   */
  static async resumeSession(sessionId: string, io: SocketIOServer): Promise<IDialecticSession | null> {
    const session = await DialecticSession.findById(sessionId);
    if (!session) return null;

    if (session.status === 'CONVERGED' || session.status === 'EXHAUSTED' || session.status === 'FAILED') {
      return session;
    }

    session.status = 'RUNNING';
    await session.save();

    io.to(sessionId).emit('session:status', {
      sessionId,
      status: 'RUNNING',
      currentTurn: session.currentTurn,
    });

    this.scheduleNextTurn(sessionId, io, 300);
    return session;
  }

  /**
   * Step: execute exactly one turn and then pause
   */
  static async stepSession(sessionId: string, io: SocketIOServer): Promise<void> {
    this.clearSessionTimeout(sessionId);
    const session = await DialecticSession.findById(sessionId);
    if (!session) return;

    if (session.status === 'CONVERGED' || session.status === 'EXHAUSTED') {
      return;
    }

    await this.executeTurn(sessionId, io, true);
  }

  /**
   * Abort session
   */
  static async abortSession(sessionId: string, io: SocketIOServer): Promise<IDialecticSession | null> {
    this.clearSessionTimeout(sessionId);
    const session = await DialecticSession.findByIdAndUpdate(
      sessionId,
      { status: 'FAILED' },
      { new: true }
    );
    if (session) {
      io.to(sessionId).emit('session:ended', {
        sessionId,
        reason: 'ABORTED',
        finalTurn: session.currentTurn,
      });
    }
    return session;
  }

  private static scheduleNextTurn(sessionId: string, io: SocketIOServer, delayMs: number = TURN_DELAY_MS): void {
    this.clearSessionTimeout(sessionId);
    const timeout = setTimeout(async () => {
      await this.executeTurn(sessionId, io, false);
    }, delayMs);
    this.activeTimeouts.set(sessionId, timeout);
  }

  private static clearSessionTimeout(sessionId: string): void {
    const timeout = this.activeTimeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.activeTimeouts.delete(sessionId);
    }
  }

  /**
   * Main turn execution state machine
   */
  private static async executeTurn(
    sessionId: string,
    io: SocketIOServer,
    isStepMode: boolean
  ): Promise<void> {
    if (this.isProcessingTurn.get(sessionId)) {
      return;
    }

    this.isProcessingTurn.set(sessionId, true);

    try {
      const session = await DialecticSession.findById(sessionId);
      if (!session) return;

      if (!isStepMode && session.status !== 'RUNNING') {
        return;
      }

      // Check turn exhaustion
      if (session.currentTurn >= session.maxTurns) {
        session.status = 'EXHAUSTED';
        await session.save();
        io.to(sessionId).emit('session:ended', {
          sessionId,
          reason: 'EXHAUSTED',
          finalTurn: session.currentTurn,
        });
        return;
      }

      const turnIndex = session.currentTurn;
      // Even turn = Agent A speaks to Agent B; Odd turn = Agent B speaks to Agent A
      const isAgentA = turnIndex % 2 === 0;
      const speakerId = isAgentA ? 'agent_a' : 'agent_b';
      const recipientId = isAgentA ? 'agent_b' : 'agent_a';
      const speakerConfig = isAgentA ? session.agentConfig.agentA : session.agentConfig.agentB;

      // 1. Fetch recent dialogue window (last 6 turns)
      const recentTurnsDb = await RawTurn.find({ sessionId })
        .sort({ turnIndex: 1 })
        .limit(6)
        .lean();

      const lastTurn = recentTurnsDb.length > 0 ? recentTurnsDb[recentTurnsDb.length - 1] : null;
      const counterpartLastMessage = lastTurn ? lastTurn.message : session.topic;

      // 2. Step 1: Context Vectorization
      io.to(sessionId).emit('turn:thinking', {
        agentId: speakerId,
        step: 'retrieving',
        turnIndex,
      });

      let counterpartEmbedding: number[] = [];
      try {
        counterpartEmbedding = await AiWorkerClient.embed(counterpartLastMessage);
      } catch (err: any) {
        console.error(`[Orchestrator] Error generating counterpart embedding: ${err.message}`);
      }

      // 3. Step 2: Episodic Retrieval ($vectorSearch)
      let retrievedMemories: Array<{ reflectionId: string; insight: string; similarityScore: number }> = [];
      if (counterpartEmbedding.length > 0) {
        retrievedMemories = await VectorStoreService.findSimilarReflections(
          sessionId,
          speakerId,
          counterpartEmbedding,
          3
        );
      }

      // 4. Step 3: Deliberation Prompting
      io.to(sessionId).emit('turn:thinking', {
        agentId: speakerId,
        step: 'deliberating',
        turnIndex,
      });

      const recentTurnsPayload = recentTurnsDb.map((t) => ({
        sender: t.sender,
        message: t.message,
      }));

      const memoryInsights = retrievedMemories.map((m) => m.insight);
      const generatedResponse = await AiWorkerClient.deliberate(
        speakerId,
        speakerConfig.corePremise,
        memoryInsights,
        recentTurnsPayload
      );

      // Save raw turn to DB
      const newTurn = await RawTurn.create({
        sessionId,
        turnIndex,
        sender: speakerId,
        recipient: recipientId,
        message: generatedResponse,
        retrievedMemories,
        timestamp: new Date(),
      });

      // Broadcast turn completion
      io.to(sessionId).emit('turn:complete', {
        turnId: newTurn._id.toString(),
        sessionId,
        turnIndex,
        sender: speakerId,
        recipient: recipientId,
        message: generatedResponse,
        retrievedMemories,
        timestamp: newTurn.timestamp,
      });

      // 5. Step 4: Metacognitive Reflection
      io.to(sessionId).emit('turn:thinking', {
        agentId: speakerId,
        step: 'reflecting',
        turnIndex,
      });

      const reflectionData = await AiWorkerClient.reflect(
        speakerId,
        speakerConfig.corePremise,
        counterpartLastMessage,
        generatedResponse
      );

      // 6. Step 5: Embed Reflection & Persist
      let reflectionEmbedding: number[] = [];
      try {
        reflectionEmbedding = await AiWorkerClient.embed(reflectionData.insight);
      } catch {
        reflectionEmbedding = counterpartEmbedding; // fallback
      }

      const newReflection = await AgentReflection.create({
        sessionId,
        agentId: speakerId,
        turnIndex,
        insight: reflectionData.insight,
        deltaStance: reflectionData.deltaStance,
        convergenceScore: reflectionData.convergenceScore,
        embedding: reflectionEmbedding,
        createdAt: new Date(),
      });

      // Broadcast reflection payload
      io.to(sessionId).emit('reflection:new', {
        reflectionId: newReflection._id.toString(),
        sessionId,
        agentId: speakerId,
        turnIndex,
        insight: reflectionData.insight,
        deltaStance: reflectionData.deltaStance,
        convergenceScore: reflectionData.convergenceScore,
        createdAt: newReflection.createdAt,
      });

      // 7. Update Session Metrics & State
      const nextTurnIndex = turnIndex + 1;
      const allReflections = await AgentReflection.find({ sessionId }).select('convergenceScore').lean();
      const avgScore =
        allReflections.reduce((acc, r) => acc + r.convergenceScore, 0) / (allReflections.length || 1);

      const isHighScore = reflectionData.convergenceScore >= CONVERGENCE_THRESHOLD;
      const consecutiveHighScores = isHighScore ? (session.metrics.consecutiveHighScores || 0) + 1 : 0;

      session.currentTurn = nextTurnIndex;
      session.metrics.avgConvergenceScore = Number(avgScore.toFixed(3));
      session.metrics.consecutiveHighScores = consecutiveHighScores;

      // 8. Convergence Check
      if (consecutiveHighScores >= CONSECUTIVE_CONVERGENCE_TURNS) {
        session.status = 'CONVERGED';
        await session.save();
        io.to(sessionId).emit('session:ended', {
          sessionId,
          reason: 'CONVERGED',
          finalTurn: nextTurnIndex,
          avgConvergenceScore: session.metrics.avgConvergenceScore,
        });
        return;
      }

      if (nextTurnIndex >= session.maxTurns) {
        session.status = 'EXHAUSTED';
        await session.save();
        io.to(sessionId).emit('session:ended', {
          sessionId,
          reason: 'EXHAUSTED',
          finalTurn: nextTurnIndex,
        });
        return;
      }

      if (isStepMode) {
        session.status = 'PAUSED';
        await session.save();
        io.to(sessionId).emit('session:status', {
          sessionId,
          status: 'PAUSED',
          currentTurn: nextTurnIndex,
        });
        return;
      }

      await session.save();

      // Schedule subsequent turn if running
      if (session.status === 'RUNNING') {
        this.scheduleNextTurn(sessionId, io, TURN_DELAY_MS);
      }
    } catch (error: any) {
      console.error(`[Orchestrator] Error in executeTurn for ${sessionId}:`, error);
      io.to(sessionId).emit('session:error', {
        sessionId,
        message: error.message || 'Turn execution failed',
      });
    } finally {
      this.isProcessingTurn.set(sessionId, false);
    }
  }
}
