import { GetHistoryPort } from "../ports/getHistoryPort.ts";
import { Chat } from "../models/chat.ts";

export class GetHistoryUseCase {
    constructor(private readonly port: GetHistoryPort) { }

    public async getHistory(chat: Chat): Promise<Chat> {
        try {
            return await this.port.getHistory(chat);
    
        } catch (error) {
            throw error;
        }
    }
}