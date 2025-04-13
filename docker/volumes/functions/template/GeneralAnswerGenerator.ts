import { Message } from "../models/chat.ts";
import { Product } from "../models/product.ts";
import { Document, Chunk } from "../models/document.ts";
import { AbstractGenerator } from "./AbstractGenerator.ts";
import { AIPrompt } from "../models/aiPrompt.ts";
import { OpenAI} from 'npm:openai';

export class GeneralAnswerGenerator extends AbstractGenerator {
    protected async getContext(message: Message, products: Product[]): Promise<string> {
        let documents: Document[] = await this.services.getDocumentsUseCase.getDocuments(products[0]);

        const chunk: Chunk[] = await this.services.obtainSimilarChunkUseCase.obtainSimilarChunk(message, documents, 5);

        let context: string = "";
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
        const product = products[0];
        const language = message.getLanguage();
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
        [
          {
            role: 'system',
            content:  "System Role Configuration"+
                      "Role: Electrical Installation Assistant" +
                      "Audience: Certified installers of VIMAR" +

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

                      "[SYSTEM_NOTE: Maintain professional technical tone. Prioritize installer safety information. Never assume unspecified installation conditions.]" + 

                      "Knowledge Base:" +
                      "ETIM Metadata:" + product.getEtim() +
                      "Technical Documents:" + context
          },
          {
            role: 'user',
            content: message.getQuestion(),
          },
        ];
        return new AIPrompt(messages);
    }
}