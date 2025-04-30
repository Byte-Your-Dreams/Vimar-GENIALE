import { Document } from "../../models/document.ts";
import { Chunk } from "../../models/document.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("Document: should return the correct name", () => {
  // Arrange
  const document = new Document("Document 1");

  // Act
  const name = document.getName();

  // Assert
  assertEquals(name, "Document 1");
});

Deno.test("Document: should return the correct ID", () => {
  // Arrange
  const document = new Document("Document 1", "doc1");

  // Act
  const id = document.getId();

  // Assert
  assertEquals(id, "doc1");
});

Deno.test("Document: should return the correct updated_at", () => {
  // Arrange
  const document = new Document("Document 1", "doc1", "2023-01-01");

  // Act
  const updatedAt = document.getUpdatedAt();

  // Assert
  assertEquals(updatedAt, "2023-01-01");
});

Deno.test("Document: should return the correct created_at", () => {
  // Arrange
  const document = new Document("Document 1", "doc1", "", "2023-01-01");

  // Act
  const createdAt = document.getCreatedAt();

  // Assert
  assertEquals(createdAt, "2023-01-01");
});

Deno.test("Document: should return the correct last_accessed_at", () => {
  // Arrange
  const document = new Document("Document 1", "doc1", "", "", "2023-01-01");

  // Act
  const lastAccessedAt = document.getLastAccessedAt();

  // Assert
  assertEquals(lastAccessedAt, "2023-01-01");
});

Deno.test("Document: should return the correct metadata", () => {
  // Arrange
  const metadata = { key1: "value1", key2: 42 };
  const document = new Document("Document 1", "doc1", "", "", "", metadata);

  // Act
  const resultMetadata = document.getMetadata();

  // Assert
  assertEquals(resultMetadata, metadata);
});

Deno.test("Document: should return the correct blobData", () => {
  // Arrange
  const blob = new Blob(["test data"], { type: "text/plain" });
  const document = new Document("Document 1", "doc1", "", "", "", {}, blob);

  // Act
  const resultBlob = document.getBlobData();

  // Assert
  assertEquals(resultBlob, blob);
});

Deno.test("Document: should return the correct URL", () => {
  // Arrange
  const document = new Document("Document 1", "doc1", "", "", "", {}, undefined, "http://example.com");

  // Act
  const url = document.getUrl();

  // Assert
  assertEquals(url, "http://example.com");
});

Deno.test("Document: should return the correct number of chunks", () => {
  // Arrange
  const document = new Document("Document 1", "doc1", "", "", "", {}, undefined, "", 5);

  // Act
  const nChunks = document.getNChunks();

  // Assert
  assertEquals(nChunks, 5);
});

Deno.test("Document: should set and get the name correctly", () => {
  // Arrange
  const document = new Document("Old Name");

  // Act
  document.setName("New Name");
  const name = document.getName();

  // Assert
  assertEquals(name, "New Name");
});

Deno.test("Document: should set and get the ID correctly", () => {
  // Arrange
  const document = new Document("Document 1");

  // Act
  document.setId("newID");
  const id = document.getId();

  // Assert
  assertEquals(id, "newID");
});

Deno.test("Document: should set and get updated_at correctly", () => {
  // Arrange
  const document = new Document("Document 1");

  // Act
  document.setUpdatedAt("2023-02-01");
  const updatedAt = document.getUpdatedAt();

  // Assert
  assertEquals(updatedAt, "2023-02-01");
});

Deno.test("Document: should set and get created_at correctly", () => {
  // Arrange
  const document = new Document("Document 1");

  // Act
  document.setCreatedAt("2023-01-01");
  const createdAt = document.getCreatedAt();

  // Assert
  assertEquals(createdAt, "2023-01-01");
});

Deno.test("Document: should set and get last_accessed_at correctly", () => {
  // Arrange
  const document = new Document("Document 1");

  // Act
  document.setLastAccessedAt("2023-03-01");
  const lastAccessedAt = document.getLastAccessedAt();

  // Assert
  assertEquals(lastAccessedAt, "2023-03-01");
});

Deno.test("Document: should set and get metadata correctly", () => {
  // Arrange
  const document = new Document("Document 1");

  // Act
  const metadata = { key1: "value1", key2: 42 };
  document.setMetadata(metadata);
  const resultMetadata = document.getMetadata();

  // Assert
  assertEquals(resultMetadata, metadata);
});

Deno.test("Document: should set and get blobData correctly", () => {
  // Arrange
  const document = new Document("Document 1");

  // Act
  const blob = new Blob(["test data"], { type: "text/plain" });
  document.setBlobData(blob);
  const resultBlob = document.getBlobData();

  // Assert
  assertEquals(resultBlob, blob);
});

Deno.test("Document: should set and get URL correctly", () => {
  // Arrange
  const document = new Document("Document 1");

  // Act
  document.setUrl("http://example.com");
  const url = document.getUrl();

  // Assert
  assertEquals(url, "http://example.com");
});

Deno.test("Document: should set and get number of chunks correctly", () => {
  // Arrange
  const document = new Document("Document 1");

  // Act
  document.setNChunks(10);
  const nChunks = document.getNChunks();

  // Assert
  assertEquals(nChunks, 10);
});

Deno.test("Chunk: should set and get the content correctly", () => {
  // Arrange
  const chunk = new Chunk("Old content");

  // Act
  chunk.setContent("New content");
  const content = chunk.getContent();

  // Assert
  assertEquals(content, "New content");
});

Deno.test("Chunk: should set and get the document correctly", () => {
  // Arrange
  const chunk = new Chunk("Chunk content", "Old document");

  // Act
  chunk.setDocument("New document");
  const document = chunk.getDocument();

  // Assert
  assertEquals(document, "New document");
});

Deno.test("Chunk: should set and get the number correctly", () => {
  // Arrange
  const chunk = new Chunk("Chunk content", "doc1", 1);

  // Act
  chunk.setNumber(2);
  const number = chunk.getNumber();

  // Assert
  assertEquals(number, 2);
});

Deno.test("Chunk: should set and get the embedding correctly", () => {
  // Arrange
  const chunk = new Chunk("Chunk content", "doc1", 1, [0.1, 0.2]);

  // Act
  chunk.setEmbedding([0.3, 0.4, 0.5]);
  const embedding = chunk.getEmbedding();

  // Assert
  assertEquals(embedding, [0.3, 0.4, 0.5]);
});