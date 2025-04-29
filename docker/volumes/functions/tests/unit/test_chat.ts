import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { Chat, Message } from "../../models/chat.ts";

Deno.test("Chat: should return the correct ID", () => {
  // Arrange
  const chat = new Chat("chat1", []);

  // Act
  const result = chat.getID();

  // Assert
  assertEquals(result, "chat1");
});

Deno.test("Chat: should return the correct messages", () => {
  // Arrange
  const messages = [
    new Message("msg1", "chat1", "What is Product 1?", new Date()),
    new Message("msg2", "chat1", "Tell me more about Product 1", new Date()),
  ];
  const chat = new Chat("chat1", messages);

  // Act
  const result = chat.getMessages();

  // Assert
  assertEquals(result, messages);
});

Deno.test("Chat: should return the last message", () => {
  // Arrange
  const messages = [
    new Message("msg1", "chat1", "What is Product 1?", new Date()),
    new Message("msg2", "chat1", "Tell me more about Product 1", new Date()),
  ];
  const chat = new Chat("chat1", messages);

  // Act
  const result = chat.getLastMessage();

  // Assert
  assertEquals(result.getQuestion(), "Tell me more about Product 1");
});

Deno.test("Message: should return the correct ID", () => {
  // Arrange
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date());

  // Act
  const result = message.getID();

  // Assert
  assertEquals(result, "msg1");
});

Deno.test("Message: should return the correct chat ID", () => {
  // Arrange
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date());

  // Act
  const result = message.getChatID();

  // Assert
  assertEquals(result, "chat1");
});

Deno.test("Message: should return the correct question", () => {
  // Arrange
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date());

  // Act
  const result = message.getQuestion();

  // Assert
  assertEquals(result, "What is Product 1?");
});

Deno.test("Message: should return the correct answer", () => {
  // Arrange
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date(), "This is the answer.");

  // Act
  const result = message.getAnswer();

  // Assert
  assertEquals(result, "This is the answer.");
});

Deno.test("Message: should detect the correct language", () => {
  // Arrange
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date());

  // Act
  const result = message.getLanguage();

  // Assert
  assertEquals(result, "english"); // Assuming the question is in English
});

Deno.test("Message: should detect English language", () => {
  // Arrange
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date());

  // Act
  const result = message.getLanguage();

  // Assert
  assertEquals(result, "english");
});

Deno.test("Message: should detect Italian language", () => {
  // Arrange
  const message = new Message("msg1", "chat1", "Che cos'è il Prodotto 1?", new Date());

  // Act
  const result = message.getLanguage();

  // Assert
  assertEquals(result, "italian");
});

Deno.test("Message: should detect Spanish language", () => {
  // Arrange
  const message = new Message("msg1", "chat1", "¿Qué es el Producto 1?", new Date());

  // Act
  const result = message.getLanguage();

  // Assert
  assertEquals(result, "spanish");
});

Deno.test("Message: should detect French language", () => {
  // Arrange
  const message = new Message("msg1", "chat1", "Qu'est-ce que le Produit 1?", new Date());

  // Act
  const result = message.getLanguage();

  // Assert
  assertEquals(result, "french");
});

Deno.test("Message: should detect German language", () => {
  // Arrange
  const message = new Message("msg1", "chat1", "Dies ist ein deutscher Satz?", new Date());

  // Act
  const result = message.getLanguage();

  // Assert
  assertEquals(result, "german");
});

Deno.test("Message: should default to Italian for unknown language", () => {
  // Arrange
  const message = new Message("msg1", "chat1", "未知的语言", new Date()); // Chinese text

  // Act
  const result = message.getLanguage();

  // Assert
  assertEquals(result, "italian");
});

Deno.test("Message: should set and get product names", () => {
  // Arrange
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date());
  const productNames = ["Product 1", "Product 2"];

  // Act
  message.setProductNames(productNames);
  const result = message.getProductNames();

  // Assert
  assertEquals(result, productNames);
});

Deno.test("Message: should set and get product IDs", () => {
  // Arrange
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date());
  const productIDs = ["ID1", "ID2"];

  // Act
  message.setProductIDs(productIDs);
  const result = message.getProductIDs();

  // Assert
  assertEquals(result, productIDs);
});

Deno.test("Message: should set and get embedding", () => {
  // Arrange
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date());
  const embedding = [0.1, 0.2, 0.3];

  // Act
  message.setEmbedding(embedding);
  const result = message.getEmbedding();

  // Assert
  assertEquals(result, embedding);
});

Deno.test("Message: should set and get question", () => {
  // Arrange
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date());

  // Act
  message.setQuestion("New question?");
  const result = message.getQuestion();

  // Assert
  assertEquals(result, "New question?");
});

Deno.test("Message: should set and get answer", () => {
  // Arrange
  const message = new Message("msg1", "chat1", "What is Product 1?", new Date());

  // Act
  message.setAnswer("New answer.");
  const result = message.getAnswer();

  // Assert
  assertEquals(result, "New answer.");
});