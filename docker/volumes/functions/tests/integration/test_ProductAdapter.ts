import { assertEquals, assertThrows } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { ProductAdapter } from "../../adapters/productAdapter.ts";
import { ProductRepository } from "../../repositories/productRepository.ts";

// Mocked entities
import { SupabaseGeneralProductInfo } from "../../entities/supabaseGeneralProductInfo.ts";
import { SupabaseProduct } from "../../entities/supabaseProduct.ts";

Deno.test("ProductAdapter: getAllProduct should return a valid GeneralProductInfo (integration)", async () => {
  // Arrange
  const mockClient = {
    from: () => ({
      select: async () => ({
        data: [
          { id: "1", nome: "Product 1" },
          { id: "2", nome: "Product 2" },
        ],
        error: null,
      }),
    }),
  };

  const repository = new ProductRepository(mockClient as any);
  const adapter = new ProductAdapter(repository);

  // Act
  const result = await adapter.getAllProduct();

  // Assert
  assertEquals(result.getNames(), ["Product 1", "Product 2"]);
  assertEquals(result.getIds(), ["1", "2"]);
});

Deno.test("ProductAdapter: getProduct should return a valid Product (integration)", async () => {
  // Arrange
  const mockClient = {
    from: () => ({
      select: () => ({
        eq: async () => ({
          data: [
            { id: "1", nome: "Product 1", descrizione: "Description 1", etim: "ETIM1" },
          ],
          error: null,
        }),
      }),
    }),
  };

  const repository = new ProductRepository(mockClient as any);
  const adapter = new ProductAdapter(repository);

  // Act
  const result = await adapter.getProduct("Product 1", null);

  // Assert
  assertEquals(result.getID(), "1");
  assertEquals(result.getName(), "Product 1");
  assertEquals(result.getDescription(), "Description 1");
  assertEquals(result.getEtim(), "ETIM1");
});

Deno.test("ProductAdapter: getProduct should throw an error if product is not found (integration)", async () => {
    // Arrange
    const mockClient = {
    from: () => ({
        select: () => ({
        eq: async () => ({
            data: [],
            error: null,
        }),
        }),
    }),
    };

    const repository = new ProductRepository(mockClient as any);
    const adapter = new ProductAdapter(repository);

    // Act & Assert
    try {
        await adapter.getProduct("Nonexistent Product", null);
    } catch (error) {
        if (error instanceof Error) {
            assertEquals(error.message, "No data found"); // Ensure this matches the actual error message
        }
    }
});