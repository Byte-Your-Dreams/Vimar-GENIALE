import { assertEquals, assertRejects } from "https://deno.land/std/testing/asserts.ts";
import { UpdateMessageUseCase } from "../../useCases/updateMessageUseCase.ts";
import { UpdateMessagePort } from "../../ports/updateMessagePort.ts";
import { Message } from "../../models/chat.ts";
import { DBInsertResponse } from "../../models/dbInsertResponse.ts";

// Mock del UpdateMessagePort
const createMockUpdateMessagePort = (shouldThrow = false): UpdateMessagePort => {
    return {
        updateMessage: async (message: Message): Promise<DBInsertResponse> => {
            if (shouldThrow) {
                throw new Error("Failed to update message");
            }
            return new DBInsertResponse(true, "Message updated successfully");
        },
    };
};

Deno.test("UpdateMessageUseCase - updateMessage - success", async () => {
    const mockPort = createMockUpdateMessagePort();
    const useCase = new UpdateMessageUseCase(mockPort);

    const message = new Message(
        "msg-123",
        "chat-1",
        "Updated content",
        new Date(),
        "Previous content",
        ["Product1"],
        ["prod-123"],
        [0.1, 0.2, 0.3]
    );

    const result = await useCase.updateMessage(message);

    assertEquals(result.getSuccess(), true, "Should return success as true");
    assertEquals(result.getAnswer(), "Message updated successfully", "Should return the correct success message");
});

Deno.test("UpdateMessageUseCase - updateMessage - failure", async () => {
    const mockPort = createMockUpdateMessagePort(true); // Simula un errore
    const useCase = new UpdateMessageUseCase(mockPort);

    const message = new Message(
        "msg-123",
        "chat-1",
        "Updated content",
        new Date(),
        "Previous content",
        ["Product1"],
        ["prod-123"],
        [0.1, 0.2, 0.3]
    );

    await assertRejects(
        () => useCase.updateMessage(message),
        Error,
        "Failed to update message",
        "Should propagate the error"
    );
});