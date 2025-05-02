import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { AnswerAdapter } from "../../adapters/answerAdapter.ts";
import { AnswerRepository } from "../../repositories/answerRepository.ts";

// Mocked models
import { AIPrompt } from "../../models/aiPrompt.ts";
import { AIAnswer } from "../../models/aiAnswer.ts";

// Mocked entities
import { OllamaPrompt } from "../../entities/OllamaPrompt.ts";
import { OllamaAnswer } from "../../entities/OllamaAnswer.ts";

Deno.test("AnswerAdapter: generateAnswer should return a valid AIAnswer", async () => {
  // Arrange
  const mockRepository = {
    generateAnswer: async (ollamaPrompt: OllamaPrompt) => {
      return new OllamaAnswer(true, "Mocked response");
      },
  } as unknown as AnswerRepository;

  const adapter = new AnswerAdapter(mockRepository);

  const mockPrompt = {
    getPrompt: () => [{ role: "user", content: "Hello, world!" }],
  } as AIPrompt;

  // Act
  const result = await adapter.generateAnswer(mockPrompt);

  // Assert
  assertEquals(result.getSuccess(), true);
  assertEquals(result.getAnswer(), "Mocked response");
});

Deno.test("AnswerAdapter: generateAnswer should handle failure from repository", async () => {
  // Arrange
  const mockRepository = {
    generateAnswer: async (ollamaPrompt: OllamaPrompt) => {
      return new OllamaAnswer(false, "Mocked failure");
    },
  } as unknown as AnswerRepository;

  const adapter = new AnswerAdapter(mockRepository);

  const mockPrompt = {
    getPrompt: () => [{ role: "user", content: "Invalid input" }],
  } as AIPrompt;

  // Act
  const result = await adapter.generateAnswer(mockPrompt);

  // Assert
  assertEquals(result.getSuccess(), false);
  assertEquals(result.getAnswer(), "Mocked failure");
});