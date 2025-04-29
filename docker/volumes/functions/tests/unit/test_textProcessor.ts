import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { TextProcessor } from "../../utils/textProcessor.ts";

Deno.test("TextProcessor: _isIta should return true for Italian text", () => {
  // Arrange
  const processor = new TextProcessor();
  const text = "Ciao studio informatica come posso aiutarti?";

  // Act
  const result = processor._isIta(text);

  // Assert
  assertEquals(result, true);
});

Deno.test("TextProcessor: _isIta should return false for non-Italian text", () => {
  // Arrange
  const processor = new TextProcessor();
  const text = "Dies ist ein deutscher Satz?.";

  // Act
  const result = processor._isIta(text);

  // Assert
  assertEquals(result, false);
});

Deno.test("TextProcessor: _isIta should return false for empty text", () => {
  // Arrange
  const processor = new TextProcessor();
  const text = "";

  // Act
  const result = processor._isIta(text);

  // Assert
  assertEquals(result, false);
});

Deno.test("TextProcessor: _isIta should return false for invalid input", () => {
  // Arrange
  const processor = new TextProcessor();
  const text = "12345!@#$%"; // Input non valido

  // Act
  const result = processor._isIta(text);

  // Assert
  assertEquals(result, false);
});

Deno.test("TextProcessor: _cleanAndChunk should clean and chunk Italian text", async () => {
  // Arrange
  const processor = new TextProcessor();
  const pages = [
    "Questo è un testo italiano.\nQuesto è un altro testo italiano.",
    "Questo è un testo italiano con un trattino-\ncontinuato su una nuova riga.",
  ];

  // Act
  const result = await processor._cleanAndChunk(pages);

  // Assert
  assertEquals(result.length > 0, true); // Verifica che ci siano chunk
  assertEquals(result.every(chunk => chunk.length <= 700), true); // Verifica che i chunk siano della dimensione corretta
});

Deno.test("TextProcessor: _cleanAndChunk should exclude non-Italian text", async () => {
  // Arrange
  const processor = new TextProcessor();
  const pages = [
    "Questo è un testo italiano. Questo è un altro testo italiano.\n\n\n",
    "This is an English text. This is another English sentence.",
    "Questo è un testo italiano con un trattino-\ncontinuato su una nuova riga.",
    "Dies ist ein deutscher Satz. Questo è un altro testo italiano.",
    "Another English text with more content. Questo è un testo italiano.",
    "Questo è un testo italiano. This is an English text.",
  ];

  // Act
  const result = await processor._cleanAndChunk(pages);

  // Assert
  assertEquals(result.length > 0, true); // Verifica che ci siano chunk
  assertEquals(result.every(chunk => !chunk.includes("English")), true); // Verifica che il testo inglese sia escluso
});

Deno.test("TextProcessor: _cleanAndChunk should handle empty pages", async () => {
  // Arrange
  const processor = new TextProcessor();
  const pages: string[] = [];

  // Act
  const result = await processor._cleanAndChunk(pages);

  // Assert
  assertEquals(result.length, 0); // Nessun chunk dovrebbe essere generato
});

Deno.test("TextProcessor: _removeOtherSpecial should clean special characters", () => {
  // Arrange
  const processor = new TextProcessor();
  const text = "Questo| è un testo• con caratteri\t speciali.";

  // Act
  const result = processor["_removeOtherSpecial"](text);

  // Assert
  assertEquals(result, "Questo è un testo con caratteri speciali.");
});

Deno.test("TextProcessor: _removeOtherSpecial should handle text without special characters", () => {
  // Arrange
  const processor = new TextProcessor();
  const text = "Questo è un testo normale senza caratteri speciali.";

  // Act
  const result = processor["_removeOtherSpecial"](text);

  // Assert
  assertEquals(result, text); // Il testo dovrebbe rimanere invariato
});

Deno.test("TextProcessor: _removeOtherSpecial should remove multiple spaces", () => {
  // Arrange
  const processor = new TextProcessor();
  const text = "Questo   è    un   testo   con   spazi   multipli.";

  // Act
  const result = processor["_removeOtherSpecial"](text);

  // Assert
  assertEquals(result, "Questo è un testo con spazi multipli.");
});

Deno.test("TextProcessor: _backslashSplit should split text by newlines", () => {
  // Arrange
  const processor = new TextProcessor();
  const document = "Linea 1\nLinea 2\nLinea 3";

  // Act
  const result = processor["_backslashSplit"](document);

  // Assert
  assertEquals(result, ["Linea 1", "Linea 2", "Linea 3"]);
});

Deno.test("TextProcessor: _removeHigh_ should remove trailing hyphens", () => {
  // Arrange
  const processor = new TextProcessor();
  const lista = ["parola-", "testo", "altro-"];

  // Act
  const result = processor["_removeHigh_"](lista);

  // Assert
  assertEquals(result, ["parola", "testo", "altro"]);
});

Deno.test("TextProcessor: _removeHigh_ should leave words without hyphens unchanged", () => {
  // Arrange
  const processor = new TextProcessor();
  const lista = ["parola", "testo", "altro"];

  // Act
  const result = processor["_removeHigh_"](lista);

  // Assert
  assertEquals(result, ["parola", "testo", "altro"]);
});

Deno.test("TextProcessor: _removeHigh_ should handle empty list", () => {
  // Arrange
  const processor = new TextProcessor();
  const lista: string[] = [];

  // Act
  const result = processor["_removeHigh_"](lista);

  // Assert
  assertEquals(result, []); // La lista dovrebbe rimanere vuota
});

Deno.test("TextProcessor: _removeHigh_ should not modify words without hyphens", () => {
  // Arrange
  const processor = new TextProcessor();
  const lista = ["parola", "testo", "altro"];

  // Act
  const result = processor["_removeHigh_"](lista);

  // Assert
  assertEquals(result, ["parola", "testo", "altro"]);
});