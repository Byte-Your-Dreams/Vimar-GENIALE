import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { ObtainAllMessagesUseCase } from "../../useCases/obtainAllMessagesUseCase.ts";
import { ObtainAllMessagesPort } from "../../ports/obtainAllMessagesPort.ts";
import { Message } from "../../models/chat.ts";

Deno.test("ObtainAllMessagesUseCase: obtainAllMessages should return an array of Message objects", async () => {
  // Arrange
  const mockPort: ObtainAllMessagesPort = {
    obtainAllMessages: async (): Promise<Message[]> => {
      return [
        new Message("msg1", "chat1", "What is Product 1?", new Date("2025-04-08T10:00:00Z"), "", [], [], []),
        new Message("msg2", "chat2", "Tell me about Product 2", new Date("2025-04-08T11:00:00Z"), "", [], [], []),
      ];
    },
  };

  const useCase = new ObtainAllMessagesUseCase(mockPort);

  // Act
  const result = await useCase.obtainAllMessages();

  // Assert
  assertEquals(result.length, 2);

  assertEquals(result[0].getID(), "msg1");
  assertEquals(result[0].getChatID(), "chat1");
  assertEquals(result[0].getQuestion(), "What is Product 1?");
  assertEquals(result[0].getDate().toISOString(), "2025-04-08T10:00:00.000Z");

  assertEquals(result[1].getID(), "msg2");
  assertEquals(result[1].getChatID(), "chat2");
  assertEquals(result[1].getQuestion(), "Tell me about Product 2");
  assertEquals(result[1].getDate().toISOString(), "2025-04-08T11:00:00.000Z");
});

Deno.test("ObtainAllMessagesUseCase: obtainAllMessages should throw an error if the port fails", async () => {
  // Arrange
  const mockPort: ObtainAllMessagesPort = {
    obtainAllMessages: async (): Promise<Message[]> => {
      throw new Error("Port error");
    },
  };

  const useCase = new ObtainAllMessagesUseCase(mockPort);

  // Act & Assert
  try {
    await useCase.obtainAllMessages();
  }
  catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "Port error");
    }
  }
});

Deno.test("ObtainAllMessagesUseCase: obtainAllMessages should return an empty array if no messages are found", async () => {
  // Arrange
  const mockPort: ObtainAllMessagesPort = {
    obtainAllMessages: async (): Promise<Message[]> => [],
  };

  const useCase = new ObtainAllMessagesUseCase(mockPort);

  // Act
  const result = await useCase.obtainAllMessages();

  // Assert
  assertEquals(result.length, 0);
});