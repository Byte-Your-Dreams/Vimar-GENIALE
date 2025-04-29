import { Message } from "../models/chat.ts";
import { Product } from "../models/product.ts";
import { Document, Chunk } from "../models/document.ts";
import { Chat } from "../models/chat.ts";
import { AIPrompt } from "../models/aiPrompt.ts";
import { OpenAI} from 'npm:openai';
import { AbstractGenerator } from "./AbstractGenerator.ts";


export class DifferenceAnswerGenerator extends AbstractGenerator {
    protected async reformulateQuestion(chat: Chat): Promise<Message> {
        if (!chat.getMessages() || chat.getMessages().length === 1) {
            throw new Error('No history found');
        }
        
        let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{
            role: 'system',
            content: "YOU ARE A QUESTION REFORMULATOR. STRICT RULES:1. NEVER answer the question 2. ALWAYS maintain original language 3. REFORMAT references using chat history 4. OUTPUT FORMAT: 'REFORMULATED: [standalone_question]. 5. The question must indicate the complete products names or codes of all products, they could be more then one'" 
        }];

        for (const message of chat.getMessages()) {
            if (message.getAnswer()) {
                messages.push({ role: 'user', content: message.getQuestion()});
                messages.push({ role: 'assistant', content: message.getAnswer()});
            } else {
                messages.push({ role: 'user', content: "RIFORMULA QUESTA DOMANDA BASANDOTI SULLA CRONOLOGIA:" + message.getQuestion() + ". 1. Non aggiungere note o spiegazioni 2. Mantieni la lingua originale 3. Rispondi SOLO con la domanda riformulata 4. Formato:'RIFORMULATO: [testo]'. 5. La domanda riformulata deve contenere i nomi completi o i codici dei prodotti citati 6.La domanda deve contenere almeno 2 nomi di prodotti o 2 id." });
            }
        }

        const response = await this.services.generateAnswerUseCase.generateAnswer(new AIPrompt(messages));
        if (!response.getSuccess()) {
            throw new Error('Answer not found');
        }
        let lastMessage: Message = chat.getLastMessage();
        lastMessage.setQuestion(this.removeThinkTag(response.getAnswer()));
        console.log(lastMessage);
        return lastMessage;
        console.log(lastMessage);
    }
    protected async getContext(message: Message, products: Product[]): Promise<string> {
        let documents: Document[] = await this.services.getDocumentsUseCase.getDocuments(products[0]);

        const chunk: Chunk[] = await this.services.obtainSimilarChunk.obtainSimilarChunk(message, documents, 5);

        let context:string= "";
        if(!chunk) {
            return "No context available";
        } else {
            chunk.forEach((c: Chunk) => {
                context += c.getContent() + "\n\n";
            });
        }

        return context;
    }

    protected generatePrompt(message: Message, context: string, products: Product[]): AIPrompt {
        let finalQuery = message.getQuestion() + "\n\n ###Products:\n";
        const language = message.getLanguage();
        for (const product of products) {
            console.log(`[DifferenceAnswerGenerator.getAnswer] Adding product details to query: ${product.getName()}`);
            finalQuery += "- **" + product.getName() + "**\n" +
                "  - **Description:** " + product.getDescription() + "\n" +
                "  - **ETIM:** " + product.getEtim() + "\n";
        }
        
        console.log('[DifferenceAnswerGenerator.getAnswer] Creating prompt for LLM');
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                "role": "system",
                "content": "System Role Configuration" +
                            "Role: Product Comparison Assistant" +
                            "Audience: Technical professionals evaluating products" +
            
                            "Operational Constraints" +
                            "Response Requirements:" +
                            "Strict 200-word limit" +
                            "IMPORTANT Respond only in " + language +
                            "Use only verified technical data from provided sources" +
            
                            "Content Restrictions:" +
                            "Blocked topics:" +
                            "• Political content" +
                            "• Sexual/relationship discussions" +
                            "• Violent/war-related material" +
                            "• Vulgar/offensive language" +
            
                            "Security Protocols" +
                            "Immediate termination on:" +
                            "∘ Reverse engineering attempts" +
                            "∘ Proprietary method inquiries" +
                            "∘ Regulatory compliance discussions" +
            
                            "[SYSTEM_NOTE: Maintain professional and technical tone. Prioritize objective, data-driven comparisons. Never assume unspecified product attributes.]" 
            },
            { "role": "user", "content": finalQuery },
        ];

        return new AIPrompt(messages);
    }
}