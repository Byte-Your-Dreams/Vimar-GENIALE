import { TechnicalAnswerGenerator } from "../../template/TechnicalAnswerGenerator.ts";
import { Message } from "../../models/chat.ts";
import { Product } from "../../models/product.ts";
import { Document, Chunk } from "../../models/document.ts";
import { AIPrompt } from "../../models/aiPrompt.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("TechnicalAnswerGenerator: getContext should return context from filtered documents", async () => {
  // Arrange
  const mockServices = {
    getDocumentsUseCase: {
      async getDocuments(product: Product): Promise<Document[]> {
        return [
          new Document("FI_Document_1", "Content of FI document 1"),
          new Document("Other_Document", "Content of other document"),
        ];
      },
    },
    obtainSimilarChunkUseCase: {
      async obtainSimilarChunk(message: Message, documents: Document[], nChunk: number): Promise<Chunk[]> {
        return [
          new Chunk("Chunk 1 content"),
          new Chunk("Chunk 2 content"),
        ];
      },
    },
  };
  const generator = new TechnicalAnswerGenerator(mockServices);
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date(), "en", [], [], []);
  const product = new Product("ID1", "Product 1", "Description", "ETIM");

  // Act
  const context = await generator["getContext"](message, [product]);

  // Assert
  assertEquals(context, "Chunk 1 content\n\nChunk 2 content\n\n");
});

Deno.test("TechnicalAnswerGenerator: getContext should return 'No context available' if no chunks are found", async () => {
  // Arrange
  const mockServices = {
    getDocumentsUseCase: {
      async getDocuments(product: Product): Promise<Document[]> {
        return [
          new Document("FI_Document_1", "Content of FI document 1"),
        ];
      },
    },
    obtainSimilarChunkUseCase: {
      async obtainSimilarChunk(message: Message, documents: Document[], nChunk: number): Promise<Chunk[] | null> {
        return null; // Simula il caso in cui non ci sono chunk
      },
    },
  };
  const generator = new TechnicalAnswerGenerator(mockServices);
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date(), "en", [], [], []);
  const product = new Product("ID1", "Product 1", "Description", "ETIM");

  // Act
  const context = await generator["getContext"](message, [product]);

  // Assert
  assertEquals(context, "No context available");
});

Deno.test("TechnicalAnswerGenerator: getContext should handle empty filtered documents", async () => {
  // Arrange
  const mockServices = {
    getDocumentsUseCase: {
      async getDocuments(product: Product): Promise<Document[]> {
        return [
          new Document("Other_Document", "Content of other document"),
        ];
      },
    },
    obtainSimilarChunkUseCase: {
      async obtainSimilarChunk(message: Message, documents: Document[], nChunk: number): Promise<Chunk[]> {
        return [
          new Chunk("Chunk 1 content"),
        ];
      },
    },
  };
  const generator = new TechnicalAnswerGenerator(mockServices);
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date(), "en", [], [], []);
  const product = new Product("ID1", "Product 1", "Description", "ETIM");

  // Act
  const context = await generator["getContext"](message, [product]);

  // Assert
  assertEquals(context, "Chunk 1 content\n\n");
});

Deno.test("TechnicalAnswerGenerator: generatePrompt should return a valid AIPrompt", () => {
  // Arrange
  const generator = new TechnicalAnswerGenerator({});
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date(), "en", [], [], []);
  const product = new Product("ID1", "Product 1", "Description", "ETIM");
  const context = "Technical document content";

  // Act
  const prompt = generator["generatePrompt"](message, context, [product]);
    console.log('prompt: ', prompt.getPrompt());
  // Assert
  assertEquals(prompt.getPrompt().length, 2);
  assertEquals(prompt.getPrompt()[0].role, "system");
  assertEquals(prompt.getPrompt()[1].role, "user");
  assertEquals(prompt.getPrompt()[1].content, "What is Product 1?");
  assertEquals(prompt.getPrompt()[0].content?.toString().includes("ETIM Metadata:"), true);
  assertEquals(prompt.getPrompt()[0].content?.toString().includes("Technical document content"), true);
});