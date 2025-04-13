import {OpenAI} from 'npm:openai';

import { OllamaEmbedding } from '../entities/OllamaEmbedding.ts';
import { OllamaQuestion } from '../entities/OllamaQuestion.ts';

export class EmbeddingRepository {
    constructor(private readonly llm: OpenAI, private readonly embeddingModel: string) {
    }

    public async generateEmbedding(question: OllamaQuestion): Promise<OllamaEmbedding> {
        const embedding = await this.llm.embeddings.create({
            model: this.embeddingModel,
            input: question.getQuestion(),
            encoding_format: "float",
        });
        if (embedding.data[0].embedding) {
            return new OllamaEmbedding(true, embedding.data[0].embedding);
        }
        return new OllamaEmbedding(false, []);
    }
}
