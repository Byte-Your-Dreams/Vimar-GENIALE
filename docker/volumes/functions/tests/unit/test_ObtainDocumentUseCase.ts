import { assertEquals, assertRejects } from "https://deno.land/std/testing/asserts.ts";
import { ObtainDocumentUseCase } from "../../useCases/obtainDocumentUseCase.ts";
import { ObtainDocumentPort } from "../../ports/obtainDocumentPort.ts";
import { Document } from "../../models/document.ts";

// Mock del ObtainDocumentPort
const createMockObtainDocumentPort = (shouldThrow = false): ObtainDocumentPort => {
    return {
        obtainDocument: async (document: Document): Promise<Document> => {
            if (shouldThrow) {
                throw new Error("Failed to obtain document");
            }
            return new Document(
                document.getId(),
                document.getName(),
                document.getUpdatedAt(),
                document.getCreatedAt(),
                document.getLastAccessedAt(),
                document.getMetadata()
            );
        },
    };
};

Deno.test("ObtainDocumentUseCase - obtainDocument - success", async () => {
    const mockPort = createMockObtainDocumentPort();
    const useCase = new ObtainDocumentUseCase(mockPort);

    const inputDocument = new Document(
        "doc-123",
        "Test Document",
        "2025-04-07",
        "2025-04-01",
        "2025-04-06",
        { size: "1MB" }
    );

    const result = await useCase.obtainDocument(inputDocument);

    assertEquals(result.getId(), "doc-123", "Should return the correct document ID");
    assertEquals(result.getName(), "Test Document", "Should return the correct document name");
    assertEquals(result.getUpdatedAt(), "2025-04-07", "Should return the correct updated date");
    assertEquals(result.getCreatedAt(), "2025-04-01", "Should return the correct created date");
    assertEquals(result.getLastAccessedAt(), "2025-04-06", "Should return the correct last accessed date");
    assertEquals(result.getMetadata(), { size: "1MB" }, "Should return the correct metadata");
});

Deno.test("ObtainDocumentUseCase - obtainDocument - failure", async () => {
    const mockPort = createMockObtainDocumentPort(true); // Simula un errore
    const useCase = new ObtainDocumentUseCase(mockPort);

    const inputDocument = new Document(
        "doc-123",
        "Test Document",
        "2025-04-07",
        "2025-04-01",
        "2025-04-06",
        { size: "1MB" }
    );

    await assertRejects(
        () => useCase.obtainDocument(inputDocument),
        Error,
        "Failed to obtain document",
        "Should propagate the error"
    );
});