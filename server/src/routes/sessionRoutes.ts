import { Router, Request, Response } from 'express';
import { DialecticSession, RawTurn, AgentReflection } from '../models';

export const sessionRouter = Router();

// List all sessions
sessionRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const sessions = await DialecticSession.find()
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();
    res.json({ success: true, count: sessions.length, data: sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new session
sessionRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { topic, maxTurns = 12, agentConfig } = req.body;

    if (!topic || !agentConfig?.agentA || !agentConfig?.agentB) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: topic, agentConfig.agentA, agentConfig.agentB',
      });
    }

    const session = await DialecticSession.create({
      topic,
      maxTurns: Number(maxTurns) || 12,
      currentTurn: 0,
      status: 'INITIALIZING',
      agentConfig: {
        agentA: {
          name: agentConfig.agentA.name || 'Agent A (Monolith)',
          corePremise: agentConfig.agentA.corePremise,
          colorTheme: agentConfig.agentA.colorTheme || '#6366F1',
        },
        agentB: {
          name: agentConfig.agentB.name || 'Agent B (Microservices)',
          corePremise: agentConfig.agentB.corePremise,
          colorTheme: agentConfig.agentB.colorTheme || '#F59E0B',
        },
      },
      metrics: {
        avgConvergenceScore: 0,
        consecutiveHighScores: 0,
      },
    });

    res.status(201).json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Seed default demo session if no sessions exist
sessionRouter.post('/seed-demo', async (_req: Request, res: Response) => {
  try {
    const demoSession = await DialecticSession.create({
      topic: 'Monoliths vs Microservices for Early Stage System Architecture',
      maxTurns: 10,
      currentTurn: 0,
      status: 'INITIALIZING',
      agentConfig: {
        agentA: {
          name: 'Apex Monolith',
          corePremise: 'Monolithic architectures provide superior iteration speed, simplified transactional boundaries, and lower cognitive overhead for early-stage engineering velocity.',
          colorTheme: '#6366F1', // Electric Indigo
        },
        agentB: {
          name: 'Nexus Microservices',
          corePremise: 'Fine-grained distributed microservices provide essential domain fault-isolation, independent team deployability, and horizontal autoscaling from day one.',
          colorTheme: '#F59E0B', // Solar Amber
        },
      },
      metrics: {
        avgConvergenceScore: 0,
        consecutiveHighScores: 0,
      },
    });

    res.status(201).json({ success: true, data: demoSession });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get session by ID
sessionRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const session = await DialecticSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get turns for session
sessionRouter.get('/:id/turns', async (req: Request, res: Response) => {
  try {
    const turns = await RawTurn.find({ sessionId: req.params.id })
      .sort({ turnIndex: 1 })
      .lean();
    res.json({ success: true, count: turns.length, data: turns });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get reflections for session
sessionRouter.get('/:id/reflections', async (req: Request, res: Response) => {
  try {
    const reflections = await AgentReflection.find({ sessionId: req.params.id })
      .sort({ turnIndex: 1 })
      .select('-embedding')
      .lean();
    res.json({ success: true, count: reflections.length, data: reflections });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
