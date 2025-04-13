export class AIQuestion {
    constructor(private question: string) {}
    
    public getQuestion(): string {
        return this.question;
    }
}