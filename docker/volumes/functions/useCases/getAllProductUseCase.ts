import { GetAllProductPort } from '../ports/getAllProductPort.ts';
import { GeneralProductInfo } from '../models/generalProductInfo.ts';

export class GetAllProductUseCase {
    constructor(private getAllProductPort: GetAllProductPort) {
    }

    public async getAllProduct(): Promise<GeneralProductInfo> {
        try {
            return await this.getAllProductPort.getAllProduct();
        }
        catch (error) {
            throw error;
        }
    }
}