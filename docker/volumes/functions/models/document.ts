export class Document {
    constructor(private name: string, private id: string = '', private updated_at: string = '', private created_at: string = '', private last_accessed_at: string = '', private metadata: Record<string, string | number> = {}, private blobData?: Blob, private url: string = '', private nChunks: number = 0) {}
    public getName(): string {
        return this.name;
    }

    public getId(): string {
        return this.id;
    }

    public getUpdatedAt(): string {
        return this.updated_at;
    }

    public getCreatedAt(): string {
        return this.created_at;
    }

    public getLastAccessedAt(): string {
        return this.last_accessed_at;
    }

    public getMetadata(): Record<string, string | number> {
        return this.metadata;
    }

    public getBlobData(): Blob | undefined {
        return this.blobData;
    }

    public getUrl(): string {
        return this.url;
    }

    public getNChunks(): number {
        return this.nChunks;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public setId(id: string): void {
        this.id = id;
    }

    public setUpdatedAt(updated_at: string): void {
        this.updated_at = updated_at;
    }

    public setCreatedAt(created_at: string): void {
        this.created_at = created_at;
    }

    public setLastAccessedAt(last_accessed_at: string): void {
        this.last_accessed_at = last_accessed_at;
    }

    public setMetadata(metadata: Record<string, string | number>): void {
        this.metadata = metadata;
    }

    public setBlobData(blobData: Blob): void {
        this.blobData = blobData;
    }

    public setUrl(url: string): void {
        this.url = url;
    }

    public setNChunks(nChunks: number): void {
        this.nChunks = nChunks;
    }
}

export class Chunk {
    constructor( private content: string, private document: string = '', private number: number = 0, private embedding: number[] = []) {}
    public getContent(): string {
        return this.content;
    }
    public getDocument(): string {
        return this.document;
    }
    public getNumber(): number {
        return this.number;
    }
    public getEmbedding(): number[] {
        return this.embedding;
    }
    public setContent(content: string): void {
        this.content = content;
    }
    public setDocument(document: string): void {
        this.document = document;
    }
    public setNumber(number: number): void {
        this.number = number;
    }
    public setEmbedding(embedding: number[]): void {
        this.embedding = embedding;
    }
}