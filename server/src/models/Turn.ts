import mongoose, { Schema, Document } from 'mongoose';

export interface IRetrievedMemory {
  reflectionId: string;
  insight: string;
  similarityScore: number;
}

export interface IRawTurn extends Document {
  sessionId: string;
  turnIndex: number;
  sender: 'agent_a' | 'agent_b';
  recipient: 'agent_a' | 'agent_b';
  message: string;
  retrievedMemories: IRetrievedMemory[];
  timestamp: Date;
}

const RetrievedMemorySchema = new Schema<IRetrievedMemory>({
  reflectionId: { type: String, required: true },
  insight: { type: String, required: true },
  similarityScore: { type: Number, required: true },
}, { _id: false });

const RawTurnSchema = new Schema<IRawTurn>(
  {
    sessionId: { type: String, required: true, index: true },
    turnIndex: { type: Number, required: true },
    sender: { type: String, enum: ['agent_a', 'agent_b'], required: true },
    recipient: { type: String, enum: ['agent_a', 'agent_b'], required: true },
    message: { type: String, required: true },
    retrievedMemories: { type: [RetrievedMemorySchema], default: [] },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    collection: 'raw_turns',
  }
);

RawTurnSchema.index({ sessionId: 1, turnIndex: 1 }, { unique: true });

export const RawTurn = mongoose.model<IRawTurn>('RawTurn', RawTurnSchema);
