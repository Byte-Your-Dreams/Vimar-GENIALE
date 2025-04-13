export class SupabaseGeneralProductInfo {
    constructor ( private names: string[], private ids: string[]) {}

    public getNames(): string[] {
        return this.names;
    }

    public getIds(): string[] {
        return this.ids;
    }
}