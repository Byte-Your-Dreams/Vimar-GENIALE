import { assertEquals, assertRejects } from "https://deno.land/std/testing/asserts.ts";
import { GetHistoryUseCase } from "../../useCases/getHistoryUseCase.ts";
import { GetHistoryPort } from "../../ports/getHistoryPort.ts";
import { Chat, Message } from "../../models/chat.ts";

// Mock del GetHistoryPort
const createMockGetHistoryPort = (shouldThrow = false): GetHistoryPort => {
    return {
        getHistory: async (chat: Chat) => {
            if (shouldThrow) {
                throw new Error("Failed to fetch chat history");
            }
            
            const messages = [
                new Message(
                    "msg1",
                    chat.getID(),
                    "Hello",
                    new Date(),
                    "Hi, how can I help you?",
                    ["Product1"],
                    ["prod-123"],
                    [0.1, 0.2, 0.3]
                ),
                new Message(
                    "msg2",
                    chat.getID(),
                    "What can you do?",
                    new Date(),
                    "I can help with product information",
                    ["Product1", "Product2"],
                    ["prod-123", "prod-456"],
                    [0.4, 0.5, 0.6]
                )
            ];
            
            return new Chat(chat.getID(), messages);
        }
    };
};

Deno.test("GetHistoryUseCase - getHistory - success", async () => {
    const mockPort = createMockGetHistoryPort();
    const useCase = new GetHistoryUseCase(mockPort);
    const chat = new Chat("chat-1", []);

    const result = await useCase.getHistory(chat);

    assertEquals(result.getID(), "chat-1", "Should return the correct chat ID");
    assertEquals(result.getMessages().length, 2, "Should return the correct number of messages");

    // Primo messaggio
    assertEquals(result.getMessages()[0].getQuestion(), "Hello", "Should return the correct content for the first message");
    assertEquals(result.getMessages()[0].getAnswer(), "Hi, how can I help you?", "Should return the correct role for the first message");
    assertEquals(result.getMessages()[0].getProductNames(), ["Product1"], "Should return the correct product names for the first message");
    assertEquals(result.getMessages()[0].getProductIDs(), ["prod-123"], "Should return the correct product IDs for the first message");
    assertEquals(result.getMessages()[0].getEmbedding(), [0.1, 0.2, 0.3], "Should return the correct embedding for the first message");
    assertEquals(result.getMessages()[0].getDate() instanceof Date, true, "Should return a valid date for the first message");
  
    // Secondo messaggio
    assertEquals(result.getMessages()[1].getQuestion(), "What can you do?", "Should return the correct content for the first message");
    assertEquals(result.getMessages()[1].getAnswer(), "I can help with product information", "Should return the correct role for the first message");
    assertEquals(result.getMessages()[1].getProductNames(), ["Product1", "Product2"], "Should return the correct product names for the first message");
    assertEquals(result.getMessages()[1].getProductIDs(), ["prod-123", "prod-456"], "Should return the correct product IDs for the first message");
    assertEquals(result.getMessages()[1].getEmbedding(), [0.4, 0.5, 0.6], "Should return the correct embedding for the first message");
    assertEquals(result.getMessages()[1].getDate() instanceof Date, true, "Should return a valid date for the first message");
});

Deno.test("GetHistoryUseCase - getHistory - failure", async () => {
    const mockPort = createMockGetHistoryPort(true); // Simula un errore
    const useCase = new GetHistoryUseCase(mockPort);
    const chat = new Chat("chat-1", []);

    await assertRejects(
        () => useCase.getHistory(chat),
        Error,
        "Failed to fetch chat history",
        "Should propagate the error"
    );
});