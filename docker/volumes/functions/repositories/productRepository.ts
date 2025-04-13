import { SupabaseClient } from 'jsr:@supabase/supabase-js';
import { SupabaseGeneralProductInfo } from '../entities/supabaseGeneralProductInfo.ts';
import { SupabaseProduct } from '../entities/supabaseProduct.ts';

export class ProductRepository {

    constructor(private readonly client:SupabaseClient) { }

    public async getAllProduct(): Promise<SupabaseGeneralProductInfo> {
        const { data, error } = await this.client.from('prodotto').select('id, nome');
        if (error) {
            throw new Error(error.message);
        }
        if (!data) {
            throw new Error('No data found');
        }
        return new SupabaseGeneralProductInfo(data.map((product: any) => product.nome), data.map((product: any) => product.id));
    }

    public async getProduct(name: string|null, id: string|null): Promise<SupabaseProduct> {
        if (!name && !id) {
            throw new Error("Missing name or id");
        }
        let result;
        if (name && !id) {
            result = await this.client.from('prodotto').select('*').eq('nome', name);
        }
        if (!name && id) {
            result = await this.client.from('prodotto').select('*').eq('id', id);
        }
        
        if (!result) {
            throw new Error('No data found');
        }

        if (result && result.error) {
            throw new Error(result.error.message);
        }
        if (result && (!result.data || result.data.length === 0)) {
            throw new Error('No data found');
        }

        const product = result.data[0] ? result.data[0] : null;
        if (!product) {
            throw new Error('Product not found');
        }
        return new SupabaseProduct(product.id, product.nome, product.descrizione, product.etim);
    }
}