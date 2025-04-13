import { DBInsertResponse } from "../models/dbInsertResponse.ts";
import { Message } from "../models/chat.ts";

export interface UpdateMessagePort {
    updateMessage(message: Message): Promise<DBInsertResponse>;
}