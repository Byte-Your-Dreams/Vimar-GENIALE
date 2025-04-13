import { ChunkRepository } from "../repositories/chunkRepository.ts";
//ports
import { UpsertChunkPort } from "../ports/upsertChunkPort.ts";
import { RemoveExtraChunkPort } from "../ports/removeExtraChunk.ts";
import { ObtainSimilarChunkPort } from "../ports/obtainSimilarChunkPort.ts";

//models
import { Chunk, Document } from "../models/document.ts";
import { Message } from "../models/chat.ts";
import { DBInsertResponse } from "../models/dbInsertResponse.ts";

//entities
import { SupabaseChunk, SupabaseDocument } from "../entities/supabaseDocument.ts";
import { SupabaseInsertResponse } from "../entities/SupabaseInsertResponse.ts";
import { SupabaseMessage } from "../entities/supabaseChat.ts";

export class ChunkAdapter implements UpsertChunkPort, RemoveExtraChunkPort, ObtainSimilarChunkPort {
    constructor(private repository: ChunkRepository) { }

    public async obtainSimilarChunk(message: Message, documents: Document[], nChunk: number): Promise<Chunk[]> {
        let supabaseMessage = this.convertMessageToSupabaseMessage(message);
        let supabaseDocuments: SupabaseDocument[] = [];
        documents.forEach(doc => supabaseDocuments.push(this.convertDocumentToSupabaseDocument(doc)));
        let supabaseChunk = await this.repository.obtainSimilarChunk(supabaseMessage, supabaseDocuments, nChunk);

        let chunks: Chunk[] = [];
        supabaseChunk.forEach(chunk => chunks.push(this.convertSupabaseChunkToChunk(chunk)));
        return chunks;
    }

    public async upsertChunk(chunk: Chunk): Promise<DBInsertResponse> {
        let supabaseChunk = this.convertChunkToSupabaseChunk(chunk);
        let supabaseInsertResponse = await this.repository.upsertChunk(supabaseChunk);
        return this.convertSupabaseInsertResponseToDBInsertResponse(supabaseInsertResponse);
    }

    public async removeExtraChunk(document: Document): Promise<DBInsertResponse> {
        let supabaseDocument: SupabaseDocument = this.convertDocumentToSupabaseDocument(document);
        let supabaseInsertResponse = await this.repository.removeExtraChunk(supabaseDocument);
        return this.convertSupabaseInsertResponseToDBInsertResponse(supabaseInsertResponse);
    }

    private convertMessageToSupabaseMessage(message: Message): SupabaseMessage {
        return new SupabaseMessage(message.getID(), message.getChatID(), message.getQuestion(), message.getDate(), message.getProductNames(), message.getProductIDs(), message.getEmbedding(), message.getAnswer());
    }

    private convertDocumentToSupabaseDocument(document: Document): SupabaseDocument {
        return new SupabaseDocument(document.getName(), document.getId(), document.getUpdatedAt(), document.getCreatedAt(), document.getLastAccessedAt(), document.getMetadata(), document.getBlobData(), document.getUrl(), document.getNChunks());
    }
    
    private convertChunkToSupabaseChunk(chunk: Chunk): SupabaseChunk {
        return new SupabaseChunk(chunk.getContent(), chunk.getDocument(), chunk.getNumber(), chunk.getEmbedding());
    }
    
    private convertSupabaseChunkToChunk(supabaseChunk: SupabaseChunk): Chunk {
        return new Chunk(supabaseChunk.getContent(), supabaseChunk.getDocument(), supabaseChunk.getNumber(), supabaseChunk.getEmbedding());
    }

    private convertSupabaseInsertResponseToDBInsertResponse(supabaseInsertResponse: SupabaseInsertResponse): DBInsertResponse {
        return new DBInsertResponse(supabaseInsertResponse.getSuccess(), supabaseInsertResponse.getAnswer());
    }
}