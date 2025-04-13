import { GenerateEmbeddingPort } from '../ports/generateEmbeddingPort.ts';
import { AIEmbedding } from '../models/aiEmbedding.ts';
import { AIQuestion } from '../models/aiQuestion.ts';

export class GenerateEmbeddingUseCase {
    constructor(private generateEmbeddingPort: GenerateEmbeddingPort) {
    }

    public async generateEmbedding(question: AIQuestion): Promise<AIEmbedding> {
        try {
            return await this.generateEmbeddingPort.generateEmbedding(question);
        }
        catch (error) {
            throw error;
        }
    }
}