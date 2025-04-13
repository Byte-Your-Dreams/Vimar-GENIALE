 import { EmbeddingRepository } from "../repositories/embeddingRepository.ts";

//ports
import { GenerateEmbeddingPort } from "../ports/generateEmbeddingPort.ts";

//models
import { AIEmbedding } from "../models/aiEmbedding.ts";
import { AIQuestion } from "../models/aiQuestion.ts";

//entities
import { OllamaQuestion } from "../entities/OllamaQuestion.ts";
import { OllamaEmbedding } from "../entities/OllamaEmbedding.ts";

export class EmbeddingAdapter implements GenerateEmbeddingPort {
    constructor(private repository: EmbeddingRepository) {
    }

    public async generateEmbedding(question: AIQuestion): Promise<AIEmbedding> {
        const ollamaQuestion = this.convertToOllamaQuestion(question);
        const ollamaEmbedding = await this.repository.generateEmbedding(ollamaQuestion);
        return this.convertToAIEmbedding(ollamaEmbedding);
    }

    private convertToOllamaQuestion(question: AIQuestion): OllamaQuestion {
        return new OllamaQuestion(question.getQuestion());
    }

    private convertToAIEmbedding(embedding: OllamaEmbedding): AIEmbedding {
        return new AIEmbedding(embedding.getSuccess(), embedding.getEmbedding());
    }
}