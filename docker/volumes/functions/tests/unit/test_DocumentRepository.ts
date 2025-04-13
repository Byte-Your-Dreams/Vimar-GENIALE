import { assertEquals, assertRejects } from "https://deno.land/std/testing/asserts.ts";
import { DocumentRepository } from "../../repositories/documentRepository.ts";
import { SupabaseClient } from "jsr:@supabase/supabase-js";
import { SupabaseProduct } from "../../entities/supabaseProduct.ts";
import { SupabaseDocument } from "../../entities/supabaseDocument.ts";

// filepath: /home/olliker/genIAle_hexa/docker/volumes/functions/repositories/documentRepository.test.ts

Deno.test("DocumentRepository - getDocuments - success", async () => {
    const mockClient = {
        rpc: async () => ({ data: [{ id: "1" }], error: null }),
    } as unknown as SupabaseClient;

    const repository = new DocumentRepository(mockClient);
    const product = { getID: () => "product-id" } as SupabaseProduct;

    const documents = await repository.getDocuments(product);
    assertEquals(documents.length, 1);
    assertEquals(documents[0] instanceof SupabaseDocument, true);
});

Deno.test("DocumentRepository - getDocuments - rpc error", async () => {
    const mockClient = {
        rpc: async () => ({ data: null, error: { message: "RPC Error" } }),
    } as unknown as SupabaseClient;

    const repository = new DocumentRepository(mockClient);
    const product = { getID: () => "product-id" } as SupabaseProduct;

    await assertRejects(
        () => repository.getDocuments(product),
        Error,
        "RPC Error",
    );
});

Deno.test("DocumentRepository - getDocuments - no data", async () => {
    const mockClient = {
        rpc: async () => ({ data: null, error: null }),
    } as unknown as SupabaseClient;

    const repository = new DocumentRepository(mockClient);
    const product = { getID: () => "product-id" } as SupabaseProduct;

    await assertRejects(
        () => repository.getDocuments(product),
        Error,
        "No data found",
    );
});

Deno.test("DocumentRepository - obtainDocument - success", async () => {
    const mockClient = {
        storage: {
            from: () => ({
                list: async () => ({
                    data: [{ id: "1", name: "file.pdf", updated_at: "", created_at: "", last_accessed_at: "", metadata: {} }],
                    error: null,
                }),
            }),
        },
    } as unknown as SupabaseClient;

    const repository = new DocumentRepository(mockClient);
    const document = { getId: () => "1" } as SupabaseDocument;

    const result = await repository.obtainDocument(document);
    assertEquals(result instanceof SupabaseDocument, true);
});

Deno.test("DocumentRepository - obtainDocument - list error", async () => {
    const mockClient = {
        storage: {
            from: () => ({
                list: async () => ({ data: null, error: { message: "List Error" } }),
            }),
        },
    } as unknown as SupabaseClient;

    const repository = new DocumentRepository(mockClient);
    const document = { getId: () => "1" } as SupabaseDocument;

    await assertRejects(
        () => repository.obtainDocument(document),
        Error,
        "Error listing PDFs: List Error",
    );
});

Deno.test("DocumentRepository - obtainDocument - no files", async () => {
    const mockClient = {
        storage: {
            from: () => ({
                list: async () => ({ data: [], error: null }),
            }),
        },
    } as unknown as SupabaseClient;

    const repository = new DocumentRepository(mockClient);
    const document = { getId: () => "1" } as SupabaseDocument;

    await assertRejects(
        () => repository.obtainDocument(document),
        Error,
        "No data found",
    );
});

Deno.test("DocumentRepository - obtainDocument - file not found", async () => {
    const mockClient = {
        storage: {
            from: () => ({
                list: async () => ({
                    data: [{ id: "2", name: "file.pdf" }],
                    error: null,
                }),
            }),
        },
    } as unknown as SupabaseClient;

    const repository = new DocumentRepository(mockClient);
    const document = { getId: () => "1" } as SupabaseDocument;

    await assertRejects(
        () => repository.obtainDocument(document),
        Error,
        "File not found: 1",
    );
});

Deno.test("DocumentRepository - obtainDocument - not a PDF", async () => {
    const mockClient = {
        storage: {
            from: () => ({
                list: async () => ({
                    data: [{ id: "1", name: "file.txt" }],
                    error: null,
                }),
            }),
        },
    } as unknown as SupabaseClient;

    const repository = new DocumentRepository(mockClient);
    const document = { getId: () => "1" } as SupabaseDocument;

    await assertRejects(
        () => repository.obtainDocument(document),
        Error,
        "No PDF found in files: file.txt",
    );
});

Deno.test("DocumentRepository - downloadDocument - success", async () => {
    const mockClient = {
        storage: {
            from: () => ({
                download: async () => ({ data: new Blob(), error: null }),
            }),
        },
    } as unknown as SupabaseClient;

    const repository = new DocumentRepository(mockClient);
    const document = { getName: () => "file.pdf" } as SupabaseDocument;

    const result = await repository.downloadDocument(document);
    assertEquals(result instanceof Blob, true);
});

Deno.test("DocumentRepository - downloadDocument - download error", async () => {
    const mockClient = {
        storage: {
            from: () => ({
                download: async () => ({ data: null, error: { message: "Download Error" } }),
            }),
        },
    } as unknown as SupabaseClient;

    const repository = new DocumentRepository(mockClient);
    const document = { getName: () => "file.pdf" } as SupabaseDocument;

    await assertRejects(
        () => repository.downloadDocument(document),
        Error,
        "Error downloading PDF: Download Error",
    );
});

Deno.test("DocumentRepository - downloadDocument - no file", async () => {
    const mockClient = {
        storage: {
            from: () => ({
                download: async () => ({ data: null, error: null }),
            }),
        },
    } as unknown as SupabaseClient;

    const repository = new DocumentRepository(mockClient);
    const document = { getName: () => "file.pdf" } as SupabaseDocument;

    await assertRejects(
        () => repository.downloadDocument(document),
        Error,
        "No data found",
    );
});
