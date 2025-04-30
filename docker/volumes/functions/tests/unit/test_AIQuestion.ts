import { AIQuestion } from "../../models/aiQuestion.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("AIQuestion: should return the correct question", () => {
  // Arrange
  const question = "What is the capital of France?";
  const aiQuestion = new AIQuestion(question);

  // Act
  const result = aiQuestion.getQuestion();

  // Assert
  assertEquals(result, question);
});