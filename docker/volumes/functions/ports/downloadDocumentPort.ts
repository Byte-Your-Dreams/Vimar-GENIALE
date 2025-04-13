import { Document } from "../models/document.ts";

export interface DownloadDocumentPort {
    downloadDocument(document: Document): Promise<Blob>;
}