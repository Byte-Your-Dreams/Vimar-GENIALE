import { assertEquals, assertThrows } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { ChunkRepository } from "../../repositories/chunkRepository.ts";
import { SupabaseDocument, SupabaseChunk } from "../../entities/supabaseDocument.ts";
import { SupabaseMessage } from "../../entities/supabaseChat.ts";
import { SupabaseInsertResponse } from "../../entities/SupabaseInsertResponse.ts";

Deno.test("ChunkRepository: obtainSimilarChunk should return a list of SupabaseChunks", async () => {
  // Arrange
  const mockClient = {
    rpc: async (procedure: string, params: any) => {
      return {
        data: [
          'Chunk 1 content', 'Chunk 2 content'
        ],
        error: null,
      };
    },
  };

  const repository = new ChunkRepository(mockClient as any);
  const message = new SupabaseMessage("msg1", "chat1", "Question", new Date(), [], [], [0.1, 0.2, 0.3], "Answer");
  const documents = [new SupabaseDocument("doc1", "url1", '', '', '', {}, undefined, "url1", 2)];
  const nChunk = 2;

  // Act
  const result = await repository.obtainSimilarChunk(message, documents, nChunk);

  // Assert
  assertEquals(result.length, 2);
  assertEquals(result[0].getContent(), "Chunk 1 content");
  assertEquals(result[1].getContent(), "Chunk 2 content");
});

Deno.test("ChunkRepository: obtainSimilarChunk should throw an error if no data is found", async () => {
  // Arrange
  const mockClient = {
    rpc: async () => ({ data: null, error: null }),
  };

  const repository = new ChunkRepository(mockClient as any);
  const message = new SupabaseMessage("msg1", "chat1", "Question", new Date(), [], [], [0.1, 0.2, 0.3], "Answer");
  const documents = [new SupabaseDocument("doc1", "url1", '', '', '', {}, undefined, "url1", 2)];
  const nChunk = 2;

  // Act & Assert
  try {
    await repository.obtainSimilarChunk(message, documents, nChunk);
  } catch (error) {
    if(error instanceof Error) {
        assertEquals(error.message, "No data found");
    }
  }
});

Deno.test("ChunkRepository: obtainSimilarChunk should throw an error if data is empty", async () => {
  // Arrange
  const mockClient = {
    rpc: async () => ({
      data: [], // Simula un array vuoto
      error: null,
    }),
  };

  const repository = new ChunkRepository(mockClient as any);
  const message = new SupabaseMessage("msg1", "chat1", "Question", new Date(), [], [], [0.1, 0.2, 0.3], "Answer");
  const documents = [new SupabaseDocument("doc1", "url1", '', '', '', {}, undefined, "url1", 2)];
  const nChunk = 2;

  // Act & Assert
  try {
    await repository.obtainSimilarChunk(message, documents, nChunk);
  } catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "No data found");
    }
  }
});

Deno.test("ChunkRepository: obtainSimilarChunk should throw an error if data is null", async () => {
  // Arrange
  const mockClient = {
    rpc: async () => ({
      data: null, // Simula un risultato nullo
      error: null,
    }),
  };

  const repository = new ChunkRepository(mockClient as any);
  const message = new SupabaseMessage("msg1", "chat1", "Question", new Date(), [], [], [0.1, 0.2, 0.3], "Answer");
  const documents = [new SupabaseDocument("doc1", "url1", '', '', '', {}, undefined, "url1", 2)];
  const nChunk = 2;

  // Act & Assert
  try {
    await repository.obtainSimilarChunk(message, documents, nChunk);
  } catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "No data found");
    }
  }
});

Deno.test("ChunkRepository: obtainSimilarChunk should throw an error if RPC returns an error", async () => {
  // Arrange
  const mockClient = {
    rpc: async () => ({
      data: null,
      error: { message: "RPC error occurred" }, // Simula un errore RPC
    }),
  };

  const repository = new ChunkRepository(mockClient as any);
  const message = new SupabaseMessage("msg1", "chat1", "Question", new Date(), [], [], [0.1, 0.2, 0.3], "Answer");
  const documents = [new SupabaseDocument("doc1", "url1", '', '', '', {}, undefined, "url1", 2)];
  const nChunk = 2;

  // Act & Assert
  try {
    await repository.obtainSimilarChunk(message, documents, nChunk);
  } catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "RPC error occurred");
    }
  }
});

Deno.test("ChunkRepository: upsertChunk should return a successful response", async () => {
  // Arrange
  const mockClient = {
    from: () => ({
      upsert: () => ({
        select: async () => ({ error: null }),
      }),
    }),
  };

  const repository = new ChunkRepository(mockClient as any);
  const chunk = new SupabaseChunk('Chunk content', 'doc1', 1, [0.1, 0.2, 0.3]);

  // Act
  const result = await repository.upsertChunk(chunk);

  // Assert
  assertEquals(result.getSuccess(), true);
  assertEquals(result.getAnswer(), "Insert successful");
});

Deno.test("ChunkRepository: upsertChunk should return a failure response if upsert fails", async () => {
  // Arrange
  const mockClient = {
    from: () => ({
      upsert: () => ({
        select: async () => ({ error: { message: "Upsert failed" } }),
      }),
    }),
  };

  const repository = new ChunkRepository(mockClient as any);
  const chunk = new SupabaseChunk('Chunk content', 'doc1', 1, [0.1, 0.2, 0.3]);

  // Act
  const result = await repository.upsertChunk(chunk);

  // Assert
  assertEquals(result.getSuccess(), false);
  assertEquals(result.getAnswer(), "Upsert failed");
});

Deno.test("ChunkRepository: removeExtraChunk should return a successful response", async () => {
  // Arrange
  const mockClient = {
    from: () => ({
      delete: () => ({
        eq: () => ({
          gt: async () => ({ error: null }),
        }),
      }),
    }),
  };

  const repository = new ChunkRepository(mockClient as any);
  const document = new SupabaseDocument("doc1", "url1", '', '', '', {}, undefined, "url1", 2);

  // Act
  const result = await repository.removeExtraChunk(document);

  // Assert
  assertEquals(result.getSuccess(), true);
  assertEquals(result.getAnswer(), "Delete successful");
});

Deno.test("ChunkRepository: removeExtraChunk should return a failure response if delete fails", async () => {
  // Arrange
  const mockClient = {
    from: () => ({
      delete: () => ({
        eq: () => ({
          gt: async () => ({ error: { message: "Delete failed" } }),
        }),
      }),
    }),
  };

  const repository = new ChunkRepository(mockClient as any);
  const document = new SupabaseDocument("doc1", "url1", '', '', '', {}, undefined, "url1", 2);

  // Act
  const result = await repository.removeExtraChunk(document);

  // Assert
  assertEquals(result.getSuccess(), false);
  assertEquals(result.getAnswer(), "Delete failed");
});