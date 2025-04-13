import { Product } from "../models/product.ts";

export interface GetProductPort {
    getProduct(productName: string|null, productId: string|null): Promise<Product>;
}