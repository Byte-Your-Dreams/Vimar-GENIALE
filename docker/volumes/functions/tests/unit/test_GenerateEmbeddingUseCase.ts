import { assertEquals, assertRejects } from "https://deno.land/std/testing/asserts.ts";
import { GenerateEmbeddingUseCase } from "../../useCases/generateEmbeddingUseCase.ts";
import { AIEmbedding } from "../../models/aiEmbedding.ts";
import { AIQuestion } from "../../models/aiQuestion.ts";

// Mock del GenerateEmbeddingPort
const createMockGenerateEmbeddingPort = (shouldThrow = false) => {
    return {
        generateEmbedding: async (question: AIQuestion): Promise<AIEmbedding> => {
            if (shouldThrow) {
                throw new Error("Embedding generation failed");
            }
            return new AIEmbedding(true, [0.1, 0.2, 0.3]);
        },
    };
};

Deno.test("GenerateEmbeddingUseCase - generateEmbedding - success", async () => {
    const mockPort = createMockGenerateEmbeddingPort();
    const useCase = new GenerateEmbeddingUseCase(mockPort);
    const question = new AIQuestion("What is AI?");

    const result = await useCase.generateEmbedding(question);
    assertEquals(result.getEmbedding(), [0.1, 0.2, 0.3], "Should return the correct embedding");
    assertEquals(result.getSuccess(), true, "Should indicate success");
});

Deno.test("GenerateEmbeddingUseCase - generateEmbedding - failure", async () => {
    const mockPort = createMockGenerateEmbeddingPort(true); // Simula un errore
    const useCase = new GenerateEmbeddingUseCase(mockPort);
    const question = new AIQuestion("What is AI?");

    await assertRejects(
        () => useCase.generateEmbedding(question),
        Error,
        "Embedding generation failed",
        "Should propagate the error"
    );
});