import { DownloadDocumentPort } from "../ports/downloadDocumentPort.ts";
import { Document } from "../models/document.ts";

export class DownloadDocumentUseCase {
    constructor(private downloadDocumentPort: DownloadDocumentPort) { }

    public async downloadDocument(document: Document): Promise<Blob> {
        try {
            return await this.downloadDocumentPort.downloadDocument(document);
        }
        catch (error) {
            throw error;
        }
    }
}