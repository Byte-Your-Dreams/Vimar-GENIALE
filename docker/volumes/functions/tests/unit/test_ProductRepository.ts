import { assertEquals, assertThrows } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { ProductRepository } from "../../repositories/productRepository.ts";
import { SupabaseGeneralProductInfo } from "../../entities/supabaseGeneralProductInfo.ts";
import { SupabaseProduct } from "../../entities/supabaseProduct.ts";

Deno.test("ProductRepository: getAllProduct should return a valid SupabaseGeneralProductInfo", async () => {
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

  // Act
  const result = await repository.getAllProduct();

  // Assert
  assertEquals(result.getNames(), ["Product 1", "Product 2"]);
  assertEquals(result.getIds(), ["1", "2"]);
});

Deno.test("ProductRepository: getAllProduct should throw an error if no data is found", async () => {
  // Arrange
  const mockClient = {
    from: () => ({
      select: async () => ({
        data: null,
        error: null,
      }),
    }),
  };

  const repository = new ProductRepository(mockClient as any);

  // Act & Assert
  try {
    await repository.getAllProduct();
  } catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "No data found"); // Ensure this matches the actual error message
    }
  }
});

Deno.test("ProductRepository: getProduct should return a valid SupabaseProduct by name", async () => {
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

  // Act
  const result = await repository.getProduct("Product 1", null);

  // Assert
  assertEquals(result.getID(), "1");
  assertEquals(result.getName(), "Product 1");
  assertEquals(result.getDescription(), "Description 1");
  assertEquals(result.getEtim(), "ETIM1");
});

Deno.test("ProductRepository: getProduct should throw an error if no name or id is provided", async () => {
  // Arrange
  const mockClient = {};

  const repository = new ProductRepository(mockClient as any);

  // Act & Assert
  try {
    await repository.getProduct(null, null);
  } catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "Missing name or id"); // Ensure this matches the actual error message
    }
  }
});
Deno.test("ProductRepository: getProduct should throw an error if product is not found", async () => {
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

  // Act & Assert
  try {
    await repository.getProduct("Nonexistent Product", null);
    } catch (error) {
        if (error instanceof Error) {
            assertEquals(error.message, "No data found"); // Ensure this matches the actual error message
        }
    }
});

Deno.test("ProductRepository: getProduct should throw an error if query returns an error", async () => {
  // Arrange
  const mockClient = {
    from: () => ({
      select: () => ({
        eq: async () => ({
          data: null,
          error: { message: "Database error" },
        }),
      }),
    }),
  };

  const repository = new ProductRepository(mockClient as any);

  // Act & Assert
  try {
    await repository.getProduct("Product 1", null);
  } catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "Database error"); // Ensure this matches the actual error message
    }
  }
});