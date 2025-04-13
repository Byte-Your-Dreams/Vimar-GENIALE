import { Chunk, Document } from "../models/document.ts";
import { Message } from "../models/chat.ts";

export interface ObtainSimilarChunkPort {
    obtainSimilarChunk(message: Message, documents: Document[], nChunk: number): Promise<Chunk[]>
}