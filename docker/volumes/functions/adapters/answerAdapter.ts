import { AnswerRepository } from "../repositories/answerRepository.ts";

//ports
import { GenerateAnswerPort } from "../ports/generateAnswerPort.ts";


//models
import { AIAnswer } from "../models/aiAnswer.ts";
import { AIPrompt } from "../models/aiPrompt.ts";

//entities
import { OllamaAnswer } from "../entities/OllamaAnswer.ts";
import { OllamaPrompt } from "../entities/OllamaPrompt.ts";

export class AnswerAdapter implements GenerateAnswerPort {
    constructor(private repository: AnswerRepository) {
    }

    public async generateAnswer(prompt: AIPrompt): Promise<AIAnswer> {
        const ollamaPrompt = this.convertToOllamaPrompt(prompt);
        const ollamaAnswer = await this.repository.generateAnswer(ollamaPrompt);
        return this.convertToAIAnswer(ollamaAnswer);
    }
    private convertToOllamaPrompt(prompt: AIPrompt): OllamaPrompt {
        return new OllamaPrompt(prompt.getPrompt());
    }

    private convertToAIAnswer(answer: OllamaAnswer): AIAnswer {
        return new AIAnswer(answer.getSuccess(), answer.getAnswer());
    }
}
