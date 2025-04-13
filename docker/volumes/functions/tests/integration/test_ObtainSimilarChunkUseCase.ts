import { assertEquals, assertRejects } from "https://deno.land/std/testing/asserts.ts";
import { ObtainSimilarChunkUseCase } from "../../useCases/obtainSimilarChunkUseCase.ts";
import { Message } from "../../models/chat.ts";
import { Document, Chunk } from "../../models/document.ts";
import { ObtainSimilarChunkPort } from "../../ports/obtainSimilarChunkPort.ts";

// Mock del ObtainSimilarChunkPort
const createMockObtainSimilarChunkPort = (shouldThrow = false): ObtainSimilarChunkPort => {
    return {
        obtainSimilarChunk: async (message: Message, documents: Document[], nChunk: number): Promise<Chunk[]> => {
            if (shouldThrow) {
                throw new Error("Failed to obtain similar chunks");
            }
            return [
                new Chunk("This is a similar chunk 1", "doc-1", 1, [0.95, 0.90, 0.84]),
                new Chunk("This is a similar chunk 2", "doc-2", 2, [0.85, 0.80, 0.75]),
            ];
        },
    };
};

Deno.test("Integration - ObtainSimilarChunkUseCase - obtainSimilarChunk - success", async () => {
    const mockPort = createMockObtainSimilarChunkPort();
    const useCase = new ObtainSimilarChunkUseCase(mockPort);

    const message = new Message("msg-1", "chat-1", "What is AI?", new Date(), undefined, [], [], []);
    const documents = [
        new Document("doc-1", "Document 1", "2025-04-07", "2025-04-01", "2025-04-06", { size: "1MB" }),
        new Document("doc-2", "Document 2", "2025-04-08", "2025-04-02", "2025-04-07", { size: "2MB" }),
    ];
    const nChunk = 2;

    const result = await useCase.obtainSimilarChunk(message, documents, nChunk);

    assertEquals(result.length, 2, "Should return the correct number of chunks");

    // Primo chunk
    assertEquals(result[0].getContent(), "This is a similar chunk 1", "Should return the correct content for the first chunk");
    assertEquals(result[0].getDocument(), "doc-1", "Should return the correct document for the first chunk");
    assertEquals(result[0].getNumber(), 1, "Should return the correct number for the first chunk");
    assertEquals(result[0].getEmbedding(), [0.95, 0.90, 0.84], "Should return the correct embedding for the first chunk");

    // Secondo chunk
    assertEquals(result[1].getContent(), "This is a similar chunk 2", "Should return the correct content for the second chunk");
    assertEquals(result[1].getDocument(), "doc-2", "Should return the correct document for the second chunk");
    assertEquals(result[1].getNumber(), 2, "Should return the correct number for the second chunk");
    assertEquals(result[1].getEmbedding(), [0.85, 0.80, 0.75], "Should return the correct embedding for the second chunk");
});

Deno.test("Integration - ObtainSimilarChunkUseCase - obtainSimilarChunk - failure", async () => {
    const mockPort = createMockObtainSimilarChunkPort(true); // Simula un errore
    const useCase = new ObtainSimilarChunkUseCase(mockPort);

    const message = new Message("msg-1", "chat-1", "What is AI?", new Date(), undefined, [], [], []);
    const documents = [
        new Document("doc-1", "Document 1", "2025-04-07", "2025-04-01", "2025-04-06", { size: "1MB" }),
        new Document("doc-2", "Document 2", "2025-04-08", "2025-04-02", "2025-04-07", { size: "2MB" }),
    ];
    const nChunk = 2;

    await assertRejects(
        () => useCase.obtainSimilarChunk(message, documents, nChunk),
        Error,
        "Failed to obtain similar chunks",
        "Should propagate the error"
    );
});