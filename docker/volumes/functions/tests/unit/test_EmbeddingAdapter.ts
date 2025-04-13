import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { EmbeddingAdapter } from "../../adapters/embeddingAdapter.ts";
import { EmbeddingRepository } from "../../repositories/embeddingRepository.ts";

// Mocked models
import { AIQuestion } from "../../models/aiQuestion.ts";
import { AIEmbedding } from "../../models/aiEmbedding.ts";

// Mocked entities
import { OllamaQuestion } from "../../entities/OllamaQuestion.ts";
import { OllamaEmbedding } from "../../entities/OllamaEmbedding.ts";

Deno.test("EmbeddingAdapter: generateEmbedding should return a valid AIEmbedding", async () => {
  // Arrange
  const mockRepository = {
    generateEmbedding: async (ollamaQuestion: OllamaQuestion) => {
      if (ollamaQuestion.getQuestion() === "What is the meaning of life?") {
        return new OllamaEmbedding(true, [0.1, 0.2, 0.3]);
      }
      return new OllamaEmbedding(false, []);
    },
  } as unknown as EmbeddingRepository;

  const adapter = new EmbeddingAdapter(mockRepository);

  const mockQuestion = {
    getQuestion: () => "What is the meaning of life?",
  } as AIQuestion;

  // Act
  const result = await adapter.generateEmbedding(mockQuestion);

  // Assert
  assertEquals(result.getSuccess(), true);
  assertEquals(result.getEmbedding(), [0.1, 0.2, 0.3]);
});

Deno.test("EmbeddingAdapter: generateEmbedding should handle failure from repository", async () => {
  // Arrange
  const mockRepository = {
    generateEmbedding: async (ollamaQuestion: OllamaQuestion) => {
      return new OllamaEmbedding(false, []);
    },
  } as unknown as EmbeddingRepository;

  const adapter = new EmbeddingAdapter(mockRepository);

  const mockQuestion = {
    getQuestion: () => "Invalid input",
  } as AIQuestion;

  // Act
  const result = await adapter.generateEmbedding(mockQuestion);

  // Assert
  assertEquals(result.getSuccess(), false);
  assertEquals(result.getEmbedding(), []);
});