import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { GeneralProductInfo } from "../../models/generalProductInfo.ts";
import { Message } from "../../models/chat.ts";

// Mock dei servizi
const mockServices = {
  getAllProductUseCase: {
    async getAllProduct(): Promise<GeneralProductInfo> {
      return new GeneralProductInfo(
        ["Product 1", "Product 2", "Special Product"],
        ["ID1", "ID2", "ID3"]
      );
    },
  },
  obtainAllMessagesUseCase: {
    async obtainAllMessages(): Promise<Message[]> {
      return [
        new Message("msg1", "chat1", "Tell me about Product 1", new Date(), "", [], [], []),
        new Message("msg2", "chat2", "What is the Special Product?", new Date(), "", [], [], []),
        new Message("msg3", "chat3", "I need information about ID2", new Date(), "", [], [], []),
      ];
    },
  },
};

// Mock della funzione `extractProductNames`
function extractProductNames(message: Message, allProducts: GeneralProductInfo): string[] | null {
  const question = message.getQuestion().toLowerCase();
  const productNames = allProducts.getNames().filter((name) =>
    question.includes(name.toLowerCase())
  );
  return productNames.length > 0 ? productNames : null;
}

// Test principale
Deno.test("Integration Test: Analyze message function should calculate average words and word counts", async () => {
  // Arrange
  const allProducts = await mockServices.getAllProductUseCase.getAllProduct();
  const messages = await mockServices.obtainAllMessagesUseCase.obtainAllMessages();

  const names = allProducts.getNames();
  const ids = allProducts.getIds();
  const vocabulary = names.map((name, i) => ({
    nome: name.toLowerCase(),
    id: ids[i].toString().toLowerCase(),
  }));

  const wordCounts: { [word: string]: number } = {};
  let totalWords = 0;

  // Act
  for (const message of messages) {
    const lowerCaseMessage = message.getQuestion().toLowerCase();
    const words = lowerCaseMessage.split(/\W+/);
    totalWords += words.length;

    const extractedProductNames = extractProductNames(message, allProducts);
    if (extractedProductNames) {
      for (const extractedProductName of extractedProductNames) {
        wordCounts[extractedProductName.toLowerCase()] =
          (wordCounts[extractedProductName.toLowerCase()] || 0) + 1;
      }
    } else {
      vocabulary.forEach((vocabularyElem) => {
        if (
          lowerCaseMessage.includes(vocabularyElem.nome) ||
          lowerCaseMessage.includes(vocabularyElem.id)
        ) {
          wordCounts[vocabularyElem.nome] =
            (wordCounts[vocabularyElem.nome] || 0) + 1;
        }
      });
    }
  }

  const averageWords = totalWords / messages.length;
  const sortedWords = Object.keys(wordCounts)
    .map((word) => ({ word: word, count: wordCounts[word] }))
    .sort((a, b) => b.count - a.count);

  // Assert
  assertEquals(averageWords, 5.333333333333333); // Media delle parole per messaggio
  assertEquals(sortedWords, [
    { word: "product 1", count: 1 },
    { word: "special product", count: 1 },
    { word: "product 2", count: 1 },
  ]); // Occorrenze delle parole
});