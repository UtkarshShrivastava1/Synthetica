import mongoose, { Schema, Document } from 'mongoose';

export type SessionStatus = 'INITIALIZING' | 'RUNNING' | 'PAUSED' | 'CONVERGED' | 'EXHAUSTED' | 'FAILED';

export interface IAgentConfig {
  name: string;
  corePremise: string;
  colorTheme: string;
}

export interface IDialecticSession extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const AgentConfigSchema = new Schema<IAgentConfig>({
  name: { type: String, required: true },
  corePremise: { type: String, required: true },
  colorTheme: { type: String, default: '#6366F1' },
}, { _id: false });

const DialecticSessionSchema = new Schema<IDialecticSession>(
  {
    topic: { type: String, required: true, trim: true },
    maxTurns: { type: Number, required: true, default: 12 },
    currentTurn: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['INITIALIZING', 'RUNNING', 'PAUSED', 'CONVERGED', 'EXHAUSTED', 'FAILED'],
      default: 'INITIALIZING',
    },
    agentConfig: {
      agentA: { type: AgentConfigSchema, required: true },
      agentB: { type: AgentConfigSchema, required: true },
    },
    metrics: {
      avgConvergenceScore: { type: Number, default: 0 },
      consecutiveHighScores: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    collection: 'dialectic_sessions',
  }
);

export const DialecticSession = mongoose.model<IDialecticSession>(
  'DialecticSession',
  DialecticSessionSchema
);
