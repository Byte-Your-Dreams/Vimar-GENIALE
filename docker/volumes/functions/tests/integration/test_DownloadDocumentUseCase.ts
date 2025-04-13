import { assertEquals, assertRejects } from "https://deno.land/std/testing/asserts.ts";
import { DownloadDocumentUseCase } from "../../useCases/downloadDocumentUseCase.ts";
import { Document } from "../../models/document.ts";

// Mock del DownloadDocumentPort
const createMockDownloadDocumentPort = (shouldThrow = false) => {
    return {
        downloadDocument: async (document: Document) => {
            if (shouldThrow) {
                throw new Error("Download failed");
            }
            return new Blob(["PDF content"], { type: "application/pdf" });
        },
    };
};

Deno.test("Integration - DownloadDocumentUseCase - downloadDocument - success", async () => {
    const mockPort = createMockDownloadDocumentPort();
    const useCase = new DownloadDocumentUseCase(mockPort);
    const document = {
        getName: () => "file.pdf",
        getId: () => "1",
        getUpdatedAt: () => "2025-04-07",
        getCreatedAt: () => "2025-04-01",
        getLastAccessedAt: () => "2025-04-06",
        getMetadata: () => ({}),
        getBlobData: () => undefined,
        getUrl: () => "http://example.com/file.pdf",
        getNChunks: () => 1,
    } as Document;

    const result = await useCase.downloadDocument(document);
    assertEquals(result instanceof Blob, true);
    assertEquals(result.type, "application/pdf");
});

Deno.test("Integration - DownloadDocumentUseCase - downloadDocument - failure", async () => {
    const mockPort = createMockDownloadDocumentPort(true); // Simula un errore
    const useCase = new DownloadDocumentUseCase(mockPort);
    const document = {
        getName: () => "file.pdf",
        getId: () => "1",
        getUpdatedAt: () => "2025-04-07",
        getCreatedAt: () => "2025-04-01",
        getLastAccessedAt: () => "2025-04-06",
        getMetadata: () => ({}),
        getBlobData: () => undefined,
        getUrl: () => "http://example.com/file.pdf",
        getNChunks: () => 1,
    } as Document;

    await assertRejects(
        () => useCase.downloadDocument(document),
        Error,
        "Download failed",
    );
});