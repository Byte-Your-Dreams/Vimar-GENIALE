import { Document } from "../models/document.ts";
import { DBInsertResponse } from "../models/dbInsertResponse.ts";

export interface RemoveExtraChunkPort {
    removeExtraChunk(document: Document): Promise<DBInsertResponse>;
}