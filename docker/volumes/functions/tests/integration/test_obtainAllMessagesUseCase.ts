import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { ObtainAllMessagesUseCase } from "../../useCases/obtainAllMessagesUseCase.ts";
import { ObtainAllMessagesPort } from "../../ports/obtainAllMessagesPort.ts";
import { Message } from "../../models/chat.ts";

// Simulated implementation of ObtainAllMessagesPort
class SimulatedObtainAllMessagesPort implements ObtainAllMessagesPort {
  private messages: Message[] = [
    new Message("msg1", "chat1", "What is Product 1?", new Date("2025-04-08T10:00:00Z"), "", [], [], []),
    new Message("msg2", "chat2", "Tell me about Product 2", new Date("2025-04-08T11:00:00Z"), "", [], [], []),
  ];

  async obtainAllMessages(): Promise<Message[]> {
    return this.messages;
  }
}

// Empty implementation of ObtainAllMessagesPort
class EmptyObtainAllMessagesPort implements ObtainAllMessagesPort {
  async obtainAllMessages(): Promise<Message[]> {
    return [];
  }
}

// Failing implementation of ObtainAllMessagesPort
class FailingObtainAllMessagesPort implements ObtainAllMessagesPort {
  async obtainAllMessages(): Promise<Message[]> {
    throw new Error("Port error");
  }
}

Deno.test("Integration Test: ObtainAllMessagesUseCase.obtainAllMessages should return all messages", async () => {
  // Arrange
  const simulatedPort = new SimulatedObtainAllMessagesPort();
  const useCase = new ObtainAllMessagesUseCase(simulatedPort);

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

Deno.test("Integration Test: ObtainAllMessagesUseCase.obtainAllMessages should return an empty array if no messages are found", async () => {
  const simulatedPort = new EmptyObtainAllMessagesPort();
  const useCase = new ObtainAllMessagesUseCase(simulatedPort);

  const result = await useCase.obtainAllMessages();

  assertEquals(result.length, 0);
});

Deno.test("Integration Test: ObtainAllMessagesUseCase.obtainAllMessages should throw an error if the port fails", async () => {
  const simulatedPort = new FailingObtainAllMessagesPort();
  const useCase = new ObtainAllMessagesUseCase(simulatedPort);

  try {
    await useCase.obtainAllMessages();
  } catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "Port error");
    }
  }
});