import { ObtainSimilarChunkPort } from "../ports/obtainSimilarChunkPort.ts";
import { Message } from "../models/chat.ts";
import { Document, Chunk } from "../models/document.ts";

export class ObtainSimilarChunkUseCase implements ObtainSimilarChunkPort {
    constructor(private obtainSimilarChunkPort: ObtainSimilarChunkPort) { }

    public async obtainSimilarChunk(message: Message, documents: Document[], nChunk: number): Promise<Chunk[]> {
        try {
            return await this.obtainSimilarChunkPort.obtainSimilarChunk(message, documents, nChunk);
        } catch (error) {
            throw error;
        }
    }
}
