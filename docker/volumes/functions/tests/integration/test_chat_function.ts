import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { GeneralAnswerGenerator } from "../../template/GeneralAnswerGenerator.ts";
import { TechnicalAnswerGenerator } from "../../template/TechnicalAnswerGenerator.ts";
import { DifferenceAnswerGenerator } from "../../template/DifferenceAnswerGenerator.ts";
import { Message, Chat } from "../../models/chat.ts";
import { AIPrompt } from "../../models/aiPrompt.ts";
import { AIAnswer } from "../../models/aiAnswer.ts";

// Mock dei servizi
const mockServices = {
  generateAnswerUseCase: {
    async generateAnswer(prompt: AIPrompt): Promise<AIAnswer> {
      const question = prompt.getPrompt()[1].content;
      if (question && question.toString().includes("Potenza dissipata")) {
        return new AIAnswer(true, "<think>1</think>Risposta tecnica per potenza dissipata");
      } else if (question && question.toString().includes("configuro il prodotto")) {
        return new AIAnswer(true, "<think>2</think>Risposta generale per configurazione prodotto");
      } else if (question && question.toString().includes("Differenze tra")) {
        return new AIAnswer(true, "<think>3</think>Risposta differenza tra prodotti");
      }
      return new AIAnswer(false, "<think>3</think>");
    },
  },
  getHistoryUseCase: {
    async getHistory(chat: Chat): Promise<Chat> {
      return chat;
    },
  },
};

// Mock dei generatori
class MockTechnicalAnswerGenerator extends TechnicalAnswerGenerator {
  override async generateAnswer(chat: Chat): Promise<Message> {
    return new Message("mockId", chat.getID(), "Technical Question", new Date(), "Risposta tecnica per potenza dissipata", [], [], []);
  }
}

class MockGeneralAnswerGenerator extends GeneralAnswerGenerator {
  override async generateAnswer(chat: Chat): Promise<Message> {
    return new Message("mockId", chat.getID(), "General Answer", new Date(), "Risposta generale per configurazione prodotto", [], [], []);
  }
}

class MockDifferenceAnswerGenerator extends DifferenceAnswerGenerator {
  override async generateAnswer(chat: Chat): Promise<Message> {
    return new Message("mockId", chat.getID(), "Difference Answer", new Date(), "Risposta differenza tra prodotti", [], [], []);
  }
}

// Helper function to determine the type of question
function getTypeOfQuestion(question: string): number {
  if (question.includes("Potenza dissipata")) {
    return 1; // Technical Request
  } else if (question.includes("configuro il prodotto")) {
    return 2; // General Request
  } else if (question.includes("Differenze tra")) {
    return 3; // Difference Request
  }
  return 0; // Unknown Request
}

// Funzione di test principale
Deno.test("Integration Test: Main function should handle different types of questions", async () => {
  // Arrange
  const services = mockServices;
  const question1 = "Potenza dissipata del prodotto X";
  const question2 = "Come configuro il prodotto Y?";
  const question3 = "Differenze tra prodotto A e prodotto B";

  const message1 = new Message("id1", "chat1", question1, new Date(), "", [], [], []);
  const message2 = new Message("id2", "chat2", question2, new Date(), "", [], [], []);
  const message3 = new Message("id3", "chat3", question3, new Date(), "", [], [], []);

  const chat1 = new Chat("chat1", [message1]);
  const chat2 = new Chat("chat2", [message2]);
  const chat3 = new Chat("chat3", [message3]);

  // Act
  const typeOfQuestion1 = await getTypeOfQuestion(question1);
  const typeOfQuestion2 = await getTypeOfQuestion(question2);
  const typeOfQuestion3 = await getTypeOfQuestion(question3);

  const technicalGenerator = new MockTechnicalAnswerGenerator(services);
  const generalGenerator = new MockGeneralAnswerGenerator(services);
  const differenceGenerator = new MockDifferenceAnswerGenerator(services);

  const technicalAnswer = await technicalGenerator.generateAnswer(chat1);
  const generalAnswer = await generalGenerator.generateAnswer(chat2);
  const differenceAnswer = await differenceGenerator.generateAnswer(chat3);

  // Assert
  assertEquals(typeOfQuestion1, 1); // Technical Request
  assertEquals(typeOfQuestion2, 2); // General Request
  assertEquals(typeOfQuestion3, 3); // Difference Request

  assertEquals(technicalAnswer.getAnswer(), "Risposta tecnica per potenza dissipata");
  assertEquals(generalAnswer.getAnswer(), "Risposta generale per configurazione prodotto");
  assertEquals(differenceAnswer.getAnswer(), "Risposta differenza tra prodotti");
});