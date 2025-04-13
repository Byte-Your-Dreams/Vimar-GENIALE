import { assertEquals, assertRejects } from "https://deno.land/std/testing/asserts.ts";
import { DocumentAdapter } from "../../adapters/documentAdapter.ts";
import { DocumentRepository } from "../../repositories/documentRepository.ts";
import { Document } from "../../models/document.ts";
import { Product } from "../../models/product.ts";

// Mock del DocumentRepository
const createMockDocumentRepository = () => {
    return {
        getDocuments: async (product: any) => {
            if (product.getID() === "valid-product-id") {
                return [
                    {
                        getName: () => "file.pdf",
                        getId: () => "1",
                        getUpdatedAt: () => "2025-04-07",
                        getCreatedAt: () => "2025-04-01",
                        getLastAccessedAt: () => "2025-04-06",
                        getMetadata: () => ({}),
                        getBlobData: () => undefined,
                        getUrl: () => "http://example.com/file.pdf",
                        getNChunks: () => 1,
                    },
                ];
            }
            throw new Error("Product not found");
        },
        obtainDocument: async (document: any) => {
            if (document.getId() === "1") {
                return {
                    getName: () => "file.pdf",
                    getId: () => "1",
                    getUpdatedAt: () => "2025-04-07",
                    getCreatedAt: () => "2025-04-01",
                    getLastAccessedAt: () => "2025-04-06",
                    getMetadata: () => ({}),
                    getBlobData: () => undefined,
                    getUrl: () => "http://example.com/file.pdf",
                    getNChunks: () => 1,
                };
            }
            throw new Error("Document not found");
        },
        downloadDocument: async (document: any) => {
            if (document.getName() === "file.pdf") {
                return new Blob(["PDF content"], { type: "application/pdf" });
            }
            throw new Error("Error downloading document");
        },
    } as unknown as DocumentRepository;
};

Deno.test("Integration - DocumentAdapter - getDocuments - success", async () => {
    const mockRepository = createMockDocumentRepository();
    const adapter = new DocumentAdapter(mockRepository);
    const product = {
        getID: () => "valid-product-id",
        getName: () => "Test Product",
        getDescription: () => "Test Description",
        getEtim: () => "12345",
    } as Product;

    const documents = await adapter.getDocuments(product);
    assertEquals(documents.length, 1);
    assertEquals(documents[0].getName(), "file.pdf");
    assertEquals(documents[0].getId(), "1");
});

Deno.test("Integration - DocumentAdapter - getDocuments - product not found", async () => {
    const mockRepository = createMockDocumentRepository();
    const adapter = new DocumentAdapter(mockRepository);
    const product = {
        getID: () => "invalid-product-id",
        getName: () => "Test Product",
        getDescription: () => "Test Description",
        getEtim: () => "12345",
    } as Product;

    await assertRejects(
        () => adapter.getDocuments(product),
        Error,
        "Product not found",
    );
});

Deno.test("Integration - DocumentAdapter - obtainDocument - success", async () => {
    const mockRepository = createMockDocumentRepository();
    const adapter = new DocumentAdapter(mockRepository);
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

    const result = await adapter.obtainDocument(document);
    assertEquals(result.getName(), "file.pdf");
    assertEquals(result.getId(), "1");
});

Deno.test("Integration - DocumentAdapter - obtainDocument - document not found", async () => {
    const mockRepository = createMockDocumentRepository();
    const adapter = new DocumentAdapter(mockRepository);
    const document = {
        getName: () => "non-existent-file.pdf",
        getId: () => "999",
        getUpdatedAt: () => "2025-04-07",
        getCreatedAt: () => "2025-04-01",
        getLastAccessedAt: () => "2025-04-06",
        getMetadata: () => ({}),
        getBlobData: () => undefined,
        getUrl: () => "http://example.com/non-existent-file.pdf",
        getNChunks: () => 1,
    } as Document;

    await assertRejects(
        () => adapter.obtainDocument(document),
        Error,
        "Document not found",
    );
});

Deno.test("Integration - DocumentAdapter - downloadDocument - success", async () => {
    const mockRepository = createMockDocumentRepository();
    const adapter = new DocumentAdapter(mockRepository);
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

    const result = await adapter.downloadDocument(document);
    assertEquals(result instanceof Blob, true);
    assertEquals(result.type, "application/pdf");
});

Deno.test("Integration - DocumentAdapter - downloadDocument - error", async () => {
    const mockRepository = createMockDocumentRepository();
    const adapter = new DocumentAdapter(mockRepository);
    const document = {
        getName: () => "non-existent-file.pdf",
        getId: () => "999",
        getUpdatedAt: () => "2025-04-07",
        getCreatedAt: () => "2025-04-01",
        getLastAccessedAt: () => "2025-04-06",
        getMetadata: () => ({}),
        getBlobData: () => undefined,
        getUrl: () => "http://example.com/non-existent-file.pdf",
        getNChunks: () => 1,
    } as Document;

    await assertRejects(
        () => adapter.downloadDocument(document),
        Error,
        "Error downloading document",
    );
});
