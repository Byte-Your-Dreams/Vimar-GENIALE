import { SupabaseClient } from "jsr:@supabase/supabase-js";
import { SupabaseDocument, SupabaseChunk } from "../entities/supabaseDocument.ts";
import { SupabaseMessage } from "../entities/supabaseChat.ts";
import { SupabaseInsertResponse } from "../entities/SupabaseInsertResponse.ts";

export class ChunkRepository {

    constructor(private readonly client: SupabaseClient) { }

    public async obtainSimilarChunk(message: SupabaseMessage, documents: SupabaseDocument[], nChunk: number): Promise<SupabaseChunk[]> {
        const { data, error } = await this.client.rpc('match_manuale', {
            query_text: message.getQuestion(),
            query_embedding: message.getEmbedding(),
            documents: documents.map((doc: SupabaseDocument) => doc.getName()),
            match_count: nChunk
        });
        if (error) {
            throw new Error(error.message);
        }
        if (!data || data.length === 0) {
            throw new Error('No data found');
        }
        return data.map((chunk: any) => new SupabaseChunk(chunk));
    }

    public async upsertChunk(chunk: SupabaseChunk): Promise<SupabaseInsertResponse> {
        console.log(`[deleteExtraChunk] Deleting extra chunk - Manual: ${chunk.getDocument()}, Chunk: ${chunk.getNumber()}`);
        const { error } = await this.client.from('manuale_sezione').upsert({ 'manuale': chunk.getDocument(), 'nchunk': chunk.getNumber(), 'contenuto': chunk.getContent(), 'embedding': chunk.getEmbedding() }).select();
        if (error) {
            console.error(`[deleteExtraChunk] Error deleting extra chunk: ${error.message}`);
            return new SupabaseInsertResponse(false, error.message);
        }
        console.log('[deleteExtraChunk] Successfully deleted extra chunk');
        return new SupabaseInsertResponse(true, 'Insert successful');
    }

    public async removeExtraChunk(document: SupabaseDocument): Promise<SupabaseInsertResponse> {
        console.log(`[deleteExtraChunk] Deleting extra chunk - Manual: ${document.getName()}`);
        const { error } = await this.client.from('manuale_sezione').delete().eq('manuale', document.getUrl()).gt('nchunk', document.getNChunks());
        if (error) {
            console.error(`[deleteExtraChunk] Error deleting extra chunk: ${error.message}`);
            return new SupabaseInsertResponse(false, error.message);
        }
        console.log('[deleteExtraChunk] Successfully deleted extra chunk');
        return new SupabaseInsertResponse(true, 'Delete successful');
    }
}