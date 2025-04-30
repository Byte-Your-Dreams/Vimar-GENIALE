import { SupabaseChat, SupabaseMessage } from "../../entities/supabaseChat.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("SupabaseChat: should return the correct ID", () => {
  // Arrange
  const chat = new SupabaseChat("chat1", []);

  // Act
  const id = chat.getID();

  // Assert
  assertEquals(id, "chat1");
});

Deno.test("SupabaseChat: should return the correct messages", () => {
  // Arrange
  const messages = [
    new SupabaseMessage("msg1", "chat1", "What is Product 1?", new Date(), ["Product 1"], ["ID1"], [0.1, 0.2], "Answer 1"),
    new SupabaseMessage("msg2", "chat1", "What is Product 2?", new Date(), ["Product 2"], ["ID2"], [0.3, 0.4], "Answer 2"),
  ];
  const chat = new SupabaseChat("chat1", messages);

  // Act
  const result = chat.getMessages();

  // Assert
  assertEquals(result, messages);
});

Deno.test("SupabaseMessage: should return the correct ID", () => {
  // Arrange
  const message = new SupabaseMessage("msg1", "chat1", "What is Product 1?", new Date(), [], [], [], "");

  // Act
  const id = message.getID();

  // Assert
  assertEquals(id, "msg1");
});

Deno.test("SupabaseMessage: should return the correct chat ID", () => {
  // Arrange
  const message = new SupabaseMessage("msg1", "chat1", "What is Product 1?", new Date(), [], [], [], "");

  // Act
  const chatID = message.getChatID();

  // Assert
  assertEquals(chatID, "chat1");
});

Deno.test("SupabaseMessage: should return the correct question", () => {
  // Arrange
  const message = new SupabaseMessage("msg1", "chat1", "What is Product 1?", new Date(), [], [], [], "");

  // Act
  const question = message.getQuestion();

  // Assert
  assertEquals(question, "What is Product 1?");
});

Deno.test("SupabaseMessage: should return the correct answer", () => {
  // Arrange
  const message = new SupabaseMessage("msg1", "chat1", "What is Product 1?", new Date(), [], [], [], "Answer 1");

  // Act
  const answer = message.getAnswer();

  // Assert
  assertEquals(answer, "Answer 1");
});

Deno.test("SupabaseMessage: should return the correct date", () => {
  // Arrange
  const date = new Date();
  const message = new SupabaseMessage("msg1", "chat1", "What is Product 1?", date, [], [], [], "");

  // Act
  const resultDate = message.getDate();

  // Assert
  assertEquals(resultDate, date);
});

Deno.test("SupabaseMessage: should return the correct product names", () => {
  // Arrange
  const productNames = ["Product 1", "Product 2"];
  const message = new SupabaseMessage("msg1", "chat1", "What is Product 1?", new Date(), productNames, [], [], "");

  // Act
  const resultProductNames = message.getProductNames();

  // Assert
  assertEquals(resultProductNames, productNames);
});

Deno.test("SupabaseMessage: should return the correct product IDs", () => {
  // Arrange
  const productIDs = ["ID1", "ID2"];
  const message = new SupabaseMessage("msg1", "chat1", "What is Product 1?", new Date(), [], productIDs, [], "");

  // Act
  const resultProductIDs = message.getProductIDs();

  // Assert
  assertEquals(resultProductIDs, productIDs);
});

Deno.test("SupabaseMessage: should return the correct embedding", () => {
  // Arrange
  const embedding = [0.1, 0.2, 0.3];
  const message = new SupabaseMessage("msg1", "chat1", "What is Product 1?", new Date(), [], [], embedding, "");

  // Act
  const resultEmbedding = message.getEmbedding();

  // Assert
  assertEquals(resultEmbedding, embedding);
});

Deno.test("SupabaseMessage: should set and get the question correctly", () => {
  // Arrange
  const message = new SupabaseMessage("msg1", "chat1", "Old Question", new Date(), [], [], [], "");

  // Act
  message.setQuestion("New Question");
  const question = message.getQuestion();

  // Assert
  assertEquals(question, "New Question");
});

Deno.test("SupabaseMessage: should set and get the answer correctly", () => {
  // Arrange
  const message = new SupabaseMessage("msg1", "chat1", "What is Product 1?", new Date(), [], [], [], "Old Answer");

  // Act
  message.setAnswer("New Answer");
  const answer = message.getAnswer();

  // Assert
  assertEquals(answer, "New Answer");
});

Deno.test("SupabaseMessage: should set and get product names correctly", () => {
  // Arrange
  const message = new SupabaseMessage("msg1", "chat1", "What is Product 1?", new Date(), [], [], [], "");

  // Act
  message.setProductNames(["Product A", "Product B"]);
  const productNames = message.getProductNames();

  // Assert
  assertEquals(productNames, ["Product A", "Product B"]);
});

Deno.test("SupabaseMessage: should set and get product IDs correctly", () => {
  // Arrange
  const message = new SupabaseMessage("msg1", "chat1", "What is Product 1?", new Date(), [], [], [], "");

  // Act
  message.setProductIDs(["ID1", "ID2"]);
  const productIDs = message.getProductIDs();

  // Assert
  assertEquals(productIDs, ["ID1", "ID2"]);
});

Deno.test("SupabaseMessage: should set and get embedding correctly", () => {
  // Arrange
  const message = new SupabaseMessage("msg1", "chat1", "What is Product 1?", new Date(), [], [], [], "");

  // Act
  message.setEmbedding([0.5, 0.6, 0.7]);
  const embedding = message.getEmbedding();

  // Assert
  assertEquals(embedding, [0.5, 0.6, 0.7]);
});