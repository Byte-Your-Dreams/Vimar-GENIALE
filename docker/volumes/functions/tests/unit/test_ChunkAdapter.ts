import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { ChunkAdapter } from "../../adapters/chunkAdapter.ts";
import { ChunkRepository } from "../../repositories/chunkRepository.ts";

// Mocked models
import { Chunk, Document } from "../../models/document.ts";
import { Message } from "../../models/chat.ts";
import { DBInsertResponse } from "../../models/dbInsertResponse.ts";

// Mocked entities
import { SupabaseChunk, SupabaseDocument } from "../../entities/supabaseDocument.ts";
import { SupabaseInsertResponse } from "../../entities/SupabaseInsertResponse.ts";
import { SupabaseMessage } from "../../entities/supabaseChat.ts";

Deno.test("ChunkAdapter: obtainSimilarChunk should return a list of Chunks", async () => {
  // Arrange
  const mockRepository = {
    obtainSimilarChunk: async (message: SupabaseMessage, documents: SupabaseDocument[], nChunk: number) => {
      return [
        new SupabaseChunk("Chunk 1 content", "doc1", 1, [0.1, 0.2, 0.3]),
        new SupabaseChunk("Chunk 2 content", "doc1", 2, [0.4, 0.5, 0.6]),
      ];
    },
  } as unknown as ChunkRepository;

  const adapter = new ChunkAdapter(mockRepository);
  const message = new Message("msg1", "chat1", "Question", new Date(), '', [], [], [0.1, 0.2, 0.3]);
  const documents = [new Document("doc1", "url1", '', '', '', {}, undefined, "url1", 2)];

  // Act
  const result = await adapter.obtainSimilarChunk(message, documents, 2);

  // Assert
  assertEquals(result.length, 2);
  assertEquals(result[0].getContent(), "Chunk 1 content");
  assertEquals(result[0].getDocument(), "doc1");
  assertEquals(result[0].getNumber(), 1);
  assertEquals(result[0].getEmbedding(), [0.1, 0.2, 0.3]);
  assertEquals(result[1].getContent(), "Chunk 2 content");
  assertEquals(result[1].getDocument(), "doc1");
  assertEquals(result[1].getNumber(), 2);
  assertEquals(result[1].getEmbedding(), [0.4, 0.5, 0.6]);
});

Deno.test("ChunkAdapter: upsertChunk should return a successful DBInsertResponse", async () => {
  // Arrange
  const mockRepository = {
    upsertChunk: async (chunk: SupabaseChunk) => {
      return new SupabaseInsertResponse(true, "Insert successful");
    },
  } as unknown as ChunkRepository;

  const adapter = new ChunkAdapter(mockRepository);
  const chunk = new Chunk("Chunk content", "doc1", 1, [0.1, 0.2, 0.3]);

  // Act
  const result = await adapter.upsertChunk(chunk);

  // Assert
  assertEquals(result.getSuccess(), true);
  assertEquals(result.getAnswer(), "Insert successful");
});

Deno.test("ChunkAdapter: upsertChunk should return a failure DBInsertResponse if upsert fails", async () => {
  // Arrange
  const mockRepository = {
    upsertChunk: async (chunk: SupabaseChunk) => {
      return new SupabaseInsertResponse(false, "Upsert failed");
    },
  } as unknown as ChunkRepository;

  const adapter = new ChunkAdapter(mockRepository);
  const chunk = new Chunk("Chunk content", "doc1", 1, [0.1, 0.2, 0.3]);

  // Act
  const result = await adapter.upsertChunk(chunk);

  // Assert
  assertEquals(result.getSuccess(), false);
  assertEquals(result.getAnswer(), "Upsert failed");
});

Deno.test("ChunkAdapter: removeExtraChunk should return a successful DBInsertResponse", async () => {
  // Arrange
  const mockRepository = {
    removeExtraChunk: async (document: SupabaseDocument) => {
      return new SupabaseInsertResponse(true, "Delete successful");
    },
  } as unknown as ChunkRepository;

  const adapter = new ChunkAdapter(mockRepository);
  const document = new Document("doc1", "url1", '', '', '', {}, undefined, "url1", 2);

  // Act
  const result = await adapter.removeExtraChunk(document);

  // Assert
  assertEquals(result.getSuccess(), true);
  assertEquals(result.getAnswer(), "Delete successful");
});

Deno.test("ChunkAdapter: removeExtraChunk should return a failure DBInsertResponse if delete fails", async () => {
  // Arrange
  const mockRepository = {
    removeExtraChunk: async (document: SupabaseDocument) => {
      return new SupabaseInsertResponse(false, "Delete failed");
    },
  } as unknown as ChunkRepository;

  const adapter = new ChunkAdapter(mockRepository);
  const document = new Document("doc1", "url1", '', '', '', {}, undefined, "url1", 2);

  // Act
  const result = await adapter.removeExtraChunk(document);

  // Assert
  assertEquals(result.getSuccess(), false);
  assertEquals(result.getAnswer(), "Delete failed");
});