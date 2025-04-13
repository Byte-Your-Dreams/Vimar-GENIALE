import { AIAnswer } from "../models/aiAnswer.ts";
import { AIPrompt } from "../models/aiPrompt.ts";

export interface GenerateAnswerPort {
    generateAnswer(prompt: AIPrompt): Promise<AIAnswer>;
}