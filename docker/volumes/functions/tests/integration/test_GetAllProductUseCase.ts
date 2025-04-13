import { assertEquals, assertRejects } from "https://deno.land/std/testing/asserts.ts";
import { GetAllProductUseCase } from "../../useCases/getAllProductUseCase.ts";
import { GeneralProductInfo } from "../../models/generalProductInfo.ts";

// Mock del GetAllProductPort
const createMockGetAllProductPort = (shouldThrow = false) => {
    return {
        getAllProduct: async (): Promise<GeneralProductInfo> => { 
            if (shouldThrow) {
                throw new Error("Failed to fetch products");
            }
            return new GeneralProductInfo(
                ["Product1", "Product2"],
                ["Description1", "Description2"]
            );
        },
    };
};
Deno.test("Integration - GetAllProductUseCase - getAllProduct - success", async () => {
    const mockPort = createMockGetAllProductPort();
    const useCase = new GetAllProductUseCase(mockPort);

    const result = await useCase.getAllProduct();
    assertEquals(result.getNames(), ["Product1", "Product2"]);
    assertEquals(result.getIds(), ["Description1", "Description2"]);
});

Deno.test("Integration - GetAllProductUseCase - getAllProduct - failure", async () => {
    const mockPort = createMockGetAllProductPort(true);
    const useCase = new GetAllProductUseCase(mockPort);

    await assertRejects(
        () => useCase.getAllProduct(),
        Error,
        "Failed to fetch products"
    );
});