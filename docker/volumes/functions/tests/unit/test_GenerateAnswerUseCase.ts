import { assertEquals, assertRejects } from "https://deno.land/std/testing/asserts.ts";
import { GenerateAnswerUseCase } from "../../useCases/generateAnswerUseCase.ts";
import { AIPrompt } from "../../models/aiPrompt.ts";
import { AIAnswer } from "../../models/aiAnswer.ts";

// Mock del GenerateAnswerPort
const createMockGenerateAnswerPort = (shouldThrow = false) => {
    return {
        generateAnswer: async (prompt: AIPrompt): Promise<AIAnswer> => {
            if (shouldThrow) {
                throw new Error("Generation failed");
            }
            return new AIAnswer(true, "Generated answer");
        },
    };
};

Deno.test("GenerateAnswerUseCase - should return successful answer", async () => {
    const mockPort = createMockGenerateAnswerPort();
    const useCase = new GenerateAnswerUseCase(mockPort);
    const prompt = new AIPrompt([{ role: "user", content: "What is AI?" }]);

    const result = await useCase.generateAnswer(prompt);
    
    assertEquals(result.getSuccess(), true, "Should be successful");
    assertEquals(result.getAnswer(), "Generated answer", "Should return expected answer");
});

Deno.test("GenerateAnswerUseCase - should handle generation failure", async () => {
    const mockPort = createMockGenerateAnswerPort(true);
    const useCase = new GenerateAnswerUseCase(mockPort);
    const prompt = new AIPrompt([{ role: "user", content: "What is AI?" }]);

    await assertRejects(
        async () => await useCase.generateAnswer(prompt),
        Error,
        "Generation failed",
        "Should propagate the error"
    );
});