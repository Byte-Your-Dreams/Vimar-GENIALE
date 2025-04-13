import { assertEquals, assertRejects } from "https://deno.land/std/testing/asserts.ts";
import { UpsertChunkUseCase } from "../../useCases/upsertChunkUseCase.ts";
import { UpsertChunkPort } from "../../ports/upsertChunkPort.ts";
import { Chunk } from "../../models/document.ts";
import { DBInsertResponse } from "../../models/dbInsertResponse.ts";

// Mock del UpsertChunkPort
const createMockUpsertChunkPort = (shouldThrow = false): UpsertChunkPort => {
    return {
        upsertChunk: async (chunk: Chunk): Promise<DBInsertResponse> => {
            if (shouldThrow) {
                throw new Error("Failed to upsert chunk");
            }
            return new DBInsertResponse(true, "Chunk upserted successfully");
        },
    };
};

Deno.test("UpsertChunkUseCase - upsertChunk - success", async () => {
    const mockPort = createMockUpsertChunkPort();
    const useCase = new UpsertChunkUseCase(mockPort);

    const chunk = new Chunk(
        "chunk-123",
        "This is a test chunk",
        1,
        [0.1, 0.2, 0.3]
    );

    const result = await useCase.upsertChunk(chunk);

    assertEquals(result.getSuccess(), true, "Should return success as true");
    assertEquals(result.getAnswer(), "Chunk upserted successfully", "Should return the correct success message");
});

Deno.test("UpsertChunkUseCase - upsertChunk - failure", async () => {
    const mockPort = createMockUpsertChunkPort(true); // Simula un errore
    const useCase = new UpsertChunkUseCase(mockPort);

    const chunk = new Chunk(
        "chunk-123",
        "This is a test chunk",
        1,
        [0.1, 0.2, 0.3]
    );

    await assertRejects(
        () => useCase.upsertChunk(chunk),
        Error,
        "Failed to upsert chunk",
        "Should propagate the error"
    );
});