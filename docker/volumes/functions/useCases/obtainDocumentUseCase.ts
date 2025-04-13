import { ObtainDocumentPort } from "../ports/obtainDocumentPort.ts";
import { Document } from "../models/document.ts";

export class ObtainDocumentUseCase {
    constructor(private obtainDocumentPort: ObtainDocumentPort) { }

    public async obtainDocument(document: Document): Promise<Document> {
        try {
            return await this.obtainDocumentPort.obtainDocument(document);
        }
        catch (error) {
            throw error;
        }
    }
}