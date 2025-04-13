import { GenerateAnswerPort } from '../ports/generateAnswerPort.ts';
import { AIAnswer } from '../models/aiAnswer.ts';
import { AIPrompt } from '../models/aiPrompt.ts';
export class GenerateAnswerUseCase {
    constructor(private generateAnswerPort: GenerateAnswerPort) {
    }

    public async generateAnswer(prompt: AIPrompt): Promise<AIAnswer> {
        try {
            return await this.generateAnswerPort.generateAnswer(prompt);
        }
        catch (error) {
            throw error;
        }
    }
}