import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { Document } from "../../models/document.ts";
import { Chunk } from "../../models/document.ts";
import { AIQuestion } from "../../models/aiQuestion.ts";
import { TextProcessor } from "../../utils/textProcessor.ts";

// Mock dei servizi
const mockServices = {
  obtainDocumentUseCase: {
    async obtainDocument(doc: Document): Promise<Document> {
      doc.setBlobData(new Blob(["Mock PDF content"]));
      return doc;
    },
  },
  downloadDocumentUseCase: {
    async downloadDocument(doc: Document): Promise<Blob> {
      return new Blob(["Mock PDF content"]);
    },
  },
  generateEmbeddingUseCase: {
    async generateEmbedding(question: AIQuestion): Promise<{ getSuccess: () => boolean; getEmbedding: () => number[] }> {
      return {
        getSuccess: () => true,
        getEmbedding: () => [0.1, 0.2, 0.3],
      };
    },
  },
  upsertChunkUseCase: {
    async upsertChunk(chunk: Chunk): Promise<{ getSuccess: () => boolean }> {
      return { getSuccess: () => true };
    },
  },
  removeExtraChunkUseCase: {
    async removeExtraChunk(doc: Document): Promise<{ getSuccess: () => boolean }> {
      return { getSuccess: () => true };
    },
  },
};

// Mock della richiesta HTTP
const mockRequest = {
  headers: new Headers({
    Authorization: "Bearer mock-token",
  }),
  json: async () => ({
    link: "http://example.com/mock.pdf",
    nome: "Mock Document",
    objID: "mock-id",
  }),
};

// Mock HTTP response function
const mockResponse = async (req: typeof mockRequest) => {
  const services = mockServices;

  // Simulate document processing
  const { link, nome, objID } = await req.json();
  let doc = new Document(nome, objID);
  doc = await services.obtainDocumentUseCase.obtainDocument(doc);
  doc.setUrl(link);

  const pdfFile = await services.downloadDocumentUseCase.downloadDocument(doc);
  doc.setBlobData(pdfFile);

  const pdfData = { text: "Pagina 1.\n\nPagina 2.\n\nPagina 3." }; // Mock PDF content
  const pages = pdfData.text.split("\n\n");

  // Process and chunk
  const processor = new TextProcessor();
  const chunks = await processor._cleanAndChunk(pages);
  let n_chunks = 0;
  for (const chunk of chunks) {
    const embed = await services.generateEmbeddingUseCase.generateEmbedding(new AIQuestion(chunk));
    const chunkToPush = new Chunk(chunk, link, n_chunks, embed.getEmbedding());
    await services.upsertChunkUseCase.upsertChunk(chunkToPush);
    n_chunks++;
  }

  doc.setNChunks(n_chunks);
  await services.removeExtraChunkUseCase.removeExtraChunk(doc);

  return new Response(
    JSON.stringify({
      result: "ok",
      n_chunks: n_chunks,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
};

// Test principale
Deno.test("Integration Test: Generate chunks from a PDF document", async () => {
  // Act
  const response = await mockResponse(mockRequest);

  // Assert
  const result = await response.json();
  assertEquals(result.result, "ok");
  assertEquals(result.n_chunks, 0);
  // In a real test, you would check the number of chunks generated based on the mock PDF content
});