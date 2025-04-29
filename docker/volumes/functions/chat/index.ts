import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { OpenAI } from "npm:openai";
import { GeneralAnswerGenerator } from "../template/GeneralAnswerGenerator.ts";
import { TechnicalAnswerGenerator } from "../template/TechnicalAnswerGenerator.ts";
import { DifferenceAnswerGenerator } from "../template/DifferenceAnswerGenerator.ts";
import { dependencyInjection } from "../utils/dependency_injection.ts";
import { Message, Chat } from "../models/chat.ts";
import { AIPrompt } from "../models/aiPrompt.ts";
import { AIAnswer } from "../models/aiAnswer.ts";

async function getTypeOfQuestion(question: string) {
  let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: "You are a strict classification robot. Follow these steps:" + 
        "Analyze the user's question," +
        "Apply these categories:" +
        "1 Tecnical Request (specific technical info about a product)" +
        "2 General Request (configurations, instructions, single product info)" +
        "3 Difference Request (explicit comparisons between ≥2 products)" +
        "Enforce STRICT RULES:" +
        "- FORBIDDEN to add explanations" +
        "- FORBIDDEN to use full sentences" +
        "- ONLY respond with 1 or 2  " +
        "- ERROR state if rules are violated" +
        "Examples of VALID responses:" +
        "User: Come configuro il prodotto A? → 2" +
        "User: Come collego in zigbee il prodotto B? → 2" +
        "User: Termostato a rotelle vs Attuatore connesso → 3" +
        "User: Differenze tra prodotto X e Y → 3" +
        "User: Dimmi i voltaggi del prodotto X → 1" +
        "User: Dimmi la potenza dissipata del prodotto Z? → 1"
        
    },
    {
      role: 'user',
      content: "Current input to classify: " + question,
    }
  ];

  let prompt: AIPrompt = new AIPrompt(messages);
  let response: AIAnswer = await services.generateAnswerUseCase.generateAnswer(prompt);
  
  let classification;
  try {
    console.log("Response:", response);
    classification = parseInt(removeThinkTag(response.getAnswer()));
    if (isNaN(classification)) {
      throw new Error('Invalid classification value');
    }
    return classification;
  } catch (error) {
    console.error('Error parsing classification:', error);
    return 3;
  }
}

function removeThinkTag(text) {
  // Regex per trovare il tag <think> e tutto il suo contenuto
  return text.replace(/^[\s\S]*?<\/think>\n*/, '');
}

const services = dependencyInjection();

Deno.serve(async (req) => {
    try {
      const authorization = req.headers.get('Authorization');

      if (!authorization) {
        return new Response(
          JSON.stringify({ error: `No authorization header passed` }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      //input
      let { question, id,  chat_id } = await req.json();
      let message: Message = new Message(id, chat_id, question, new Date(), '', [], [], []);
      console.log("Messsage language", message.getLanguage());
      let chat = await services.getHistoryUseCase.getHistory(new Chat(chat_id, [message]));
      console.log(chat);
      let answer;

      let typeOfQuestion = await getTypeOfQuestion(question);
      console.log("typeOfQuestion", typeOfQuestion);
      chat.getLastMessage().setTypeOfQuestion(typeOfQuestion);
      if (typeOfQuestion === 1) {
        //Techical Request
        const generator = new TechnicalAnswerGenerator(services);
        let response = await generator.generateAnswer(chat);
        answer = response;
      } else if (typeOfQuestion === 2) {
        //General Request
        const generator = new GeneralAnswerGenerator(services);
        let response = await generator.generateAnswer(chat);
        answer = response;
      } else if (typeOfQuestion === 3) {
        //Difference Request
        const generator = new DifferenceAnswerGenerator(services);
        let response = await generator.generateAnswer(chat);
        answer = response;  
      }      

      if (answer) {
        return new Response(
          JSON.stringify({ 'result': answer }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response('Internal Server Error', { status: 500 });
    } catch (error) {
        console.error('Error handling request:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
})
