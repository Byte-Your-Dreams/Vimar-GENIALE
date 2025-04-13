export class Product {
    constructor(
        private id: string,
        private name: string,
        private description: string,
        private etim: string
    ) {}

    public getID(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getDescription(): string {
        return this.description;
    }

    public getEtim(): string {
        // function to copy from github
        return this.etim;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public setDescription(description: string): void {
        this.description = description;
    }

}