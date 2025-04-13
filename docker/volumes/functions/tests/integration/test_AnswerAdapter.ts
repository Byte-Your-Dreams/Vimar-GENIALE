import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { AnswerAdapter } from "../../adapters/answerAdapter.ts";
import { AnswerRepository } from "../../repositories/answerRepository.ts";

// Mocked models
import { AIPrompt } from "../../models/aiPrompt.ts";
import { AIAnswer } from "../../models/aiAnswer.ts";

// Mocked entities
import { OllamaPrompt } from "../../entities/OllamaPrompt.ts";
import { OllamaAnswer } from "../../entities/OllamaAnswer.ts";

Deno.test("AnswerAdapter: generateAnswer should return a valid AIAnswer (integration)", async () => {
  // Arrange
  const mockOpenAI = {
    chat: {
      completions: {
        create: async (params: any) => {
          // Simulate OpenAI API response
          if (params.messages[0].content === "Hello, world!") {
            return {
              choices: [{ message: { content: "Mocked response from OpenAI" } }],
            };
          }
          return {
            choices: [{ message: { content: "" } }],
          };
        },
      },
    },
  };

  const repository = new AnswerRepository(
    mockOpenAI as any,
    "mock-generation-model",
    "mock-embedding-model",
  );

  const adapter = new AnswerAdapter(repository);

  const mockPrompt = {
    getPrompt: () => [{ role: "user", content: "Hello, world!" }],
  } as AIPrompt;

  // Act
  const result = await adapter.generateAnswer(mockPrompt);

  // Assert
  assertEquals(result.getSuccess(), true);
  assertEquals(result.getAnswer(), "Mocked response from OpenAI");
});

Deno.test("AnswerAdapter: generateAnswer should handle failure from repository (integration)", async () => {
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

  const adapter = new AnswerAdapter(repository);

  const mockPrompt = {
    getPrompt: () => [{ role: "user", content: "Invalid input" }],
  } as AIPrompt;

  // Act
  const result = await adapter.generateAnswer(mockPrompt);

  // Assert
  assertEquals(result.getSuccess(), false);
  assertEquals(result.getAnswer(), "There was a problem with the completition");
});