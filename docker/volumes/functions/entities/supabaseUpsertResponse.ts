export class SupabaseUpsertResponse {
    constructor(private success: boolean, private message: boolean) {
    }
    public getSuccess(): boolean {
        return this.success;
    }
    public getMessage(): boolean {
        return this.message;
    }
}