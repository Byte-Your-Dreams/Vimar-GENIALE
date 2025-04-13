import { DocumentRepository } from "../repositories/documentRepository.ts";

//ports
import { ObtainDocumentPort } from "../ports/obtainDocumentPort.ts";
import { DownloadDocumentPort } from "../ports/downloadDocumentPort.ts";
import { GetDocumentsPort } from "../ports/getDocumentsPort.ts";

//models
import { Document } from "../models/document.ts";
import { Product } from "../models/product.ts";

//entities
import { SupabaseDocument } from "../entities/supabaseDocument.ts";
import { SupabaseProduct } from "../entities/supabaseProduct.ts";

export class DocumentAdapter implements GetDocumentsPort, ObtainDocumentPort, DownloadDocumentPort {
    constructor(private repository: DocumentRepository) { }

    public async getDocuments(product: Product): Promise<Document[]> {
        let supabaseProduct = this.convertProductToPostgresProduct(product);
        let supabaseDocs = await this.repository.getDocuments(supabaseProduct);
        let documents: Document[] = [];
        supabaseDocs.forEach(doc => documents.push(this.convertSupabaseDocumentToDocument(doc)));
        return documents;
    }

    public async obtainDocument(document: Document): Promise<Document> {
        let supabaseDocument: SupabaseDocument = this.convertDocumentToSupabaseDocument(document);
        supabaseDocument = await this.repository.obtainDocument(supabaseDocument);
        return this.convertSupabaseDocumentToDocument(supabaseDocument);
    }   

    public async downloadDocument(document: Document): Promise<Blob> {
        let supabaseDocument: SupabaseDocument = this.convertDocumentToSupabaseDocument(document);
        let blob = await this.repository.downloadDocument(supabaseDocument);
        return blob;
    } 

    private convertProductToPostgresProduct(product: Product): SupabaseProduct {
        return new SupabaseProduct(product.getID(), product.getName(), product.getDescription(), product.getEtim());
    }

    private convertDocumentToSupabaseDocument(document: Document): SupabaseDocument {
        return new SupabaseDocument(document.getName(), document.getId(), document.getUpdatedAt(), document.getCreatedAt(), document.getLastAccessedAt(), document.getMetadata(), document.getBlobData(), document.getUrl(), document.getNChunks());
    }

    private convertSupabaseDocumentToDocument(supabaseDocument: SupabaseDocument): Document {
        return new Document(supabaseDocument.getName(), supabaseDocument.getId(), supabaseDocument.getUpdatedAt(), supabaseDocument.getCreatedAt(), supabaseDocument.getLastAccessedAt(), supabaseDocument.getMetadata(), supabaseDocument.getBlobData(), supabaseDocument.getUrl(),supabaseDocument.getNChunks());
    }
}