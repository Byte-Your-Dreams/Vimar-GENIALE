export class SupabaseChat {
    constructor(private id: string, private messages: SupabaseMessage[]) {}
    
    public getID(): string {
        return this.id;
    }
    public getMessages(): SupabaseMessage[] {
        return this.messages;
    }
}

export class SupabaseMessage {
    private id: string;
    private chatID: string;
    private question: string;
    private answer: string;
    private date: Date;
    private productNames: string[];
    private productIDs: string[];
    private embedding: number[];

    constructor(id: string, chatID: string, question: string, date: Date, productNames: string[] = [], productIDs: string[] = [], embedding: number[] = [], answer: string = "") {
        this.id = id;
        this.chatID = chatID;
        this.question = question;
        this.answer = answer;
        this.date = date;
        this.productNames = productNames;
        this.productIDs = productIDs;
        this.embedding = embedding;
    }

    public getID(): string {
        return this.id;
    }

    public getChatID(): string {
        return this.chatID;
    }

    public getQuestion(): string {
        return this.question;
    }

    public getAnswer(): string {
        return this.answer;
    }

    public getDate(): Date {
        return this.date;
    }

    public getProductNames(): string[] {
        return this.productNames;
    }

    public getProductIDs(): string[] {
        return this.productIDs;
    }

    public getEmbedding(): number[] {
        return this.embedding;
    }

    public setQuestion(question: string): void {
        this.question = question;
    }

    public setAnswer(answer: string): void {
        this.answer = answer;
    }

    public setProductNames(productNames: string[]): void {
        this.productNames = productNames;
    }

    public setProductIDs(productIDs: string[]): void {
        this.productIDs = productIDs;
    }

    public setEmbedding(embedding: number[]): void {
        this.embedding = embedding;
    }

}