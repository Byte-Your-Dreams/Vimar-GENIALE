import { assertEquals, assertRejects } from "https://deno.land/std/testing/asserts.ts";
import { GetDocumentsUseCase } from "../../useCases/getDocumentsUseCase.ts";
import { GetDocumentsPort } from "../../ports/getDocumentsPort.ts";
import { Product } from "../../models/product.ts";
import { Document } from "../../models/document.ts";

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
    } as GetDocumentsPort;
};

// Test modificato
Deno.test("GetDocumentsUseCase - getDocuments - success", async () => {
    const mockPort = createMockGetDocumentsPort();
    const useCase = new GetDocumentsUseCase(mockPort);
    const product = new Product("Product1", "Test Product", "Description", "ETIM123");

    const result = await useCase.getDocuments(product);
    
    assertEquals(result.length, 2);
    
    // Primo documento
    assertEquals(result[0].getName(), "Document1");
    assertEquals(result[0].getId(), "doc-1"); // ID coerente con il mock
    assertEquals(result[0].getUpdatedAt(), "2025-04-07");
    
    // Secondo documento
    assertEquals(result[1].getName(), "Document2");
    assertEquals(result[1].getId(), "doc-2"); // ID coerente con il mock
    assertEquals(result[1].getUpdatedAt(), "2025-04-08");
});

Deno.test("GetDocumentsUseCase - getDocuments - failure", async () => {
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