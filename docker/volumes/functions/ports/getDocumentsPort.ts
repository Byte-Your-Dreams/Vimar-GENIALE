import { Document } from "../models/document.ts";
import { Product } from "../models/product.ts";

export interface GetDocumentsPort {
    getDocuments(product: Product): Promise<Document[]>;
}