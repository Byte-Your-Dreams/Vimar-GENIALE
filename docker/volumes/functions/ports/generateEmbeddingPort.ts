import { AIEmbedding } from "../models/aiEmbedding.ts";
import { AIQuestion } from "../models/aiQuestion.ts";

export interface GenerateEmbeddingPort {
    generateEmbedding(question: AIQuestion): Promise<AIEmbedding>;
}