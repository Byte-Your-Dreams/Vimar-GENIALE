import { DBInsertResponse } from "../models/dbInsertResponse.ts";
import { Chunk } from "../models/document.ts";

export interface UpsertChunkPort {
    upsertChunk(chunk: Chunk): Promise<DBInsertResponse>;
}