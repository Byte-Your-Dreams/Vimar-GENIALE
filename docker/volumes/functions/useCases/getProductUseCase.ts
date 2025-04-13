import { GetProductPort } from "../ports/getProductPort.ts";
import { Product } from "../models/product.ts";

export class GetProductUseCase {
    constructor(private getProductPort: GetProductPort) {
    }

    public async getProduct(productName: string|null, productId: string|null): Promise<Product> {
        try {
            return await this.getProductPort.getProduct(productName, productId);
        }
        catch (error) {
            throw error;
        }
    }
}