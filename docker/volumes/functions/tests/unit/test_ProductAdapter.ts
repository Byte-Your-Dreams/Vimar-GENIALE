import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { ProductAdapter } from "../../adapters/productAdapter.ts";
import { ProductRepository } from "../../repositories/productRepository.ts";

// Mocked models
import { GeneralProductInfo } from "../../models/generalProductInfo.ts";
import { Product } from "../../models/product.ts";

// Mocked entities
import { SupabaseGeneralProductInfo } from "../../entities/supabaseGeneralProductInfo.ts";
import { SupabaseProduct } from "../../entities/supabaseProduct.ts";

Deno.test("ProductAdapter: getAllProduct should return a valid GeneralProductInfo", async () => {
  // Arrange
  const mockRepository = {
    getAllProduct: async () => {
      return new SupabaseGeneralProductInfo(["Product 1", "Product 2"], ["1", "2"]);
    },
  } as unknown as ProductRepository;

  const adapter = new ProductAdapter(mockRepository);

  // Act
  const result = await adapter.getAllProduct();

  // Assert
  assertEquals(result.getNames(), ["Product 1", "Product 2"]);
  assertEquals(result.getIds(), ["1", "2"]);
});

Deno.test("ProductAdapter: getProduct should return a valid Product", async () => {
  // Arrange
  const mockRepository = {
    getProduct: async (name: string | null, id: string | null) => {
      return new SupabaseProduct("1", "Product 1", "Description 1", "ETIM1");
    },
  } as unknown as ProductRepository;

  const adapter = new ProductAdapter(mockRepository);

  // Act
  const result = await adapter.getProduct("Product 1", null);

  // Assert
  assertEquals(result.getID(), "1");
  assertEquals(result.getName(), "Product 1");
  assertEquals(result.getDescription(), "Description 1");
  assertEquals(result.getEtim(), "ETIM1");
});

Deno.test("ProductAdapter: getProduct should throw an error if product is not found", async () => {
  // Arrange
  const mockRepository = {
    getProduct: async () => {
      throw new Error("Product not found");
    },
  } as unknown as ProductRepository;

  const adapter = new ProductAdapter(mockRepository);

  // Act & Assert
  try {
    await adapter.getProduct("Nonexistent Product", null);
  } catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "Product not found");
    } else {
      throw error; // Re-throw if it's not an Error
    }
  }
});