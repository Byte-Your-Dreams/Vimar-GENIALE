import { DifferenceAnswerGenerator } from "../../template/DifferenceAnswerGenerator.ts";
import { Message, Chat } from "../../models/chat.ts";
import { Product } from "../../models/product.ts";
import { Document, Chunk } from "../../models/document.ts";
import { AIPrompt } from "../../models/aiPrompt.ts";
import { assertEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts";

Deno.test("DifferenceAnswerGenerator: reformulateQuestion should throw an error if chat has no history", async () => {
  // Arrange
  const generator = new DifferenceAnswerGenerator({});
  const chat = new Chat("chat1", [
    new Message("msg1", "chat1", "What is Product 1?", new Date(), "", [], [], []),
  ]); // Solo un messaggio

  // Act & Assert
  try {
    await generator["reformulateQuestion"](chat);
  }
  catch (error) {
    if (error instanceof Error) {
        assertEquals(error.message, "No history found");
    }
  }
});

Deno.test("DifferenceAnswerGenerator: reformulateQuestion should return reformulated question", async () => {
  // Arrange
  const mockServices = {
    generateAnswerUseCase: {
      async generateAnswer(prompt: AIPrompt): Promise<{ getSuccess: () => boolean; getAnswer: () => string }> {
        return {
          getSuccess: () => true,
          getAnswer: () => "REFORMULATED: What are the differences between Product A and Product B?",
        };
      },
    },
  };
  const generator = new DifferenceAnswerGenerator(mockServices);
  const chat = new Chat("chat1", [
    new Message("msg1", "chat1", "What is Product A?", new Date(), "", [], [], []),
    new Message("msg2", "chat1", "What is Product B?", new Date(), "Answer for Product B", [], [], []),
  ]);

  // Act
  const result = await generator["reformulateQuestion"](chat);

  // Assert
  assertEquals(result.getQuestion(), "REFORMULATED: What are the differences between Product A and Product B?");
});

Deno.test("DifferenceAnswerGenerator: getContext should return context from chunks", async () => {
  // Arrange
  const mockServices = {
    getDocumentsUseCase: {
      async getDocuments(product: Product): Promise<Document[]> {
        return [new Document("Doc1", "Content of document 1")];
      },
    },
    obtainSimilarChunk: {
      async obtainSimilarChunk(message: Message, documents: Document[], nChunk: number): Promise<Chunk[]> {
        return [new Chunk("Chunk 1 content"), new Chunk("Chunk 2 content")];
      },
    },
  };
  const generator = new DifferenceAnswerGenerator(mockServices);
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date(), "en", [], [], []);
  const product = new Product("ID1", "Product 1", "Description", "ETIM");

  // Act
  const context = await generator["getContext"](message, [product]);

  // Assert
  assertEquals(context, "Chunk 1 content\n\nChunk 2 content\n\n");
});

Deno.test("DifferenceAnswerGenerator: getContext should return 'No context available' if no chunks are found", async () => {
  // Arrange
  const mockServices = {
    getDocumentsUseCase: {
      async getDocuments(product: Product): Promise<Document[]> {
        return [new Document("Doc1", "Content of document 1")];
      },
    },
    obtainSimilarChunk: {
      async obtainSimilarChunk(message: Message, documents: Document[], nChunk: number): Promise<Chunk[] | null> {
        return null; // Simula il caso in cui non ci sono chunk
      },
    },
  };
  const generator = new DifferenceAnswerGenerator(mockServices);
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date(), "en", [], [], []);
  const product = new Product("ID1", "Product 1", "Description", "ETIM");

  // Act
  const context = await generator["getContext"](message, [product]);

  // Assert
  assertEquals(context, "No context available");
});

Deno.test("DifferenceAnswerGenerator: generatePrompt should return a valid AIPrompt", () => {
  // Arrange
  const generator = new DifferenceAnswerGenerator({});
  const message = new Message("msg1", "chat1", "What are the differences between Product A and Product B?", new Date(), "en", [], [], []);
  const productA = new Product("ID1", "Product A", "Description A", "ETIM A");
  const productB = new Product("ID2", "Product B", "Description B", "ETIM B");
  const context = "Technical document content";

  // Act
  const prompt = generator["generatePrompt"](message, context, [productA, productB]);

  // Assert
  const messages = prompt.getPrompt();
  console.log(messages);
  assertEquals(messages.length, 2);
  assertEquals(messages[0].role, "system");
  assertEquals(messages[1].role, "user");
  assertEquals(messages[1].content, "What are the differences between Product A and Product B?\n\n ###Products:\n- **Product A**\n  - **Description:** Description A\n  - **ETIM:** ETIM A\n- **Product B**\n  - **Description:** Description B\n  - **ETIM:** ETIM B\n");
  
});

Deno.test("DifferenceAnswerGenerator: reformulateQuestion should throw an error if answer generation fails", async () => {
    // Arrange
    const mockServices = {
      generateAnswerUseCase: {
        async generateAnswer(prompt: AIPrompt): Promise<{ getSuccess: () => boolean; getAnswer: () => string }> {
          return {
            getSuccess: () => false, // Simula fallimento
            getAnswer: () => "",
          };
        },
      },
    };
    const generator = new DifferenceAnswerGenerator(mockServices);
    const chat = new Chat("chat1", [
      new Message("msg1", "chat1", "What is Product A?", new Date(), "", [], [], []),
      new Message("msg2", "chat1", "What is Product B?", new Date(), "Answer for Product B", [], [], []),
    ]);
  
    // Act & Assert
    try {
        await generator["reformulateQuestion"](chat);
    } catch (error) {
        if (error instanceof Error) {
            assertEquals(error.message, "Answer not found");
        }
    }
  });

Deno.test("DifferenceAnswerGenerator: reformulateQuestion should remove think tag from response", async () => {
  // Arrange
  const mockServices = {
    generateAnswerUseCase: {
      async generateAnswer(prompt: AIPrompt): Promise<{ getSuccess: () => boolean; getAnswer: () => string }> {
        return {
          getSuccess: () => true,
          getAnswer: () => "<think> pensando... </think>What are the differences between Product A and Product B?",
        };
      },
    },
  };
  const generator = new DifferenceAnswerGenerator(mockServices);
  const chat = new Chat("chat1", [
    new Message("msg1", "chat1", "What is Product A?", new Date(), "", [], [], []),
    new Message("msg2", "chat1", "What is Product B?", new Date(), "Answer for Product B", [], [], []),
  ]);

  // Act
  const result = await generator["reformulateQuestion"](chat);

  // Assert
  assertEquals(result.getQuestion(), "What are the differences between Product A and Product B?");
});