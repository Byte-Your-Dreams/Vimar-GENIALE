import { assertEquals, assertThrows } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { DocumentAdapter } from "../../adapters/documentAdapter.ts";
import { DocumentRepository } from "../../repositories/documentRepository.ts";

// Mocked models
import { Document } from "../../models/document.ts";
import { Product } from "../../models/product.ts";

// Mocked entities
import { SupabaseDocument } from "../../entities/supabaseDocument.ts";
import { SupabaseProduct } from "../../entities/supabaseProduct.ts";

Deno.test("DocumentAdapter: getDocuments should return a list of Documents", async () => {
  // Arrange
  const mockRepository = {
    getDocuments: async (product: SupabaseProduct) => {
      return [
        new SupabaseDocument("doc1", "id1", '', '', '', {}, undefined, "url1", 2),
        new SupabaseDocument("doc2", "id2", '', '', '', {}, undefined, "url2", 3),
      ];
    },
  } as unknown as DocumentRepository;

  const adapter = new DocumentAdapter(mockRepository);
  const product = new Product("prod1", "Product 1", "Description 1", "ETIM1");

  // Act
  const result = await adapter.getDocuments(product);

  // Assert
  assertEquals(result.length, 2);
  assertEquals(result[0].getName(), "doc1");
  assertEquals(result[0].getUrl(), "url1");
  assertEquals(result[1].getName(), "doc2");
  assertEquals(result[1].getUrl(), "url2");
});

Deno.test("DocumentAdapter: getDocuments should throw an error if repository fails", async () => {
  // Arrange
  const mockRepository = {
    getDocuments: async () => {
      throw new Error("Repository error");
    },
  } as unknown as DocumentRepository;

  const adapter = new DocumentAdapter(mockRepository);
  const product = new Product("prod1", "Product 1", "Description 1", "ETIM1");

  // Act & Assert
  try {
    await adapter.getDocuments(product);
  } catch (error) {
    if (error instanceof Error) {
        assertEquals(error.message, "Repository error");
    }
  }
});

Deno.test("DocumentAdapter: obtainDocument should return a single Document", async () => {
  // Arrange
  const mockRepository = {
    obtainDocument: async (document: SupabaseDocument) => {
      return new SupabaseDocument("doc1", "id1", '', '', '', {}, undefined, "url1", 2);
    },
  } as unknown as DocumentRepository;

  const adapter = new DocumentAdapter(mockRepository);
  const document = new Document("doc1", "id1", '', '', '', {}, undefined, "url1", 2);

  // Act
  const result = await adapter.obtainDocument(document);

  // Assert
  assertEquals(result.getName(), "doc1");
  assertEquals(result.getUrl(), "url1");
});

Deno.test("DocumentAdapter: obtainDocument should throw an error if repository fails", async () => {
  // Arrange
  const mockRepository = {
    obtainDocument: async () => {
      throw new Error("Repository error");
    },
  } as unknown as DocumentRepository;

  const adapter = new DocumentAdapter(mockRepository);
  const document = new Document("doc1", "id1", '', '', '', {}, undefined, "url1", 2);

  // Act & Assert
  try {
    await adapter.obtainDocument(document);
  } catch (error) {
    if (error instanceof Error) {
        assertEquals(error.message, "Repository error");
   }
  }
});

Deno.test("DocumentAdapter: downloadDocument should return a Blob", async () => {
  // Arrange
  const mockRepository = {
    downloadDocument: async (document: SupabaseDocument) => {
      return new Blob(["Document content"], { type: "text/plain" });
    },
  } as unknown as DocumentRepository;

  const adapter = new DocumentAdapter(mockRepository);
  const document = new Document("doc1", "id1", '', '', '', {}, undefined, "url1", 2);

  // Act
  const result = await adapter.downloadDocument(document);

  // Assert
  assertEquals(result instanceof Blob, true);
  assertEquals(await result.text(), "Document content");
});

Deno.test("DocumentAdapter: downloadDocument should throw an error if repository fails", async () => {
  // Arrange
  const mockRepository = {
    downloadDocument: async () => {
      throw new Error("Repository error");
    },
  } as unknown as DocumentRepository;

  const adapter = new DocumentAdapter(mockRepository);
  const document = new Document("doc1", "id1", '', '', '', {}, undefined, "url1", 2);

  // Act & Assert
  try {
    await adapter.downloadDocument(document);
  } catch (error) {
    if (error instanceof Error) {
        assertEquals(error.message, "Repository error");
    }
  }
});