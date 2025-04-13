import { SupabaseClient } from 'jsr:@supabase/supabase-js';

import { SupabaseProduct } from '../entities/supabaseProduct.ts';
import { SupabaseDocument } from '../entities/supabaseDocument.ts';

export class DocumentRepository {
    constructor(private client: SupabaseClient) { }

    public async getDocuments(product: SupabaseProduct): Promise<SupabaseDocument[]> {
        const { data, error } = await this.client.rpc('getpdfkeybyid', {'input': product.getID()});
        if (error) {
            throw new Error(error.message);
        }
        if (!data) {
            throw new Error('No data found');
        }
        return data.map((document: any) => new SupabaseDocument(document));
    }

    public async obtainDocument(document: SupabaseDocument): Promise<SupabaseDocument> {
        const { data: files, error: listError } = await this.client.storage.from('files').list('pdfs');
        if (listError) {
            throw new Error(`Error listing PDFs: ${listError.message}`);
        }
        if (!files || files.length === 0) {
            throw new Error('No data found');
        }
        const file = files.find(file => file.id === document.getId());
        if (!file) {
            throw new Error(`File not found: ${document.getId()}`);
        }
        if (!file.name.endsWith('.pdf') && !file.name.endsWith('.PDF')) {
            throw new Error(`No PDF found in files: ${file.name}`);
        }
        return new SupabaseDocument(file.name, file.id, file.updated_at, file.created_at, file.last_accessed_at, file.metadata);
    }

    public async downloadDocument (document: SupabaseDocument): Promise<Blob> {
        console.log(document.getName());
        const { data: pdfFile, error: downloadError } = await this.client.storage.from('files').download(`pdfs/${document.getName()}`);
        if (downloadError) {
            throw new Error(`Error downloading PDF: ${downloadError.message}`);
        }
        if (!pdfFile) {
            throw new Error('No data found');
        }
        return pdfFile; 
    }
}