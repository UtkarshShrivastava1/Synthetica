export type SessionStatus = 'INITIALIZING' | 'RUNNING' | 'PAUSED' | 'CONVERGED' | 'EXHAUSTED' | 'FAILED';

export interface IAgentConfig {
  name: string;
  corePremise: string;
  colorTheme: string;
}

export interface ISession {
  _id: string;
  topic: string;
  maxTurns: number;
  currentTurn: number;
  status: SessionStatus;
  agentConfig: {
    agentA: IAgentConfig;
    agentB: IAgentConfig;
  };
  metrics: {
    avgConvergenceScore: number;
    consecutiveHighScores: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IRetrievedMemory {
  reflectionId: string;
  insight: string;
  similarityScore: number;
}

export interface IRawTurn {
  _id?: string;
  turnId?: string;
  sessionId: string;
  turnIndex: number;
  sender: 'agent_a' | 'agent_b';
  recipient: 'agent_a' | 'agent_b';
  message: string;
  retrievedMemories: IRetrievedMemory[];
  timestamp: string;
}

export interface IAgentReflection {
  reflectionId: string;
  sessionId: string;
  agentId: 'agent_a' | 'agent_b';
  turnIndex: number;
  insight: string;
  deltaStance: string;
  convergenceScore: number;
  createdAt: string;
}

export interface IThinkingState {
  agentId: 'agent_a' | 'agent_b';
  step: 'retrieving' | 'deliberating' | 'reflecting' | null;
  turnIndex?: number;
}
