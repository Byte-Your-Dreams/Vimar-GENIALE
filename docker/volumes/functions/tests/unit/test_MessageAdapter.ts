import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { MessageAdapter } from "../../adapters/messageAdapter.ts";
import { MessageRepository } from "../../repositories/messageRepository.ts";

// Mocked models
import { Message, Chat } from "../../models/chat.ts";
import { DBInsertResponse } from "../../models/dbInsertResponse.ts";

// Mocked entities
import { SupabaseChat, SupabaseMessage } from "../../entities/supabaseChat.ts";
import { SupabaseInsertResponse } from "../../entities/SupabaseInsertResponse.ts";

Deno.test("MessageAdapter: getHistory should return a valid Chat", async () => {
  // Arrange
  const mockRepository = {
    getHistory: async (supabaseChat: SupabaseChat) => {
      return new SupabaseChat("chat1", [
        new SupabaseMessage("msg1", "chat1", "Question 1", new Date(), [], [], [], "Answer 1"),
        new SupabaseMessage("msg2", "chat1", "Question 2", new Date(), [], [], [], "Answer 2"),
      ]);
    },
  } as unknown as MessageRepository;

  const adapter = new MessageAdapter(mockRepository);
  const chat = new Chat("chat1", []);

  // Act
  const result = await adapter.getHistory(chat);

  // Assert
  assertEquals(result.getID(), "chat1");
  assertEquals(result.getMessages().length, 2);
  assertEquals(result.getMessages()[0].getQuestion(), "Question 1");
  assertEquals(result.getMessages()[0].getAnswer(), "Answer 1");
});

Deno.test("MessageAdapter: updateMessage should return a successful DBInsertResponse", async () => {
  // Arrange
  const mockRepository = {
    updateMessage: async (supabaseMessage: SupabaseMessage) => {
      return new SupabaseInsertResponse(true, "Update successful");
    },
  } as unknown as MessageRepository;

  const adapter = new MessageAdapter(mockRepository);
  const message = new Message("msg1", "chat1", "Question 1", new Date(), "Updated Answer", [], [], []);

  // Act
  const result = await adapter.updateMessage(message);

  // Assert
  assertEquals(result.getSuccess(), true);
  assertEquals(result.getAnswer(), "Update successful");
});

Deno.test("MessageAdapter: updateMessage should return a failure DBInsertResponse if update fails", async () => {
  // Arrange
  const mockRepository = {
    updateMessage: async (supabaseMessage: SupabaseMessage) => {
      return new SupabaseInsertResponse(false, "Update failed");
    },
  } as unknown as MessageRepository;

  const adapter = new MessageAdapter(mockRepository);
  const message = new Message("msg1", "chat1", "Question 1", new Date(), "Updated Answer", [], [], []);

  // Act
  const result = await adapter.updateMessage(message);

  // Assert
  assertEquals(result.getSuccess(), false);
  assertEquals(result.getAnswer(), "Update failed");
});

Deno.test("MessageAdapter: obtainAllMessages should return an array of Message objects", async () => {
  // Arrange
  const mockRepository = {
    obtainAllMessages: async (): Promise<SupabaseMessage[]> => {
      return [
        new SupabaseMessage(
          "msg1",
          "chat1",
          "What is Product 1?",
          new Date("2025-04-08T10:00:00Z"),
          ["Product 1"],
          ["ID1"],
          [0.1, 0.2, 0.3],
          "This is the answer"
        ),
        new SupabaseMessage(
          "msg2",
          "chat2",
          "Tell me about Product 2",
          new Date("2025-04-08T11:00:00Z"),
          ["Product 2"],
          ["ID2"],
          [0.4, 0.5, 0.6],
          "Another answer"
        ),
      ];
    },
  } as MessageRepository;

  const adapter = new MessageAdapter(mockRepository);

  // Act
  const result = await adapter.obtainAllMessages();

  // Assert
  assertEquals(result.length, 2);

  assertEquals(result[0].getID(), "msg1");
  assertEquals(result[0].getChatID(), "chat1");
  assertEquals(result[0].getQuestion(), "What is Product 1?");
  assertEquals(result[0].getDate().toISOString(), "2025-04-08T10:00:00.000Z");
  assertEquals(result[0].getProductNames(), ["Product 1"]);
  assertEquals(result[0].getProductIDs(), ["ID1"]);
  assertEquals(result[0].getEmbedding(), [0.1, 0.2, 0.3]);
  assertEquals(result[0].getAnswer(), "This is the answer");

  assertEquals(result[1].getID(), "msg2");
  assertEquals(result[1].getChatID(), "chat2");
  assertEquals(result[1].getQuestion(), "Tell me about Product 2");
  assertEquals(result[1].getDate().toISOString(), "2025-04-08T11:00:00.000Z");
  assertEquals(result[1].getProductNames(), ["Product 2"]);
  assertEquals(result[1].getProductIDs(), ["ID2"]);
  assertEquals(result[1].getEmbedding(), [0.4, 0.5, 0.6]);
  assertEquals(result[1].getAnswer(), "Another answer");
});