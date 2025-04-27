import { OpenAI } from 'npm:openai';

import { GenerateAnswerUseCase } from '../useCases/generateAnswerUseCase.ts';
import { GenerateEmbeddingUseCase } from '../useCases/generateEmbeddingUseCase.ts';
import { GetAllProductUseCase } from '../useCases/getAllProductUseCase.ts';
import { GetProductUseCase } from '../useCases/getProductUseCase.ts';
import { GetDocumentsUseCase } from '../useCases/getDocumentsUseCase.ts';
import { GetHistoryUseCase } from '../useCases/getHistoryUseCase.ts';
import { ObtainSimilarChunkUseCase } from '../useCases/obtainSimilarChunkUseCase.ts';
import { UpdateMessageUseCase } from '../useCases/updateMessageUseCase.ts';

import { Product } from '../models/product.ts';
import { GeneralProductInfo } from '../models/generalProductInfo.ts';
import { Chat, Message } from '../models/chat.ts';
import { AIQuestion } from '../models/aiQuestion.ts';
import { AIEmbedding } from '../models/aiEmbedding.ts';
import { Document } from '../models/document.ts';
import { DBInsertResponse } from '../models/dbInsertResponse.ts';
import { AIAnswer } from '../models/aiAnswer.ts';
import { AIPrompt } from '../models/aiPrompt.ts';

export abstract class AbstractGenerator {
    constructor( protected services: any) { }
    public async generateAnswer(chat: Chat): Promise<Message> {

        try {
            let allProducts: GeneralProductInfo;
            try {
                allProducts = await this.services.getAllProductUseCase.getAllProduct();
            } catch (error) {
                console.error('[generateAnswer] Error fetching all products:', error);
                throw new Error('Error fetching all products');
            }

            if (!allProducts) {
                throw new Error('No products found');
            }

            // Extraction of product names and IDs
            let lastMessage: Message = chat.getLastMessage();
            let response: DBInsertResponse;
            lastMessage.setProductNames(this.extractProductNames(chat.getLastMessage(), allProducts) || []);
            lastMessage.setProductIDs(this.extractProductID(chat.getLastMessage(), allProducts) || []);
            for (let i = 0; (i < 10 && lastMessage.getProductNames().length === 0 && lastMessage.getProductIDs().length === 0); i++) {
                //let completeChat = await this.getHistoryUseCase.getHistory(chat.getID());
                //if (!completeChat) {
                //    throw new Error('No history found');
                //}

                //let completeChatType = new Chat(chat.getID(), chat.getMessages());

                lastMessage = await this.reformulateQuestion(chat);
                lastMessage.setProductNames(this.extractProductNames(lastMessage, allProducts) || []);
                lastMessage.setProductIDs(this.extractProductID(lastMessage, allProducts) || []);
            }

            if (lastMessage.getProductNames().length === 0 && lastMessage.getProductIDs().length === 0) {
                lastMessage.setAnswer("Non sono riuscito a trovare i prodotti di cui stai parlando. Prova a riformulare la domanda.");
                response = await this.saveMessage(lastMessage);
                if (!response.getSuccess()) {
                    throw new Error('Message not saved');
                }
                return lastMessage;
            }

            let products: Product[] = await this.getProducts(lastMessage);
            if (!products) {
                lastMessage.setAnswer("Non sono riuscito a trovare i prodotti di cui stai parlando. Prova a riformulare la domanda.");
                response = await this.saveMessage(lastMessage);
                if (!response.getSuccess()) {
                    throw new Error('Message not saved');
                }
                return lastMessage;
            }

            let question: AIQuestion = new AIQuestion(lastMessage.getQuestion());
            let questionEmbedding: AIEmbedding = await this.getQueryEmbedding(question);
            if (questionEmbedding.getSuccess() === false) {
                throw new Error('Embedding not found');
            }
            lastMessage.setEmbedding(questionEmbedding.getEmbedding());

            let context: string = await this.getContext(lastMessage, products);
            if (!context || context === '') {
                lastMessage.setAnswer("Non trovo materiale sul prodotto di cui parli. Riprova più tardi.");
                response = await this.saveMessage(lastMessage);
                if (!response.getSuccess()) {
                    throw new Error('Message not saved');
                }
                return lastMessage;
            }

            let prompt: AIPrompt = this.generatePrompt(lastMessage, context, products);

            let answer = await this.services.generateAnswerUseCase.generateAnswer(prompt);
            if (!answer.getSuccess()) {
                lastMessage.setAnswer("C'è stato un problema nella generazione della risposta. Riprova più tardi.");
                response = await this.saveMessage(lastMessage);
                if (!response.getSuccess()) {
                    throw new Error('Message not saved');
                }
                return lastMessage;
            }

            lastMessage.setAnswer(this.removeThinkTag(answer.getAnswer()));
            console.log('[generateAnswer] Answer:', lastMessage);
            response = await this.saveMessage(lastMessage);
            if (!response.getSuccess()) {
                throw new Error('Message not saved');
            }

            return lastMessage;
        } catch (error) {
            let lastMessage = chat.getLastMessage();
            lastMessage.setAnswer("C'è stato un problema nella generazione della risposta. Riprova più tardi.");
            const response = await this.saveMessage(lastMessage);
            if (!response.getSuccess()) {
                throw new Error('Message not saved');
            }
            return lastMessage;
        }
    }

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
                messages.push({ role: 'user', content: "RIFORMULA QUESTA DOMANDA BASANDOTI SULLA CRONOLOGIA:" + message.getQuestion() + ". 1. Non aggiungere note o spiegazioni 2. Mantieni la lingua originale 3. Rispondi SOLO con la domanda riformulata 4. Formato:'RIFORMULATO: [testo]'. 5. La domanda riformulata deve contenere i nomi completi o i codici dei prodotti citati" });
            }
        }

        const response = await this.services.generateAnswerUseCase.generateAnswer(new AIPrompt(messages));
        if (!response.getSuccess()) {
            throw new Error('Answer not found');
        }
        let lastMessage: Message = chat.getLastMessage();
        lastMessage.setQuestion(this.removeThinkTag(response.getAnswer()));

        return lastMessage;
    }

    protected async getQueryEmbedding(question: AIQuestion): Promise<AIEmbedding> {
        const embed = await this.services.generateEmbeddingUseCase.generateEmbedding(question);
        return embed;
    }

    protected extractProductNames(message: Message, allProducts: GeneralProductInfo): string[] | null {
        try {
            const relevantProd: { name: string, percentage: number }[] = [];
    
            for (const productName of allProducts.getNames()) { // Usa allProducts.getNames() invece di message.getProductNames()
                const splittedProduct = productName.split(' ');
                let sum = 0;
                let den = 0;
    
                for (let i = 0; i < splittedProduct.length; i++) {
                    const elem = splittedProduct[i];
                    if (elem.length >= 4) {
                        den += splittedProduct.length - i;
                        if (message.getQuestion().toLowerCase().includes(elem.toLowerCase())) {
                            sum += splittedProduct.length - i;
                        }
                    }
                }
    
                const percentage = den > 0 ? (sum / den) * 100 : 0;
                relevantProd.push({ name: productName, percentage });

                if (percentage >= 50.00) {
                }
            }
    
            const topProducts = relevantProd
                .filter(prod => prod.percentage >= 65.00)
                .map(prod => prod.name);
    
            const uniqueProducts = new Set<string>();
            const finalProducts = topProducts.filter(product => {
                const baseName = product.split(' ').slice(0, 3).join(' ');
                return !uniqueProducts.has(baseName) && uniqueProducts.add(baseName);
            });
            return finalProducts.length > 0 ? finalProducts : null;
        } catch (e) {
            console.error('[extractProductNames] Error:', e);
            return null;
        }
    }

    protected extractProductID(message: Message, allProducts: GeneralProductInfo): string[] | null {
        const queryWords: string[] = message.getQuestion().toLowerCase().match(/\b\w+(?:\.\w+)?\b/g) || [];
        const ids: string[] = allProducts.getIds().filter(id => queryWords.includes(id.toLocaleLowerCase()));
        return ids.length > 0 ? ids : null;
    }

    protected async getProducts(message: Message): Promise<Product[]> {
        let products: Product[] = [];
        for (const productName of message.getProductNames()) {
            let product: Product = await this.services.getProductUseCase.getProduct(productName, null);
            products.push(product);
        }
        for (const productID of message.getProductIDs()) {
            let product: Product = await this.services.getProductUseCase.getProduct(null, productID);
            products.push(product);
        }
        return products;
    }

    protected abstract getContext(message: Message, products: Product[]): Promise<string>;

    protected abstract generatePrompt(message: Message, context: string, products: Product[]): AIPrompt;

    protected async getAnswer(prompt: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<string> {
        let aiPrompt: AIPrompt = new AIPrompt(prompt);
        let response: AIAnswer = await this.services.generateAnswerUseCase.generateAnswer(aiPrompt);
        return response.getAnswer();
    }

    protected async saveMessage(message: Message): Promise<DBInsertResponse> {
        const response: DBInsertResponse = await this.services.updateMessageUseCase.updateMessage(message);
        return response;
    }

    protected removeThinkTag(text: string): string {
        // Regex per trovare il tag <think> e tutto il suo contenuto
        return text.replace(/^[\s\S]*?<\/think>\n*/, '');
    }

}