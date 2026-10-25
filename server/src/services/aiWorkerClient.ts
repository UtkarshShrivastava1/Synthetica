import axios from 'axios';

const AI_WORKER_URL = process.env.AI_WORKER_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: AI_WORKER_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface IRecentTurnPayload {
  sender: 'agent_a' | 'agent_b';
  message: string;
}

export interface IReflectionResult {
  insight: string;
  deltaStance: string;
  convergenceScore: number;
}

export class AiWorkerClient {
  /**
   * Request embedding vector from inference worker
   */
  static async embed(text: string): Promise<number[]> {
    try {
      const response = await client.post<{ embedding: number[] }>('/api/embed', { text });
      return response.data.embedding;
    } catch (error: any) {
      console.error(`[AiWorkerClient] embed failed: ${error.message}`);
      throw new Error(`Failed to generate embedding: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Request deliberate response generation from gemini-pro / worker
   */
  static async deliberate(
    agentId: 'agent_a' | 'agent_b',
    corePremise: string,
    retrievedMemories: string[],
    recentTurns: IRecentTurnPayload[]
  ): Promise<string> {
    try {
      const response = await client.post<{ response: string }>('/api/deliberate', {
        agent_id: agentId,
        core_premise: corePremise,
        retrieved_memories: retrievedMemories,
        recent_turns: recentTurns,
      });
      return response.data.response;
    } catch (error: any) {
      console.error(`[AiWorkerClient] deliberate failed: ${error.message}`);
      throw new Error(`Failed to deliberate: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Request metacognitive reflection from gemini-flash / worker
   */
  static async reflect(
    agentId: 'agent_a' | 'agent_b',
    corePremise: string,
    incomingMessage: string,
    agentResponse: string
  ): Promise<IReflectionResult> {
    try {
      const response = await client.post<IReflectionResult>('/api/reflect', {
        agent_id: agentId,
        core_premise: corePremise,
        incoming_message: incomingMessage,
        agent_response: agentResponse,
      });
      return response.data;
    } catch (error: any) {
      console.error(`[AiWorkerClient] reflect failed: ${error.message}`);
      throw new Error(`Failed to reflect: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Health check for inference microservice
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const res = await client.get('/api/health');
      return res.status === 200;
    } catch {
      return false;
    }
  }
}
