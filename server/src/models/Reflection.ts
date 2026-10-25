import mongoose, { Schema, Document } from 'mongoose';

export interface IAgentReflection extends Document {
  sessionId: string;
  agentId: 'agent_a' | 'agent_b';
  turnIndex: number;
  insight: string;
  deltaStance: string;
  convergenceScore: number;
  embedding: number[];
  createdAt: Date;
}

const AgentReflectionSchema = new Schema<IAgentReflection>(
  {
    sessionId: { type: String, required: true, index: true },
    agentId: { type: String, enum: ['agent_a', 'agent_b'], required: true, index: true },
    turnIndex: { type: Number, required: true },
    insight: { type: String, required: true },
    deltaStance: { type: String, required: true },
    convergenceScore: { type: Number, required: true, min: 0.0, max: 1.0 },
    embedding: {
      type: [Number],
      required: true,
      validate: {
        validator: function (v: number[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Embedding must be a non-empty array of numbers',
      },
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'agent_reflections',
  }
);

// Compound index for querying reflections per session and agent
AgentReflectionSchema.index({ sessionId: 1, agentId: 1, turnIndex: 1 });

export const AgentReflection = mongoose.model<IAgentReflection>(
  'AgentReflection',
  AgentReflectionSchema
);
