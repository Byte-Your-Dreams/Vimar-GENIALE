import {OpenAI} from 'npm:openai';
import { createClient } from 'npm:@supabase/supabase-js';
// use cases
import { GenerateAnswerUseCase } from '../useCases/generateAnswerUseCase.ts';
import { GenerateEmbeddingUseCase } from '../useCases/generateEmbeddingUseCase.ts';
import { GetAllProductUseCase } from '../useCases/getAllProductUseCase.ts';
import { GetDocumentsUseCase } from '../useCases/getDocumentsUseCase.ts';
import { GetProductUseCase } from '../useCases/getProductUseCase.ts';
import { GetHistoryUseCase } from '../useCases/getHistoryUseCase.ts';
import { UpdateMessageUseCase } from '../useCases/updateMessageUseCase.ts';
import { ObtainDocumentUseCase } from '../useCases/obtainDocumentUseCase.ts';
import { DownloadDocumentUseCase } from '../useCases/downloadDocumentUseCase.ts';
import { ObtainSimilarChunkUseCase } from '../useCases/obtainSimilarChunkUseCase.ts';
import { UpsertChunkUseCase } from '../useCases/upsertChunkUseCase.ts';
import { RemoveExtraChunkUseCase } from '../useCases/removeExtraChunkUseCase.ts';
import { ObtainAllMessagesUseCase } from '../useCases/obtainAllMessagesUseCase.ts';

// adapters
import { ProductAdapter } from '../adapters/productAdapter.ts';
import { DocumentAdapter } from '../adapters/documentAdapter.ts';
import { ChunkAdapter } from '../adapters/chunkAdapter.ts';
import { MessageAdapter } from '../adapters/messageAdapter.ts';
import { AnswerAdapter } from '../adapters/answerAdapter.ts';
import { EmbeddingAdapter } from '../adapters/embeddingAdapter.ts';
// repositories
 import { ProductRepository } from '../repositories/productRepository.ts';
import { AnswerRepository } from '../repositories/answerRepository.ts';
import { EmbeddingRepository } from '../repositories/embeddingRepository.ts';
import { ChunkRepository } from '../repositories/chunkRepository.ts';
import { DocumentRepository } from '../repositories/documentRepository.ts';
import { MessageRepository } from '../repositories/messageRepository.ts';

export function dependencyInjection(){
    try {

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseAnonKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error("Missing environment variables for Supabase");
        }

        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

        const productRepository = new ProductRepository(supabaseClient);
        const chunkRepository = new ChunkRepository(supabaseClient);
        const messageRepository = new MessageRepository(supabaseClient);
        const documentRepository = new DocumentRepository(supabaseClient);

        const productAdapter = new ProductAdapter(productRepository);
        const chunkAdapter = new ChunkAdapter(chunkRepository);
        const messageAdapter = new MessageAdapter(messageRepository);
        const documentAdapter = new DocumentAdapter(documentRepository);

        // products
        const getProductUseCase = new GetProductUseCase(productAdapter);
        const getAllProductUseCase = new GetAllProductUseCase(productAdapter);

        // chunks
        const obtainSimilarChunkUseCase = new ObtainSimilarChunkUseCase(chunkAdapter);
        const upsertChunkUseCase = new UpsertChunkUseCase(chunkAdapter);
        const removeExtraChunkUseCase = new RemoveExtraChunkUseCase(chunkAdapter);

        //documents
        const getDocumentsUseCase = new GetDocumentsUseCase(documentAdapter);
        const obtainDocumentUseCase = new ObtainDocumentUseCase(documentAdapter);
        const downloadDocumentUseCase = new DownloadDocumentUseCase(documentAdapter);

        //message
        const getHistoryUseCase = new GetHistoryUseCase(messageAdapter);
        const updateMessageUseCase = new UpdateMessageUseCase(messageAdapter);
        const obtainAllMessagesUseCase = new ObtainAllMessagesUseCase(messageAdapter);


        // init ollama
        if (!Deno.env.get('OLLAMA_API_URL') || !Deno.env.get('OLLAMA_API_KEY') || !Deno.env.get('LLM_GENERATION_MODEL') || !Deno.env.get('LLM_EMBEDDING_MODEL')) {
            throw new Error('ENV is not set');
        }
        const ollamaClient = new OpenAI({
            baseURL: Deno.env.get('OLLAMA_API_URL'),
            apiKey: Deno.env.get('OLLAMA_API_KEY')
        });

        const answerRepository = new AnswerRepository(ollamaClient, Deno.env.get('LLM_GENERATION_MODEL') ?? 'llama2', Deno.env.get('LLM_EMBEDDING_MODEL') ?? 'llama2');
        const embeddingRepository = new EmbeddingRepository(ollamaClient, Deno.env.get('LLM_EMBEDDING_MODEL'));
        const ollamaAdapter = new AnswerAdapter(answerRepository);
        const embeddingAdapter = new EmbeddingAdapter(embeddingRepository);
        const generateEmbeddingUseCase = new GenerateEmbeddingUseCase(embeddingAdapter);
        const generateAnswerUseCase = new GenerateAnswerUseCase(ollamaAdapter);

        const services = {
            "getAllProductUseCase": getAllProductUseCase,
            "getProductUseCase": getProductUseCase,
            "getDocumentsUseCase": getDocumentsUseCase,
            "getHistoryUseCase": getHistoryUseCase,
            "obtainAllMessagesUseCase": obtainAllMessagesUseCase,
            "obtainSimilarChunkUseCase": obtainSimilarChunkUseCase,
            "updateMessageUseCase": updateMessageUseCase,
            "obtainDocumentUseCase": obtainDocumentUseCase,
            "downloadDocumentUseCase": downloadDocumentUseCase,
            "upsertChunkUseCase": upsertChunkUseCase,
            "removeExtraChunkUseCase": removeExtraChunkUseCase,
            "generateEmbeddingUseCase": generateEmbeddingUseCase,
            "generateAnswerUseCase": generateAnswerUseCase
        };
        return services;
    } catch (error) {
        throw error;
    }
    
}
