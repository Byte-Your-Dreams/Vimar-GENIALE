import { UpdateMessagePort } from "../ports/updateMessagePort.ts";

import { Message } from "../models/chat.ts";
import { DBInsertResponse } from "../models/dbInsertResponse.ts";

export class UpdateMessageUseCase implements UpdateMessagePort {
    constructor(private repository: UpdateMessagePort) { }

    public async updateMessage(message: Message): Promise<DBInsertResponse> {
        try {
            return await this.repository.updateMessage(message);
        } catch (error) {
            throw error;
        }
    }
}
