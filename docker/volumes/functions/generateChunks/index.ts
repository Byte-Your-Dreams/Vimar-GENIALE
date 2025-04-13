import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import pdfParse from "npm:pdf-parse";

import { Chunk, Document } from "../models/document.ts";
import { dependencyInjection } from "./../utils/dependency_injection.ts";
import { AIQuestion } from "../models/aiQuestion.ts";
import { TextProcessor } from "../utils/textProcessor.ts";

const services = dependencyInjection();


Deno.serve(async (req) => {
    try {
        const authorization = req.headers.get('Authorization');
        if (!authorization) {
            return new Response(
                JSON.stringify({ error: `No authorization header passed` }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        let { link, nome, objID } = await req.json()
        //lista i file nello storage
        let doc = new Document(nome, objID);
        console.log('INPUT DOC:', doc);
        doc = await services.obtainDocumentUseCase.obtainDocument(doc);
        console.log('OUTPUT DOC:', doc);
        doc.setUrl(link);
        console.log('OUTPUT DOC WITH URL:', doc);

        if (!doc) {
            throw new Error(`No document found with id ${objID}`);
        }
        // Scarica il PDF
        const pdfFile = await services.downloadDocumentUseCase.downloadDocument(doc);
        doc.setBlobData(pdfFile);
        if (!pdfFile) {
            throw new Error(`Error downloading ${doc.getName()}`);
        }

        const processor = new TextProcessor();

        // Estrai il testo
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdfData = await pdfParse(arrayBuffer);
        const pages = pdfData.text.split('\n\n');

        // Elabora e chunking
        const chunks = await processor._cleanAndChunk(pages);
        let n_chunks = 0;
        for (const chunk of chunks) {
            const embed = await services.generateEmbeddingUseCase.generateEmbedding(new AIQuestion(chunk));
            if (!embed.getSuccess()) {
                throw new Error(`Error generating embedding for chunk ${n_chunks} for ${doc.getName()}`);
            }
            const chunkToPush = new Chunk(chunk, link, n_chunks, embed.getEmbedding());

            const upsert = await services.upsertChunkUseCase.upsertChunk(chunkToPush);
            
            if (!upsert.getSuccess()) {
                throw new Error(`Error inserting chunk ${chunkToPush.getNumber()} for ${chunkToPush.getDocument()}`);
            }
            n_chunks++;
        }

        doc.setNChunks(n_chunks);
        console.log('OUTPUT DOC WITH NCHUNKS:', doc);
        const removedExtraChunk = await services.removeExtraChunkUseCase.removeExtraChunk(doc);

        if (!removedExtraChunk.getSuccess()) {
            throw new Error(`Error deleting extra chunk for ${doc.getName()}`);
        }

        return new Response(
            JSON.stringify({
                result: 'ok'
            }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error handling request:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

});