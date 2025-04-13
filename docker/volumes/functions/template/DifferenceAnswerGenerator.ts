import { Message } from "../models/chat.ts";
import { Product } from "../models/product.ts";
import { Document, Chunk } from "../models/document.ts";
import { AIPrompt } from "../models/aiPrompt.ts";
import { OpenAI} from 'npm:openai';
import { AbstractGenerator } from "./AbstractGenerator.ts";


export class DifferenceAnswerGenerator extends AbstractGenerator {

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