import { assertEquals, assertRejects } from "https://deno.land/std/testing/asserts.ts";
import { GetDocumentsUseCase } from "../../useCases/getDocumentsUseCase.ts";
import { Product } from "../../models/product.ts";
import { Document } from "../../models/document.ts";

// Mock del GetDocumentsPort
const createMockGetDocumentsPort = (shouldThrow = false) => {
    return {
        getDocuments: async (product: Product): Promise<Document[]> => {
            if (shouldThrow) {
                throw new Error("Failed to fetch documents");
            }
            return [
                new Document("Document1", "doc-1", "2025-04-07"),
                new Document("Document2", "doc-2", "2025-04-08"),
            ];
        },
    };
};

Deno.test("Integration - GetDocumentsUseCase - getDocuments - success", async () => {
    const mockPort = createMockGetDocumentsPort();
    const useCase = new GetDocumentsUseCase(mockPort);
    const product = new Product("Product1", "Test Product", "Description", "ETIM123");

    const result = await useCase.getDocuments(product);

    assertEquals(result.length, 2, "Should return the correct number of documents");

    // Primo documento
    assertEquals(result[0].getName(), "Document1", "Should return the correct name for the first document");
    assertEquals(result[0].getId(), "doc-1", "Should return the correct ID for the first document");
    assertEquals(result[0].getUpdatedAt(), "2025-04-07", "Should return the correct date for the first document");

    // Secondo documento
    assertEquals(result[1].getName(), "Document2", "Should return the correct name for the second document");
    assertEquals(result[1].getId(), "doc-2", "Should return the correct ID for the second document");
    assertEquals(result[1].getUpdatedAt(), "2025-04-08", "Should return the correct date for the second document");
});

Deno.test("Integration - GetDocumentsUseCase - getDocuments - failure", async () => {
    const mockPort = createMockGetDocumentsPort(true); // Simula un errore
    const useCase = new GetDocumentsUseCase(mockPort);
    const product = new Product("Product1", "Test Product", "Description", "ETIM123");

    await assertRejects(
        () => useCase.getDocuments(product),
        Error,
        "Failed to fetch documents",
        "Should propagate the error"
    );
});