import { assertEquals, assertRejects } from "https://deno.land/std/testing/asserts.ts";
import { GetProductUseCase } from "../../useCases/getProductUseCase.ts";
import { GetProductPort } from "../../ports/getProductPort.ts";
import { Product } from "../../models/product.ts";

// Mock del GetProductPort
const createMockGetProductPort = (shouldThrow = false): GetProductPort => {
    return {
        getProduct: async (productName: string | null, productId: string | null): Promise<Product> => {
            if (shouldThrow) {
                throw new Error("Failed to fetch product");
            }
            if (productName === "Test Product" || productId === "prod-123") {
                return new Product("prod-123", "Test Product", "This is a test product", "ETIM123");
            }
            throw new Error("Product not found");
        },
    };
};

Deno.test("GetProductUseCase - getProduct - success by name", async () => {
    const mockPort = createMockGetProductPort();
    const useCase = new GetProductUseCase(mockPort);

    const result = await useCase.getProduct("Test Product", null);

    assertEquals(result.getID(), "prod-123", "Should return the correct product ID");
    assertEquals(result.getName(), "Test Product", "Should return the correct product name");
    assertEquals(result.getDescription(), "This is a test product", "Should return the correct product description");
    assertEquals(result.getEtim(), "ETIM123", "Should return the correct ETIM code");
});

Deno.test("GetProductUseCase - getProduct - success by ID", async () => {
    const mockPort = createMockGetProductPort();
    const useCase = new GetProductUseCase(mockPort);

    const result = await useCase.getProduct(null, "prod-123");

    assertEquals(result.getID(), "prod-123", "Should return the correct product ID");
    assertEquals(result.getName(), "Test Product", "Should return the correct product name");
    assertEquals(result.getDescription(), "This is a test product", "Should return the correct product description");
    assertEquals(result.getEtim(), "ETIM123", "Should return the correct ETIM code");
});

Deno.test("GetProductUseCase - getProduct - product not found", async () => {
    const mockPort = createMockGetProductPort();
    const useCase = new GetProductUseCase(mockPort);

    await assertRejects(
        () => useCase.getProduct("Nonexistent Product", null),
        Error,
        "Product not found",
        "Should throw an error if the product is not found"
    );
});

Deno.test("GetProductUseCase - getProduct - failure", async () => {
    const mockPort = createMockGetProductPort(true); // Simula un errore
    const useCase = new GetProductUseCase(mockPort);

    await assertRejects(
        () => useCase.getProduct("Test Product", null),
        Error,
        "Failed to fetch product",
        "Should propagate the error"
    );
});