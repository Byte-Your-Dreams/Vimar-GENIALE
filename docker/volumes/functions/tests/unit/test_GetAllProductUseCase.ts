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
            return new GeneralProductInfo(["Product1"], ["Description1"]);
        },
    };
};

Deno.test("GetAllProductUseCase - getAllProduct - success", async () => {
    const mockPort = createMockGetAllProductPort();
    const useCase = new GetAllProductUseCase(mockPort);

    const result = await useCase.getAllProduct();
    assertEquals(result.getNames()[0], "Product1", "Should return the correct product name");
    assertEquals(result.getIds()[0], "Description1", "Should return the correct product ID");
});

Deno.test("GetAllProductUseCase - getAllProduct - failure", async () => {
    const mockPort = createMockGetAllProductPort(true); // Simula un errore
    const useCase = new GetAllProductUseCase(mockPort);

    await assertRejects(
        () => useCase.getAllProduct(),
        Error,
        "Failed to fetch products",
        "Should propagate the error"
    );
});