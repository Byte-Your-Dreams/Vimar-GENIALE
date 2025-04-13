import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { EmbeddingAdapter } from "../../adapters/embeddingAdapter.ts";
import { EmbeddingRepository } from "../../repositories/embeddingRepository.ts";

// Mocked models
import { AIQuestion } from "../../models/aiQuestion.ts";
import { AIEmbedding } from "../../models/aiEmbedding.ts";

// Mocked entities
import { OllamaQuestion } from "../../entities/OllamaQuestion.ts";
import { OllamaEmbedding } from "../../entities/OllamaEmbedding.ts";

Deno.test("EmbeddingAdapter: generateEmbedding should return a valid AIEmbedding (integration)", async () => {
  // Arrange
  const mockOpenAI = {
    embeddings: {
      create: async (params: any) => {
        // Simulate OpenAI API response
        if (params.input === "What is the meaning of life?") {
          return {
            data: [{ embedding: [0.1, 0.2, 0.3] }],
          };
        }
        return {
          data: [{ embedding: null }],
        };
      },
    },
  };

  const repository = new EmbeddingRepository(
    mockOpenAI as any,
    "mock-embedding-model",
  );

  const adapter = new EmbeddingAdapter(repository);

  const mockQuestion = {
    getQuestion: () => "What is the meaning of life?",
  } as AIQuestion;

  // Act
  const result = await adapter.generateEmbedding(mockQuestion);

  // Assert
  assertEquals(result.getSuccess(), true);
  assertEquals(result.getEmbedding(), [0.1, 0.2, 0.3]);
});

Deno.test("EmbeddingAdapter: generateEmbedding should handle failure from repository (integration)", async () => {
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

  const adapter = new EmbeddingAdapter(repository);

  const mockQuestion = {
    getQuestion: () => "Invalid input",
  } as AIQuestion;

  // Act
  const result = await adapter.generateEmbedding(mockQuestion);

  // Assert
  assertEquals(result.getSuccess(), false);
  assertEquals(result.getEmbedding(), []);
});