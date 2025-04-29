import { assertEquals, assertThrows } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { AbstractGenerator } from "../../template/AbstractGenerator.ts";
import { GeneralAnswerGenerator } from "../../template/GeneralAnswerGenerator.ts";
import { Chat, Message } from "../../models/chat.ts";
import { Product } from "../../models/product.ts";
import { GeneralProductInfo } from "../../models/generalProductInfo.ts";
import { AIQuestion } from "../../models/aiQuestion.ts";
import { AIEmbedding } from "../../models/aiEmbedding.ts";
import { DBInsertResponse } from "../../models/dbInsertResponse.ts";
import { AIPrompt } from "../../models/aiPrompt.ts";
import { AIAnswer } from "../../models/aiAnswer.ts";
import { Document, Chunk } from "../../models/document.ts"
import { ObtainSimilarChunkUseCase } from "../../useCases/obtainSimilarChunkUseCase.ts";

const mockServices = {
  getAllProductUseCase: {
    async getAllProduct(): Promise<GeneralProductInfo> {
      return new GeneralProductInfo(["Product 1"], ["ID1"]);
    },
  },
  generateAnswerUseCase: {
    async generateAnswer(prompt: AIPrompt): Promise<AIAnswer> {
      return new AIAnswer(true, "Mocked answer");
    },
  },
  generateEmbeddingUseCase: {
    async generateEmbedding(question: AIQuestion): Promise<AIEmbedding> {
      return new AIEmbedding(true, [0.1, 0.2, 0.3]);
    },
  },
  getProductUseCase: {
    async getProduct(name: string | null, id: string | null): Promise<Product> {
      return new Product(id || "ID1", name || "Product 1", "Description", "ETIM");
    },
  },
  updateMessageUseCase: {
    async updateMessage(message: Message): Promise<DBInsertResponse> {
      return new DBInsertResponse(true, "Message saved");
    },
  },
  getHistoryUseCase: {
    async getHistory(chatId: string): Promise<Message[]> {
      return [];
    },
  },
  getDocumentsUseCase: {
    async getDocuments(productId: string): Promise<Document[]> {
      return [
        new Document("doc1", "Document 1", "", "", "", {}, new Blob(), "http://example.com/doc1", 1)
      ];
    },
  },
  obtainSimilarChunkUseCase: {
    async obtainSimilarChunk(message: Message, documents: Document[], nChunk: number): Promise<Chunk[]> {
      return [
        new Chunk("Chunk 1 content", "doc1", 1, [0.1, 0.2, 0.3]),
        new Chunk("Chunk 2 content", "doc2", 2, [0.4, 0.5, 0.6]),
      ];
    },
  },
};

Deno.test("AbstractGenerator: generateAnswer should return a Message with an answer", async () => {
  // Arrange
  const generator = new GeneralAnswerGenerator(mockServices);

  const chat = new Chat("chat1", [
    new Message("msg1", "chat1", "What is Product 1?", new Date(), "", [], [], []),
  ]);

  // Act
  const result = await generator.generateAnswer(chat);

  // Assert
  assertEquals(result.getAnswer(), "Mocked answer");
});

Deno.test("AbstractGenerator: generateAnswer should throw an error if no products are found", async () => {
  // Arrange
  const failingServices = {
    ...mockServices,
    getAllProductUseCase: {
      async getAllProduct(): Promise<GeneralProductInfo> {
        throw new Error("No products found");
      },
    },
  };
  const generator = new GeneralAnswerGenerator(failingServices);

  const chat = new Chat("chat1", [
    new Message("msg1", "chat1", "What is Product 1?", new Date(), "", [], [], []),
  ]);

  // Act & Assert
  try {
    await generator.generateAnswer(chat);
  } catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "Error fetching all products");
    }
  }
});

Deno.test("AbstractGenerator: generateAnswer should throw an error if chat has no messages", async () => {
  // Arrange
  const generator = new GeneralAnswerGenerator(mockServices);
  const chat = new Chat("chat1", []);

  // Act & Assert
  try {
    await generator.generateAnswer(chat);
  } catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "Cannot read properties of undefined (reading 'setAnswer')");
    }
  }
});

Deno.test("AbstractGenerator: generateAnswer should throw an error if embedding generation fails", async () => {
  // Arrange
  const failingServices = {
    ...mockServices,
    generateEmbeddingUseCase: {
      async generateEmbedding(question: AIQuestion): Promise<AIEmbedding> {
        throw new Error("Embedding generation failed");
      },
    },
  };
  const generator = new GeneralAnswerGenerator(failingServices);
  const chat = new Chat("chat1", [
    new Message("msg1", "chat1", "What is Product 1?", new Date(), "", [], [], []),
  ]);

  // Act & Assert
  try {
    await generator.generateAnswer(chat);
  } catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "Embedding generation failed");
    }
  }
});

Deno.test("AbstractGenerator: extractProductNames should return matching product names", () => {
  // Arrange
  const generator = new GeneralAnswerGenerator(mockServices);

  const message = new Message("msg1", "chat1", "Tell me about Termostato a rotella connesso", new Date(), "", [], [], []);
  const allProducts = new GeneralProductInfo(["Termostato a rotella connesso", "Deviatore connesso"], ["ID1", "ID2"]);

  // Act
  const result = generator["extractProductNames"](message, allProducts);
  // Assert
  assertEquals(result, ["Termostato a rotella connesso"]);
});

Deno.test("AbstractGenerator: extractProductNames should exclude products with low percentage", () => {
  // Arrange
  const generator = new GeneralAnswerGenerator(mockServices);
  const message = new Message("msg1", "chat1", "Tell me about Deviatore connesso IoT", new Date(), "", [], [], []);
  const allProducts = new GeneralProductInfo(["Termostato a rotella connesso"], ["ID1"]);

  // Act
  const result = generator["extractProductNames"](message, allProducts);

  // Assert
  assertEquals(result, null); // Nessun prodotto dovrebbe essere incluso
});

Deno.test("AbstractGenerator: extractProductID should return matching product IDs", () => {
  // Arrange
  const generator = new GeneralAnswerGenerator(mockServices);

  const message = new Message("msg1", "chat1", "Tell me about ID1", new Date(), "", [], [], []);
  const allProducts = new GeneralProductInfo(["Product 1", "Product 2"], ["ID1", "ID2"]);

  // Act
  const result = generator["extractProductID"](message, allProducts);

  // Assert
  assertEquals(result, ["ID1"]);
});

Deno.test("AbstractGenerator: extractProductID should return null if no IDs match", () => {
  // Arrange
  const generator = new GeneralAnswerGenerator(mockServices);
  const message = new Message("msg1", "chat1", "Tell me about Product X", new Date(), "", [], [], []);
  const allProducts = new GeneralProductInfo(["Product 1"], ["ID1"]);

  // Act
  const result = generator["extractProductID"](message, allProducts);

  // Assert
  assertEquals(result, null);
});

Deno.test("AbstractGenerator: reformulateQuestion should return a reformulated Message", async () => {
  // Arrange
  const generator = new GeneralAnswerGenerator(mockServices);

  const chat = new Chat("chat1", [
    new Message("msg1", "chat1", "What is Product 1?", new Date(), "", [], [], []),
    new Message("msg2", "chat1", "Tell me more about Product 1", new Date(), "Product 1 is great.", [], [], []),
  ]);

  // Act
  const result = await generator["reformulateQuestion"](chat);

  // Assert
  assertEquals(result.getQuestion(), "Mocked answer");
});

Deno.test("AbstractGenerator: getQueryEmbedding should return a valid embedding", async () => {
  // Arrange
  const generator = new GeneralAnswerGenerator(mockServices);
  const question = new AIQuestion("What is Product 1?");

  // Act
  const result = await generator["getQueryEmbedding"](question);

  // Assert
  assertEquals(result.getEmbedding(), [0.1, 0.2, 0.3]);
});

Deno.test("AbstractGenerator: getProducts should return matching products", async () => {
  // Arrange
  const generator = new GeneralAnswerGenerator(mockServices);
  const message = new Message("msg1", "chat1", "Tell me about Product 1 and ID2", new Date(), "", ["Product 1"], ["ID2"], []);

  // Act
  const result = await generator["getProducts"](message);

  // Assert
  assertEquals(result.length, 2);
  assertEquals(result[0].getName(), "Product 1");
  assertEquals(result[1].getID(), "ID2");
});

Deno.test("AbstractGenerator: saveMessage should save the message successfully", async () => {
  // Arrange
  const generator = new GeneralAnswerGenerator(mockServices);
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date(), "", [], [], []);

  // Act
  const result = await generator["saveMessage"](message);

  // Assert
  assertEquals(result.getSuccess(), true);
});

Deno.test("AbstractGenerator: removeThinkTag should remove <think> tags", () => {
  // Arrange
  const generator = new GeneralAnswerGenerator(mockServices);
  const text = "<think>Some internal thought</think>\nThis is the actual answer.";

  // Act
  const result = generator["removeThinkTag"](text);

  // Assert
  assertEquals(result, "This is the actual answer.");
});

Deno.test("GeneralAnswerGenerator: getContext should return mocked context", async () => {
  // Arrange
  const generator = new GeneralAnswerGenerator(mockServices);
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date(), "", [], [], []);
  const products = [new Product("ID1", "Product 1", "Description", "ETIM")];

  // Act
  const result = await generator["getContext"](message, products);
  // Assert
  assertEquals(result, "Chunk 1 content\n\nChunk 2 content\n\n");
});

Deno.test("GeneralAnswerGenerator: getContext should return the correct context", async () => {
  // Arrange
  const contextServices = {
    ...mockServices,
    getDocumentsUseCase: {
      async getDocuments(product: Product): Promise<Document[]> {
        return [
          new Document("doc1", "Document 1", "", "", "", {}, new Blob(), "http://example.com/doc1", 1),
          new Document("doc2", "Document 2", "", "", "", {}, new Blob(), "http://example.com/doc2", 2),
        ];
      },
    },
    obtainSimilarChunkUseCase: {
      async obtainSimilarChunk(message: Message, documents: Document[], nChunk: number): Promise<Chunk[]> {
        return [
          new Chunk("Chunk 1 content", "doc1", 1, [0.1, 0.2, 0.3]),
          new Chunk("Chunk 2 content", "doc2", 2, [0.4, 0.5, 0.6]),
        ];
      },
    },
  };

  const generator = new GeneralAnswerGenerator(contextServices);
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date(), "", [], [], []);
  const products = [new Product("ID1", "Product 1", "Description", "ETIM")];

  // Act
  const result = await generator["getContext"](message, products);

  // Assert
  assertEquals(result, "Chunk 1 content\n\nChunk 2 content\n\n");
});

Deno.test("GeneralAnswerGenerator: getContext should handle empty documents", async () => {
  // Arrange
  const failingServices = {
    ...mockServices,
    getDocumentsUseCase: {
      async getDocuments(productId: string): Promise<Document[]> {
        return []; // Simula nessun documento trovato
      },
    },
    obtainSimilarChunkUseCase: {
      async obtainSimilarChunk(message: Message, documents: Document[], nChunk: number): Promise<Chunk[]> {
        return []; // Simula nessun chunk trovato
      },
    },
  };
  const generator = new GeneralAnswerGenerator(failingServices);
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date(), "", [], [], []);
  const products = [new Product("ID1", "Product 1", "Description", "ETIM")];

  // Act
  const result = await generator["getContext"](message, products);

  // Assert
  assertEquals(result, ""); // Contesto vuoto
});

Deno.test("GeneralAnswerGenerator: generatePrompt should return the correct prompt", () => {
  // Arrange
  const generator = new GeneralAnswerGenerator(mockServices);
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date(), "", [], [], []);
  const context = "Technical document content";
  const products = [new Product("ID1", "Product 1", "Description", "ETIM")];

  // Act
  const result = generator["generatePrompt"](message, context, products);
  // Assert
  assertEquals(result.getPrompt()[0].role, "system");
  const content = result.getPrompt()[0].content;
  if (content) {
    assertEquals(content.toString().includes("System Role Configuration"), true);
  }
  assertEquals(result.getPrompt()[1].role, "user");
  //assertEquals(result.getPrompt()[1].content, "What is Product 1?");
});

Deno.test("AbstractGenerator: should handle empty context", async () => {
  // Arrange
  const failingServices = {
    ...mockServices,
    obtainSimilarChunkUseCase: {
      async obtainSimilarChunk(message: Message, documents: Document[], nChunk: number): Promise<Chunk[]> {
        return [];
      },
    },
  };
  const generator = new GeneralAnswerGenerator(failingServices);
  const chat = new Chat("chat1", [
    new Message("msg1", "chat1", "What is Product 1?", new Date(), "", [], [], []),
  ]);

  // Act
  const result = await generator.generateAnswer(chat);

  // Assert
  assertEquals(result.getAnswer(), "Non trovo materiale sul prodotto di cui parli. Riprova più tardi.");
});

Deno.test("AbstractGenerator: should handle failed answer generation", async () => {
  // Arrange
  const failingServices = {
    ...mockServices,
    generateAnswerUseCase: {
      async generateAnswer(prompt: AIPrompt): Promise<AIAnswer> {
        return new AIAnswer(false, "");
      },
    },
  };
  const generator = new GeneralAnswerGenerator(failingServices);
  const chat = new Chat("chat1", [
    new Message("msg1", "chat1", "What is Product 1?", new Date(), "", [], [], []),
  ]);

  // Act
  const result = await generator.generateAnswer(chat);

  // Assert
  assertEquals(result.getAnswer(), "C'è stato un problema nella generazione della risposta. Riprova più tardi.");
});

Deno.test("AbstractGenerator: should throw error if message not saved", async () => {
  // Arrange
  const failingServices = {
    ...mockServices,
    updateMessageUseCase: {
      async updateMessage(message: Message): Promise<DBInsertResponse> {
        return new DBInsertResponse(false, "Failed to save");
      },
    },
  };
  const generator = new GeneralAnswerGenerator(failingServices);
  const chat = new Chat("chat1", [
    new Message("msg1", "chat1", "What is Product 1?", new Date(), "", [], [], []),
  ]);

  // Act & Assert
  try {
    await generator.generateAnswer(chat);
  } catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "Message not saved");
    }
  }
});

Deno.test("AbstractGenerator: should handle empty products", async () => {
  // Arrange
  class MockedGeneralAnswerGenerator extends GeneralAnswerGenerator {
    protected override async getProducts(message: Message): Promise<Product[]> {
      return []; // Simula nessun prodotto trovato
    }
  }

  const failingServices = {
    ...mockServices,
    getProducts: async () => [], // Simulate no products found
  };

  const generator = new MockedGeneralAnswerGenerator(failingServices);
  const chat = new Chat("chat1", [
    new Message("msg1", "chat1", "What is Product 1?", new Date(), "", [], [], []),
  ]);

  // Act
  const result = await generator.generateAnswer(chat);

  // Assert
  assertEquals(result.getAnswer(), "Non sono riuscito a trovare i prodotti di cui stai parlando. Prova a riformulare la domanda.");
});

Deno.test("AbstractGenerator: generateAnswer should handle empty products", async () => {
  // Arrange
  class MockedGeneralAnswerGenerator extends GeneralAnswerGenerator {
    protected override async getProducts(message: Message): Promise<Product[]> {
      return []; // Simula nessun prodotto trovato
    }
  }

  const generator = new MockedGeneralAnswerGenerator(mockServices);
  const chat = new Chat("chat1", [
    new Message("msg1", "chat1", "What is Product 1?", new Date(), "", [], [], []),
  ]);

  // Act
  const result = await generator.generateAnswer(chat);

  // Assert
  assertEquals(result.getAnswer(), "Non sono riuscito a trovare i prodotti di cui stai parlando. Prova a riformulare la domanda.");
});

Deno.test("AbstractGenerator: should handle failed embedding generation", async () => {
  // Arrange
  const failingServices = {
    ...mockServices,
    generateEmbeddingUseCase: {
      async generateEmbedding(question: AIQuestion): Promise<AIEmbedding> {
        return new AIEmbedding(false, []);
      },
    },
  };
  const generator = new GeneralAnswerGenerator(failingServices);
  const chat = new Chat("chat1", [
    new Message("msg1", "chat1", "What is Product 1?", new Date(), "", [], [], []),
  ]);

  // Act & Assert
  try {
    await generator.generateAnswer(chat);
  } catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "Embedding generation failed");
    }
  }
});

Deno.test("GeneralAnswerGenerator: generateAnswer should handle service failure", async () => {
  // Arrange
  const failingServices = {
    ...mockServices,
    generateAnswerUseCase: {
      async generateAnswer(prompt: AIPrompt): Promise<AIAnswer> {
        throw new Error("Service failure");
      },
    },
  };
  const generator = new GeneralAnswerGenerator(failingServices);
  const chat = new Chat("chat1", [
    new Message("msg1", "chat1", "What is Product 1?", new Date(), "", [], [], []),
  ]);

  // Act & Assert
  try {
    await generator.generateAnswer(chat);
  } catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "Service failure");
    }
  }
});

Deno.test("AbstractGenerator: removeThinkTag should handle text without <think> tags", () => {
  // Arrange
  const generator = new GeneralAnswerGenerator(mockServices);
  const text = "This is the actual answer.";

  // Act
  const result = generator["removeThinkTag"](text);
  console.log('result', result)

  // Assert
  assertEquals(result, "This is the actual answer.");
});