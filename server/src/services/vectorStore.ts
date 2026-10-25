import { AgentReflection, IAgentReflection } from '../models';

export interface ISimilarMemory {
  reflectionId: string;
  insight: string;
  similarityScore: number;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class VectorStoreService {
  /**
   * Search for top K similar reflections using Atlas Vector Search with local fallback
   */
  static async findSimilarReflections(
    sessionId: string,
    agentId: 'agent_a' | 'agent_b',
    queryVector: number[],
    limit: number = 3
  ): Promise<ISimilarMemory[]> {
    // 1. Try MongoDB Atlas $vectorSearch aggregation pipeline
    try {
      const pipeline: any[] = [
        {
          $vectorSearch: {
            index: 'vector_memory_index',
            path: 'embedding',
            queryVector: queryVector,
            numCandidates: Math.max(limit * 5, 20),
            limit: limit,
            filter: {
              sessionId: { $eq: sessionId },
              agentId: { $eq: agentId },
            },
          },
        },
        {
          $project: {
            _id: 1,
            insight: 1,
            similarityScore: { $meta: 'vectorSearchScore' },
          },
        },
      ];

      const results = await AgentReflection.aggregate(pipeline).exec();
      if (results && results.length > 0) {
        return results.map((r) => ({
          reflectionId: r._id.toString(),
          insight: r.insight,
          similarityScore: Number((r.similarityScore || 0).toFixed(4)),
        }));
      }
    } catch (atlasErr: any) {
      // Atlas $vectorSearch may fail if index is still indexing or when running against local standalone Mongo
      // Fallback seamlessly to in-memory cosine ranking
      console.warn(`[VectorStore] Atlas $vectorSearch not available or failed (${atlasErr.message}). Using local cosine similarity fallback.`);
    }

    // 2. Local cosine similarity fallback across existing agent reflections in this session
    try {
      const priorReflections = await AgentReflection.find({
        sessionId,
        agentId,
      }).select('_id insight embedding').lean();

      if (!priorReflections || priorReflections.length === 0) {
        return [];
      }

      const scored = priorReflections.map((ref) => {
        const score = cosineSimilarity(queryVector, ref.embedding);
        return {
          reflectionId: (ref._id as any).toString(),
          insight: ref.insight,
          similarityScore: Number(score.toFixed(4)),
        };
      });

      scored.sort((a, b) => b.similarityScore - a.similarityScore);
      return scored.slice(0, limit);
    } catch (err: any) {
      console.error(`[VectorStore] Local similarity fallback failed: ${err.message}`);
      return [];
    }
  }
}
