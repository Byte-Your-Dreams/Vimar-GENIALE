import { assertEquals, assertRejects } from "https://deno.land/std/testing/asserts.ts";
import { RemoveExtraChunkUseCase } from "../../useCases/removeExtraChunkUseCase.ts";
import { RemoveExtraChunkPort } from "../../ports/removeExtraChunk.ts";
import { Document } from "../../models/document.ts";
import { DBInsertResponse } from "../../models/dbInsertResponse.ts";

// Mock del RemoveExtraChunkPort
const createMockRemoveExtraChunkPort = (shouldThrow = false): RemoveExtraChunkPort => {
    return {
        removeExtraChunk: async (document: Document): Promise<DBInsertResponse> => {
            if (shouldThrow) {
                throw new Error("Failed to remove extra chunks");
            }
            return new DBInsertResponse(true, "Extra chunks removed successfully");
        },
    };
};

Deno.test("RemoveExtraChunkUseCase - removeExtraChunk - success", async () => {
    const mockPort = createMockRemoveExtraChunkPort();
    const useCase = new RemoveExtraChunkUseCase(mockPort);

    const document = new Document(
        "doc-123",
        "Test Document",
        "2025-04-07",
        "2025-04-01",
        "2025-04-06",
        { size: "1MB" }
    );

    const result = await useCase.removeExtraChunk(document);

    assertEquals(result.getSuccess(), true, "Should return success as true");
    assertEquals(result.getAnswer(), "Extra chunks removed successfully", "Should return the expected answer");
});

Deno.test("RemoveExtraChunkUseCase - removeExtraChunk - failure", async () => {
    const mockPort = createMockRemoveExtraChunkPort(true); // Simula un errore
    const useCase = new RemoveExtraChunkUseCase(mockPort);

    const document = new Document(
        "doc-123",
        "Test Document",
        "2025-04-07",
        "2025-04-01",
        "2025-04-06",
        { size: "1MB" }
    );

    await assertRejects(
        () => useCase.removeExtraChunk(document),
        Error,
        "Failed to remove extra chunks",
        "Should propagate the error"
    );
});