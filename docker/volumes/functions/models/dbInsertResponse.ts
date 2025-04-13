export class DBInsertResponse {
    constructor(private success: boolean, private answer: string) {}
    
    public getSuccess(): boolean {
        return this.success;
    }

    public getAnswer(): string {
        return this.answer;
    }
}