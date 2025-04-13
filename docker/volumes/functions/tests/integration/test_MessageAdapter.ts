import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { MessageAdapter } from "../../adapters/messageAdapter.ts";
import { MessageRepository } from "../../repositories/messageRepository.ts";

// Mocked models
import { Message, Chat } from "../../models/chat.ts";
import { DBInsertResponse } from "../../models/dbInsertResponse.ts";

// Mocked entities
import { SupabaseChat, SupabaseMessage } from "../../entities/supabaseChat.ts";
import { SupabaseInsertResponse } from "../../entities/SupabaseInsertResponse.ts";

Deno.test("MessageAdapter: getHistory should return a valid Chat (integration)", async () => {
  // Arrange
  const mockClient = {
    rpc: async (procedure: string, params: any) => {
      if (procedure === "getlastmessages" && params.chat_id === "chat1") {
        return {
          data: [
            { id: "msg1", domanda: "Question 1", risposta: "Answer 1" },
            { id: "msg2", domanda: "Question 2", risposta: "Answer 2" },
          ],
          error: null,
        };
      }
      return { data: null, error: null };
    },
  };

  const repository = new MessageRepository(mockClient as any);
  const adapter = new MessageAdapter(repository);
  const chat = new Chat("chat1", []);

  // Act
  const result = await adapter.getHistory(chat);

  // Assert
  assertEquals(result.getID(), "chat1");
  assertEquals(result.getMessages().length, 2);
  assertEquals(result.getMessages()[0].getQuestion(), "Question 1");
  assertEquals(result.getMessages()[0].getAnswer(), "Answer 1");
});

Deno.test("MessageAdapter: updateMessage should return a successful DBInsertResponse (integration)", async () => {
  // Arrange
  const mockClient = {
    from: () => ({
      update: () => ({
        eq: async () => ({ error: null }),
      }),
    }),
  };

  const repository = new MessageRepository(mockClient as any);
  const adapter = new MessageAdapter(repository);
  const message = new Message("msg1", "chat1", "Question 1", new Date(), "Updated Answer", [], [], []);

  // Act
  const result = await adapter.updateMessage(message);

  // Assert
  assertEquals(result.getSuccess(), true);
  assertEquals(result.getAnswer(), "Update successful");
});

Deno.test("MessageAdapter: updateMessage should return a failure DBInsertResponse if update fails (integration)", async () => {
  // Arrange
  const mockClient = {
    from: () => ({
      update: () => ({
        eq: async () => ({ error: { message: "Update failed" } }),
      }),
    }),
  };

  const repository = new MessageRepository(mockClient as any);
  const adapter = new MessageAdapter(repository);
  const message = new Message("msg1", "chat1", "Question 1", new Date(), "Updated Answer", [], [], []);

  // Act
  const result = await adapter.updateMessage(message);

  // Assert
  assertEquals(result.getSuccess(), false);
  assertEquals(result.getAnswer(), "Update failed");
});

Deno.test("MessageAdapter: obtainAllMessages should return an array of Message objects (integration)", async () => {
  // Arrange
  const mockClient = {
    from: () => ({
      select: async () => ({
        data: [
          { id: "msg1", domanda: "Question 1", risposta: "Answer 1" },
          { id: "msg2", domanda: "Question 2", risposta: "Answer 2" },
        ],
        error: null,
      }),
    }),
  };

  const repository = new MessageRepository(mockClient as any);
  const adapter = new MessageAdapter(repository);

  // Act
  const result = await adapter.obtainAllMessages();
  console.log(result);
  // Assert
  assertEquals(result.length, 2);
  assertEquals(result[0].getQuestion(), "Question 1");
  assertEquals(result[0].getAnswer(), "");
  assertEquals(result[1].getQuestion(), "Question 2");
  assertEquals(result[1].getAnswer(), "");
});