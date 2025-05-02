import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { EmbeddingRepository } from "../../repositories/embeddingRepository.ts";
import { OllamaQuestion } from "../../entities/OllamaQuestion.ts";
import { OllamaEmbedding } from "../../entities/OllamaEmbedding.ts";

Deno.test("EmbeddingRepository: generateEmbedding should return a valid OllamaEmbedding", async () => {
  // Arrange
  const mockOpenAI = {
    embeddings: {
      create: async (params: any) => {
        return {
          data: [{ embedding: [0.1, 0.2, 0.3] }],
        };
      },
    },
  };

  const repository = new EmbeddingRepository(
    mockOpenAI as any,
    "mock-embedding-model",
  );

  const mockQuestion = {
    getQuestion: () => "What is the meaning of life?",
  } as OllamaQuestion;

  // Act
  const result = await repository.generateEmbedding(mockQuestion);

  // Assert
  assertEquals(result.getSuccess(), true);
  assertEquals(result.getEmbedding(), [0.1, 0.2, 0.3]);
});

Deno.test("EmbeddingRepository: generateEmbedding should handle missing embeddings", async () => {
  // Arrange
  const mockOpenAI = {
    embeddings: {
      create: async () => ({
        data: [{ embedding: null }],
      }),
    },
  };

  const repository = new EmbeddingRepository(
    mockOpenAI as any,
    "mock-embedding-model",
  );

  const mockQuestion = {
    getQuestion: () => "Invalid input",
  } as OllamaQuestion;

  // Act
  const result = await repository.generateEmbedding(mockQuestion);

  // Assert
  assertEquals(result.getSuccess(), false);
  assertEquals(result.getEmbedding(), []);
});