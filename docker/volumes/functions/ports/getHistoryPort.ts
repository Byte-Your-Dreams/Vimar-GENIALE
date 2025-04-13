import { Chat } from '../models/chat.ts';

export interface GetHistoryPort {
    getHistory(chat: Chat): Promise<Chat>;
}