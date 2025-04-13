import { Message } from "../models/chat.ts";

export interface ObtainAllMessagesPort {
    obtainAllMessages(): Promise<Message[]>;
}