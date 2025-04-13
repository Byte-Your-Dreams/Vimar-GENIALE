import { GetDocumentsPort } from "../ports/getDocumentsPort.ts";
import { Product } from "../models/product.ts";
import { Document } from '../models/document.ts';

export class GetDocumentsUseCase {
    constructor(private getDocumentsPort: GetDocumentsPort) {
    }

    public async getDocuments(product: Product): Promise<Document[]> {
        try {
            return await this.getDocumentsPort.getDocuments(product);
        }
        catch (error) {
            throw error;
        }
    }
}