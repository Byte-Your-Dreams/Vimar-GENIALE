import { assertEquals, assertThrows } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { MessageRepository } from "../../repositories/messageRepository.ts";
import { SupabaseChat, SupabaseMessage } from "../../entities/supabaseChat.ts";
import { SupabaseInsertResponse } from "../../entities/SupabaseInsertResponse.ts";

Deno.test("MessageRepository: getHistory should return a valid SupabaseChat", async () => {
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
  const chat = new SupabaseChat("chat1", []);

  // Act
  const result = await repository.getHistory(chat);

  // Assert
  assertEquals(result.getID(), "chat1");
  assertEquals(result.getMessages().length, 2);
  assertEquals(result.getMessages()[0].getQuestion(), "Question 1");
  assertEquals(result.getMessages()[0].getAnswer(), "Answer 1");
});

Deno.test("MessageRepository: getHistory should throw an error if no data is found", async () => {
  // Arrange
  const mockClient = {
    rpc: async () => ({ data: null, error: null }),
  };

  const repository = new MessageRepository(mockClient as any);
  const chat = new SupabaseChat("chat1", []);

  // Act & Assert
  try {
      await repository.getHistory(chat);
  } catch (error) {
    if (error instanceof Error) {
        assertEquals(error.message, "No data found"); // Ensure this matches the actual error message
    }
  }
});

Deno.test("MessageRepository: getHistory should throw an error if RPC call fails", async () => {
  // Arrange
  const mockClient = {
    rpc: async () => ({ data: null, error: { message: "RPC error" } }),
  };

  const repository = new MessageRepository(mockClient as any);
  const chat = new SupabaseChat("chat1", []);

  // Act & Assert
  try {
    await repository.getHistory(chat);
  } catch (error) {
    if (error instanceof Error) {
        assertEquals(error.message, "RPC error"); // Ensure this matches the actual error message
    }
  }
});

Deno.test("MessageRepository: updateMessage should return a successful response", async () => {
  // Arrange
  const mockClient = {
    from: () => ({
      update: () => ({
        eq: async () => ({ error: null }),
      }),
    }),
  };

  const repository = new MessageRepository(mockClient as any);
  const message = new SupabaseMessage("msg1", "chat1", "Question 1", new Date(), [], [], [], "Updated Answer");

  // Act
  const result = await repository.updateMessage(message);

  // Assert
  assertEquals(result.getSuccess(), true);
  assertEquals(result.getAnswer(), "Update successful");
});

Deno.test("MessageRepository: updateMessage should return a failure response if update fails", async () => {
  // Arrange
  const mockClient = {
    from: () => ({
      update: () => ({
        eq: async () => ({ error: { message: "Update failed" } }),
      }),
    }),
  };

  const repository = new MessageRepository(mockClient as any);
  const message = new SupabaseMessage("msg1", "chat1", "Question 1", new Date(), [], [], [], "Updated Answer");

  // Act
  const result = await repository.updateMessage(message);

  // Assert
  assertEquals(result.getSuccess(), false);
  assertEquals(result.getAnswer(), "Update failed");
});

Deno.test("MessageRepository: obtainAllMessages should return an array of SupabaseMessage objects", async () => {
  // Arrange
  const mockClient = {
    from: (table: string) => ({
      select: async (columns: string) => {
        if (table === "messaggio" && columns === "id, chat, domanda") {
          return {
            data: [
              { id: "msg1", chat_id: "chat1", domanda: "What is Product 1?" },
              { id: "msg2", chat_id: "chat2", domanda: "Tell me about Product 2" },
            ],
            error: null,
          };
        }
        return { data: null, error: null };
      },
    }),
  };

  const repository = new MessageRepository(mockClient as any);

  // Act
  const result = await repository.obtainAllMessages();

  // Assert
  assertEquals(result.length, 2);

  assertEquals(result[0].getID(), "msg1");
  assertEquals(result[0].getChatID(), "chat1");
  assertEquals(result[0].getQuestion(), "What is Product 1?");
  assertEquals(result[0].getDate() instanceof Date, true);

  assertEquals(result[1].getID(), "msg2");
  assertEquals(result[1].getChatID(), "chat2");
  assertEquals(result[1].getQuestion(), "Tell me about Product 2");
  assertEquals(result[1].getDate() instanceof Date, true);
});

Deno.test("MessageRepository: obtainAllMessages should throw an error if Supabase returns an error", async () => {
  // Arrange
  const mockClient = {
    from: (table: string) => ({
      select: async (columns: string) => {
        return { data: null, error: { message: "Supabase error" } };
      },
    }),
  };

  const repository = new MessageRepository(mockClient as any);

  // Act & Assert
  try {
    await repository.obtainAllMessages();
  }
  catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "Supabase error"); // Ensure this matches the actual error message
    }
  }
});

Deno.test("MessageRepository: obtainAllMessages should throw an error if no data is returned", async () => {
  // Arrange
  const mockClient = {
    from: (table: string) => ({
      select: async (columns: string) => {
        return { data: null, error: null };
      },
    }),
  };

  const repository = new MessageRepository(mockClient as any);

  // Act & Assert
  try {
    await repository.obtainAllMessages();
  }
  catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "No data found"); // Ensure this matches the actual error message
    }
  }
});