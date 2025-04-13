import { OpenAI } from 'npm:openai';

export class AIPrompt {
    constructor(private prompt: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {}
    
    public getPrompt(): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
        return this.prompt;
    }
}