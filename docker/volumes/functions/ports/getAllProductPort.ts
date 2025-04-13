import { GeneralProductInfo } from "../models/generalProductInfo.ts";

export interface GetAllProductPort {
    getAllProduct(): Promise<GeneralProductInfo>;
}