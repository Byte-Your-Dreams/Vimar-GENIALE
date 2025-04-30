import { franc } from "npm:franc";

export class Chat {
    constructor(private id: string, private messages: Message[]) {}
    public getID(): string {
        return this.id;
    }
    public getMessages(): Message[] {
        return this.messages;
    }
    public getLastMessage(): Message {
        return this.messages[this.messages.length - 1];
    }
}

export class Message {
    private id: string;
    private chatID: string;
    private question: string;
    private answer: string;
    private date: Date;
    private productNames: string[];
    private productIDs: string[];
    private embedding: number[];
    private typeOfQuestion: number = 4;

    constructor(id: string, chatID: string, question: string, date: Date, answer: string = "", productNames: string[] = [], productIDs: string[] = [], embedding: number[] = [], typeOfQuestion: number = 4) {
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

    public getLanguage(): string {
        const langCode = franc(this.question, { minLength: 3 });
        
        const languageMap: Record<string, string> = {
            'eng': 'english',
            'ita': 'italian',
            'spa': 'spanish',
            'fra': 'french',
            'deu': 'german',
        };

        console.log('Language detected:', langCode);
        return languageMap[langCode] || 'italian';
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

    public setTypeOfQuestion(typeOfQuestion: number): void {
        this.typeOfQuestion = typeOfQuestion;
    }
    public getTypeOfQuestion(): number {
        return this.typeOfQuestion;
    }
}