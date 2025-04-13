export class OllamaEmbedding {
    constructor(private success: boolean, private embedding: number[]) {}
    
    public getSuccess(): boolean {
        return this.success;
    }

    public getEmbedding(): number[] {
        return this.embedding;
    }
}