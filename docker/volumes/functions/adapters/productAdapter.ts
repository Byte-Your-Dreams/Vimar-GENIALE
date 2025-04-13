import { ProductRepository } from "../repositories/productRepository.ts";

//ports
import { GetAllProductPort } from "../ports/getAllProductPort.ts";
import { GetProductPort } from "../ports/getProductPort.ts";

//models
import { GeneralProductInfo } from "../models/generalProductInfo.ts";
import { Product } from "../models/product.ts";

//entities
import { SupabaseGeneralProductInfo } from "../entities/supabaseGeneralProductInfo.ts";
import { SupabaseProduct } from "../entities/supabaseProduct.ts";

export class ProductAdapter implements GetAllProductPort, GetProductPort {
    constructor(private repository: ProductRepository) { }
    
    public async getAllProduct(): Promise<GeneralProductInfo> {
        let supabaseGeneralProductInfo = await this.repository.getAllProduct();
        return this.convertSupabaseGeneralProductInfo(supabaseGeneralProductInfo);
    }

    public async getProduct (productName: string|null, productId: string|null): Promise<Product> {
        let supabaseProduct = await this.repository.getProduct(productName, productId);
        return this.convertPostgresProductToProduct(supabaseProduct);
    }
    
    // converters

    private convertSupabaseGeneralProductInfo(product:SupabaseGeneralProductInfo): GeneralProductInfo {
        return new GeneralProductInfo(product.getNames(), product.getIds());
    }

    private convertPostgresProductToProduct(supabaseProduct: SupabaseProduct): Product {
        return new Product(supabaseProduct.getID(), supabaseProduct.getName(), supabaseProduct.getDescription(), supabaseProduct.getEtim());
    }
}

