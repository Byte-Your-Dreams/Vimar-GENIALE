import { UpsertChunkPort } from "../ports/upsertChunkPort.ts";

import { DBInsertResponse } from "../models/dbInsertResponse.ts";
import { Chunk } from "../models/document.ts";

export class UpsertChunkUseCase {
    constructor(private upsertChunkPort: UpsertChunkPort) { }

    public async upsertChunk(chunk: Chunk): Promise<DBInsertResponse> {
        try {
            return await this.upsertChunkPort.upsertChunk(chunk);
        } catch (error) {
            throw error;
        }
    }
}