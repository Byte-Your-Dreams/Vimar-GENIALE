import { Document } from "../models/document.ts";

export interface ObtainDocumentPort {
    obtainDocument(document: Document): Promise<Document>;
}