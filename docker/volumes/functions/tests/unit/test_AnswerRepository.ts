import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { AnswerRepository } from "../../repositories/answerRepository.ts";
import { OllamaPrompt } from "../../entities/OllamaPrompt.ts";
import { OllamaAnswer } from "../../entities/OllamaAnswer.ts";

Deno.test("AnswerRepository: generateAnswer should return a valid OllamaAnswer", async () => {
  // Arrange
  const mockOpenAI = {
    chat: {
      completions: {
        create: async () => ({
          choices: [{ message: { content: "Mocked response" } }],
        }),
      },
    },
  };

  const repository = new AnswerRepository(
    mockOpenAI as any,
    "mock-generation-model",
    "mock-embedding-model",
  );

  const mockPrompt = {
    getPrompt: () => [{ role: "user", content: "Hello, world!" }],
  } as OllamaPrompt;

  // Act
  const result = await repository.generateAnswer(mockPrompt);

  // Assert
  assertEquals(result.getSuccess(), true);
  assertEquals(result.getAnswer(), "Mocked response");
});

Deno.test("AnswerRepository: generateAnswer should handle empty completions", async () => {
  // Arrange
  const mockOpenAI = {
    chat: {
      completions: {
        create: async () => ({
          choices: [{ message: { content: "" } }],
        }),
      },
    },
  };

  const repository = new AnswerRepository(
    mockOpenAI as any,
    "mock-generation-model",
    "mock-embedding-model",
  );

  const mockPrompt = {
    getPrompt: () => [{ role: "user", content: "Hello, world!" }],
  } as OllamaPrompt;

  // Act
  const result = await repository.generateAnswer(mockPrompt);

  // Assert
  assertEquals(result.getSuccess(), false);
  assertEquals(result.getAnswer(), "There was a problem with the completition");
});