import {OpenAI} from 'npm:openai';

import { OllamaAnswer } from '../entities/OllamaAnswer.ts';
import { OllamaPrompt } from '../entities/OllamaPrompt.ts';

export class AnswerRepository {
    constructor(private readonly llm: OpenAI, private readonly generationModel: string, private readonly embeddingModel: string) {
    }

    public async generateAnswer(prompt: OllamaPrompt): Promise<OllamaAnswer> {
        const completition = await this.llm.chat.completions.create({
            model: this.generationModel,
            temperature: 0.1,
            messages: prompt.getPrompt(),
        });
        if (completition.choices[0].message.content) {
            return new OllamaAnswer(true, completition.choices[0].message.content);
        }
        return new OllamaAnswer(false, "There was a problem with the completition");
    }
}