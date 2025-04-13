import { RemoveExtraChunkPort } from "../ports/removeExtraChunk.ts";

import { DBInsertResponse } from "../models/dbInsertResponse.ts";
import { Document } from "../models/document.ts";

export class RemoveExtraChunkUseCase {
    constructor(private removeExtraChunkPort: RemoveExtraChunkPort) {}

    public async removeExtraChunk(document: Document): Promise<DBInsertResponse> {
        try {
            return await this.removeExtraChunkPort.removeExtraChunk(document);
        } catch (error) {
            throw error;
        }
    }
}